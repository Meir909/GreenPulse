from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request

SYSTEM_PROMPT = """Сіз GreenPulse жобасының ғылыми көмекшісісіз — Chlorella vulgaris балдырлары негізіндегі биореактор скамейкасы.

НЕГІЗГІ ФАКТІЛЕР:
- Микроорганизм: Chlorella vulgaris
- CO2 сіңіру: фотосинтез арқылы
- Оптималды температура: 20–30°C
- Оптималды pH: 6.5–7.5
- Жарық: >400 люкс
- Болжамды сіңіру: жылына ~38 кг CO2

Қазақ тілінде жауап бер. Қысқа және нақты бол (2-3 сөйлем)."""


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

        user_message = data.get("message", "").strip()
        history = data.get("history", [])

        if not user_message:
            self._respond(400, {"error": "No message"})
            return

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self._respond(500, {"error": "OPENAI_API_KEY is not set"})
            return

        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            for item in history[-10:]:
                role = item.get("role")
                content = item.get("content", "")
                if role in {"user", "assistant"} and content.strip():
                    messages.append({"role": role, "content": content.strip()})
            messages.append({"role": "user", "content": user_message})

            req_data = {
                "model": "gpt-4o-mini",
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7,
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
            self._respond(200, {"response": response_data["choices"][0]["message"]["content"]})
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
