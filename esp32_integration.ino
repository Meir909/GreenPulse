// GreenPulse ESP32 — DHT11 + NEO-6M + LCD + WiFi → greenpulse-su2h.onrender.com
//
// КАК РАБОТАЕТ:
//   1. ESP32 подключается к WiFi "BB" / "Student111"
//   2. Каждые 10 сек читает DHT11 (температура, влажность) и GPS (координаты)
//   3. Отправляет POST /api/sensor-data на сайт
//   4. Сайт показывает реальную станцию на карте
//
// БИБЛИОТЕКИ (установить в Arduino IDE → Library Manager):
//   - DHT sensor library (by Adafruit)
//   - TinyGPS++ (by Mikal Hart)
//   - LiquidCrystal I2C (by Frank de Brabander)
//   - ArduinoJson (by Benoit Blanchon)
//   WiFi и HTTPClient встроены в ESP32 Arduino Core

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
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

// ===== GPS NEO-6M =====
#define GPS_RX 16
#define GPS_TX 17
TinyGPSPlus gps;
HardwareSerial gpsSerial(1);

// ===== LCD 16x2 I2C =====
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ===== Данные датчиков =====
float temperature = 0.0;
float humidity    = 0.0;
float latitude    = 0.0;
float longitude   = 0.0;
int   satellites  = 0;
float altitude    = 0.0;
bool  gpsValid    = false;

// ===== Таймер отправки =====
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 10000; // каждые 10 сек

// ===== LCD helper =====
void printLine(int row, const String& text) {
  lcd.setCursor(0, row);
  lcd.print("                ");
  lcd.setCursor(0, row);
  lcd.print(text);
}

// ===== Подключение к WiFi =====
void connectWiFi() {
  Serial.printf("📶 Подключаюсь к WiFi: %s\n", WIFI_SSID);
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
    Serial.printf("\n✅ WiFi подключён! IP: %s\n", WiFi.localIP().toString().c_str());
    printLine(0, "WiFi OK!");
    printLine(1, WiFi.localIP().toString());
    delay(1500);
  } else {
    Serial.println("\n❌ WiFi не подключился! Проверь SSID/пароль.");
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

  // GPS
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  // WiFi
  connectWiFi();

  Serial.println("🚀 GreenPulse ESP32 готов!");
}

void loop() {
  // Переподключаемся если WiFi упал
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi потерян, переподключаюсь...");
    connectWiFi();
  }

  readGPS();
  readDHT11();
  updateLCD();

  // Отправляем данные каждые 10 сек
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    sendData();
    lastSendTime = millis();
  }

  delay(100);
}

// ===== Чтение GPS =====
void readGPS() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
  if (gps.location.isValid()) {
    latitude   = gps.location.lat();
    longitude  = gps.location.lng();
    satellites = gps.satellites.value();
    altitude   = gps.altitude.meters();
    gpsValid   = true;
  }
}

// ===== Чтение DHT11 =====
void readDHT11() {
  static unsigned long lastDHT = 0;
  if (millis() - lastDHT < 2000) return;
  lastDHT = millis();

  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity    = h;

  Serial.printf("🌡️  %.1f°C  💧 %.1f%%\n", temperature, humidity);
}

// ===== Обновление LCD =====
void updateLCD() {
  static unsigned long lastLCD = 0;
  if (millis() - lastLCD < 1000) return;
  lastLCD = millis();

  char line0[17];
  snprintf(line0, sizeof(line0), "T:%.1fC H:%.0f%%", temperature, humidity);
  printLine(0, String(line0));

  if (gpsValid) {
    char line1[17];
    snprintf(line1, sizeof(line1), "SAT:%d OK", satellites);
    printLine(1, String(line1));
  } else {
    printLine(1, "GPS search...");
  }
}

// ===== Отправка данных на сервер =====
void sendData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Нет WiFi, пропускаю отправку");
    return;
  }

  // Формируем JSON
  StaticJsonDocument<300> doc;
  doc["station_id"]      = 4;
  doc["station_name"]    = "GreenPulse ESP32";
  doc["temperature"]     = temperature;
  doc["humidity"]        = humidity;
  doc["co2_ppm"]         = 420;       // заменить на реальный датчик если есть
  doc["ph"]              = 7.0;       // заменить на реальный датчик если есть
  doc["light_intensity"] = 450;       // заменить на реальный датчик если есть
  doc["water_level"]     = 85;
  doc["latitude"]        = gpsValid ? latitude  : 0.0;
  doc["longitude"]       = gpsValid ? longitude : 0.0;
  doc["altitude"]        = altitude;
  doc["satellites"]      = satellites;
  doc["gps_valid"]       = gpsValid;

  String json;
  serializeJson(doc, json);

  Serial.printf("\n📡 Отправляю данные на сервер...\n%s\n", json.c_str());

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 сек таймаут

  int httpCode = http.POST(json);

  if (httpCode == 201) {
    Serial.printf("✅ Данные отправлены! HTTP %d\n", httpCode);
    printLine(1, "Sent OK!");
    delay(500);
  } else if (httpCode > 0) {
    Serial.printf("⚠️ Сервер ответил: HTTP %d\n", httpCode);
    Serial.println(http.getString());
  } else {
    Serial.printf("❌ Ошибка HTTP: %s\n", http.errorToString(httpCode).c_str());
    printLine(1, "Send FAIL!");
    delay(500);
  }

  http.end();
}
