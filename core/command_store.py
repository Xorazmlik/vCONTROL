"""
Qoidalar Ombori (Command Store)
=================================
Har bir "qoida" uchta narsani bog'laydi: GPIO pin -> ovozli so'z -> amal (ON/OFF).
Barcha qoidalar config/commands.json faylida saqlanadi.

Muhim qoida: bitta so'z faqat bitta (GPIO, amal) juftligiga tegishli bo'lishi
mumkin. Ruxsat etilgan GPIO ro'yxati esa doimiy band pinlar (I2C/UART/EEPROM)
va joriy mikrofon sozlamasida band qilingan pinlarni (SettingsStore orqali)
avtomatik chetlab o'tadi.

Xatoliklar haqida: bu modul xabarlarni tayyor matn sifatida emas, balki
barqaror "kod" (masalan "word_taken") va uni to'ldirish uchun kerakli
parametrlar bilan qaytaradi. Buning sababi — veb-interfeys bir nechta tilni
(hozircha o'zbek va ingliz) qo'llab-quvvatlaydi, shuning uchun xabarning
o'zi frontendda, tanlangan tilga qarab, shakllantiriladi. Agar backend
tayyor o'zbekcha jumla qaytarsa, ingliz interfeysida ham o'sha jumla
chiqib qolar edi.
"""
import json
import os
import threading
import uuid

from core.pinout import ALL_HEADER_GPIOS, BASE_RESERVED_PINS

VALID_ACTIONS = ("ON", "OFF")


class CommandStoreError(Exception):
    """Foydalanuvchi tomonidan tuzatilishi mumkin bo'lgan validatsiya xatoligi.

    `code` — barqaror, tilga bog'liq bo'lmagan xatolik identifikatori.
    `params` — xabarni to'ldirish uchun kerakli qo'shimcha qiymatlar
    (masalan {"gpio": 6}), ular frontendning tarjima lug'atida ishlatiladi.
    """

    def __init__(self, code, **params):
        self.code = code
        self.params = params
        super().__init__(code)


class CommandStore:
    def __init__(self, config_path, settings_store):
        self.config_path = config_path
        self.settings_store = settings_store
        self._lock = threading.Lock()
        self._ensure_file()

    def _ensure_file(self):
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        if not os.path.exists(self.config_path):
            self._write([])

    def _read(self):
        with open(self.config_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, data):
        tmp_path = self.config_path + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, self.config_path)

    @staticmethod
    def _normalize_word(word):
        return " ".join(word.strip().lower().split())

    def _reserved_pins(self):
        """Doimiy band pinlar + joriy mikrofon sozlamasida band qilingan pinlar."""
        reserved = set(BASE_RESERVED_PINS.keys())
        reserved |= set(self.settings_store.get_mic_pins().values())
        return reserved

    def get_all(self):
        with self._lock:
            return self._read()

    def get_available_pins(self):
        used = {c["gpio"] for c in self.get_all()}
        reserved = self._reserved_pins()
        return [
            {"gpio": g, "used": g in used}
            for g in ALL_HEADER_GPIOS
            if g not in reserved
        ]

    def add(self, gpio, word, action):
        try:
            gpio = int(gpio)
        except (TypeError, ValueError):
            raise CommandStoreError("invalid_gpio")

        action = (action or "").upper().strip()
        word_norm = self._normalize_word(word or "")

        if not word_norm:
            raise CommandStoreError("empty_word")
        if gpio not in ALL_HEADER_GPIOS or gpio in self._reserved_pins():
            raise CommandStoreError("gpio_reserved", gpio=gpio)
        if action not in VALID_ACTIONS:
            raise CommandStoreError("invalid_action")

        with self._lock:
            commands = self._read()
            for c in commands:
                if self._normalize_word(c["word"]) == word_norm:
                    raise CommandStoreError(
                        "word_taken",
                        word=word.strip(),
                        gpio=c["gpio"],
                        action=c["action"],
                    )
            new_cmd = {
                "id": uuid.uuid4().hex[:8],
                "gpio": gpio,
                "word": word.strip(),
                "action": action,
            }
            commands.append(new_cmd)
            self._write(commands)
            return new_cmd

    def delete(self, cmd_id):
        with self._lock:
            commands = self._read()
            filtered = [c for c in commands if c["id"] != cmd_id]
            if len(filtered) == len(commands):
                raise CommandStoreError("rule_not_found")
            self._write(filtered)

    def get_grammar_words(self):
        return sorted({c["word"] for c in self.get_all()})

    def find_by_word(self, text):
        text_norm = self._normalize_word(text or "")
        for c in self.get_all():
            if self._normalize_word(c["word"]) == text_norm:
                return c
        return None
