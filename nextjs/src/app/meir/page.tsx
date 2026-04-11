"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useSensorSocket } from "@/hooks/useSensorSocket";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  const { sensorData, connected, offline, loading, lastUpdate } = useSensorSocket();

  const fields = sensorData
    ? Object.entries(sensorData).map(([k, v]) => ({ key: k, value: String(v ?? "—") }))
    : [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/65 mb-6 transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <ArrowLeft size={12} /> Басты бетке
            </Link>

            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.28)" }}>
                <Shield size={18} className="text-[#7c3aed]" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Админ панелі
                </h1>
                <p className="text-xs text-white/30 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                  Жасырын маршрут · /meir
                </p>
              </div>
            </div>

            {/* Connection status */}
            <div className={`glass-card rounded-2xl p-5 mb-5 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-[#00ff88] animate-pulse" : "bg-[#ef4444]"}`} />
                <div>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {connected ? "ESP32 байланысқан" : offline ? "Офлайн" : "Байланысу..."}
                  </p>
                  {lastUpdate && (
                    <p className="text-xs text-white/28 mt-0.5" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                      Соңғы жаңарту: {lastUpdate.toLocaleTimeString("kk-KZ")}
                    </p>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
                connected
                  ? "text-[#00ff88] border-[rgba(0,255,136,0.22)] bg-[rgba(0,255,136,0.06)]"
                  : "text-[#ef4444] border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.06)]"
              }`} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
                {connected ? "Live" : "Offline"}
              </div>
            </div>

            {/* Raw sensor data */}
            <div className="glass-card rounded-2xl p-6">
              <p className="text-xs uppercase tracking-widest text-white/25 mb-5" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                Шикі сенсор деректері
              </p>
              {loading ? (
                <p className="text-sm text-white/30 text-center py-8" style={{ fontFamily: "var(--font-inter)" }}>Жүктелуде...</p>
              ) : fields.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {fields.map(({ key, value }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-xs text-white/35 font-mono" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{key}</span>
                      <span className="text-xs text-[#00ff88] font-mono font-bold" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-white/25" style={{ fontFamily: "var(--font-inter)" }}>
                    ESP32 деректері жоқ. Серверге қосылып тексеріңіз.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
