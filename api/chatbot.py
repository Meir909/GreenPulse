from flask import Flask, request, jsonify
import os
from openai import OpenAI

app = Flask(__name__)

SYSTEM_PROMPT = """Сіз GreenPulse жобасының ғылыми көмекшісісіз — Chlorella vulgaris балдырлары негізіндегі биореактор скамейкасы.

НЕГІЗГІ ФАКТІЛЕР:
- Микроорганизм: Chlorella vulgaris
- CO2 сіңіру: фотосинтез арқылы
- Оптималды температура: 20–30°C
- Оптималды pH: 6.5–7.5
- Жарық: >400 люкс
- Болжамды сіңіру: жылына ~38 кг CO2

Қазақ тілінде жауап бер. Қысқа және нақты бол (2-3 сөйлем)."""

@app.route("/api/chatbot", methods=["POST", "OPTIONS"])
def handler():
    if request.method == "OPTIONS":
        res = jsonify({})
        res.headers["Access-Control-Allow-Origin"] = "*"
        res.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        res.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return res, 200

    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "")
    history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "No message"}), 400

    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
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
        res = jsonify({"response": response.choices[0].message.content})
        res.headers["Access-Control-Allow-Origin"] = "*"
        return res, 200
    except Exception as e:
        res = jsonify({"error": str(e)})
        res.headers["Access-Control-Allow-Origin"] = "*"
        return res, 500
