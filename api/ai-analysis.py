from http.server import BaseHTTPRequestHandler
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _telemetry import get_current_sensor_data
from openai import OpenAI

ANALYSIS_MODEL = os.environ.get("OPENAI_ANALYSIS_MODEL", "gpt-4o-mini")


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
        merged = {
            "temperature": req.get("temperature", current.get("temperature")),
            "temp_inside": req.get("temp_inside", current.get("temp_inside")),
            "humidity": req.get("humidity", current.get("humidity")),
            "co2_ppm": req.get("co2_ppm", current.get("co2_ppm")),
            "co_ppm": req.get("co_ppm", current.get("co_ppm")),
            "air_quality_index": req.get("air_quality_index", current.get("air_quality_index")),
            "ph": req.get("ph", current.get("ph")),
            "light_intensity": req.get("light_intensity", current.get("light_intensity")),
            "station_name": req.get("station_name", current.get("station_name")),
        }

        prompt = f"""Analyze this GreenPulse telemetry snapshot and reply in Russian.

Station: {merged["station_name"]}
- Outside temperature: {merged["temperature"]} C
- Internal temperature: {merged["temp_inside"]} C
- Humidity: {merged["humidity"]}%
- CO2: {merged["co2_ppm"]} ppm
- CO: {merged["co_ppm"]} ppm
- Air quality index: {merged["air_quality_index"]}
- pH: {merged["ph"]}
- Light intensity: {merged["light_intensity"]} lux

Use this exact structure:
Status: ...
Summary: ...
Within range: ...
Needs attention: ...
Recommendation: ...

Keep it short, concrete, and investor-demo friendly without sounding fake."""

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self._respond(500, {"status": "error", "message": "OPENAI_API_KEY is not set"})
            return

        try:
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=ANALYSIS_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a scientific advisor for an algae bioreactor monitoring platform. "
                            "Reply in Russian. Be concise, technically credible, and action-oriented."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
                max_tokens=280,
            )
            text = response.choices[0].message.content or "Analysis is unavailable."
            self._respond(200, {
                "status": "success",
                "analysis": text,
                "parameters": merged,
                "model": ANALYSIS_MODEL,
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
