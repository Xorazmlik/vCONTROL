/*
 * i18n.js — Interfeys tarjimasi (o'zbek / ingliz)
 * ==================================================
 * Bu fayl ikki narsani beradi:
 *   1) I18N       — interfeys matnlari lug'ati (tugmalar, yorliqlar, holat matnlari)
 *   2) ERRORS_I18N — backend qaytaradigan error_code'larni matnga aylantiruvchi lug'at
 *
 * Backend hech qachon tayyor matn qaytarmaydi — faqat barqaror kod
 * (masalan "word_taken") va parametrlar (masalan {word, gpio, action}).
 * Buning sababi: yakuniy xabar shu yerda, foydalanuvchi tanlagan tilga
 * qarab, tuzilishi kerak.
 *
 * main.js dan foydalanish: t("key") va tError("code", params).
 */

const I18N = {
  uz: {
    page_title: "Ovozli Boshqaruv Tizimi",
    app_title: "OVOZLI\u00A0BOSHQARUV",
    offline: "oflayn",
    model_led_title: "Model holati",
    gpio_led_title: "Simulyatsiya rejimi",

    section_listen: "\u203A TINGLASH",
    checking: "Tekshirilmoqda\u2026",
    listening: "Tinglanmoqda\u2026",
    listening_sim: "Tinglanmoqda (GPIO simulyatsiyada)",
    stopped: "To'xtatilgan",
    model_missing_status: "Model topilmadi \u2014 README.md ga qarang",
    btn_start: "TINGLASHNI BOSHLASH",
    btn_stop: "TO'XTATISH",

    monitor_hint: "bosing \u2192 so'z \u201CYangi qoida\u201D formasiga tushadi",
    monitor_empty: "Hali hech narsa aniqlanmadi\u2026",
    monitor_no_match: "mos qoida yo'q",
    monitor_use_btn: "SHAKLGA",
    monitor_use_done: "OLINDI \u2713",
    monitor_row_title: "Bosing \u2014 bu so'zni \u201CYangi qoida\u201D formasiga joylashtiradi",

    section_device: "\u203A QURILMA VA MIKROFON",
    label_pi_model: "Raspberry Pi modeli",
    label_mic_wiring: "INMP441 ulanish sxemasi",
    th_mic_pin: "Mikrofon pini",
    th_connects_to: "Ulanadi",
    th_physical_pin: "Fizik pin",
    advanced_mic: "Kengaytirilgan: mikrofon pinlarini o'zgartirish",
    btn_save: "SAQLASH",
    mic_note: "Standart INMP441 ulanishi uchun bu qiymatlarni o'zgartirmang \u2014 " +
      "faqat boshqacha sxema bilan ulagan bo'lsangiz o'zgartiring.",
    pi5_note: "Pi 5'da GPIO ishlashi uchun qo'shimcha kutubxona kerak: " +
      "pip install lgpio --break-system-packages (o'rnatgandan so'ng tizimni qayta ishga tushiring).",
    restart_required_note: "(O'zgarishni to'liq qo'llash uchun tizimni qayta ishga tushiring.)",

    section_new_rule: "\u203A YANGI QOIDA",
    step1: "1. GPIO pinni tanlang",
    step2: "2. Amalni tanlang",
    step3: "3. Ovozli so'zni yozing",
    word_placeholder: "masalan: yon, o'ch, chiroqni yoq",
    btn_add_rule: "+ QOIDANI QO'SHISH",

    section_rules: "\u203A MAVJUD QOIDALAR",
    th_gpio: "GPIO",
    th_word: "SO'Z",
    th_action: "AMAL",
    btn_delete: "O'CHIRISH",
    empty_rules: "Hali qoida qo'shilmagan. Chapdagi shakldan foydalaning.",
    confirm_delete: "Ushbu qoidani o'chirishni tasdiqlaysizmi?",

    model_loaded_footer: "model: yuklangan",
    model_missing_footer: "model: topilmadi",

    pin_used: "\u2014 allaqachon qoida biriktirilgan",
    pin_free: "\u2014 bo'sh",

    err_select_gpio: "Avval GPIO pinni tanlang.",
    err_enter_word: "So'zni kiriting.",
  },

  en: {
    page_title: "Voice Control System",
    app_title: "VOICE\u00A0CONTROL",
    offline: "offline",
    model_led_title: "Model status",
    gpio_led_title: "Simulation mode",

    section_listen: "\u203A LISTENING",
    checking: "Checking\u2026",
    listening: "Listening\u2026",
    listening_sim: "Listening (GPIO simulated)",
    stopped: "Stopped",
    model_missing_status: "Model not found \u2014 see README.md",
    btn_start: "START LISTENING",
    btn_stop: "STOP",

    monitor_hint: "click \u2192 word goes into the \u201CNew rule\u201D form",
    monitor_empty: "Nothing detected yet\u2026",
    monitor_no_match: "no matching rule",
    monitor_use_btn: "TO FORM",
    monitor_use_done: "TAKEN \u2713",
    monitor_row_title: "Click \u2014 places this word into the \u201CNew rule\u201D form",

    section_device: "\u203A DEVICE & MICROPHONE",
    label_pi_model: "Raspberry Pi model",
    label_mic_wiring: "INMP441 wiring diagram",
    th_mic_pin: "Mic pin",
    th_connects_to: "Connects to",
    th_physical_pin: "Physical pin",
    advanced_mic: "Advanced: change microphone pins",
    btn_save: "SAVE",
    mic_note: "Don't change these values for a standard INMP441 wiring \u2014 " +
      "only change them if you wired it differently.",
    pi5_note: "Pi 5 needs an extra library for GPIO to work: " +
      "pip install lgpio --break-system-packages (restart the app after installing).",
    restart_required_note: "(Restart the app for the change to fully take effect.)",

    section_new_rule: "\u203A NEW RULE",
    step1: "1. Select the GPIO pin",
    step2: "2. Select the action",
    step3: "3. Write the voice word",
    word_placeholder: "e.g. (Uzbek words): yon, o'ch, chiroqni yoq",
    btn_add_rule: "+ ADD RULE",

    section_rules: "\u203A EXISTING RULES",
    th_gpio: "GPIO",
    th_word: "WORD",
    th_action: "ACTION",
    btn_delete: "DELETE",
    empty_rules: "No rules added yet. Use the form on the left.",
    confirm_delete: "Are you sure you want to delete this rule?",

    model_loaded_footer: "model: loaded",
    model_missing_footer: "model: not found",

    pin_used: "\u2014 already assigned to a rule",
    pin_free: "\u2014 free",

    err_select_gpio: "Select a GPIO pin first.",
    err_enter_word: "Enter a word.",
  },
};

const ERRORS_I18N = {
  uz: {
    invalid_gpio: () => "GPIO qiymati noto'g'ri.",
    empty_word: () => "So'z maydoni bo'sh bo'lishi mumkin emas.",
    gpio_reserved: (p) => `GPIO ${p.gpio} band yoki tizim uchun ruxsat etilmagan pin.`,
    invalid_action: () => "Amal faqat ON yoki OFF bo'lishi mumkin.",
    word_taken: (p) =>
      `"${p.word}" so'zi allaqachon GPIO ${p.gpio} (${p.action}) uchun band qilingan. ` +
      `Har bir so'z faqat bitta amalga bog'lanishi mumkin.`,
    rule_not_found: () => "Bunday qoida topilmadi.",
    unknown_pi_model: () => "Noma'lum Raspberry Pi modeli.",
    invalid_mic_pins: () => "Mikrofon pinlari noto'g'ri kiritilgan.",
    mic_pin_out_of_range: (p) => `${p.name} uchun GPIO ${p.value} 40-pinli headerda mavjud emas.`,
    mic_pin_reserved: (p) => `${p.name} uchun GPIO ${p.value} band.`,
    mic_pins_not_distinct: () => "SCK, WS va SD uchun har xil (takrorlanmas) pinlar tanlanishi kerak.",
    mic_pin_clash: (p) =>
      `GPIO ${p.pins.join(", ")} hozir qoida(lar)da ishlatilmoqda. ` +
      `Avval o'sha qoidalarni o'chiring, keyin mikrofon pinini o'zgartiring.`,
    vosk_not_installed: () => "vosk kutubxonasi o'rnatilmagan (pip install vosk).",
    model_load_failed: (p) =>
      `Vosk modeli topilmadi yoki yuklanmadi${p.detail ? " (" + p.detail + ")" : ""}. ` +
      `vosk-model-small-uz-0.22 papkasini 'model/' ichiga joylashtiring.`,
    engine_runtime_error: (p) => `Dvigatel xatoligi${p.detail ? ": " + p.detail : ""}.`,
    unknown: () => "Noma'lum xatolik yuz berdi.",
  },

  en: {
    invalid_gpio: () => "Invalid GPIO value.",
    empty_word: () => "The word field cannot be empty.",
    gpio_reserved: (p) => `GPIO ${p.gpio} is reserved or not allowed for this system.`,
    invalid_action: () => "Action must be either ON or OFF.",
    word_taken: (p) =>
      `"${p.word}" is already assigned to GPIO ${p.gpio} (${p.action}). ` +
      `Each word can only trigger one action.`,
    rule_not_found: () => "That rule could not be found.",
    unknown_pi_model: () => "Unknown Raspberry Pi model.",
    invalid_mic_pins: () => "The microphone pins were entered incorrectly.",
    mic_pin_out_of_range: (p) => `${p.name}: GPIO ${p.value} is not on the 40-pin header.`,
    mic_pin_reserved: (p) => `${p.name}: GPIO ${p.value} is reserved.`,
    mic_pins_not_distinct: () => "SCK, WS, and SD must each use a different pin.",
    mic_pin_clash: (p) =>
      `GPIO ${p.pins.join(", ")} ${p.pins.length > 1 ? "are" : "is"} currently used by a rule. ` +
      `Delete those rule(s) first, then change the microphone pin.`,
    vosk_not_installed: () => "The vosk library is not installed (pip install vosk).",
    model_load_failed: (p) =>
      `The Vosk model was not found or failed to load${p.detail ? " (" + p.detail + ")" : ""}. ` +
      `Place the vosk-model-small-uz-0.22 folder inside 'model/'.`,
    engine_runtime_error: (p) => `Engine error${p.detail ? ": " + p.detail : ""}.`,
    unknown: () => "An unknown error occurred.",
  },
};

let currentLang = localStorage.getItem("ovc_lang") || "uz";

function t(key) {
  const dict = I18N[currentLang] || I18N.uz;
  return dict[key] !== undefined ? dict[key] : (I18N.uz[key] !== undefined ? I18N.uz[key] : key);
}

function tError(code, params) {
  const dict = ERRORS_I18N[currentLang] || ERRORS_I18N.uz;
  const fn = dict[code] || dict.unknown;
  return fn(params || {});
}
