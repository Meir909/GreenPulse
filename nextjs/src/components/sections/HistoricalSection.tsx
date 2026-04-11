"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const generateData = (seed = 0) =>
  Array.from({ length: 24 }, (_, i) => ({
    hour:  `${String(i).padStart(2, "0")}:00`,
    temp:  +(20 + Math.sin((i + seed) / 3) * 4 + Math.random() * 1.5).toFixed(1),
    co2:   Math.round(420 + Math.sin((i + seed) / 2.5) * 55 + Math.random() * 25),
    humid: Math.round(55 + Math.cos((i + seed) / 3.5) * 10 + Math.random() * 5),
  }));

type Tab = "temp" | "co2" | "humid";

const tabs: { id: Tab; label: string; color: string; unit: string }[] = [
  { id: "temp",  label: "Температура", color: "#f97316", unit: "°C"  },
  { id: "co2",   label: "CO₂",         color: "#00d4ff", unit: " ppm" },
  { id: "humid", label: "Ылғалдылық",  color: "#7c3aed", unit: "%"   },
];

export default function HistoricalSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeTab, setActiveTab] = useState<Tab>("co2");
  const [data, setData] = useState(() => generateData());

  const tab = tabs.find(t => t.id === activeTab)!;

  return (
    <section id="history" className="relative py-28 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-[#00ff88] mb-2" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              Тарихи деректер
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              24 сағаттық{" "}
              <span className="gradient-green">тренд</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
                  activeTab === t.id
                    ? "text-black border-transparent"
                    : "text-white/40 border-white/10 hover:text-white/65"
                }`}
                style={activeTab === t.id ? { background: t.color, fontFamily: "var(--font-inter)" } : { fontFamily: "var(--font-inter)" }}
              >
                {t.label}
              </button>
            ))}
            <button
              onClick={() => setData(generateData(Math.random() * 10))}
              className="p-2 rounded-lg text-white/30 hover:text-white border border-white/8 hover:border-white/20 transition-all cursor-pointer ml-1"
              aria-label="Refresh data"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4 text-xs text-white/30" style={{ fontFamily: "var(--font-inter)" }}>
            <TrendingUp size={13} style={{ color: tab.color }} />
            <span>{tab.label} — {tab.unit}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${tab.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={tab.color} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={tab.color} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.22)" }}
                interval={3}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.22)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid rgba(0,255,136,0.15)",
                  borderRadius: 10,
                  fontSize: 11,
                  fontFamily: "var(--font-jetbrains-mono)",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.4)" }}
                itemStyle={{ color: tab.color }}
                formatter={(v) => [`${v}${tab.unit}`, tab.label] as [string, string]}
              />
              <Area
                type="monotone"
                dataKey={tab.id}
                stroke={tab.color}
                strokeWidth={2}
                fill={`url(#grad-${tab.id})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: tab.color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </section>
  );
}
