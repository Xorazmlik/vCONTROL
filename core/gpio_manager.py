"""
GPIO Boshqaruvchisi (GPIO Manager)
====================================
gpiozero kutubxonasi orqali chiqish pinlarini (LED, rele) boshqaradi.

Raspberry Pi 5 yangi RP1 chipi tufayli klassik RPi.GPIO bilan ishlamaydi,
shuning uchun tanlangan Pi modeli "pi5" bo'lsa, gpiozero uchun "lgpio"
backendi avtomatik tanlanadi (GPIOZERO_PIN_FACTORY orqali). Bu narsa
har qanday GPIO pinini yaratishdan OLDIN, dastur ishga tushishida
bajarilishi kerak.

Agar gpiozero yoki mos apparat topilmasa, tizim SIMULYATSIYA rejimiga
o'tadi: GPIO amallari xatoliksiz, faqat log qilinadi.
"""
import logging
import os

from core.pinout import PI_MODELS

logger = logging.getLogger("gpio_manager")


def _configure_pin_factory(pi_model):
    """gpiozero import qilinishidan oldin chaqirilishi kerak."""
    info = PI_MODELS.get(pi_model, {})
    if info.get("needs_lgpio") and "GPIOZERO_PIN_FACTORY" not in os.environ:
        os.environ["GPIOZERO_PIN_FACTORY"] = "lgpio"
        logger.info("Pi 5 aniqlandi — GPIOZERO_PIN_FACTORY=lgpio o'rnatildi.")


class _MockPin:
    """Haqiqiy GPIO mavjud bo'lmaganda ishlatiladigan soxta (mock) pin."""

    def __init__(self, gpio):
        self.gpio = gpio
        self.value = False

    def on(self):
        self.value = True
        logger.info(f"[SIMULYATSIYA] GPIO {self.gpio} -> HIGH (ON)")

    def off(self):
        self.value = False
        logger.info(f"[SIMULYATSIYA] GPIO {self.gpio} -> LOW (OFF)")

    def close(self):
        pass


class GPIOManager:
    def __init__(self, pi_model="zero2w"):
        self.pi_model = pi_model
        _configure_pin_factory(pi_model)

        try:
            from gpiozero import LED
            self._LED = LED
            self._gpiozero_available = True
        except Exception as e:
            self._LED = None
            self._gpiozero_available = False
            logger.warning(f"gpiozero mavjud emas ({e}). Simulyatsiya rejimi ishlatiladi.")

        self._pins = {}
        self.simulation_mode = not self._gpiozero_available

    def _get_pin(self, gpio):
        if gpio in self._pins:
            return self._pins[gpio]

        if self._gpiozero_available and not self.simulation_mode:
            try:
                pin = self._LED(gpio)
                self._pins[gpio] = pin
                return pin
            except Exception as e:
                logger.error(
                    f"GPIO {gpio} ochilmadi ({e}). Qolgan seans uchun "
                    "simulyatsiya rejimiga o'tilmoqda."
                )
                self.simulation_mode = True

        pin = _MockPin(gpio)
        self._pins[gpio] = pin
        return pin

    def set_state(self, gpio, action):
        pin = self._get_pin(gpio)
        if action == "ON":
            pin.on()
        else:
            pin.off()

    def get_state(self, gpio):
        pin = self._pins.get(gpio)
        if pin is None:
            return False
        return bool(pin.value)

    def cleanup(self):
        for pin in self._pins.values():
            try:
                pin.close()
            except Exception:
                pass
        self._pins.clear()
