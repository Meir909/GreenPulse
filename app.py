from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Инициализируем OpenAI клиент с обработкой ошибок
try:
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    print("✅ OpenAI клиент успешно инициализирован")
except Exception as e:
    print(f"❌ Ошибка инициализации OpenAI клиента: {e}")
    client = None

# Демо данные ESP32 (временно, пока ESP32 не подключена)
demo_sensor_data = {
    'station_id': 1,
    'station_name': 'GreenPulse Station 01 - Mobile (ESP32)',
    'timestamp': datetime.now().isoformat(),
    'temperature': 22.3,
    'humidity': 65.0,
    'latitude': 55.7558,      # GPS - Москва
    'longitude': 37.6173,
    'accuracy': 10.0,         # точность GPS (HDOP)
    'satellites': 0,          # количество спутников
    'altitude': 150.0,        # высота
    'ph': 6.5,                # pH - добавим потом
    'co2_ppm': 420,
    'light_intensity': 450,
    'water_level': 85
}

# Хранилище данных датчиков (для демо и истории)
sensor_history = []
current_sensor_data = demo_sensor_data.copy()

@app.route('/api/sensor-data', methods=['GET', 'POST'])
def sensor_data():
    """
    GET: получить текущие данные датчиков с ESP32
    POST: получить данные с ESP32 (обновляет текущие значения)
    """
    global current_sensor_data

    if request.method == 'POST':
        # ESP32 отправляет данные сюда
        data = request.json

        # Обновляем текущие данные
        current_sensor_data = {
            'timestamp': datetime.now().isoformat(),
            'station_id': data.get('station_id', 1),
            'station_name': data.get('station_name', 'GreenPulse Station 01'),
            'temperature': data.get('temperature', demo_sensor_data['temperature']),
            'humidity': data.get('humidity', demo_sensor_data['humidity']),
            'latitude': data.get('latitude', demo_sensor_data['latitude']),      # GPS
            'longitude': data.get('longitude', demo_sensor_data['longitude']),
            'accuracy': data.get('accuracy', demo_sensor_data['accuracy']),      # GPS точность
            'satellites': data.get('satellites', demo_sensor_data['satellites']),# GPS спутники
            'altitude': data.get('altitude', demo_sensor_data['altitude']),      # GPS высота
            'ph': data.get('ph', demo_sensor_data['ph']),
            'co2_ppm': data.get('co2_ppm', demo_sensor_data['co2_ppm']),
            'light_intensity': data.get('light_intensity', demo_sensor_data['light_intensity']),
            'water_level': data.get('water_level', demo_sensor_data['water_level'])
        }

        # Сохраняем в историю
        sensor_history.append(current_sensor_data.copy())

        print(f"\n📊 Получены данные с ESP32:")
        print(f"   Температура: {current_sensor_data['temperature']}°C")
        print(f"   Влажность: {current_sensor_data['humidity']}%")
        print(f"   GPS: {current_sensor_data['latitude']}, {current_sensor_data['longitude']}")
        print(f"   Спутников: {current_sensor_data['satellites']}")

        return jsonify({'status': 'received', 'data': current_sensor_data}), 201

    # GET: возвращаем текущие данные
    return jsonify(current_sensor_data), 200

@app.route('/api/ai-analyze-sensors', methods=['POST'])
def ai_analyze_sensors():
    """
    ИИ анализирует данные датчиков (температура, влажность, GPS)
    и дает рекомендации для оптимальной работы системы
    """
    global current_sensor_data
    data = request.json

    temperature = data.get('temperature', current_sensor_data['temperature'])
    humidity = data.get('humidity', current_sensor_data['humidity'])
    light_intensity = data.get('light_intensity', current_sensor_data['light_intensity'])
    co2_ppm = data.get('co2_ppm', current_sensor_data['co2_ppm'])
    latitude = data.get('latitude', current_sensor_data['latitude'])
    longitude = data.get('longitude', current_sensor_data['longitude'])
    satellites = data.get('satellites', current_sensor_data['satellites'])

    prompt = f"""Параметры станции GreenPulse:
🌡️ {temperature}°C | 💧 {humidity}% | ☀️ {light_intensity} люкс | 🌱 CO2: {co2_ppm} ppm

Дай анализ строго в этом формате (не добавляй лишнего текста):

Статус: [одно слово: Отлично / Хорошо / Внимание]
Вывод: [1 предложение — общая оценка условий]
⚠️ Проблема: [если есть — что именно не в норме, иначе напиши "нет"]
💡 Совет: [1 конкретное действие для улучшения]"""

    try:
        if not client:
            return jsonify({'status': 'error', 'message': 'OpenAI клиент не доступен'}), 500

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Ты краткий и точный консультант GreenPulse. Отвечай только по заданному формату, без лишних слов."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=120,
            temperature=0.5
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
    Вводишь условия (температура, свет, pH) → ИИ предсказывает
    """
    data = request.json
    ph = data.get('ph', demo_sensor_data['ph'])
    temperature = data.get('temperature', demo_sensor_data['temperature'])
    light_intensity = data.get('light_intensity', demo_sensor_data['light_intensity'])

    prompt = f"""Параметры станции GreenPulse:
⚗️ pH: {ph} | 🌡️ {temperature}°C | ☀️ {light_intensity} люкс

Дай прогноз поглощения CO2 строго в этом формате (без лишнего текста):

⚡ Эффективность: [число]%
За 1 ч: [число] г CO2
За 24 ч: [число] г CO2
За год: [число] кг CO2
💡 Как улучшить: [1 короткое предложение]"""

    try:
        if not client:
            return jsonify({'status': 'error', 'message': 'OpenAI клиент не доступен'}), 500

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Ты краткий эксперт по биореакторам GreenPulse. Отвечай строго по заданному формату, только цифры и факты."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.4
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
    Поддерживает историю сообщений для контекстного диалога
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

🧬 О БАЛДЫРЯХ (Baldyria):
- Микроорганизм, который поглощает CO2 через фотосинтез
- Растет в биореакторе при pH 6.5-7.5 и температуре 20-25°C
- Требует света для интенсивного фотосинтеза
- Скорость роста зависит от условий окружающей среды

📊 ОПТИМАЛЬНЫЕ УСЛОВИЯ:
- Температура: 20-25°C
- Влажность: 60-80%
- pH: 6.5-7.5
- Свет: 400-600 люкс
- CO2: 400-450 ppm

💡 СТИЛЬ ОТВЕТОВ:
- Кратко и информативно (2-3 предложения за раз)
- На русском языке
- Используй эмодзи для наглядности
- Будь дружелюбным консультантом
- Если не знаешь - честно скажи и предложи альтернативу
- Поддерживай контекст предыдущих сообщений в диалоге"""

    try:
        if not client:
            return jsonify({'status': 'error', 'message': 'OpenAI клиент не доступен'}), 500

        # Формируем сообщения с историей
        messages = [{"role": "system", "content": system_prompt}]

        # Добавляем историю диалога
        if history and len(history) > 0:
            # Ограничиваем историю последними 10 сообщениями для экономии токенов
            recent_history = history[-10:]
            messages.extend(recent_history)

        # Добавляем текущее сообщение пользователя
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
    return jsonify({'status': 'ok', 'message': 'GreenPulse API работает'}), 200

@app.route('/')
def index():
    """Главная страница - Serve React index.html"""
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
    if os.path.exists(os.path.join(dist_path, 'index.html')):
        return send_from_directory(dist_path, 'index.html')
    else:
        return jsonify({'error': 'React build not found. Run: npm run build'}), 503

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve static assets from React build"""
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
    return send_from_directory(os.path.join(dist_path, 'assets'), filename)

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files from React build (CSS, JS, etc.)"""
    dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
    file_path = os.path.join(dist_path, filename)

    # Check if file exists in dist directory
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(dist_path, filename)

    # For React Router - serve index.html for all non-API routes
    # But only if it doesn't look like a specific file request
    if not any(filename.startswith(prefix) for prefix in ['api/', 'assets/']):
        index_path = os.path.join(dist_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(dist_path, 'index.html')

    return jsonify({'error': f'File not found: {filename}'}), 404

if __name__ == '__main__':
    # Для локального развития
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'

    # Render использует PORT переменную
    app.run(debug=debug, host='0.0.0.0', port=port)
