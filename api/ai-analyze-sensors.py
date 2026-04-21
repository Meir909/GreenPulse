from flask import Flask, request, jsonify
import os
from openai import OpenAI

app = Flask(__name__)

@app.route("/api/ai-analyze-sensors", methods=["POST", "OPTIONS"])
def handler():
    if request.method == "OPTIONS":
        res = jsonify({})
        res.headers["Access-Control-Allow-Origin"] = "*"
        res.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        res.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return res, 200

    req = request.get_json(silent=True) or {}

    temperature     = req.get("temperature", 22)
    humidity        = req.get("humidity", 65)
    light_intensity = req.get("light_intensity", 450)
    co2_ppm         = req.get("co2_ppm", 420)
    ph              = req.get("ph", 7.0)

    prompt = f"""Sensor data from GreenPulse bioreactor bench:
• Temperature: {temperature}°C (optimal 20–25°C)
• Humidity: {humidity}% (optimal 60–80%)
• Light: {light_intensity} lux (optimal 400–600)
• CO2: {co2_ppm} ppm (ambient ~420 ppm normal)
• pH: {ph} (optimal 6.5–7.5)

Respond strictly in this format, one item per line, in Kazakh language:

🟢 Күй: [Оптималды / Жақсы / Назар қажет / Сын]
📋 Бағалау: [1–2 сөйлем жалпы жағдай туралы]
✅ Нормада: [нормадағы параметрлер, үтірмен]
⚠️ Ауытқулар: [нормадан тыс параметрлер немесе "Жоқ"]
🔧 Ұсыныс: [бір нақты іс-қимыл]"""

    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a scientific advisor for GreenPulse bioreactor. Respond in Kazakh language."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.3
        )
        res = jsonify({"analysis": response.choices[0].message.content})
        res.headers["Access-Control-Allow-Origin"] = "*"
        return res, 200
    except Exception as e:
        res = jsonify({"error": str(e)})
        res.headers["Access-Control-Allow-Origin"] = "*"
        return res, 500
