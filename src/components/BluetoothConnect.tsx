import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bluetooth, BluetoothOff, Loader, Wifi } from "lucide-react";

// UUID должны совпадать с ESP32 кодом
const SERVICE_UUID     = "12345678-1234-1234-1234-123456789abc";
const SENSOR_CHAR_UUID = "12345678-1234-1234-1234-123456789ab1";
const GPS_CHAR_UUID    = "12345678-1234-1234-1234-123456789ab2";

interface SensorData {
  temperature: number;
  humidity: number;
  co2_ppm: number;
  ph: number;
  light_intensity: number;
  station_id: number;
  station_name: string;
  latitude: number;
  longitude: number;
  satellites: number;
  gps_valid: boolean;
}

interface BluetoothConnectProps {
  onDataReceived: (data: SensorData) => void;
}

type Status = "idle" | "connecting" | "connected" | "error" | "unsupported";

const BluetoothConnect = ({ onDataReceived }: BluetoothConnectProps) => {
  const [status, setStatus] = useState<Status>(
    !navigator.bluetooth ? "unsupported" : "idle"
  );
  const [sensorData, setSensorData] = useState<Partial<SensorData>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [device, setDevice] = useState<BluetoothDevice | null>(null);

  // Объединяем данные с двух характеристик
  const latestData = { ...sensorData };

  const handleSensorNotify = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;
    try {
      const text = new TextDecoder().decode(value);
      const parsed = JSON.parse(text);
      setSensorData(prev => {
        const merged = { ...prev, ...parsed };
        // Отправляем объединённые данные наверх когда есть и сенсор и GPS
        if (merged.temperature !== undefined && merged.latitude !== undefined) {
          onDataReceived(merged as SensorData);
        }
        return merged;
      });
    } catch (e) {
      console.error("BLE parse error:", e);
    }
  };

  const handleGPSNotify = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;
    try {
      const text = new TextDecoder().decode(value);
      const parsed = JSON.parse(text);
      setSensorData(prev => {
        const merged = { ...prev, ...parsed };
        if (merged.temperature !== undefined && merged.latitude !== undefined) {
          onDataReceived(merged as SensorData);
        }
        return merged;
      });
    } catch (e) {
      console.error("BLE GPS parse error:", e);
    }
  };

  const connect = async () => {
    setStatus("connecting");
    setErrorMsg("");

    try {
      // Запрашиваем устройство у пользователя
      const bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ name: "GreenPulse-Station" }],
        optionalServices: [SERVICE_UUID],
      });

      setDevice(bleDevice);

      // Отслеживаем отключение
      bleDevice.addEventListener("gattserverdisconnected", () => {
        setStatus("idle");
        setSensorData({});
        console.log("BLE устройство отключилось");
      });

      // Подключаемся к GATT серверу
      const server = await bleDevice.gatt!.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);

      // Подписываемся на данные датчиков
      const sensorChar = await service.getCharacteristic(SENSOR_CHAR_UUID);
      await sensorChar.startNotifications();
      sensorChar.addEventListener("characteristicvaluechanged", handleSensorNotify);

      // Подписываемся на GPS данные
      const gpsChar = await service.getCharacteristic(GPS_CHAR_UUID);
      await gpsChar.startNotifications();
      gpsChar.addEventListener("characteristicvaluechanged", handleGPSNotify);

      // Читаем начальные значения
      const initSensor = await sensorChar.readValue();
      handleSensorNotify({ target: { value: initSensor } } as any);
      const initGPS = await gpsChar.readValue();
      handleGPSNotify({ target: { value: initGPS } } as any);

      setStatus("connected");
    } catch (e: any) {
      if (e.name === "NotFoundError") {
        setErrorMsg("Құрылғы табылмады. ESP32 қосулы екенін тексеріңіз.");
      } else if (e.name === "SecurityError") {
        setErrorMsg("Bluetooth үшін HTTPS немесе localhost қажет.");
      } else {
        setErrorMsg(e.message || "Белгісіз қате");
      }
      setStatus("error");
    }
  };

  const disconnect = () => {
    device?.gatt?.disconnect();
    setDevice(null);
    setStatus("idle");
    setSensorData({});
  };

  return (
    <div className="w-full">
      {/* Кнопка подключения */}
      {status === "unsupported" && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <BluetoothOff className="w-4 h-4 shrink-0" />
          Web Bluetooth қолдау көрсетілмейді. Chrome (десктоп немесе Android) пайдаланыңыз.
        </div>
      )}

      {status === "idle" && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={connect}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/20 transition-colors w-full justify-center"
        >
          <Bluetooth className="w-4 h-4" />
          ESP32-ні Bluetooth арқылы қосу
        </motion.button>
      )}

      {status === "connecting" && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm w-full justify-center">
          <Loader className="w-4 h-4 animate-spin" />
          GreenPulse-Station іздеуде...
        </div>
      )}

      {status === "error" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <BluetoothOff className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
          <button
            onClick={connect}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm w-full justify-center hover:bg-blue-500/20 transition-colors"
          >
            <Bluetooth className="w-4 h-4" />
            Қайта көру
          </button>
        </div>
      )}

      {/* Панель данных когда подключено */}
      <AnimatePresence>
        {status === "connected" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-green-500/30 overflow-hidden"
          >
            {/* Шапка */}
            <div className="bg-green-500/10 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                ESP32 қосылды
              </div>
              <button
                onClick={disconnect}
                className="text-gray-500 hover:text-red-400 transition-colors text-xs flex items-center gap-1"
              >
                <BluetoothOff className="w-3 h-3" /> Ажырату
              </button>
            </div>

            {/* Данные */}
            <div className="bg-black/40 p-3 grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div>🌡️ {sensorData.temperature?.toFixed(1) ?? "—"}°C</div>
              <div>💧 {sensorData.humidity?.toFixed(0) ?? "—"}%</div>
              <div>🌱 CO2: {sensorData.co2_ppm ?? "—"} ppm</div>
              <div>⚗️ pH: {sensorData.ph ?? "—"}</div>
              <div className={`col-span-2 ${sensorData.gps_valid ? "text-green-400" : "text-yellow-400"}`}>
                {sensorData.gps_valid
                  ? `📍 GPS: ${sensorData.latitude?.toFixed(4)}, ${sensorData.longitude?.toFixed(4)} (${sensorData.satellites} сат.)`
                  : "📍 GPS: спутниктер іздеуде..."}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BluetoothConnect;
