from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request


def photo_efficiency(temp):
    if temp is None or temp >= 40 or temp < 0:
        return 0.0
    if temp < 10:
        return 0.02
    if temp < 15:
        return 0.15
    if temp < 20:
        return 0.45
    if temp <= 30:
        return 1.0
    if temp <= 35:
        return 0.50
    return 0.10


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
        eff = photo_efficiency(temperature)

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

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self._respond(500, {"error": "OPENAI_API_KEY is not set"})
            return

        try:
            req_data = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "Сіз биореактор ғалымысыз. Қазақ тілінде нақты жауап беріңіз."},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 350,
                "temperature": 0.4,
            }
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=json.dumps(req_data).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                response_data = json.loads(resp.read().decode("utf-8"))
            self._respond(200, {"prediction": response_data["choices"][0]["message"]["content"]})
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
