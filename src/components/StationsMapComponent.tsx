import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

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
  onStationSelect: (station: Station) => void;
  onAnalyzeClick: (station: Station) => void;
  onPredictClick: (station: Station) => void;
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

const stationIcon = L.divIcon({
  html: `<div style="
    width: 24px; height: 24px;
    background: #00ff88;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 12px #00ff88, 0 0 6px rgba(0,0,0,0.8);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
  className: "",
});

const userIcon = L.divIcon({
  html: `<div style="
    width: 18px; height: 18px;
    background: #00d4ff;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 12px #00d4ff, 0 0 6px rgba(0,0,0,0.8);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
  className: "",
});

const StationsMapComponent = ({
  onStationSelect,
  onAnalyzeClick,
  onPredictClick,
}: StationsMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Инициализируем карту
    const map = L.map(mapRef.current, {
      center: KAZAKHSTAN_CENTER,
      zoom: 5,
      zoomControl: true,
    });

    leafletMap.current = map;

    // Тайлы CartoDB Dark
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap contributors &copy; CartoDB",
      maxZoom: 19,
    }).addTo(map);

    // Добавляем станции
    demoStations.forEach((station) => {
      L.circle([station.latitude, station.longitude], {
        radius: PURIFICATION_RADIUS * 1000,
        color: "#00ff88",
        weight: 2,
        opacity: 0.5,
        fillColor: "#00ff88",
        fillOpacity: 0.08,
        dashArray: "6, 4",
      }).addTo(map);

      L.marker([station.latitude, station.longitude], { icon: stationIcon })
        .bindPopup(`
          <div style="background:#000;color:#fff;padding:12px;border:1px solid #00d4ff;border-radius:8px;min-width:200px;font-family:sans-serif;">
            <h3 style="color:#00d4ff;margin:0 0 8px 0;font-size:13px;">${station.name}</h3>
            <p style="margin:3px 0;font-size:12px;">🌡️ ${station.temperature}°C</p>
            <p style="margin:3px 0;font-size:12px;">💧 ${station.humidity}%</p>
            <p style="margin:3px 0;font-size:12px;">🌱 CO2: ${station.co2_ppm} ppm</p>
            <p style="margin:3px 0;font-size:12px;">⚗️ pH: ${station.ph}</p>
            <p style="margin:3px 0 10px 0;font-size:12px;">☀️ ${station.light_intensity} люкс</p>
            <div style="display:flex;gap:6px;">
              <button onclick="window._gpAnalyze(${station.id})" style="flex:1;background:#00d4ff;color:#000;border:none;padding:5px;border-radius:4px;font-size:11px;font-weight:bold;cursor:pointer;">📊 Анализ</button>
              <button onclick="window._gpPredict(${station.id})" style="flex:1;background:#00ff88;color:#000;border:none;padding:5px;border-radius:4px;font-size:11px;font-weight:bold;cursor:pointer;">🔮 Прогноз</button>
            </div>
          </div>
        `, { maxWidth: 240 })
        .addTo(map);
    });

    // Глобальные обработчики кнопок в попапе
    (window as any)._gpAnalyze = (id: number) => {
      const s = demoStations.find((s) => s.id === id);
      if (s) { onAnalyzeClick(s); onStationSelect(s); }
    };
    (window as any)._gpPredict = (id: number) => {
      const s = demoStations.find((s) => s.id === id);
      if (s) { onPredictClick(s); onStationSelect(s); }
    };

    // Геолокация
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
        () => {
          console.log("Геолокация не разрешена");
        }
      );
    }

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl" style={{ height: "600px" }}>
      {/* Сам контейнер карты */}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* Статус геолокации */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-cyan-500/30 text-xs z-[1000]"
      >
        {userLocation ? (
          <span className="text-green-400">✅ Геолокация включена</span>
        ) : (
          <span className="text-yellow-400">📍 Показана карта Казахстана</span>
        )}
      </motion.div>

      {/* Инструкция */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-cyan-500/30 max-w-xs text-xs z-[1000]"
      >
        <h4 className="text-cyan-300 font-bold mb-2">🗺️ Как использовать</h4>
        <ul className="text-gray-300 space-y-1">
          <li>📍 Нажмите на станцию для информации</li>
          <li>💚 Зелёные круги — радиус очистки (0.8 км)</li>
          <li>🔵 Синий маркер — ваша локация</li>
          <li>⚙️ Zoom для приближения/отдаления</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default StationsMapComponent;
