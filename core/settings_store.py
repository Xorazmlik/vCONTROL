"""
Sozlamalar Ombori (Settings Store)
=====================================
Tanlangan Raspberry Pi modelini va INMP441 mikrofonining SCK/WS/SD
GPIO ulanishlarini config/settings.json faylida saqlaydi.

Eslatma: mikrofonning bu uch pini I2S apparat bloki bilan bog'liq bo'lib,
odatda GPIO 18/19/20'da qat'iy turadi. Bu yerda "o'zgartirish mumkin"
qilinishining sababi — agar kimdir boshqacha overlay/ulanish ishlatsa ham
tizim band pinlarni to'g'ri hisoblay olsin, va ulanish sxemasi sahifada
aniq ko'rinib tursin.

Xatoliklar (CommandStore'dagi kabi) tayyor matn emas, balki barqaror kod +
parametr sifatida qaytariladi, chunki interfeys bir nechta tilni
qo'llab-quvvatlaydi va yakuniy xabar frontendda shakllantiriladi.
"""
import json
import os
import threading

from core.pinout import PI_MODELS, DEFAULT_MIC_PINS, ALL_HEADER_GPIOS, BASE_RESERVED_PINS


class SettingsStoreError(Exception):
    def __init__(self, code, **params):
        self.code = code
        self.params = params
        super().__init__(code)


class SettingsStore:
    def __init__(self, config_path):
        self.config_path = config_path
        self._lock = threading.Lock()
        self._ensure_file()

    def _ensure_file(self):
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        if not os.path.exists(self.config_path):
            self._write({"pi_model": "zero2w", "mic_pins": dict(DEFAULT_MIC_PINS)})

    def _read(self):
        with open(self.config_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, data):
        tmp_path = self.config_path + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, self.config_path)

    def get(self):
        with self._lock:
            return self._read()

    def get_pi_model(self):
        return self.get().get("pi_model", "zero2w")

    def get_mic_pins(self):
        return self.get().get("mic_pins", dict(DEFAULT_MIC_PINS))

    def update(self, pi_model=None, mic_pins=None):
        with self._lock:
            data = self._read()

            if pi_model is not None:
                if pi_model not in PI_MODELS:
                    raise SettingsStoreError("unknown_pi_model")
                data["pi_model"] = pi_model

            if mic_pins is not None:
                try:
                    sck = int(mic_pins["sck"])
                    ws = int(mic_pins["ws"])
                    sd = int(mic_pins["sd"])
                except (KeyError, TypeError, ValueError):
                    raise SettingsStoreError("invalid_mic_pins")

                for name, val in (("SCK", sck), ("WS", ws), ("SD", sd)):
                    if val not in ALL_HEADER_GPIOS:
                        raise SettingsStoreError(
                            "mic_pin_out_of_range", name=name, value=val
                        )
                    if val in BASE_RESERVED_PINS:
                        raise SettingsStoreError(
                            "mic_pin_reserved", name=name, value=val
                        )
                if len({sck, ws, sd}) != 3:
                    raise SettingsStoreError("mic_pins_not_distinct")

                data["mic_pins"] = {"sck": sck, "ws": ws, "sd": sd}

            self._write(data)
            return data
