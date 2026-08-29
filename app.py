"""
Ovozli Boshqaruv Tizimi — Flask Veb Serveri
==============================================
Ishga tushirish:  python3 app.py
Standart manzil:  http://<raspberry-pi-ip>:5000

Bu server:
  1) Veb-interfeysni (templates/index.html) taqdim etadi
  2) GPIO <-> So'z <-> Amal qoidalarini boshqarish uchun REST API beradi
  3) Raspberry Pi modeli va mikrofon ulanish sozlamalarini boshqaradi
  4) Ovoz aniqlash dvigatelini (fon oqimida) ishga tushiradi/to'xtatadi

Xatoliklar haqida: barcha API xatoliklari {"error_code": "...", "params": {...}}
shaklida qaytariladi (tayyor matn emas), chunki veb-interfeys bir nechta
tilni qo'llab-quvvatlaydi — yakuniy xabar frontendning static/js/i18n.js
lug'atida, tanlangan tilga qarab shakllantiriladi.
"""
import atexit
import logging
import os

from flask import Flask, jsonify, render_template, request

from core.command_store import CommandStore, CommandStoreError
from core.gpio_manager import GPIOManager
from core.pinout import PI_MODELS, physical_pin
from core.settings_store import SettingsStore, SettingsStoreError
from core.voice_engine import VoiceEngine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "config", "commands.json")
SETTINGS_PATH = os.path.join(BASE_DIR, "config", "settings.json")
MODEL_PATH = os.path.join(BASE_DIR, "model")

app = Flask(__name__)

settings_store = SettingsStore(SETTINGS_PATH)
command_store = CommandStore(CONFIG_PATH, settings_store)
gpio_manager = GPIOManager(pi_model=settings_store.get_pi_model())
voice_engine = VoiceEngine(MODEL_PATH, command_store, gpio_manager)

atexit.register(gpio_manager.cleanup)


def error_response(code, status=400, **params):
    return jsonify({"error_code": code, "params": params}), status


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/commands", methods=["GET"])
def get_commands():
    return jsonify(command_store.get_all())


@app.route("/api/commands", methods=["POST"])
def add_command():
    data = request.get_json(force=True, silent=True) or {}
    try:
        cmd = command_store.add(
            gpio=data.get("gpio"),
            word=data.get("word", ""),
            action=data.get("action", ""),
        )
        if voice_engine.is_running():
            voice_engine.restart()
        return jsonify(cmd), 201
    except CommandStoreError as e:
        return error_response(e.code, **e.params)


@app.route("/api/commands/<cmd_id>", methods=["DELETE"])
def delete_command(cmd_id):
    try:
        command_store.delete(cmd_id)
        if voice_engine.is_running():
            voice_engine.restart()
        return jsonify({"ok": True})
    except CommandStoreError as e:
        return error_response(e.code, status=404, **e.params)


@app.route("/api/gpio/available", methods=["GET"])
def available_gpio():
    pins = command_store.get_available_pins()
    for p in pins:
        p["physical"] = physical_pin(p["gpio"])
    return jsonify(pins)


@app.route("/api/settings", methods=["GET"])
def get_settings():
    settings = settings_store.get()
    mic_pins = settings["mic_pins"]
    return jsonify({
        "pi_model": settings["pi_model"],
        "mic_pins": mic_pins,
        "mic_pins_physical": {k: physical_pin(v) for k, v in mic_pins.items()},
        "available_models": PI_MODELS,
    })


@app.route("/api/settings", methods=["POST"])
def update_settings():
    data = request.get_json(force=True, silent=True) or {}
    try:
        if data.get("mic_pins"):
            try:
                candidate_vals = {int(v) for v in data["mic_pins"].values()}
            except (TypeError, ValueError):
                return error_response("invalid_mic_pins")
            used_by_rules = {c["gpio"] for c in command_store.get_all()}
            clash = candidate_vals & used_by_rules
            if clash:
                return error_response("mic_pin_clash", pins=sorted(clash))

        model_changed = (
            "pi_model" in data and data["pi_model"] != settings_store.get_pi_model()
        )
        updated = settings_store.update(
            pi_model=data.get("pi_model"),
            mic_pins=data.get("mic_pins"),
        )
        mic_pins = updated["mic_pins"]
        return jsonify({
            "pi_model": updated["pi_model"],
            "mic_pins": mic_pins,
            "mic_pins_physical": {k: physical_pin(v) for k, v in mic_pins.items()},
            "available_models": PI_MODELS,
            "restart_required": model_changed,
        })
    except SettingsStoreError as e:
        return error_response(e.code, **e.params)


@app.route("/api/engine/status", methods=["GET"])
def engine_status():
    return jsonify(voice_engine.get_status())


@app.route("/api/engine/start", methods=["POST"])
def engine_start():
    try:
        voice_engine.start()
        return jsonify({"ok": True})
    except RuntimeError:
        return error_response(
            voice_engine.last_error_code or "model_load_failed",
            detail=voice_engine.last_error_detail,
        )


@app.route("/api/engine/stop", methods=["POST"])
def engine_stop():
    voice_engine.stop()
    return jsonify({"ok": True})


if __name__ == "__main__":
    print("=" * 66)
    print("OGOHLANTIRISH: bu tizimda kirish (login) tekshiruvi mavjud emas.")
    print("Veb-panel tarmoqdagi HAR QANDAY qurilmadan ochiq holda ko'rinadi")
    print("va GPIO'ni boshqarish imkonini beradi. Faqat ishonchli mahalliy")
    print("tarmoqda ishlating, internetga to'g'ridan-to'g'ri chiqarmang.")
    print("Batafsil: README.md -> \"Xavfsizlik\" bo'limi.")
    print("=" * 66)
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
