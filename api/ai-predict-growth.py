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

    temperature     = req.get("temperature", 22)
    temp_inside     = req.get("temp_inside")
    humidity        = req.get("humidity", 65)
    co2_ppm         = req.get("co2_ppm", 420)
    air_quality_index = req.get("air_quality_index")
    ph              = req.get("ph", 7.0)
    light_intensity = req.get("light_intensity", 450)
    eff             = photo_efficiency(temperature)

    temp_inside_line = f"- Температура ішінде: {temp_inside} C\n" if temp_inside is not None else ""
    aqi_line = f"- Ауа сапасы AQI: {air_quality_index}/300\n" if air_quality_index is not None else ""

    prompt = f"""GreenPulse биореактор жағдайлары:
- Сыртқы температура: {temperature} C (оптимум 20-25 C)
{temp_inside_line}- Ылғалдылық: {humidity}%
- CO2 (MQ135): {co2_ppm} ppm
{aqi_line}- pH: {ph}
- Жарық: {light_intensity} люкс
- Есептелген тиімділік: {round(eff * 100)}%
- Базалық: жылына 38 кг CO2 (100% тиімділікте, Chlorella vulgaris)

Барлық деректерді ескере отырып қазақ тілінде CO2 болжамын беріңіз:

Тиімділік: [%] - [себеп]
1 сағатта: [г] CO2
24 сағатта: [г] CO2
Айына: [г] CO2
Жылына: [кг] CO2
Ауа сапасы әсері: [MQ135 деректері бойынша]
Жақсарту: [бір нақты ұсыныс]"""

    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="o4-mini",
            messages=[
                {"role": "system", "content": "Сіз биореактор ғалымысыз. Қазақ тілінде нақты жауап беріңіз."},
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=350
        )
        res = jsonify({"prediction": response.choices[0].message.content})
        res.headers["Access-Control-Allow-Origin"] = "*"
        return res, 200
    except Exception as e:
        res = jsonify({"error": str(e)})
        res.headers["Access-Control-Allow-Origin"] = "*"
        return res, 500
