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
    temp_inside     = req.get("temp_inside")
    humidity        = req.get("humidity", 65)
    co2_ppm         = req.get("co2_ppm", 420)
    air_quality_index = req.get("air_quality_index")
    ph              = req.get("ph", 7.0)
    light_intensity = req.get("light_intensity", 450)

    temp_inside_line = f"- Температура ішінде (DS18B20): {temp_inside} C\n" if temp_inside is not None else ""
    aqi_line = f"- Ауа сапасы індексі (MQ135 AQI): {air_quality_index}/300\n" if air_quality_index is not None else ""

    prompt = f"""GreenPulse биореактор скамейкасының сенсор деректері:
- Сыртқы температура (DHT22): {temperature} C (оптимум 20-25 C)
{temp_inside_line}- Ылғалдылық (DHT22): {humidity}% (оптимум 60-80%)
- CO2 (MQ135): {co2_ppm} ppm (норма <1000 ppm)
{aqi_line}- pH: {ph} (оптимум 6.5-7.5)
- Жарық: {light_intensity} люкс (оптимум 400-600)

Барлық деректерді пайдаланып қазақ тілінде талдаңыз:

Күй: [Оптималды / Жақсы / Назар қажет / Сын]
Бағалау: [1-2 сөйлем жалпы жағдай туралы]
Нормада: [нормадағы параметрлер]
Ауытқулар: [нормадан тыс параметрлер немесе Жоқ]
Ауа сапасы: [MQ135 AQI нәтижесі туралы]
Ұсыныс: [бір нақты іс-қимыл]"""

    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="o4-mini",
            messages=[
                {"role": "system", "content": "Сіз GreenPulse биореактор жүйесінің ғылыми кеңесшісісіз. Қазақ тілінде жауап беріңіз."},
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=400
        )
        res = jsonify({"analysis": response.choices[0].message.content})
        res.headers["Access-Control-Allow-Origin"] = "*"
        return res, 200
    except Exception as e:
        res = jsonify({"error": str(e)})
        res.headers["Access-Control-Allow-Origin"] = "*"
        return res, 500
