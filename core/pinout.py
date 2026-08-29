"""
Pinout Ma'lumotnomasi
========================
Raspberry Pi 2 / 3 / 4 / 5 va Zero (2 W) bir xil 40-pinli GPIO headerga ega —
BCM GPIO raqamlash barcha modellarda bir xil, shuning uchun ulanish sxemasi
(qaysi jismoniy pin qaysi GPIO'ga to'g'ri kelishi) model tanlovidan qat'i
nazar o'zgarmaydi.

Modellar orasidagi haqiqiy farq — dasturiy taraf: Raspberry Pi 5 yangi RP1
chipidan foydalanadi va klassik RPi.GPIO kutubxonasini qo'llab-quvvatlamaydi,
shuning uchun unga alohida "lgpio" backend kerak bo'ladi.
"""

# BCM GPIO -> jismoniy pin raqami (40-pinli header, barcha modellarda bir xil)
BCM_TO_PHYSICAL = {
    2: 3, 3: 5, 4: 7, 14: 8, 15: 10, 17: 11, 18: 12, 27: 13,
    22: 15, 23: 16, 24: 18, 10: 19, 9: 21, 25: 22, 11: 23, 8: 24,
    7: 26, 0: 27, 1: 28, 5: 29, 6: 31, 12: 32, 13: 33, 19: 35,
    16: 36, 26: 37, 20: 38, 21: 40,
}

ALL_HEADER_GPIOS = sorted(BCM_TO_PHYSICAL.keys())

# Mikrofon sozlamasidan mustaqil, doimiy band bo'lgan pinlar
BASE_RESERVED_PINS = {
    0: "ID_SD (HAT EEPROM)",
    1: "ID_SC (HAT EEPROM)",
    2: "I2C SDA",
    3: "I2C SCL",
    14: "UART TXD",
    15: "UART RXD",
}

DEFAULT_MIC_PINS = {"sck": 18, "ws": 19, "sd": 20}

PI_MODELS = {
    "zero2w": {"label": "Pi Zero 2 W", "needs_lgpio": False},
    "pi2":    {"label": "Pi 2",        "needs_lgpio": False},
    "pi3":    {"label": "Pi 3",        "needs_lgpio": False},
    "pi4":    {"label": "Pi 4",        "needs_lgpio": False},
    "pi5":    {"label": "Pi 5",        "needs_lgpio": True},
}


def physical_pin(bcm):
    return BCM_TO_PHYSICAL.get(int(bcm))
