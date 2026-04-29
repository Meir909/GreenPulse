from http.server import BaseHTTPRequestHandler
import json
import os
from openai import OpenAI


class handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b"{}"
        try:
            req = json.loads(body)
        except Exception:
            req = {}

        temperature = req.get("temperature", 22)
        temp_inside = req.get("temp_inside")
        humidity = req.get("humidity", 65)
        co2_ppm = req.get("co2_ppm", 420)
        air_quality_index = req.get("air_quality_index")
        ph = req.get("ph", 7.0)
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

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self._respond(500, {"error": "OPENAI_API_KEY is not set"})
            return

        try:
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Сіз GreenPulse биореактор жүйесінің ғылыми кеңесшісісіз. Қазақ тілінде жауап беріңіз.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=400,
                temperature=0.4,
            )
            self._respond(200, {"analysis": response.choices[0].message.content})
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _respond(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
