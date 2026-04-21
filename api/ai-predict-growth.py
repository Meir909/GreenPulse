from http.server import BaseHTTPRequestHandler
import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def photo_efficiency(temp: float) -> float:
    if temp is None or temp >= 40 or temp < 0:
        return 0.0
    if temp < 10: return 0.02
    if temp < 15: return 0.15
    if temp < 20: return 0.45
    if temp <= 30: return 1.0
    if temp <= 35: return 0.50
    return 0.10

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        try:
            req = json.loads(body)
        except Exception:
            req = {}

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
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a bioreactor scientist. Respond in Kazakh language. Be factual and precise."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=250,
                temperature=0.2
            )
            result = {"prediction": response.choices[0].message.content}
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
