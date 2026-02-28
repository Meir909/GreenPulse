// GreenPulse ESP32 — DHT11 + WiFi → greenpulse-su2h.onrender.com
//
// КАК РАБОТАЕТ:
//   1. ESP32 подключается к WiFi "BB" / "Student111"
//   2. Каждую 1 сек читает DHT11 (температура — реальная)
//   3. GPS — фиксированные координаты (мы в помещении)
//   4. pH, CO2, свет — случайные значения в норме
//   5. Отправляет POST /api/sensor-data на сайт
//
// БИБЛИОТЕКИ (установить в Arduino IDE → Library Manager):
//   - DHT sensor library (by Adafruit)
//   - LiquidCrystal I2C (by Frank de Brabander)
//   - ArduinoJson (by Benoit Blanchon)
//   WiFi и HTTPClient встроены в ESP32 Arduino Core

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ===== WiFi =====
const char* WIFI_SSID     = "BB";
const char* WIFI_PASSWORD = "Student111";

// ===== Сервер =====
const char* SERVER_URL = "https://greenpulse-su2h.onrender.com/api/sensor-data";

// ===== DHT11 =====
#define DHTPIN  33
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ===== LCD 16x2 I2C =====
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ===== Фиксированный GPS (мы в помещении — Актау) =====
const float FAKE_LAT       = 43.68644;
const float FAKE_LON       = 51.15716;
const float FAKE_ALTITUDE  = 27.0;
const int   FAKE_SATELLITES = 8;

// ===== Реальные данные =====
float temperature = 22.0;

// ===== Таймер отправки =====
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 1000; // каждую 1 сек

// ===== LCD helper =====
void printLine(int row, const String& text) {
  lcd.setCursor(0, row);
  lcd.print("                ");
  lcd.setCursor(0, row);
  lcd.print(text);
}

// ===== Подключение к WiFi =====
void connectWiFi() {
  Serial.printf("Подключаюсь к WiFi: %s\n", WIFI_SSID);
  printLine(0, "Connecting WiFi");
  printLine(1, WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi OK! IP: %s\n", WiFi.localIP().toString().c_str());
    printLine(0, "WiFi OK!");
    printLine(1, WiFi.localIP().toString());
    delay(1500);
  } else {
    Serial.println("\nWiFi FAILED!");
    printLine(0, "WiFi FAILED!");
    printLine(1, "Check settings");
    delay(3000);
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);

  // LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  printLine(0, "GreenPulse");
  printLine(1, "Starting...");

  // DHT11
  dht.begin();

  // WiFi
  connectWiFi();

  // Инициализируем random на основе незаполненного АЦП
  randomSeed(analogRead(0));

  Serial.println("GreenPulse ESP32 ready!");
}

void loop() {
  // Переподключаемся если WiFi упал
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost, reconnecting...");
    connectWiFi();
  }

  readDHT11();
  updateLCD();

  // Отправляем данные каждую 1 сек
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    sendData();
    lastSendTime = millis();
  }

  delay(50);
}

// ===== Чтение DHT11 (только реальная температура) =====
void readDHT11() {
  static unsigned long lastDHT = 0;
  if (millis() - lastDHT < 2000) return;
  lastDHT = millis();

  float t = dht.readTemperature();
  if (!isnan(t)) temperature = t;

  Serial.printf("Temp: %.1f C\n", temperature);
}

// ===== Обновление LCD =====
void updateLCD() {
  static unsigned long lastLCD = 0;
  if (millis() - lastLCD < 1000) return;
  lastLCD = millis();

  char line0[17];
  snprintf(line0, sizeof(line0), "T:%.1fC GPS:OK", temperature);
  printLine(0, String(line0));
  printLine(1, "Aktau 43.68N");
}

// ===== Генерация случайного float в диапазоне =====
float randFloat(float minVal, float maxVal) {
  return minVal + (float)random(0, 1000) / 1000.0f * (maxVal - minVal);
}

// ===== Отправка данных на сервер =====
void sendData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("No WiFi, skip send");
    return;
  }

  // Фейковые значения в норме (случайные каждую секунду)
  float fakeHumidity      = randFloat(62.0, 76.0);   // норма 60-80%
  float fakeCo2           = randFloat(405.0, 445.0);  // норма 400-450 ppm
  float fakePh            = randFloat(6.6, 7.4);      // норма 6.5-7.5
  float fakeLightIntensity = randFloat(420.0, 580.0); // норма 400-600 lux
  float fakeWaterLevel    = randFloat(80.0, 90.0);    // норма 80-95%

  // Формируем JSON
  StaticJsonDocument<400> doc;
  doc["station_id"]      = 4;
  doc["station_name"]    = "GreenPulse ESP32";
  doc["temperature"]     = round(temperature * 10) / 10.0;
  doc["humidity"]        = round(fakeHumidity * 10) / 10.0;
  doc["co2_ppm"]         = (int)round(fakeCo2);
  doc["ph"]              = round(fakePh * 100) / 100.0;
  doc["light_intensity"] = (int)round(fakeLightIntensity);
  doc["water_level"]     = (int)round(fakeWaterLevel);
  doc["latitude"]        = FAKE_LAT;
  doc["longitude"]       = FAKE_LON;
  doc["altitude"]        = FAKE_ALTITUDE;
  doc["satellites"]      = FAKE_SATELLITES;
  doc["gps_valid"]       = true;

  String json;
  serializeJson(doc, json);

  Serial.printf("Sending: T=%.1f pH=%.2f CO2=%d\n", temperature, fakePh, (int)round(fakeCo2));

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // 5 сек таймаут

  int httpCode = http.POST(json);

  if (httpCode == 201) {
    Serial.println("OK 201");
  } else if (httpCode > 0) {
    Serial.printf("HTTP %d\n", httpCode);
  } else {
    Serial.printf("ERR: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}
