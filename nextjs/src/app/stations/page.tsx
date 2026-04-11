"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MapPin, Wifi, WifiOff, Thermometer, Droplets, Wind, FlaskConical } from "lucide-react";
import { useSensorSocket } from "@/hooks/useSensorSocket";
import { calculateAQI } from "@/lib/aqi";
import Navbar from "@/components/Navbar";

const STATIC_STATIONS = [
  { id: 1, name: "GreenPulse-01", location: "Алматы, БАО",    lat: 43.238, lon: 76.9297, active: true  },
  { id: 2, name: "GreenPulse-02", location: "Алматы, АУДАНЫ", lat: 43.255, lon: 76.950,  active: false },
  { id: 3, name: "GreenPulse-03", location: "Астана, ЖАО",    lat: 51.180, lon: 71.446,  active: false },
];

function val(v: number | undefined | null, dec = 1) {
  return v != null ? v.toFixed(dec) : "—";
}

export default function StationsPage() {
  const { sensorData, connected, loading } = useSensorSocket();
  const aqi = sensorData ? calculateAQI(sensorData.co_ppm, sensorData.co2_ppm, sensorData.temperature) : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/65 mb-6 transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <ArrowLeft size={12} /> Басты бетке
            </Link>
            <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-2" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              Станциялар желісі
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              GreenPulse{" "}
              <span className="gradient-green">Станциялары</span>
            </h1>
          </motion.div>

          {/* Stations grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {STATIC_STATIONS.map((station, i) => {
              const isLive = station.id === 1 && connected;
              return (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-display font-bold text-base text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        {station.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-white/30 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                        <MapPin size={10} /> {station.location}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${
                      isLive
                        ? "text-[#00ff88] border-[rgba(0,255,136,0.22)] bg-[rgba(0,255,136,0.07)]"
                        : station.active
                          ? "text-[#00d4ff] border-[rgba(0,212,255,0.22)] bg-[rgba(0,212,255,0.07)]"
                          : "text-white/25 border-white/8 bg-white/3"
                    }`} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                      {isLive ? <Wifi size={9} /> : <WifiOff size={9} />}
                      {isLive ? "Live" : station.active ? "Online" : "Offline"}
                    </div>
                  </div>

                  {isLive && sensorData ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { Icon: Thermometer, color: "#f97316", label: "Темп",     value: `${val(sensorData.temperature)}°C` },
                        { Icon: Droplets,    color: "#00d4ff", label: "Ылғал",    value: `${val(sensorData.humidity)}%`     },
                        { Icon: Wind,        color: "#00d4ff", label: "CO₂",      value: `${val(sensorData.co2_ppm, 0)} ppm` },
                        { Icon: FlaskConical,color: "#7c3aed", label: "pH",       value: val(sensorData.ph)                },
                      ].map(({ Icon, color, label, value }) => (
                        <div key={label} className="rounded-xl p-3" style={{ background: color + "08", border: `1px solid ${color}18` }}>
                          <div className="flex items-center gap-1 text-[10px] text-white/28 mb-1" style={{ fontFamily: "var(--font-inter)" }}>
                            <Icon size={9} style={{ color }} /> {label}
                          </div>
                          <p className="font-mono text-sm font-bold text-white" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-xs text-white/20" style={{ fontFamily: "var(--font-inter)" }}>
                        {station.active ? "Деректер жүктелуде..." : "Станция офлайн"}
                      </p>
                    </div>
                  )}

                  {isLive && aqi && (
                    <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border ${aqi.bgColor}`}>
                      <span>{aqi.emoji}</span>
                      <span className={aqi.color} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                        AQI {aqi.score} · {aqi.label}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* GPS card */}
          {connected && sensorData?.latitude && sensorData.gps_valid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 text-xs text-white/30 mb-3" style={{ fontFamily: "var(--font-inter)" }}>
                <MapPin size={12} className="text-[#00ff88]" /> GPS координаттары
              </div>
              <p className="font-mono text-sm text-white/65" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {sensorData.latitude?.toFixed(6)}, {sensorData.longitude?.toFixed(6)}
                {sensorData.altitude != null && <span className="text-white/30 ml-3">Биіктік: {sensorData.altitude.toFixed(1)} м</span>}
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
