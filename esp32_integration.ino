// GreenPulse ESP32 Integration
// GPS датчик + температурный датчик (DHT22)
// pH датчик - добавим позже

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// ============ WiFi Конфигурация ============
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://192.168.1.100:5000/api/sensor-data"; // IP адрес компьютера с Flask

// ============ DHT22 (Датчик температуры и влажности) ============
#define DHTPIN 4          // GPIO4 (D4 на ESP32)
#define DHTTYPE DHT22     // DHT 22 (AM2302)
DHT dht(DHTPIN, DHTTYPE);

// ============ GPS (NEO-6M) ============
// TX: GPIO17 (U2RXD)
// RX: GPIO16 (U2TXD)
#define GPS_RX 16
#define GPS_TX 17
#define GPS_BAUDRATE 9600

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);  // Serial2 для GPS

// ============ Переменные для хранения данных ============
float temperature = 22.3;
float humidity = 65.0;
float latitude = 55.7558;    // Москва (демо)
float longitude = 37.6173;
float accuracy = 10.0;       // Точность в метрах
int satellites = 0;          // Количество спутников
float altitude = 0.0;        // Высота

// ============ Время отправки данных ============
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 60000; // 60 секунд

void setup() {
  Serial.begin(115200);
  delay(100);

  // Инициализируем DHT22
  Serial.println("\n\n=== GreenPulse ESP32 ===");
  Serial.println("Инициализирую DHT22...");
  dht.begin();
  delay(500);

  // Инициализируем GPS
  Serial.println("Инициализирую GPS (Serial2)...");
  gpsSerial.begin(GPS_BAUDRATE, SERIAL_8N1, GPS_RX, GPS_TX);
  delay(500);

  // Подключаемся к WiFi
  Serial.println("\nПодключаюсь к WiFi...");
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi подключена!");
    Serial.print("IP адрес: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Не удалось подключиться к WiFi");
    Serial.println("Продолжаю работу с демо данными...");
  }

  delay(1000);
}

void loop() {
  // Читаем GPS данные (постоянно)
  readGPS();

  // Читаем датчик температуры
  readDHT22();

  // Отправляем данные на сервер каждые 60 секунд
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    sendDataToServer();
    lastSendTime = millis();
  }

  delay(100);
}

// ============ Функция чтения GPS ============
void readGPS() {
  // Обрабатываем входящие данные от GPS
  while (gpsSerial.available() > 0) {
    char c = gpsSerial.read();

    if (gps.encode(c)) {
      // Когда получена полная позиция
      if (gps.location.isUpdated()) {
        latitude = gps.location.lat();
        longitude = gps.location.lng();
        accuracy = gps.hdop.hdop();  // HDOP - точность
        altitude = gps.altitude.meters();
        satellites = gps.satellites.value();

        Serial.println("\n📍 GPS ДАННЫЕ:");
        Serial.print("  Широта: ");
        Serial.println(latitude, 6);
        Serial.print("  Долгота: ");
        Serial.println(longitude, 6);
        Serial.print("  Точность (HDOP): ");
        Serial.println(accuracy, 2);
        Serial.print("  Высота: ");
        Serial.print(altitude, 2);
        Serial.println(" м");
        Serial.print("  Спутников: ");
        Serial.println(satellites);
      }
    }
  }

  // Проверяем если есть timeout (более 5 сек нет данных)
  if (millis() > 5000 && gps.charsProcessed() < 10) {
    Serial.println("⚠️  GPS: нет данных. Проверьте подключение!");
  }
}

// ============ Функция чтения DHT22 ============
void readDHT22() {
  // Читаем только каждые 2 секунды (DHT имеет минимум 2 сек между чтениями)
  static unsigned long lastDHTTime = 0;

  if (millis() - lastDHTTime >= 2000) {
    lastDHTTime = millis();

    // Читаем влажность
    float h = dht.readHumidity();
    // Читаем температуру в Цельсиях
    float t = dht.readTemperature();

    // Проверяем валидность данных
    if (isnan(h) || isnan(t)) {
      Serial.println("❌ Ошибка чтения DHT22!");
      return;
    }

    temperature = t;
    humidity = h;

    Serial.println("\n🌡️  DHT22 ДАННЫЕ:");
    Serial.print("  Температура: ");
    Serial.print(temperature);
    Serial.println(" °C");
    Serial.print("  Влажность: ");
    Serial.print(humidity);
    Serial.println(" %");
  }
}

// ============ Функция отправки данных на сервер ============
void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi не подключена. Пропускаю отправку.");
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Создаём JSON с данными
  StaticJsonDocument<256> doc;

  // Данные которые у нас есть
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["latitude"] = latitude;
  doc["longitude"] = longitude;
  doc["accuracy"] = accuracy;
  doc["satellites"] = satellites;
  doc["altitude"] = altitude;

  // Демо данные (пока нет pH датчика)
  doc["ph"] = 6.5;  // Добавим реальный pH позже
  doc["co2_ppm"] = 420;
  doc["light_intensity"] = 450;
  doc["water_level"] = 85;

  // Информация о станции
  doc["station_id"] = 1;
  doc["station_name"] = "GreenPulse Station 01 - Mobile";

  String payload;
  serializeJson(doc, payload);

  Serial.println("\n📤 Отправляю данные на сервер...");
  Serial.println("Данные:");
  Serial.println(payload);

  int httpCode = http.POST(payload);

  Serial.print("HTTP статус: ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    if (httpCode == HTTP_CODE_CREATED || httpCode == HTTP_CODE_OK) {
      Serial.println("✅ Данные успешно отправлены!");

      // Выводим ответ
      String response = http.getString();
      Serial.println("Ответ сервера:");
      Serial.println(response);
    } else {
      Serial.print("❌ Ошибка сервера: ");
      Serial.println(httpCode);
    }
  } else {
    Serial.print("❌ Ошибка отправки: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}

/*
═════════════════════════════════════════════════════════════════════════

ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ:

1. КОМПОНЕНТЫ:
   - ESP32 (DevKit v1)
   - DHT22 (датчик температуры + влажность)
   - GPS модуль NEO-6M
   - микро-USB кабель

2. ПОДКЛЮЧЕНИЕ:

   DHT22:
   ├─ VCC → 3.3V (или 5V)
   ├─ GND → GND
   └─ DATA → GPIO4 (D4)

   GPS (NEO-6M):
   ├─ VCC → 5V (или 3.3V)
   ├─ GND → GND
   ├─ TX → GPIO16 (U2RXD)
   └─ RX → GPIO17 (U2TXD)

3. УСТАНОВКА БИБЛИОТЕК:
   - DHT sensor library by Adafruit (v1.4.3+)
   - TinyGPS++ by Mikal Hart (v1.0.2+)

4. КОНФИГУРАЦИЯ:
   - Замени YOUR_WIFI_SSID на свой WiFi
   - Замени YOUR_WIFI_PASSWORD на пароль
   - Замени 192.168.1.100 на IP адрес компьютера с Flask

5. ЗАГРУЗКА:
   - Доска: ESP32 Dev Module
   - Upload Speed: 115200
   - Флеш размер: 4MB

6. МОНИТОРИНГ:
   - Откройте Serial Monitor (9600 бод)
   - Вы увидите логи подключения и отправку данных

═════════════════════════════════════════════════════════════════════════

ДОБАВЛЕНИЕ pH ДАТЧИКА:

Когда будет pH датчик (например, DFRobot Analog pH Sensor):

1. Подключи к GPIO35 (аналоговый вход)
2. Добавь калибровку (7.0 и 10.0)
3. Обнови JSON с ph значением

Пример кода:
  #define PH_PIN 35

  void readpH() {
    int raw = analogRead(PH_PIN);
    float voltage = raw * (3.3 / 4095.0);
    float ph = 7.0 + (voltage - 2.5) / 0.18;  // Примерная формула
    return ph;
  }

═════════════════════════════════════════════════════════════════════════

JSON ЧТО ОТПРАВЛЯЕТСЯ:

{
  "temperature": 22.3,        // °C
  "humidity": 65.0,           // %
  "latitude": 55.7558,        // широта GPS
  "longitude": 37.6173,       // долгота GPS
  "accuracy": 10.0,           // метры (HDOP)
  "satellites": 12,           // количество спутников
  "altitude": 150.5,          // метры
  "ph": 6.5,                  // пока демо, потом реальное
  "co2_ppm": 420,            // пока демо
  "light_intensity": 450,    // пока демо
  "water_level": 85,         // пока демо
  "station_id": 1,           // ID станции
  "station_name": "..."      // имя станции
}

═════════════════════════════════════════════════════════════════════════

ОСОБЕННОСТИ:

✓ WiFi автоматическое подключение
✓ GPS парсинг в реальном времени
✓ DHT22 чтение каждые 2 секунды
✓ Отправка на сервер каждые 60 секунд
✓ Обработка ошибок и timeout'ов
✓ Serial логирование всех операций
✓ Готовность к добавлению pH датчика

═════════════════════════════════════════════════════════════════════════
*/
