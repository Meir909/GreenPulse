/*
  GreenPulse ESP32 — WiFi Sensor Node
  Датчики: DHT22 (темп/влажность снаружи), DS18B20 (темп внутри), MQ135 (воздух), GPS NEO-6M
  Отправляет данные на Vercel API каждые 30 секунд
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// ── Настройки WiFi ──────────────────────────────────────────────────
const char* WIFI_SSID     = "ВАШ_WIFI_SSID";       // ← поменяй
const char* WIFI_PASSWORD = "ВАШ_WIFI_ПАРОЛЬ";     // ← поменяй

// ── URL вашего Vercel бэкенда ───────────────────────────────────────
const char* SERVER_URL = "https://greenp.vercel.app/api/sensor-data";  // ← поменяй на свой домен

// ── Пины ────────────────────────────────────────────────────────────
#define DHT_PIN         4    // DHT22 — температура/влажность снаружи
#define DHT_TYPE        DHT22
#define DS18B20_PIN     5    // DS18B20 — температура внутри модели
#define MQ135_PIN       34   // MQ135 — аналоговый вход (качество воздуха)
#define GPS_RX_PIN      16   // GPS NEO-6M RX
#define GPS_TX_PIN      17   // GPS NEO-6M TX

// ── Станция ─────────────────────────────────────────────────────────
const int    STATION_ID   = 1;
const char*  STATION_NAME = "GreenPulse Ақтау #1";

// ── Объекты датчиков ────────────────────────────────────────────────
DHT dht(DHT_PIN, DHT_TYPE);
OneWire oneWire(DS18B20_PIN);
DallasTemperature ds18b20(&oneWire);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);  // UART2

// ── Калибровка MQ135 ────────────────────────────────────────────────
// MQ135 в чистом воздухе ~400 ppm CO2. Подстрой R0 под свой датчик.
#define MQ135_R0      10.0   // Ом (калибруй в чистом воздухе)
#define MQ135_RL      10.0   // Нагрузочный резистор, кОм
#define ADC_MAX       4095.0
#define VCC           3.3

float readMQ135_ppm() {
  int raw = analogRead(MQ135_PIN);
  float voltage = (raw / ADC_MAX) * VCC;
  if (voltage <= 0.01) return 0;
  float rs = ((VCC - voltage) / voltage) * MQ135_RL;
  float ratio = rs / MQ135_R0;
  // Формула аппроксимации для CO2 (из datasheet Winsen MQ135)
  float ppm = 116.6020682 * pow(ratio, -2.769034857);
  return constrain(ppm, 0, 5000);
}

// MQ135 также даёт оценку NH3 и качества воздуха (AQI-like, 0-500)
int readAirQualityIndex() {
  float ppm = readMQ135_ppm();
  if (ppm < 400)  return 10;
  if (ppm < 500)  return 30;
  if (ppm < 700)  return 60;
  if (ppm < 1000) return 120;
  if (ppm < 2000) return 200;
  return 300;
}

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("🌿 GreenPulse ESP32 запускается...");

  // Инициализация датчиков
  dht.begin();
  ds18b20.begin();
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  analogReadResolution(12);

  // Подключение к WiFi
  Serial.printf("📶 Подключение к %s...\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n✅ WiFi подключён! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n❌ WiFi не подключён — работа без сети");
  }
}

void loop() {
  // Читаем GPS данные (1 секунда)
  unsigned long gpsStart = millis();
  while (millis() - gpsStart < 1000) {
    while (gpsSerial.available()) {
      gps.encode(gpsSerial.read());
    }
  }

  // ── Чтение DHT22 (снаружи) ──────────────────────────────────────
  float temp_outside = dht.readTemperature();
  float humidity     = dht.readHumidity();
  if (isnan(temp_outside)) temp_outside = 0;
  if (isnan(humidity))     humidity     = 0;

  // ── Чтение DS18B20 (внутри модели) ──────────────────────────────
  ds18b20.requestTemperatures();
  float temp_inside = ds18b20.getTempCByIndex(0);
  if (temp_inside == DEVICE_DISCONNECTED_C) temp_inside = 0;

  // ── Чтение MQ135 ─────────────────────────────────────────────────
  float co2_ppm     = readMQ135_ppm();
  int   air_quality = readAirQualityIndex();

  // ── GPS данные ───────────────────────────────────────────────────
  bool  gps_valid = gps.location.isValid() && gps.location.age() < 2000;
  float latitude  = gps_valid ? gps.location.lat() : 0.0;
  float longitude = gps_valid ? gps.location.lng() : 0.0;
  int   satellites = gps.satellites.isValid() ? gps.satellites.value() : 0;
  float altitude  = gps.altitude.isValid() ? gps.altitude.meters() : 0.0;

  // Вывод в Serial (для LCD)
  Serial.println("─────────────────────────────");
  Serial.printf("📡 Станция: %s\n", STATION_NAME);
  Serial.printf("🌡️  Снаружи:  %.1f°C  💧 %.0f%%\n", temp_outside, humidity);
  Serial.printf("🌡️  Внутри:   %.1f°C\n", temp_inside);
  Serial.printf("🌱 CO2:      %.0f ppm\n", co2_ppm);
  Serial.printf("💨 Воздух:   AQI %d\n", air_quality);
  if (gps_valid) {
    Serial.printf("📍 GPS: %.6f, %.6f (%d сп.)\n", latitude, longitude, satellites);
  } else {
    Serial.println("📍 GPS: поиск сигнала...");
  }

  // ── Отправка на сервер ───────────────────────────────────────────
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000);

    StaticJsonDocument<512> doc;
    doc["station_id"]   = STATION_ID;
    doc["station_name"] = STATION_NAME;

    // Температуры
    doc["temperature"]      = round(temp_outside * 10) / 10.0;
    doc["temp_inside"]      = round(temp_inside * 10) / 10.0;
    doc["humidity"]         = round(humidity);

    // MQ135
    doc["co2_ppm"]          = round(co2_ppm);
    doc["air_quality_index"]= air_quality;

    // GPS
    doc["latitude"]         = latitude;
    doc["longitude"]        = longitude;
    doc["gps_valid"]        = gps_valid;
    doc["satellites"]       = satellites;
    doc["altitude"]         = round(altitude * 10) / 10.0;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    if (code == 201 || code == 200) {
      Serial.printf("✅ Сервер: %d OK\n", code);
    } else {
      Serial.printf("⚠️  Сервер: ошибка %d\n", code);
    }
    http.end();
  }

  Serial.println("─────────────────────────────");

  // Ждём 30 секунд
  delay(30000);
}
