from http.server import BaseHTTPRequestHandler
import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        try:
            req = json.loads(body)
        except Exception:
            req = {}

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
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a scientific advisor for GreenPulse, a Chlorella vulgaris bioreactor. Respond in Kazakh language."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            result = {"analysis": response.choices[0].message.content}
            status = 200
        except Exception as e:
            result = {"error": str(e)}
            status = 500

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
