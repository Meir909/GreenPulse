from flask import Flask, request, jsonify
import os
from openai import OpenAI

app = Flask(__name__)

def photo_efficiency(temp):
    if temp is None or temp >= 40 or temp < 0: return 0.0
    if temp < 10: return 0.02
    if temp < 15: return 0.15
    if temp < 20: return 0.45
    if temp <= 30: return 1.0
    if temp <= 35: return 0.50
    return 0.10

@app.route("/api/ai-predict-growth", methods=["POST", "OPTIONS"])
def handler():
    if request.method == "OPTIONS":
        res = jsonify({})
        res.headers["Access-Control-Allow-Origin"] = "*"
        res.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        res.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return res, 200

    req = request.get_json(silent=True) or {}

    ph              = req.get("ph", 7.0)
    temperature     = req.get("temperature", 22)
    light_intensity = req.get("light_intensity", 450)
    eff             = photo_efficiency(temperature)

    prompt = f"""GreenPulse bioreactor conditions:
• pH: {ph} (optimal 6.5–7.5)
• Temperature: {temperature}°C (optimal 20–25°C)
• Light: {light_intensity} lux (optimal 400–600)
• Calculated efficiency: {round(eff * 100)}%
• Baseline: 38 kg CO2/year at 100% efficiency (Chlorella vulgaris)

Provide CO2 absorption forecast in Kazakh language:

⚡ Тиімділік: [number]% — [brief reason]
⏱ 1 сағатта: [number] г CO2
🌙 24 сағатта: [number] г CO2
📅 Айына: [number] г CO2
🌍 Жылына: [number] кг CO2
📝 Ескерту: [1 sentence]
💡 Жақсарту үшін: [one action]"""

    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a bioreactor scientist. Respond in Kazakh language."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=250,
            temperature=0.2
        )
        res = jsonify({"prediction": response.choices[0].message.content})
        res.headers["Access-Control-Allow-Origin"] = "*"
        return res, 200
    except Exception as e:
        res = jsonify({"error": str(e)})
        res.headers["Access-Control-Allow-Origin"] = "*"
        return res, 500
