from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request

CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o-mini")
SYSTEM_PROMPT = """You are GreenPulse AI, an assistant for an algae bioreactor air-quality project.

Core facts:
- Organism: Chlorella vulgaris
- Primary function: absorb CO2 through photosynthesis and improve local air quality
- Typical operating targets: temperature 20-30 C, pH 6.5-7.5, light above 400 lux
- The project combines IoT telemetry, environmental monitoring, and urban sustainability

Reply in Russian.
Keep answers concise, practical, and credible.
If the user asks about sensor readings or forecasts, explain them in plain language.
Do not invent measurements that were not provided in the conversation."""


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
            data = json.loads(body)
        except Exception:
            data = {}

        user_message = (data.get("message") or "").strip()
        history = data.get("history", [])

        if not user_message:
            self._respond(400, {"status": "error", "message": "Message cannot be empty"})
            return

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self._respond(500, {"status": "error", "message": "OPENAI_API_KEY is not set"})
            return

        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            for item in history[-10:]:
                role = item.get("role")
                content = item.get("content", "")
                if role in {"user", "assistant"} and isinstance(content, str) and content.strip():
                    messages.append({"role": role, "content": content.strip()})
            messages.append({"role": "user", "content": user_message})

            req_data = {
                "model": CHAT_MODEL,
                "messages": messages,
                "temperature": 0.6,
                "max_tokens": 450,
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
            text = response_data["choices"][0]["message"]["content"] or "I could not generate a response."
            self._respond(200, {"status": "success", "response": text, "model": CHAT_MODEL})
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
