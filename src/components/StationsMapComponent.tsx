import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import StationModal from "./StationModal";
import BluetoothConnect from "./BluetoothConnect";

interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  co2_ppm: number;
  ph: number;
  light_intensity: number;
  status: "active" | "inactive";
}

interface StationsMapComponentProps {
  onStationSelect?: (station: Station) => void;
}

const demoStations: Station[] = [
  {
    id: 1,
    name: "GreenPulse Station - Актау",
    latitude: 43.6452,
    longitude: 51.1694,
    temperature: 22.3,
    humidity: 65.0,
    co2_ppm: 420,
    ph: 6.5,
    light_intensity: 450,
    status: "active",
  },
  {
    id: 2,
    name: "GreenPulse Station - Алматы 1",
    latitude: 43.2425,
    longitude: 76.9481,
    temperature: 23.1,
    humidity: 68.5,
    co2_ppm: 415,
    ph: 6.9,
    light_intensity: 480,
    status: "active",
  },
  {
    id: 3,
    name: "GreenPulse Station - Алматы 2",
    latitude: 43.2387,
    longitude: 76.9503,
    temperature: 21.8,
    humidity: 62.0,
    co2_ppm: 425,
    ph: 6.7,
    light_intensity: 420,
    status: "active",
  },
];

const PURIFICATION_RADIUS = 0.8;
const KAZAKHSTAN_CENTER: [number, number] = [48.0196, 66.9237];

// Оранжевый маркер — демо станции
const stationIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;background:#ff8c00;border:3px solid white;border-radius:50%;box-shadow:0 0 12px #ff8c00,0 0 6px rgba(0,0,0,0.8);cursor:pointer;"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  className: "",
});

// Зелёный маркер — реальная ESP32 станция
const esp32Icon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:#00ff88;border:3px solid white;border-radius:50%;box-shadow:0 0 16px #00ff88,0 0 8px rgba(0,0,0,0.8);cursor:pointer;position:relative;">
    <div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);background:#00ff88;color:black;font-size:9px;font-weight:bold;padding:1px 4px;border-radius:4px;white-space:nowrap;">LIVE</div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  className: "",
});

// Синий маркер — позиция пользователя
const userIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;background:#00d4ff;border:3px solid white;border-radius:50%;box-shadow:0 0 12px #00d4ff,0 0 6px rgba(0,0,0,0.8);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: "",
});

const StationsMapComponent = ({ onStationSelect }: StationsMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const esp32MarkerRef = useRef<L.Marker | null>(null);
  const esp32CircleRef = useRef<L.Circle | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [esp32Station, setEsp32Station] = useState<Station | null>(null);
  const [esp32Online, setEsp32Online] = useState(false);
  const [bleConnected, setBleConnected] = useState(false);

  const openStation = (station: Station) => {
    setSelectedStation(station);
    setModalOpen(true);
    onStationSelect?.(station);
  };

  // Загрузка данных с ESP32
  const fetchEsp32Data = async () => {
    try {
      const res = await fetch("/api/sensor-data");
      if (!res.ok) return;
      const data = await res.json();

      // Проверяем что это реальные данные (не демо с координатами Москвы)
      const isReal = data.latitude !== 55.7558 && data.latitude !== 0 && data.longitude !== 0;

      const station: Station = {
        id: 4,
        name: data.station_name || "GreenPulse ESP32 (Live)",
        latitude: data.latitude,
        longitude: data.longitude,
        temperature: data.temperature,
        humidity: data.humidity,
        co2_ppm: data.co2_ppm,
        ph: data.ph,
        light_intensity: data.light_intensity,
        status: "active",
      };

      setEsp32Station(station);
      setEsp32Online(isReal);

      // Обновляем маркер на карте если GPS валидный
      if (isReal && leafletMap.current) {
        // Удаляем старый маркер и круг
        if (esp32MarkerRef.current) esp32MarkerRef.current.remove();
        if (esp32CircleRef.current) esp32CircleRef.current.remove();

        // Круг радиуса очистки
        esp32CircleRef.current = L.circle([data.latitude, data.longitude], {
          radius: PURIFICATION_RADIUS * 1000,
          color: "#00ff88",
          weight: 2,
          opacity: 0.6,
          fillColor: "#00ff88",
          fillOpacity: 0.08,
          dashArray: "6, 4",
        }).addTo(leafletMap.current);

        // Маркер
        esp32MarkerRef.current = L.marker([data.latitude, data.longitude], { icon: esp32Icon })
          .on("click", () => openStation(station))
          .addTo(leafletMap.current);
      }
    } catch (e) {
      console.log("ESP32 недоступен:", e);
    }
  };

  // Обработчик данных с ESP32 по BLE
  const handleBleData = (data: {
    temperature: number; humidity: number; co2_ppm: number;
    ph: number; light_intensity: number; station_id: number; station_name: string;
    latitude: number; longitude: number; satellites: number; gps_valid: boolean;
  }) => {
    setBleConnected(true);

    const station: Station = {
      id: data.station_id || 4,
      name: data.station_name || "GreenPulse ESP32 (BLE)",
      latitude: data.latitude,
      longitude: data.longitude,
      temperature: data.temperature,
      humidity: data.humidity,
      co2_ppm: data.co2_ppm,
      ph: data.ph,
      light_intensity: data.light_intensity,
      status: "active",
    };

    setEsp32Station(station);

    const hasGPS = data.gps_valid && data.latitude !== 0 && data.longitude !== 0;
    setEsp32Online(hasGPS);

    if (hasGPS && leafletMap.current) {
      if (esp32MarkerRef.current) esp32MarkerRef.current.remove();
      if (esp32CircleRef.current) esp32CircleRef.current.remove();

      esp32CircleRef.current = L.circle([data.latitude, data.longitude], {
        radius: PURIFICATION_RADIUS * 1000,
        color: "#00ff88",
        weight: 2,
        opacity: 0.6,
        fillColor: "#00ff88",
        fillOpacity: 0.08,
        dashArray: "6, 4",
      }).addTo(leafletMap.current);

      esp32MarkerRef.current = L.marker([data.latitude, data.longitude], { icon: esp32Icon })
        .on("click", () => openStation(station))
        .addTo(leafletMap.current);

      // Центрируем карту на станции при первом получении GPS
      leafletMap.current.setView([data.latitude, data.longitude], 13);
    }
  };

  // Инициализация карты
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: KAZAKHSTAN_CENTER,
      zoom: 5,
      zoomControl: true,
    });

    leafletMap.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap contributors &copy; CartoDB",
      maxZoom: 19,
    }).addTo(map);

    // Демо станции
    demoStations.forEach((station) => {
      L.circle([station.latitude, station.longitude], {
        radius: PURIFICATION_RADIUS * 1000,
        color: "#ff8c00",
        weight: 2,
        opacity: 0.5,
        fillColor: "#ff8c00",
        fillOpacity: 0.08,
        dashArray: "6, 4",
      }).addTo(map);

      L.marker([station.latitude, station.longitude], { icon: stationIcon })
        .on("click", () => openStation(station))
        .addTo(map);
    });

    // Геолокация пользователя
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setUserLocation({ lat: coords.latitude, lng: coords.longitude });
          map.setView([coords.latitude, coords.longitude], 12);
          L.marker([coords.latitude, coords.longitude], { icon: userIcon })
            .bindPopup(`<div style="background:#000;color:#fff;padding:8px;border:1px solid #00d4ff;border-radius:4px;font-family:sans-serif;">
              <b style="color:#00d4ff;">Ваша локация</b><br/>
              <span style="font-size:12px;">${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E</span>
            </div>`)
            .addTo(map);
        },
        () => console.log("Геолокация не разрешена")
      );
    }

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Загружаем ESP32 данные сразу и затем каждые 30 сек
  useEffect(() => {
    fetchEsp32Data();
    const interval = setInterval(fetchEsp32Data, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="relative w-full rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl" style={{ height: "600px" }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

        {/* Статус геолокации */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-cyan-500/30 text-xs z-[1000] space-y-1"
        >
          {userLocation ? (
            <div className="text-green-400">✅ Геолокация включена</div>
          ) : (
            <div className="text-yellow-400">📍 Показана карта Казахстана</div>
          )}
          {bleConnected ? (
            <div className="text-blue-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
              BLE подключён
            </div>
          ) : esp32Online ? (
            <div className="text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              ESP32 онлайн
            </div>
          ) : (
            <div className="text-gray-500">⚫ ESP32 офлайн</div>
          )}
        </motion.div>

        {/* Легенда */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-cyan-500/30 max-w-xs text-xs z-[1000]"
        >
          <h4 className="text-cyan-300 font-bold mb-2">🗺️ Легенда</h4>
          <ul className="text-gray-300 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400 inline-block shadow-[0_0_6px_#ff8c00]" /> Демо станция
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block shadow-[0_0_6px_#00ff88]" /> ESP32 Live станция
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_#00d4ff]" /> Ваша локация
            </li>
            <li className="text-gray-400 mt-1">🖱️ Клик на маркер — подробности</li>
          </ul>
        </motion.div>

        {/* Панель ESP32 данных (если онлайн) */}
        {esp32Station && esp32Online && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-green-500/40 text-xs z-[1000] min-w-[160px]"
          >
            <div className="text-green-400 font-bold mb-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              ESP32 Live
            </div>
            <div className="text-gray-300 space-y-1">
              <div>🌡️ {esp32Station.temperature}°C</div>
              <div>💧 {esp32Station.humidity}%</div>
              <div>🌱 CO2: {esp32Station.co2_ppm} ppm</div>
              <div>⚗️ pH: {esp32Station.ph}</div>
            </div>
            <button
              onClick={() => openStation(esp32Station)}
              className="mt-2 w-full text-center text-green-300 border border-green-500/40 rounded py-1 hover:bg-green-500/10 transition-colors"
            >
              Подробнее →
            </button>
          </motion.div>
        )}
      </div>

      {/* BLE подключение ESP32 */}
      <div className="mt-3">
        <BluetoothConnect onDataReceived={handleBleData} />
      </div>

      <StationModal
        station={selectedStation}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default StationsMapComponent;
