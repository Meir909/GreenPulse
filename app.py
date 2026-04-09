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

# Инициализируем OpenAI клиент с обработкой ошибок
try:
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    print("✅ OpenAI клиент успешно инициализирован")
except Exception as e:
    print(f"❌ Ошибка инициализации OpenAI клиента: {e}")
    client = None

# Хранилище данных датчиков
sensor_history = []          # Последние 500 показаний
gps_track = []               # История GPS координат для трека
current_sensor_data = None   # None = ESP32 ещё не подключалась

# Поля которые принимаем от ESP32
SENSOR_FIELDS = [
    'station_id', 'station_name',
    'temperature', 'humidity',
    'latitude', 'longitude', 'accuracy', 'satellites', 'altitude', 'gps_valid',
    'ph', 'co2_ppm', 'co_ppm',           # co_ppm = MQ-7 угарный газ
    'light_intensity', 'water_level',
]

@app.route('/api/sensor-data', methods=['GET', 'POST'])
def sensor_data():
    """
    GET: получить текущие данные датчиков с ESP32
    POST: ESP32 отправляет реальные данные сюда
    """
    global current_sensor_data, sensor_history

    if request.method == 'POST':
        data = request.json
        if not data:
            return jsonify({'status': 'error', 'message': 'Нет данных'}), 400

        # Начинаем с предыдущих данных или пустого словаря
        updated = dict(current_sensor_data) if current_sensor_data else {}
        updated['timestamp'] = datetime.now().isoformat()

        # Обновляем только те поля, которые не None (игнорируем null)
        for field in SENSOR_FIELDS:
            value = data.get(field)
            if value is not None:
                updated[field] = value

        current_sensor_data = updated

        # Храним историю (последние 500)
        sensor_history.append(current_sensor_data.copy())
        if len(sensor_history) > 500:
            sensor_history.pop(0)

        # Сохраняем GPS трек (последние 500 точек)
        if updated.get('gps_valid') and updated.get('latitude') and updated.get('longitude'):
            lat = updated['latitude']
            lng = updated['longitude']
            # Добавляем точку только если она отличается от предыдущей (минимум 5м)
            if not gps_track or abs(gps_track[-1]['lat'] - lat) > 0.00005 or abs(gps_track[-1]['lng'] - lng) > 0.00005:
                gps_track.append({
                    'lat': lat,
                    'lng': lng,
                    'timestamp': updated['timestamp']
                })
                if len(gps_track) > 500:
                    gps_track.pop(0)

        print(f"\n📊 ESP32: T={updated.get('temperature')}°C "
              f"H={updated.get('humidity')}% "
              f"CO={updated.get('co_ppm')} ppm "
              f"GPS={updated.get('latitude')},{updated.get('longitude')}")

        # Уведомляем всех WebSocket клиентов о новых данных
        socketio.emit('sensor_update', current_sensor_data)

        return jsonify({'status': 'received', 'data': current_sensor_data}), 201

    # GET: если ESP32 ещё не подключалась — возвращаем offline статус
    if current_sensor_data is None:
        return jsonify({'status': 'offline', 'message': 'ESP32 не подключена'}), 200

    return jsonify({'status': 'online', 'data': current_sensor_data}), 200


@app.route('/api/gps-track', methods=['GET'])
def get_gps_track():
    """Возвращает историю GPS координат для отображения трека на карте"""
    return jsonify({
        'status': 'ok',
        'track': gps_track,
        'count': len(gps_track)
    }), 200


@app.route('/api/gps-track', methods=['DELETE'])
def clear_gps_track():
    """Очищает GPS трек"""
    global gps_track
    gps_track = []
    socketio.emit('track_cleared', {})
    return jsonify({'status': 'ok', 'message': 'Трек очищен'}), 200


@app.route('/api/sensor-history', methods=['GET'])
def get_sensor_history():
    """Возвращает историю показаний (последние 100)"""
    limit = min(int(request.args.get('limit', 100)), 500)
    return jsonify({
        'status': 'ok',
        'history': sensor_history[-limit:],
        'total': len(sensor_history)
    }), 200


@app.route('/api/co2-absorbed', methods=['GET'])
def co2_absorbed():
    """
    Рассчитывает суммарное поглощение CO2 с момента запуска.
    Биореактор GreenPulse поглощает до 38 кг CO2/год = ~4.34 г/час.
    Используем данные из истории для оценки.
    """
    if len(sensor_history) < 2:
        return jsonify({'status': 'ok', 'grams': 0, 'records': len(sensor_history)}), 200

    total_grams = 0.0
    for i in range(1, len(sensor_history)):
        prev = sensor_history[i - 1]
        curr = sensor_history[i]

        # Вычисляем эффективность по температуре
        temp = curr.get('temperature') or 22
        if temp >= 40 or temp < 0:
            eff = 0
        elif temp < 10:
            eff = 0.02
        elif temp < 15:
            eff = 0.15
        elif temp < 20:
            eff = 0.45
        elif temp <= 30:
            eff = 1.0
        elif temp <= 35:
            eff = 0.5
        else:
            eff = 0.1

        # Разница по времени в часах
        try:
            from datetime import datetime
            t1 = datetime.fromisoformat(prev.get('timestamp', ''))
            t2 = datetime.fromisoformat(curr.get('timestamp', ''))
            hours = (t2 - t1).total_seconds() / 3600
            hours = min(hours, 1.0)  # cap at 1 hour per record
        except Exception:
            hours = 0.0083  # ~30 seconds default

        # 38 кг/год / (365 * 24) часов = 4.34 г/час при 100% эффективности
        total_grams += eff * 4.34 * hours

    return jsonify({
        'status': 'ok',
        'grams': round(total_grams, 2),
        'records': len(sensor_history)
    }), 200


@app.route('/api/ai-analyze-sensors', methods=['POST'])
def ai_analyze_sensors():
    """
    ИИ анализирует данные датчиков и дает рекомендации
    Поддерживает: температура, влажность, свет, CO2, CO (MQ-7), GPS
    """
    global current_sensor_data
    data = request.json
    sd = current_sensor_data or {}

    temperature = data.get('temperature') or sd.get('temperature', 22)
    humidity = data.get('humidity') or sd.get('humidity', 65)
    light_intensity = data.get('light_intensity') or sd.get('light_intensity', 450)
    co2_ppm = data.get('co2_ppm') or sd.get('co2_ppm', 420)
    co_ppm = data.get('co_ppm') or sd.get('co_ppm', 0)
    latitude = data.get('latitude') or sd.get('latitude', 0)
    longitude = data.get('longitude') or sd.get('longitude', 0)
    satellites = data.get('satellites') or sd.get('satellites', 0)

    co_line = f"• CO (угарный газ): {co_ppm} ppm (норма < 50 ppm)\n" if co_ppm else ""

    prompt = f"""Данные станции GreenPulse:
• Температура: {temperature}°C (норма 20–25°C)
• Влажность: {humidity}% (норма 60–80%)
• Свет: {light_intensity} люкс (норма 400–600)
• CO2: {co2_ppm} ppm (норма 400–450)
{co_line}
Ответь строго в этом формате, каждый пункт с новой строки, без лишних слов:

🟢 Статус: [Оптимально / Хорошо / Требует внимания]
📋 Оценка: [1–2 предложения об общем состоянии системы]
✅ В норме: [список параметров через запятую]
⚠️ Отклонения: [параметры вне нормы с реальными значениями, или "все в норме"]
🔧 Действие: [одна конкретная рекомендация]"""

    try:
        if not client:
            return jsonify({'status': 'error', 'message': 'OpenAI клиент не доступен'}), 500

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Ты эксперт-консультант GreenPulse. Строго следуй формату ответа. Только русский язык, кратко и по делу."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.4
        )

        analysis = response.choices[0].message.content

        return jsonify({
            'status': 'success',
            'analysis': analysis,
            'parameters': {
                'temperature': temperature,
                'humidity': humidity,
                'light_intensity': light_intensity,
                'co2_ppm': co2_ppm,
                'co_ppm': co_ppm,
                'latitude': latitude,
                'longitude': longitude,
                'satellites': satellites
            }
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/ai-predict-growth', methods=['POST'])
def ai_predict_growth():
    """
    ИИ предсказывает сколько CO2 поглотится за час
    """
    data = request.json
    sd = current_sensor_data or {}

    ph = data.get('ph') or sd.get('ph', 7.0)
    temperature = data.get('temperature') or sd.get('temperature', 22)
    light_intensity = data.get('light_intensity') or sd.get('light_intensity', 450)

    prompt = f"""Данные станции GreenPulse:
• pH: {ph} (норма 6.5–7.5)
• Температура: {temperature}°C (норма 20–25°C)
• Свет: {light_intensity} люкс (норма 400–600)

Рассчитай прогноз поглощения CO2 биореактором GreenPulse (1 скамейка = до 38 кг CO2/год).
Ответь строго в этом формате, каждый пункт с новой строки:

⚡ Эффективность: [число]% — [1–2 слова почему]
⏱ За 1 час: [число] г CO2
🌙 За 24 часа: [число] г CO2
📅 За месяц: [число] г CO2
🌍 За год: [число] кг CO2
💡 Как повысить: [одно конкретное действие]"""

    try:
        if not client:
            return jsonify({'status': 'error', 'message': 'OpenAI клиент не доступен'}), 500

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Ты эксперт по биореакторам GreenPulse. Строго следуй формату. Только числа, факты, русский язык."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.3
        )

        prediction = response.choices[0].message.content

        return jsonify({
            'status': 'success',
            'prediction': prediction,
            'conditions': {
                'ph': ph,
                'temperature': temperature,
                'light_intensity': light_intensity
            }
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """
    Чат-бот отвечает на вопросы про GreenPulse, балдыри, экологию
    """
    data = request.json
    user_message = data.get('message', '')
    history = data.get('history', [])

    if not user_message:
        return jsonify({'status': 'error', 'message': 'Сообщение не может быть пусто'}), 400

    system_prompt = """Ты помощник GreenPulse - инновационной системы для очистки воздуха от CO2 с помощью биореакторных скамеек.

📋 ИНФОРМАЦИЯ О GREENPULSE:
- Биореакторная скамейка для отдыха и очистки воздуха
- 1 скамейка очищает 38 кг CO2 в год (эквивалент 15 деревьев)
- Экономит $1,900 в год на одну скамейку
- Обслуживает 15,000 человек в зоне 0.8 км
- Использует натуральный фотосинтез, без электричества и химикатов
- Работает с эффективностью 92%
- Стоимость: $500-800 за единицу
- Бизнес-модели: B2G (школы, муниципалитеты), B2B (компании ESG), Гранты, Биомасса

🔬 ДАТЧИКИ СИСТЕМЫ:
- Температура и влажность (DHT22/SHT30)
- CO2 (MH-Z19 или аналог) — поглощение балдырями
- CO — угарный газ MQ-7 (норма < 50 ppm, опасно > 200 ppm)
- pH воды (норма 6.5–7.5)
- Освещённость (норма 400–600 люкс)
- GPS (отслеживание местоположения скамейки)

🧬 О БАЛДЫРЯХ (Baldyria):
- Микроорганизм, который поглощает CO2 через фотосинтез
- Растет в биореакторе при pH 6.5-7.5 и температуре 20-25°C
- Требует света для интенсивного фотосинтеза

📊 ОПТИМАЛЬНЫЕ УСЛОВИЯ:
- Температура: 20-25°C
- Влажность: 60-80%
- pH: 6.5-7.5
- Свет: 400-600 люкс
- CO2: 400-450 ppm
- CO (угарный газ): < 50 ppm

💡 СТИЛЬ ОТВЕТОВ:
- Кратко и информативно (2-3 предложения за раз)
- На русском языке
- Используй эмодзи для наглядности
- Будь дружелюбным консультантом"""

    try:
        if not client:
            return jsonify({'status': 'error', 'message': 'OpenAI клиент не доступен'}), 500

        messages = [{"role": "system", "content": system_prompt}]

        if history and len(history) > 0:
            recent_history = history[-10:]
            messages.extend(recent_history)

        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )

        bot_response = response.choices[0].message.content

        return jsonify({
            'status': 'success',
            'response': bot_response,
            'user_message': user_message
        }), 200

    except Exception as e:
        print(f"❌ Chatbot error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Проверка что сервер работает"""
    return jsonify({
        'status': 'ok',
        'message': 'GreenPulse API работает',
        'esp32_connected': current_sensor_data is not None,
        'gps_track_points': len(gps_track),
        'history_records': len(sensor_history)
    }), 200


# WebSocket события
@socketio.on('connect')
def on_connect():
    print(f"🔌 WebSocket клиент подключился")
    # Сразу отправляем текущие данные новому клиенту
    if current_sensor_data:
        emit('sensor_update', current_sensor_data)


@socketio.on('disconnect')
def on_disconnect():
    print(f"🔌 WebSocket клиент отключился")


@socketio.on('request_track')
def on_request_track():
    """Клиент запрашивает полный GPS трек"""
    emit('full_track', {'track': gps_track})


# Статические файлы React
@app.route('/')
def index():
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
    if os.path.exists(os.path.join(dist_path, 'index.html')):
        return send_from_directory(dist_path, 'index.html')
    else:
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

    if not any(filename.startswith(prefix) for prefix in ['api/', 'assets/', 'socket.io']):
        index_path = os.path.join(dist_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(dist_path, 'index.html')

    return jsonify({'error': f'File not found: {filename}'}), 404


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    print(f"🚀 GreenPulse сервер запускается на порту {port}")
    print(f"📡 WebSocket поддержка: включена (eventlet)")
    socketio.run(app, debug=debug, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
