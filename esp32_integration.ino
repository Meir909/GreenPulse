// GreenPulse ESP32 — DHT11 + NEO-6M + LCD + WiFiManager → Render
// Библиотеки: WiFiManager by tzapu, DHT, TinyGPS++, ArduinoJson, LiquidCrystal_I2C
//
// КАК НАСТРОИТЬ WiFi БЕЗ ПЕРЕПРОШИВКИ:
//   1. Первый запуск → ESP32 создаёт точку доступа "GreenPulse-Setup"
//   2. Подключись с телефона к "GreenPulse-Setup" (пароль: greenpulse)
//   3. Откроется страница → выбери свой WiFi → введи пароль → сохрани
//   4. ESP32 подключится и запомнит навсегда
//   5. Чтобы сменить WiFi — нажми кнопку BOOT на 3 сек → сброс настроек

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <WiFiManager.h>      // установи: Arduino IDE → Tools → Manage Libraries → "WiFiManager" by tzapu
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>      // встроенная, для хранения данных

// ===== Сервер =====
const char* serverUrl = "https://greenpulse-su2h.onrender.com/api/sensor-data";

// ===== Кнопка сброса WiFi (BOOT кнопка на ESP32) =====
#define RESET_BUTTON_PIN 0

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
const unsigned long SEND_INTERVAL = 30000;

// ===== LCD вспомогательная функция =====
void printLine(int row, const String &text) {
  lcd.setCursor(0, row);
  lcd.print("                ");
  lcd.setCursor(0, row);
  lcd.print(text);
}

void setup() {
  Serial.begin(115200);

  // Кнопка сброса
  pinMode(RESET_BUTTON_PIN, INPUT_PULLUP);

  // LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  printLine(0, "GreenPulse v2.0");
  printLine(1, "Starting...");
  delay(1000);

  // DHT11
  dht.begin();

  // GPS
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  // Проверяем кнопку сброса при старте
  if (digitalRead(RESET_BUTTON_PIN) == LOW) {
    Serial.println("🔄 Сброс WiFi настроек...");
    printLine(0, "WiFi reset...");
    printLine(1, "Hold 3 sec");
    delay(3000);
    if (digitalRead(RESET_BUTTON_PIN) == LOW) {
      WiFiManager wm;
      wm.resetSettings();
      printLine(0, "WiFi cleared!");
      printLine(1, "Restarting...");
      delay(2000);
      ESP.restart();
    }
  }

  // ===== WiFiManager =====
  WiFiManager wm;

  // Кастомные параметры на странице настройки
  wm.setTitle("GreenPulse Station Setup");
  wm.setConfigPortalTimeout(180); // 3 минуты на настройку

  // Показываем на LCD что создаём точку доступа
  printLine(0, "WiFi Setup Mode");
  printLine(1, "GreenPulse-Setup");

  Serial.println("\n📶 Запускаю WiFiManager...");
  Serial.println("Подключись к 'GreenPulse-Setup' с телефона (пароль: greenpulse)");

  // Пытаемся подключиться к сохранённой сети, если нет — создаём AP
  bool connected = wm.autoConnect("GreenPulse-Setup", "greenpulse");

  if (connected) {
    Serial.println("✅ WiFi подключена: " + WiFi.localIP().toString());
    printLine(0, "WiFi OK!");
    printLine(1, WiFi.localIP().toString());
    delay(2000);
  } else {
    Serial.println("❌ WiFi таймаут. Перезагружаюсь...");
    printLine(0, "WiFi timeout");
    printLine(1, "Restarting...");
    delay(2000);
    ESP.restart();
  }

  lcd.clear();
  printLine(0, "GreenPulse LIVE");
  printLine(1, "Sensors ready");
  delay(1000);
}

void loop() {
  readGPS();
  readDHT11();
  updateLCD();

  // Отправка каждые 30 сек
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    sendData();
    lastSendTime = millis();
  }

  // Проверяем кнопку сброса во время работы
  if (digitalRead(RESET_BUTTON_PIN) == LOW) {
    delay(3000);
    if (digitalRead(RESET_BUTTON_PIN) == LOW) {
      Serial.println("🔄 Сброс WiFi по кнопке...");
      WiFiManager wm;
      wm.resetSettings();
      printLine(0, "WiFi reset!");
      printLine(1, "Restarting...");
      delay(1000);
      ESP.restart();
    }
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

  char line0[17];
  snprintf(line0, sizeof(line0), "T:%.1fC H:%.0f%%", temperature, humidity);
  printLine(0, String(line0));

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
    Serial.println("⚠️  WiFi отключилась, переподключаюсь...");
    WiFi.reconnect();
    delay(3000);
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);

  StaticJsonDocument<256> doc;
  doc["station_id"]      = 4;
  doc["station_name"]    = "GreenPulse ESP32 Station";
  doc["temperature"]     = temperature;
  doc["humidity"]        = humidity;
  doc["latitude"]        = gpsValid ? latitude  : 0.0;
  doc["longitude"]       = gpsValid ? longitude : 0.0;
  doc["satellites"]      = satellites;
  doc["altitude"]        = altitude;
  doc["ph"]              = 7.0;
  doc["co2_ppm"]         = 420;
  doc["light_intensity"] = 450;
  doc["water_level"]     = 85;

  String payload;
  serializeJson(doc, payload);

  Serial.println("📤 Отправляю: " + payload);
  int code = http.POST(payload);

  if (code == 200 || code == 201) {
    Serial.println("✅ Отправлено! HTTP: " + String(code));
  } else {
    Serial.println("❌ Ошибка HTTP: " + String(code));
  }

  http.end();
}
