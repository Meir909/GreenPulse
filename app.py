from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
from dotenv import load_dotenv
from openai import OpenAI
from datetime import datetime

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'greenpulse-secret-key')
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet', logger=False, engineio_logger=False)

try:
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    print("✅ OpenAI client initialized")
except Exception as e:
    print(f"❌ OpenAI init error: {e}")
    client = None

# Sensor data storage
sensor_history = []          # Up to 500 readings
gps_track = []               # GPS track history
current_sensor_data = None   # None = ESP32 never connected

# Fields accepted from ESP32
SENSOR_FIELDS = [
    'station_id', 'station_name',
    'temperature', 'humidity',
    'latitude', 'longitude', 'accuracy', 'satellites', 'altitude', 'gps_valid',
    'ph', 'co2_ppm', 'co_ppm',
    'light_intensity', 'water_level',
]

# ── Photosynthetic efficiency model ──────────────────────────────────────────
# Based on Chlorella vulgaris growth curves (Converti et al., 2009;
# Ugwu et al., 2008). Temperature is the primary limiting factor.
# Optimal range: 20–30°C → 100%; deviations reduce efficiency linearly.
CO2_GRAMS_PER_HOUR_MAX = 4.34   # = 38 kg/year ÷ 8760 h — theoretical maximum
                                  # Assumes 100% photosynthetic efficiency,
                                  # adequate light (>400 lux) and pH 6.5–7.5

def photo_efficiency(temp: float) -> float:
    """
    Returns efficiency coefficient 0.0–1.0 based on temperature.
    Model: piecewise linear approximation of Chlorella vulgaris growth response.
    Source: Converti et al. (2009), Bioresource Technology 100(1):556-561.
    """
    if temp is None:
        return 0.0
    if temp >= 40 or temp < 0:
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


@app.route('/api/sensor-data', methods=['GET', 'POST'])
def sensor_data():
    """
    GET  → current sensor readings (origin: live_measured)
    POST → ESP32 pushes new readings
    """
    global current_sensor_data, sensor_history

    if request.method == 'POST':
        data = request.json
        if not data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400

        updated = dict(current_sensor_data) if current_sensor_data else {}
        updated['timestamp'] = datetime.now().isoformat()

        for field in SENSOR_FIELDS:
            value = data.get(field)
            if value is not None:
                updated[field] = value

        current_sensor_data = updated

        sensor_history.append(current_sensor_data.copy())
        if len(sensor_history) > 500:
            sensor_history.pop(0)

        if updated.get('gps_valid') and updated.get('latitude') and updated.get('longitude'):
            lat = updated['latitude']
            lng = updated['longitude']
            if not gps_track or abs(gps_track[-1]['lat'] - lat) > 0.00005 or abs(gps_track[-1]['lng'] - lng) > 0.00005:
                gps_track.append({'lat': lat, 'lng': lng, 'timestamp': updated['timestamp']})
                if len(gps_track) > 500:
                    gps_track.pop(0)

        print(f"\n📊 ESP32: T={updated.get('temperature')}°C "
              f"H={updated.get('humidity')}% "
              f"CO={updated.get('co_ppm')} ppm "
              f"GPS={updated.get('latitude')},{updated.get('longitude')}")

        socketio.emit('sensor_update', current_sensor_data)
        return jsonify({'status': 'received', 'data': current_sensor_data}), 201

    if current_sensor_data is None:
        return jsonify({
            'status': 'offline',
            'message': 'ESP32 not connected',
            'data_source': 'none'
        }), 200

    return jsonify({
        'status': 'online',
        'data': current_sensor_data,
        'data_source': 'live_measured',
        'origin': 'ESP32 hardware sensors'
    }), 200


@app.route('/api/gps-track', methods=['GET'])
def get_gps_track():
    return jsonify({'status': 'ok', 'track': gps_track, 'count': len(gps_track)}), 200


@app.route('/api/gps-track', methods=['DELETE'])
def clear_gps_track():
    global gps_track
    gps_track = []
    socketio.emit('track_cleared', {})
    return jsonify({'status': 'ok', 'message': 'Track cleared'}), 200


@app.route('/api/sensor-history', methods=['GET'])
def get_sensor_history():
    limit = min(int(request.args.get('limit', 100)), 500)
    return jsonify({
        'status': 'ok',
        'history': sensor_history[-limit:],
        'total': len(sensor_history),
        'data_source': 'live_measured',
        'origin': 'ESP32 hardware sensors, stored in memory'
    }), 200


@app.route('/api/co2-absorbed', methods=['GET'])
def co2_absorbed():
    """
    Estimated cumulative CO2 absorbed since server start.

    METHODOLOGY (transparent):
      This is a MODEL-BASED ESTIMATE, not a direct measurement.
      CO2 absorption is not directly measured by the current sensor suite.

      Formula: Σ (efficiency(T_i) × 4.34 g/h × Δt_i hours)

      Where:
        - efficiency(T) = piecewise function of temperature (Converti et al. 2009)
        - 4.34 g/h = theoretical max rate for 38 kg/year baseline
        - 38 kg/year = literature value for Chlorella vulgaris bioreactor
          bench (1 m² algae culture, ambient CO2 conditions)
        - Δt = time between consecutive ESP32 readings (capped at 1h per interval)

      Assumptions & limitations:
        - Light intensity assumed adequate (not factored in this version)
        - pH assumed within optimal range (6.5–7.5)
        - No direct CO2 measurement inlet/outlet differential
        - Estimate accuracy: ±30–50% (research-grade approximation)
    """
    if not sensor_history or len(sensor_history) < 2:
        return jsonify({
            'status': 'ok',
            'grams': 0.0,
            'records': len(sensor_history),
            'data_source': 'estimated',
            'origin': 'temperature_model',
            'esp32_connected': current_sensor_data is not None,
            'methodology': 'Insufficient sensor history for estimation',
            'confidence': 'none'
        }), 200

    total_grams = 0.0
    used_records = 0

    for i in range(1, len(sensor_history)):
        prev = sensor_history[i - 1]
        curr = sensor_history[i]

        temp = curr.get('temperature')
        eff = photo_efficiency(temp) if temp is not None else 0.0

        try:
            t1 = datetime.fromisoformat(prev.get('timestamp', ''))
            t2 = datetime.fromisoformat(curr.get('timestamp', ''))
            hours = min((t2 - t1).total_seconds() / 3600, 1.0)
        except Exception:
            hours = 0.0083  # ~30 seconds fallback

        total_grams += eff * CO2_GRAMS_PER_HOUR_MAX * hours
        used_records += 1

    return jsonify({
        'status': 'ok',
        'grams': round(total_grams, 3),
        'records': used_records,
        'data_source': 'estimated',
        'origin': 'temperature_efficiency_model',
        'esp32_connected': current_sensor_data is not None,
        'methodology': (
            'Model-based estimate using temperature-dependent photosynthetic '
            'efficiency curve for Chlorella vulgaris. Not a direct measurement. '
            'Baseline: 38 kg CO2/year at 100% efficiency (literature value).'
        ),
        'formula': 'sum(efficiency(T_i) * 4.34 g/h * delta_t_i)',
        'confidence': 'low_to_medium',
        'accuracy_note': '±30-50% (research-grade approximation)'
    }), 200


@app.route('/api/ai-analyze-sensors', methods=['POST'])
def ai_analyze_sensors():
    """
    AI analysis of sensor conditions.
    Uses real sensor data if available; falls back to provided values.
    Clearly indicates data origin in response.
    """
    global current_sensor_data
    req = request.json or {}
    sd = current_sensor_data or {}

    # Track which values come from real sensors vs defaults
    params = {}
    param_origins = {}

    def resolve(key, default, unit=''):
        val = req.get(key) or sd.get(key)
        if val is not None:
            params[key] = val
            param_origins[key] = 'live_measured'
        else:
            params[key] = default
            param_origins[key] = 'default_assumed'
        return params[key]

    temperature     = resolve('temperature',     22,  '°C')
    humidity        = resolve('humidity',        65,  '%')
    light_intensity = resolve('light_intensity', 450, 'lux')
    co2_ppm         = resolve('co2_ppm',         420, 'ppm')
    co_ppm          = resolve('co_ppm',          0,   'ppm')
    ph              = resolve('ph',              7.0, '')

    data_quality = 'live' if current_sensor_data else 'defaults_used'

    co_line = f"• CO (carbon monoxide): {co_ppm} ppm (safe <50 ppm)\n" if co_ppm else ""

    prompt = f"""Sensor data from GreenPulse bioreactor bench:
• Temperature: {temperature}°C (optimal 20–25°C)
• Humidity: {humidity}% (optimal 60–80%)
• Light: {light_intensity} lux (optimal 400–600)
• CO2: {co2_ppm} ppm (ambient ~420 ppm normal)
• pH: {ph} (optimal 6.5–7.5)
{co_line}
Data quality: {data_quality}

Respond strictly in this format, one item per line:

🟢 Status: [Optimal / Good / Needs attention / Critical]
📋 Assessment: [1–2 sentences on overall system state]
✅ Within range: [list parameters in range, comma-separated]
⚠️ Deviations: [parameters out of range with values, or "None"]
🔧 Recommendation: [one specific actionable step]"""

    try:
        if not client:
            return jsonify({'status': 'error', 'message': 'OpenAI client not available'}), 500

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": (
                    "You are a scientific advisor for GreenPulse, a Chlorella vulgaris "
                    "bioreactor monitoring system. Be precise and data-driven. "
                    "If data quality is 'defaults_used', note that live sensor data "
                    "is unavailable and analysis is based on assumed defaults."
                )},
                {"role": "user", "content": prompt}
            ],
            max_tokens=250,
            temperature=0.3
        )

        return jsonify({
            'status': 'success',
            'analysis': response.choices[0].message.content,
            'parameters': params,
            'parameter_origins': param_origins,
            'data_source': 'ai_generated',
            'input_quality': data_quality,
            'model': 'gpt-4o',
            'disclaimer': (
                'AI-generated analysis based on sensor readings. '
                'Not a substitute for manual inspection.'
            )
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/ai-predict-growth', methods=['POST'])
def ai_predict_growth():
    """
    AI-based CO2 absorption forecast.
    Uses real conditions if available; clearly marks data origin.
    """
    req = request.json or {}
    sd = current_sensor_data or {}

    ph              = req.get('ph')              or sd.get('ph',              7.0)
    temperature     = req.get('temperature')     or sd.get('temperature',     22)
    light_intensity = req.get('light_intensity') or sd.get('light_intensity', 450)

    data_quality = 'live' if current_sensor_data else 'defaults_used'
    eff = photo_efficiency(temperature)

    prompt = f"""GreenPulse bioreactor conditions:
• pH: {ph} (optimal 6.5–7.5)
• Temperature: {temperature}°C (optimal 20–25°C)
• Light: {light_intensity} lux (optimal 400–600)
• Calculated efficiency: {round(eff * 100)}% (temperature model)
• Data quality: {data_quality}
• Baseline: 38 kg CO2/year at 100% efficiency (Chlorella vulgaris literature value)

Provide CO2 absorption forecast. If data_quality is defaults_used, note this is a hypothetical projection.

Respond strictly:
⚡ Efficiency: [number]% — [brief reason]
⏱ Per 1 hour: [number] g CO2
🌙 Per 24 hours: [number] g CO2
📅 Per month: [number] g CO2
🌍 Per year: [number] kg CO2
📝 Note: [1 sentence on reliability of this estimate]
💡 To improve: [one specific action]"""

    try:
        if not client:
            return jsonify({'status': 'error', 'message': 'OpenAI client not available'}), 500

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": (
                    "You are a bioreactor scientist. Be factual and precise. "
                    "Always distinguish between estimated and measured values."
                )},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.2
        )

        return jsonify({
            'status': 'success',
            'prediction': response.choices[0].message.content,
            'conditions': {'ph': ph, 'temperature': temperature, 'light_intensity': light_intensity},
            'calculated_efficiency': round(eff * 100, 1),
            'data_source': 'ai_generated',
            'input_quality': data_quality,
            'disclaimer': (
                'Forecast based on temperature-efficiency model + AI interpretation. '
                'Actual absorption depends on algae density, light spectrum, and CO2 gradient. '
                'Accuracy: ±30–50%.'
            )
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """Scientific chatbot about GreenPulse technology."""
    data = request.json or {}
    user_message = data.get('message', '')
    history = data.get('history', [])

    if not user_message:
        return jsonify({'status': 'error', 'message': 'Message cannot be empty'}), 400

    system_prompt = """You are a scientific assistant for GreenPulse, a Chlorella vulgaris algae bioreactor bench that monitors and improves urban air quality.

SCIENTIFIC FACTS (verified):
- Microorganism: Chlorella vulgaris (green microalgae)
- CO2 absorption mechanism: photosynthesis (6CO2 + 6H2O → C6H12O6 + 6O2)
- Temperature optimum: 20–30°C for peak photosynthetic efficiency
- pH optimum: 6.5–7.5 for algae health
- Light requirement: >400 lux for active photosynthesis
- Baseline absorption rate: ~38 kg CO2/year (literature estimate at 100% efficiency, 1m² culture)
  NOTE: This is a theoretical model value, not a directly measured result from this specific unit
- Tree equivalent: ~15 trees (based on average tree CO2 uptake of ~2.5 kg/year)
  NOTE: This is an approximation; tree uptake varies widely by species and age

SENSOR SYSTEM:
- Temperature & humidity: DHT22/SHT30
- CO2: MH-Z19 or equivalent (ambient monitoring)
- CO (carbon monoxide): MQ-7 (safety monitoring, normal <50 ppm)
- pH: analog pH probe (algae health indicator)
- Light: LDR/photodiode (photosynthesis sufficiency)
- GPS: NEO-6M (location tracking)

CURRENT PROJECT STATUS:
- Prototype/pilot stage
- ESP32 microcontroller-based IoT system
- Real-time monitoring dashboard
- CO2 absorption is currently estimated from temperature model, not directly measured

RESPONSE STYLE:
- Be precise and scientifically honest
- Distinguish between measured values and model estimates
- Keep responses concise (2–3 sentences)
- Use Russian language
- Use emojis sparingly for clarity"""

    try:
        if not client:
            return jsonify({'status': 'error', 'message': 'OpenAI client not available'}), 500

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history[-10:])
        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )

        return jsonify({
            'status': 'success',
            'response': response.choices[0].message.content,
            'user_message': user_message
        }), 200

    except Exception as e:
        print(f"❌ Chatbot error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'esp32_connected': current_sensor_data is not None,
        'gps_track_points': len(gps_track),
        'history_records': len(sensor_history),
        'data_sources': {
            'sensor_data': 'live_measured' if current_sensor_data else 'unavailable',
            'co2_estimate': 'temperature_model' if len(sensor_history) >= 2 else 'insufficient_data',
            'ai_analysis': 'gpt-4o' if client else 'unavailable'
        }
    }), 200


# WebSocket events
@socketio.on('connect')
def on_connect():
    print("🔌 WebSocket client connected")
    if current_sensor_data:
        emit('sensor_update', current_sensor_data)


@socketio.on('disconnect')
def on_disconnect():
    print("🔌 WebSocket client disconnected")


@socketio.on('request_track')
def on_request_track():
    emit('full_track', {'track': gps_track})


# Static files (legacy Vite build)
@app.route('/')
def index():
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
    if os.path.exists(os.path.join(dist_path, 'index.html')):
        return send_from_directory(dist_path, 'index.html')
    return jsonify({'error': 'React build not found. Run: npm run build'}), 503


@app.route('/assets/<path:filename>')
def serve_assets(filename):
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
    return send_from_directory(os.path.join(dist_path, 'assets'), filename)


@app.route('/<path:filename>')
def static_files(filename):
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
    file_path = os.path.join(dist_path, filename)

    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(dist_path, filename)

    if not any(filename.startswith(p) for p in ['api/', 'assets/', 'socket.io']):
        index_path = os.path.join(dist_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(dist_path, 'index.html')

    return jsonify({'error': f'File not found: {filename}'}), 404


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    print(f"🚀 GreenPulse server starting on port {port}")
    print(f"📡 WebSocket: enabled (eventlet)")
    socketio.run(app, debug=debug, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
