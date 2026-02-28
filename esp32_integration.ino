// GreenPulse ESP32 — DHT11 + NEO-6M + LCD + BLE → браузер
// Библиотеки: DHT, TinyGPS++, LiquidCrystal_I2C, ArduinoJson (встроены в ESP32)
//
// КАК РАБОТАЕТ:
//   1. ESP32 включается и начинает рекламировать себя по Bluetooth (BLE)
//   2. Пользователь на сайте нажимает "Подключить ESP32"
//   3. Браузер (Chrome) находит устройство "GreenPulse-Station"
//   4. Данные с датчиков передаются в браузер по BLE
//   5. Браузер отправляет данные на сервер и показывает маркер на карте

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ArduinoJson.h>

// ===== BLE UUID (уникальные идентификаторы сервиса и характеристик) =====
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define SENSOR_CHAR_UUID    "12345678-1234-1234-1234-123456789ab1"  // данные датчиков (notify)
#define GPS_CHAR_UUID       "12345678-1234-1234-1234-123456789ab2"  // GPS координаты (notify)

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

// ===== BLE =====
BLEServer*         pServer         = nullptr;
BLECharacteristic* pSensorChar     = nullptr;
BLECharacteristic* pGPSChar        = nullptr;
bool               bleConnected    = false;
bool               bleWasConnected = false;

// ===== Таймер =====
unsigned long lastNotifyTime = 0;
const unsigned long NOTIFY_INTERVAL = 3000; // отправка каждые 3 сек

// ===== LCD helper =====
void printLine(int row, const String &text) {
  lcd.setCursor(0, row);
  lcd.print("                ");
  lcd.setCursor(0, row);
  lcd.print(text);
}

// ===== BLE callbacks — отслеживаем подключение =====
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) override {
    bleConnected = true;
    Serial.println("✅ BLE: браузер подключился!");
    printLine(0, "BLE connected!");
  }
  void onDisconnect(BLEServer* pServer) override {
    bleConnected    = false;
    bleWasConnected = true;
    Serial.println("❌ BLE: браузер отключился");
    printLine(0, "BLE disconnect");
    // Перезапускаем рекламу чтобы снова можно было подключиться
    BLEDevice::startAdvertising();
  }
};

void setup() {
  Serial.begin(115200);

  // LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  printLine(0, "GreenPulse BLE");
  printLine(1, "Initializing...");

  // DHT11
  dht.begin();

  // GPS
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  // ===== BLE инициализация =====
  BLEDevice::init("GreenPulse-Station"); // имя устройства в Bluetooth

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  // Создаём BLE сервис
  BLEService* pService = pServer->createService(SERVICE_UUID);

  // Характеристика для данных датчиков (температура, влажность и т.д.)
  pSensorChar = pService->createCharacteristic(
    SENSOR_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pSensorChar->addDescriptor(new BLE2902());

  // Характеристика для GPS координат
  pGPSChar = pService->createCharacteristic(
    GPS_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pGPSChar->addDescriptor(new BLE2902());

  // Запускаем сервис
  pService->start();

  // Настраиваем рекламу (чтобы браузер мог найти устройство)
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  BLEDevice::startAdvertising();

  Serial.println("📶 BLE готов! Ищи 'GreenPulse-Station' в браузере");
  printLine(0, "GreenPulse BLE");
  printLine(1, "Waiting...");
}

void loop() {
  readGPS();
  readDHT11();
  updateLCD();

  // Отправляем данные по BLE каждые 3 сек если подключён
  if (millis() - lastNotifyTime >= NOTIFY_INTERVAL) {
    sendBLEData();
    lastNotifyTime = millis();
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

  if (bleConnected) {
    printLine(1, "BLE: connected");
  } else if (gpsValid) {
    char line1[17];
    snprintf(line1, sizeof(line1), "SAT:%d BLE:wait", satellites);
    printLine(1, String(line1));
  } else {
    printLine(1, "GPS search...");
  }
}

// ===== Отправка данных по BLE =====
void sendBLEData() {
  // JSON с данными датчиков
  StaticJsonDocument<200> sensorDoc;
  sensorDoc["temperature"]     = temperature;
  sensorDoc["humidity"]        = humidity;
  sensorDoc["co2_ppm"]         = 420;
  sensorDoc["ph"]              = 7.0;
  sensorDoc["light_intensity"] = 450;
  sensorDoc["station_id"]      = 4;
  sensorDoc["station_name"]    = "GreenPulse ESP32";

  String sensorJson;
  serializeJson(sensorDoc, sensorJson);
  pSensorChar->setValue(sensorJson.c_str());
  pSensorChar->notify();

  // JSON с GPS данными
  StaticJsonDocument<128> gpsDoc;
  gpsDoc["latitude"]   = gpsValid ? latitude  : 0.0;
  gpsDoc["longitude"]  = gpsValid ? longitude : 0.0;
  gpsDoc["satellites"] = satellites;
  gpsDoc["altitude"]   = altitude;
  gpsDoc["gps_valid"]  = gpsValid;

  String gpsJson;
  serializeJson(gpsDoc, gpsJson);
  pGPSChar->setValue(gpsJson.c_str());
  pGPSChar->notify();

  if (bleConnected) {
    Serial.println("📡 BLE: данные отправлены");
  }
}
