import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import StationModal from "./StationModal";

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
  onAnalyzeClick?: (station: Station) => void;
  onPredictClick?: (station: Station) => void;
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
    cursor: pointer;
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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
  className: "",
});

const StationsMapComponent = ({
  onStationSelect,
}: StationsMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openStation = (station: Station) => {
    setSelectedStation(station);
    setModalOpen(true);
    onStationSelect?.(station);
  };

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: KAZAKHSTAN_CENTER,
      zoom: 5,
      zoomControl: true,
    });

    leafletMap.current = map;

    // CartoDB Dark тайлы
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap contributors &copy; CartoDB",
      maxZoom: 19,
    }).addTo(map);

    // Добавляем станции
    demoStations.forEach((station) => {
      // Круг радиуса очистки
      L.circle([station.latitude, station.longitude], {
        radius: PURIFICATION_RADIUS * 1000,
        color: "#00ff88",
        weight: 2,
        opacity: 0.5,
        fillColor: "#00ff88",
        fillOpacity: 0.08,
        dashArray: "6, 4",
      }).addTo(map);

      // Маркер — по клику открываем React-модалку
      L.marker([station.latitude, station.longitude], { icon: stationIcon })
        .on("click", () => openStation(station))
        .addTo(map);
    });

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
    <>
      <div
        className="relative w-full rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl"
        style={{ height: "600px" }}
      >
        {/* Контейнер карты */}
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

        {/* Подсказка */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-cyan-500/30 max-w-xs text-xs z-[1000]"
        >
          <h4 className="text-cyan-300 font-bold mb-2">🗺️ Как использовать</h4>
          <ul className="text-gray-300 space-y-1">
            <li>🟢 Нажмите на зелёный маркер — откроется станция</li>
            <li>💚 Зелёные круги — радиус очистки (0.8 км)</li>
            <li>🔵 Синий маркер — ваша локация</li>
            <li>⚙️ Zoom для приближения/отдаления</li>
          </ul>
        </motion.div>
      </div>

      {/* React-модалка станции */}
      <StationModal
        station={selectedStation}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default StationsMapComponent;
