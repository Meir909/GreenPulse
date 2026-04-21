from http.server import BaseHTTPRequestHandler
import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        user_message = data.get("message", "")
        history = data.get("history", [])

        if not user_message:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "No message"}).encode())
            return

        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            if history:
                messages.extend(history[-10:])
            messages.append({"role": "user", "content": user_message})

            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            result = {"response": response.choices[0].message.content}
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
