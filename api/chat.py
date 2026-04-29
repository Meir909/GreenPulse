from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import re

CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o-mini")

# Language detection patterns
LANGUAGE_PATTERNS = {
    'ru': r'[а-яА-ЯёЁ]',
    'kk': r'[әіңғүұқөһӘІҢҒҮҰҚӨҺ]',
    'zh': r'[\u4e00-\u9fff]',
    'ja': r'[\u3040-\u309f\u30a0-\u30ff]',
    'ko': r'[\uac00-\ud7af]',
    'ar': r'[\u0600-\u06ff]',
    'he': r'[\u0590-\u05ff]',
    'hi': r'[\u0900-\u097f]',
    'th': r'[\u0e00-\u0e7f]',
    'el': r'[\u0370-\u03ff]',
}


def detect_language(text):
    """Detect language from text. Returns language code or 'auto'."""
    if not text:
        return 'en'

    for lang_code, pattern in LANGUAGE_PATTERNS.items():
        if re.search(pattern, text):
            return lang_code

    # Check for common European languages
    text_lower = text.lower()
    if any(word in text_lower for word in ['el', 'la', 'los', 'las', 'es', 'un', 'una']):
        return 'es'
    if any(word in text_lower for word in ['le', 'la', 'les', 'un', 'une', 'est', 'sont']):
        return 'fr'
    if any(word in text_lower for word in ['der', 'die', 'das', 'ein', 'eine', 'ist', 'sind']):
        return 'de'

    return 'en'  # Default to English


def build_system_prompt(user_prefs=None, topic_focus=None):
    """Build adaptive system prompt based on user preferences and context."""
    prefs = user_prefs or {}
    topic = topic_focus or 'general'

    user_name = prefs.get('name', '')
    user_role = prefs.get('role', '')
    interests = prefs.get('interests', [])
    expertise = prefs.get('expertise', 'general')
    tone = prefs.get('tone', 'friendly')

    base_prompt = f"""You are GreenPulse AI, an intelligent assistant for an algae bioreactor air-quality project.

CORE FACTS:
- Organism: Chlorella vulgaris (green microalgae)
- Function: CO2 absorption via photosynthesis, urban air quality improvement
- Operating targets: temperature 20-30°C, pH 6.5-7.5, light >400 lux
- Capacity: ~38 kg CO2/year at optimal conditions (literature baseline)
- Equivalent: ~15 trees in CO2 absorption potential

ADAPTIVE GUIDELINES:
1. LANGUAGE: Detect the user's language from their message and ALWAYS reply in that same language. Support all world languages naturally.

2. PERSONALIZATION:"""

    if user_name:
        base_prompt += f"\n   - Address user as '{user_name}' when appropriate"
    if user_role:
        base_prompt += f"\n   - Adapt for user role: {user_role}"
    if interests:
        base_prompt += f"\n   - User interests: {', '.join(interests)}"

    expertise_levels = {
        'beginner': 'Use simple analogies, avoid jargon, explain basic concepts',
        'student': 'Educational tone, explain mechanisms clearly',
        'researcher': 'Technical depth, cite mechanisms, precise terminology',
        'investor': 'Focus on metrics, ROI, scalability, market potential',
        'urban_planner': 'Emphasize city integration, public health, infrastructure',
        'general': 'Balanced, accessible but scientifically accurate'
    }

    base_prompt += f"\n   - Expertise level: {expertise_levels.get(expertise, expertise_levels['general'])}"

    tone_styles = {
        'friendly': 'Warm, conversational, encouraging',
        'professional': 'Formal, precise, structured',
        'enthusiastic': 'Energetic, inspiring, visionary',
        'calm': 'Soothing, reassuring, patient',
        'technical': 'Data-driven, systematic, detailed'
    }

    base_prompt += f"\n   - Tone: {tone_styles.get(tone, tone_styles['friendly'])}"

    topic_contexts = {
        'sensors': 'Focus on telemetry, real-time data, sensor interpretation',
        'biology': 'Deep dive into algae biology, photosynthesis, growth factors',
        'environment': 'CO2 impact, air quality metrics, climate benefits',
        'technology': 'IoT systems, hardware, software architecture',
        'business': 'Scalability, cost-benefit, implementation models',
        'health': 'Air quality health impacts, public benefits',
        'education': 'Learning resources, science communication',
        'general': 'Balanced overview of all aspects'
    }

    base_prompt += f"\n\n3. TOPIC FOCUS: {topic_contexts.get(topic, topic_contexts['general'])}"

    base_prompt += """
4. CONVERSATION STYLE:
   - Be concise but informative (2-4 sentences typical)
   - Adjust depth based on user expertise
   - Use relevant examples from user's context
   - Ask clarifying questions when topic is ambiguous
   - Proactively connect topics to GreenPulse when natural

5. BOUNDARIES:
   - Never invent sensor data not provided
   - Distinguish measured vs estimated values
   - Stay scientifically accurate
   - Redirect off-topic questions gracefully to GreenPulse context

Remember: You are a helpful, knowledgeable assistant that adapts to each user's needs while staying true to the GreenPulse mission."""

    return base_prompt


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
        user_prefs = data.get("user_prefs", {})
        topic_focus = data.get("topic", "general")

        if not user_message:
            self._respond(400, {"status": "error", "message": "Message cannot be empty"})
            return

        # Detect language for response metadata
        detected_lang = detect_language(user_message)

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self._respond(500, {"status": "error", "message": "OPENAI_API_KEY is not set"})
            return

        try:
            # Build adaptive system prompt
            adaptive_prompt = build_system_prompt(user_prefs, topic_focus)

            messages = [{"role": "system", "content": adaptive_prompt}]
            for item in history[-10:]:
                role = item.get("role")
                content = item.get("content", "")
                if role in {"user", "assistant"} and isinstance(content, str) and content.strip():
                    messages.append({"role": role, "content": content.strip()})
            messages.append({"role": "user", "content": user_message})

            req_data = {
                "model": CHAT_MODEL,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 500,
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
            self._respond(200, {
                "status": "success",
                "response": text,
                "model": CHAT_MODEL,
                "detected_language": detected_lang,
                "topic_focus": topic_focus,
                "personalized": bool(user_prefs)
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
