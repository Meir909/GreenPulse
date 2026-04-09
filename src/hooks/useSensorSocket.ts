import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

export interface SensorData {
  station_id?: number;
  station_name?: string;
  temperature?: number | null;
  humidity?: number | null;
  ph?: number | null;
  co2_ppm?: number | null;
  co_ppm?: number | null;         // MQ-7 угарный газ
  light_intensity?: number | null;
  water_level?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  satellites?: number | null;
  accuracy?: number | null;
  altitude?: number | null;
  gps_valid?: boolean;
  timestamp?: string;
}

interface UseSensorSocketReturn {
  sensorData: SensorData | null;
  connected: boolean;       // WebSocket соединение установлено
  offline: boolean;         // ESP32 не передаёт данные
  loading: boolean;
  lastUpdate: Date | null;
}

const POLL_INTERVAL_MS = 5000;   // fallback polling каждые 5 секунд
const WS_RECONNECT_MS = 3000;    // переподключение WS через 3 секунды

// Пороговые значения для алертов
const THRESHOLDS = {
  co_ppm:      { warn: 50,  danger: 200 },
  temperature: { min: 18,   max: 30    },
  co2_ppm:     { warn: 800, danger: 1500 },
  ph:          { min: 6.0,  max: 8.0   },
};

export function useSensorSocket(): UseSensorSocketReturn {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsAvailable = useRef(false);

  const alertedRef = useRef<Set<string>>(new Set());

  const checkAlerts = useCallback((data: SensorData) => {
    const now = Date.now();

    const alert = (key: string, msg: string, desc: string, variant: "warning" | "error") => {
      const cooldownKey = `${key}-${Math.floor(now / 60000)}`; // once per minute
      if (!alertedRef.current.has(cooldownKey)) {
        alertedRef.current.add(cooldownKey);
        if (variant === "error") {
          toast.error(msg, { description: desc, duration: 8000 });
        } else {
          toast.warning(msg, { description: desc, duration: 6000 });
        }
      }
    };

    if (data.co_ppm != null) {
      if (data.co_ppm > THRESHOLDS.co_ppm.danger) {
        alert("co_danger", "⚠️ Опасный уровень CO!", `CO = ${data.co_ppm} ppm — срочно проветрите помещение!`, "error");
      } else if (data.co_ppm > THRESHOLDS.co_ppm.warn) {
        alert("co_warn", "⚠️ Повышен CO (угарный газ)", `CO = ${data.co_ppm} ppm (норма < 50 ppm)`, "warning");
      }
    }
    if (data.temperature != null) {
      if (data.temperature > THRESHOLDS.temperature.max) {
        alert("temp_high", "🌡️ Высокая температура", `Температура = ${data.temperature.toFixed(1)}°C (норма 18–30°C)`, "warning");
      } else if (data.temperature < THRESHOLDS.temperature.min) {
        alert("temp_low", "🌡️ Низкая температура", `Температура = ${data.temperature.toFixed(1)}°C (норма 18–30°C)`, "warning");
      }
    }
    if (data.co2_ppm != null && data.co2_ppm > THRESHOLDS.co2_ppm.warn) {
      alert("co2_warn", "💨 Повышен CO₂", `CO₂ = ${data.co2_ppm} ppm (норма < 800 ppm)`, data.co2_ppm > THRESHOLDS.co2_ppm.danger ? "error" : "warning");
    }
    if (data.ph != null && (data.ph < THRESHOLDS.ph.min || data.ph > THRESHOLDS.ph.max)) {
      alert("ph_warn", "🧪 pH вне нормы", `pH = ${data.ph.toFixed(1)} (норма 6.0–8.0)`, "warning");
    }
  }, []);

  const handleSensorUpdate = useCallback((data: SensorData) => {
    setSensorData(data);
    setOffline(false);
    setLoading(false);
    setLastUpdate(new Date());
    checkAlerts(data);
  }, [checkAlerts]);

  // HTTP fallback polling
  const pollSensorData = useCallback(async () => {
    if (wsAvailable.current) return; // WS работает — polling не нужен
    try {
      const res = await fetch("/api/sensor-data");
      const json = await res.json();
      if (json.status === "offline" || !json.data) {
        setOffline(true);
        setLoading(false);
        return;
      }
      handleSensorUpdate(json.data);
    } catch {
      setOffline(true);
      setLoading(false);
    }
  }, [handleSensorUpdate]);

  useEffect(() => {
    // Сначала делаем HTTP запрос для быстрой инициализации
    pollSensorData();

    // Подключаемся к WebSocket
    const socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
      reconnectionDelay: WS_RECONNECT_MS,
      reconnectionAttempts: Infinity,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      wsAvailable.current = true;
      // Останавливаем polling — WS работает
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    });

    socket.on("sensor_update", (data: SensorData) => {
      handleSensorUpdate(data);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      wsAvailable.current = false;
      // Запускаем fallback polling
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(pollSensorData, POLL_INTERVAL_MS);
      }
    });

    socket.on("connect_error", () => {
      wsAvailable.current = false;
      // Запускаем fallback polling если ещё не запущен
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(pollSensorData, POLL_INTERVAL_MS);
      }
    });

    return () => {
      socket.disconnect();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [handleSensorUpdate, pollSensorData]);

  return { sensorData, connected, offline, loading, lastUpdate };
}
