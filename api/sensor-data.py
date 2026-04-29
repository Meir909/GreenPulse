from http.server import BaseHTTPRequestHandler
import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from _telemetry import get_current_sensor_data, remember_sensor_payload


class handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        data = get_current_sensor_data()
        self._respond(200, {
            "status": "online",
            "data": data,
            "data_source": data.get("data_source", "telemetry_snapshot"),
            "origin": data.get("origin", "greenpulse_virtual_station"),
        })

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        if not payload:
            self._respond(400, {"status": "error", "message": "No sensor payload provided"})
            return

        stored = remember_sensor_payload(payload)
        self._respond(201, {
            "status": "online",
            "message": "Sensor payload accepted",
            "data": stored,
        })

    def _respond(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
