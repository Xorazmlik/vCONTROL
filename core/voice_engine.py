"""
Ovoz Aniqlash Dvigateli (Voice Recognition Engine)
=====================================================
INMP441 mikrofonidan I2S orqali kelayotgan audio oqimini `arecord` yordamida
o'qiydi, uni Vosk formatiga (16kHz, 16-bit, mono) o'giradi va aniqlangan
so'zga mos GPIO amalini bajaradi.

Grammatika (tanib olinadigan so'zlar ro'yxati) CommandStore'dan DINAMIK tarzda
olinadi — foydalanuvchi veb-interfeys orqali yangi qoida qo'shsa yoki o'chirsa,
dvigatel avtomatik qayta ishga tushadi va yangi so'zni "eshita boshlaydi".
"""
import json
import logging
import subprocess
import threading
import time
from collections import deque

logger = logging.getLogger("voice_engine")

try:
    from vosk import Model, KaldiRecognizer
    VOSK_AVAILABLE = True
except Exception as e:
    VOSK_AVAILABLE = False
    logger.warning(f"vosk mavjud emas ({e}).")


class VoiceEngine:
    def __init__(self, model_path, command_store, gpio_manager, samplerate=16000):
        self.model_path = model_path
        self.command_store = command_store
        self.gpio_manager = gpio_manager
        self.samplerate = samplerate

        self._thread = None
        self._process = None
        self._running = False
        self._stop_flag = threading.Event()
        self._restart_lock = threading.Lock()

        self.model_loaded = False
        self.last_error_code = None
        self.last_error_detail = None
        self.last_recognized = None
        self.history = deque(maxlen=30)

        self._model = None
        if VOSK_AVAILABLE:
            self._load_model()
        else:
            self.last_error_code = "vosk_not_installed"

    def _load_model(self):
        try:
            self._model = Model(self.model_path)
            self.model_loaded = True
            self.last_error_code = None
            self.last_error_detail = None
        except Exception as e:
            self.model_loaded = False
            self.last_error_code = "model_load_failed"
            self.last_error_detail = str(e)
            logger.error(f"Vosk modeli yuklanmadi: {e}")

    def is_running(self):
        return self._running

    def get_status(self):
        return {
            "running": self._running,
            "model_loaded": self.model_loaded,
            "vosk_available": VOSK_AVAILABLE,
            "simulation_mode": self.gpio_manager.simulation_mode,
            "last_error_code": self.last_error_code,
            "last_error_detail": self.last_error_detail,
            "last_recognized": self.last_recognized,
            "history": list(self.history),
        }

    def start(self):
        if self._running:
            return
        if not self.model_loaded:
            self._load_model()
        if not self.model_loaded:
            raise RuntimeError(self.last_error_code or "model_load_failed")

        self._stop_flag.clear()
        self._running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def stop(self):
        self._stop_flag.set()
        if self._process is not None:
            try:
                self._process.terminate()
            except Exception:
                pass
        self._running = False

    def restart(self):
        """Qoidalar o'zgarganda grammatikani yangilash uchun ishlatiladi."""
        with self._restart_lock:
            was_running = self._running
            if was_running:
                self.stop()
                time.sleep(0.4)
            if was_running:
                self.start()

    def _build_recognizer(self):
        words = self.command_store.get_grammar_words()
        words = words + ["[unk]"]
        grammar = json.dumps(words, ensure_ascii=False)
        return KaldiRecognizer(self._model, self.samplerate, grammar)

    def _run(self):
        try:
            recognizer = self._build_recognizer()
            self._process = subprocess.Popen(
                ["arecord", "-D", "default", "-r", str(self.samplerate),
                 "-c", "2", "-f", "S32_LE", "-t", "raw", "-q"],
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
            )

            while not self._stop_flag.is_set():
                raw_data = self._process.stdout.read(4000)
                if not raw_data:
                    break

                # 32-bit stereo -> 16-bit mono (chap kanal yuqori 16 biti)
                pcm_16 = bytearray()
                for i in range(0, len(raw_data), 8):
                    pcm_16.extend(raw_data[i + 2:i + 4])

                if recognizer.AcceptWaveform(bytes(pcm_16)):
                    result = json.loads(recognizer.Result())
                    text = result.get("text", "").strip()
                    if text and text != "[unk]":
                        self._handle_recognized(text)
        except Exception as e:
            self.last_error_code = "engine_runtime_error"
            self.last_error_detail = str(e)
            logger.exception("Ovoz dvigateli ishlash vaqtida xatolik")
        finally:
            if self._process is not None:
                try:
                    self._process.terminate()
                except Exception:
                    pass
            self._running = False

    def _handle_recognized(self, text):
        logger.info(f"[ANIQLANDI]: {text}")
        cmd = self.command_store.find_by_word(text)
        entry = {
            "text": text,
            "time": time.strftime("%H:%M:%S"),
            "matched": bool(cmd),
        }
        if cmd:
            self.gpio_manager.set_state(cmd["gpio"], cmd["action"])
            entry["gpio"] = cmd["gpio"]
            entry["action"] = cmd["action"]
        self.last_recognized = text
        self.history.append(entry)
