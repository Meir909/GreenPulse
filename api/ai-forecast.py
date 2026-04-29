from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from _telemetry import get_current_sensor_data

PREDICTION_MODEL = os.environ.get("OPENAI_PREDICTION_MODEL", "gpt-4o-mini")


def photo_efficiency(temp) -> float:
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

        current = get_current_sensor_data()
        temperature = req.get("temperature", current.get("temperature"))
        humidity = req.get("humidity", current.get("humidity"))
        co2_ppm = req.get("co2_ppm", current.get("co2_ppm"))
        ph = req.get("ph", current.get("ph"))
        light_intensity = req.get("light_intensity", current.get("light_intensity"))
        station_name = req.get("station_name", current.get("station_name"))
        efficiency = round(photo_efficiency(temperature) * 100, 1)

        prompt = f"""Create a concise Russian forecast for this GreenPulse station.

Station: {station_name}
- Temperature: {temperature} C
- Humidity: {humidity}%
- CO2: {co2_ppm} ppm
- pH: {ph}
- Light intensity: {light_intensity} lux
- Estimated photosynthesis efficiency: {efficiency}%
- Baseline reference: 38 kg CO2 per year at ideal operating conditions

Use this exact structure:
Efficiency: ...
1 hour: ...
24 hours: ...
30 days: ...
1 year: ...
Comment: ...
Best next step: ...

Keep it realistic, short, and easy to present on a dashboard."""

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self._respond(500, {"status": "error", "message": "OPENAI_API_KEY is not set"})
            return

        try:
            req_data = {
                "model": PREDICTION_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are a bioreactor analyst. Reply in Russian with concrete, presentation-ready numbers "
                            "and one practical optimization tip."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
                "max_tokens": 260,
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
            text = response_data["choices"][0]["message"]["content"] or "Prediction is unavailable."
            self._respond(200, {
                "status": "success",
                "prediction": text,
                "conditions": {
                    "temperature": temperature,
                    "humidity": humidity,
                    "co2_ppm": co2_ppm,
                    "ph": ph,
                    "light_intensity": light_intensity,
                },
                "calculated_efficiency": efficiency,
                "model": PREDICTION_MODEL,
            })
        except Exception as exc:
            self._respond(500, {"status": "error", "message": str(exc)})

    def _respond(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
