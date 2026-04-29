from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import re

# Language detection patterns for multilingual support
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
    """Detect language from text. Returns language code."""
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

    base_prompt = f"""You are GreenPulse AI — a scientific assistant for a Chlorella vulgaris algae bioreactor bench that improves urban air quality.

CORE FACTS:
- Organism: Chlorella vulgaris (green microalgae)
- Mechanism: Photosynthesis converts CO2 to oxygen
- Optimal temperature: 20–30°C
- Optimal pH: 6.5–7.5
- Light requirement: >400 lux
- Capacity: ~38 kg CO2/year at optimal conditions
- Tree equivalent: ~15 trees in CO2 absorption

ADAPTIVE GUIDELINES:
1. LANGUAGE: Detect the user's language from their message and ALWAYS reply in that same language naturally. Support all world languages.

2. PERSONALIZATION:"""

    if user_name:
        base_prompt += f"\n   - Address user as '{user_name}' when appropriate"
    if user_role:
        base_prompt += f"\n   - Adapt for user role: {user_role}"
    if interests:
        base_prompt += f"\n   - Connect to user interests: {', '.join(interests)}"

    expertise_levels = {
        'beginner': 'Use simple terms, explain basics, avoid technical jargon',
        'student': 'Educational approach, explain science clearly',
        'researcher': 'Technical depth, scientific precision, cite mechanisms',
        'investor': 'Focus on ROI, scalability, market metrics',
        'urban_planner': 'City integration, infrastructure, public benefits',
        'general': 'Balanced, accessible but accurate'
    }

    base_prompt += f"\n   - Expertise level: {expertise_levels.get(expertise, expertise_levels['general'])}"

    tone_styles = {
        'friendly': 'Warm, conversational, approachable',
        'professional': 'Formal, precise, authoritative',
        'enthusiastic': 'Energetic, inspiring, positive',
        'calm': 'Soothing, patient, reassuring',
        'technical': 'Systematic, data-focused, detailed'
    }

    base_prompt += f"\n   - Tone: {tone_styles.get(tone, tone_styles['friendly'])}"

    topic_contexts = {
        'sensors': 'Focus on real-time data, telemetry, sensor readings',
        'biology': 'Algae biology, photosynthesis, growth conditions',
        'environment': 'CO2 absorption, air quality, climate impact',
        'technology': 'IoT hardware, software systems, monitoring',
        'business': 'Implementation, costs, scalability, partnerships',
        'health': 'Air quality health benefits, public wellness',
        'education': 'Science communication, learning, awareness',
        'general': 'Balanced overview, all aspects of GreenPulse'
    }

    base_prompt += f"\n\n3. TOPIC FOCUS: {topic_contexts.get(topic, topic_contexts['general'])}"

    base_prompt += """
4. CONVERSATION STYLE:
   - Keep responses concise (2-4 sentences typically)
   - Adjust complexity to user's expertise level
   - Use relevant examples from user's context
   - Gently steer off-topic questions back to GreenPulse
   - Be helpful, accurate, and engaging

5. RULES:
   - Never invent sensor data not provided
   - Always distinguish measured vs estimated values
   - Stay scientifically accurate
   - Respond ONLY in the language of the user's message

Remember: Adapt to each user while staying true to GreenPulse's mission of cleaner air through algae technology."""

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

        user_message = data.get("message", "").strip()
        history = data.get("history", [])
        user_prefs = data.get("user_prefs", {})
        topic_focus = data.get("topic", "general")

        if not user_message:
            self._respond(400, {"error": "No message"})
            return

        # Detect language for metadata
        detected_lang = detect_language(user_message)

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            self._respond(500, {"error": "OPENAI_API_KEY is not set"})
            return

        try:
            # Build adaptive system prompt
            adaptive_prompt = build_system_prompt(user_prefs, topic_focus)

            messages = [{"role": "system", "content": adaptive_prompt}]
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
            self._respond(200, {
                "response": response_data["choices"][0]["message"]["content"],
                "detected_language": detected_lang,
                "topic_focus": topic_focus,
                "personalized": bool(user_prefs)
            })
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
