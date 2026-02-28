// GreenPulse ESP32 — DHT11 + NEO-6M + LCD + WiFi → Render
// Пины: DHT11=33, GPS RX=16 TX=17, LCD I2C=0x27

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== WiFi =====
const char* ssid     = "ТУТ_ТВОЙ_WIFI";       // <-- замени
const char* password = "ТУТ_ТВОЙ_ПАРОЛЬ";      // <-- замени

// URL твоего сервера на Render (замени на свой)
const char* serverUrl = "https://ТУТ_ТВОЙ_RENDER_URL.onrender.com/api/sensor-data";

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
LiquidCrystal_I2C lcd(0x27, 16, 2); // если не работает, попробуй 0x3F

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
const unsigned long SEND_INTERVAL = 30000; // каждые 30 секунд

// ===== Вспомогательная функция LCD =====
void printLine(int row, const String &text) {
  lcd.setCursor(0, row);
  lcd.print("                "); // очищаем строку
  lcd.setCursor(0, row);
  lcd.print(text);
}

void setup() {
  Serial.begin(115200);

  // LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  printLine(0, "GreenPulse");
  printLine(1, "Initializing...");

  // DHT11
  dht.begin();
  delay(500);

  // GPS
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  delay(500);

  // WiFi
  printLine(0, "WiFi connecting");
  printLine(1, ssid);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi подключена: " + WiFi.localIP().toString());
    printLine(0, "WiFi OK!");
    printLine(1, WiFi.localIP().toString());
  } else {
    Serial.println("\n❌ WiFi не подключена");
    printLine(0, "WiFi FAILED");
    printLine(1, "Check settings");
  }

  delay(2000);
  lcd.clear();
}

void loop() {
  // Читаем GPS постоянно
  readGPS();

  // Читаем DHT11 каждые 2 сек
  readDHT11();

  // Обновляем LCD
  updateLCD();

  // Отправляем данные на сервер каждые 30 сек
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
  if (!isnan(h)) humidity = h;

  Serial.printf("🌡️  Temp: %.1f°C  💧 Hum: %.1f%%\n", temperature, humidity);
}

// ===== Обновление LCD =====
void updateLCD() {
  static unsigned long lastLCD = 0;
  if (millis() - lastLCD < 1000) return;
  lastLCD = millis();

  // Строка 0: температура и влажность
  char line0[17];
  snprintf(line0, sizeof(line0), "T:%.1fC H:%.0f%%", temperature, humidity);
  printLine(0, String(line0));

  // Строка 1: GPS или pH
  if (gpsValid) {
    char line1[17];
    snprintf(line1, sizeof(line1), "SAT:%d pH:7.0", satellites);
    printLine(1, String(line1));
  } else {
    printLine(1, "GPS searching...");
  }
}

// ===== Отправка данных на сервер =====
void sendData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi не подключена, пропускаю отправку");
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 секунд таймаут

  // Собираем JSON
  StaticJsonDocument<256> doc;
  doc["station_id"]      = 4;                         // ID реальной станции
  doc["station_name"]    = "GreenPulse ESP32 Station"; // название
  doc["temperature"]     = temperature;
  doc["humidity"]        = humidity;
  doc["latitude"]        = gpsValid ? latitude  : 0.0;
  doc["longitude"]       = gpsValid ? longitude : 0.0;
  doc["satellites"]      = satellites;
  doc["altitude"]        = altitude;
  doc["ph"]              = 7.0;   // пока фиксированное
  doc["co2_ppm"]         = 420;   // пока фиксированное
  doc["light_intensity"] = 450;   // пока фиксированное
  doc["water_level"]     = 85;    // пока фиксированное

  String payload;
  serializeJson(doc, payload);

  Serial.println("📤 Отправляю: " + payload);

  int code = http.POST(payload);

  if (code == 200 || code == 201) {
    Serial.println("✅ Данные отправлены! HTTP: " + String(code));
  } else {
    Serial.println("❌ Ошибка отправки. HTTP: " + String(code));
  }

  http.end();
}
