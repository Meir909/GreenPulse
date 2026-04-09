import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface HistoryPoint {
  timestamp: string;
  temperature?: number | null;
  humidity?: number | null;
  co2_ppm?: number | null;
  co_ppm?: number | null;
  ph?: number | null;
}

type TimeRange = "30m" | "1h" | "6h" | "all";

const RANGES: { label: string; value: TimeRange; minutes: number }[] = [
  { label: "30 мин", value: "30m", minutes: 30 },
  { label: "1 час", value: "1h", minutes: 60 },
  { label: "6 часов", value: "6h", minutes: 360 },
  { label: "Все", value: "all", minutes: Infinity },
];

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

function exportCSV(data: HistoryPoint[]) {
  if (!data.length) return;
  const headers = ["timestamp", "temperature", "humidity", "co2_ppm", "co_ppm", "ph"];
  const rows = data.map(d =>
    headers.map(h => d[h as keyof HistoryPoint] ?? "").join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `greenpulse-history-${new Date().toISOString().slice(0, 19)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const HistoricalSection = () => {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [range, setRange] = useState<TimeRange>("1h");
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sensor-history?limit=500");
      const json = await res.json();
      if (json.status === "ok") setHistory(json.history);
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 30_000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  const filtered = history.filter(d => {
    if (range === "all") return true;
    const minutes = RANGES.find(r => r.value === range)?.minutes ?? 60;
    try {
      const age = (Date.now() - new Date(d.timestamp).getTime()) / 60_000;
      return age <= minutes;
    } catch { return false; }
  });

  const chartData = filtered.map(d => ({
    time: formatTime(d.timestamp),
    temp: d.temperature ?? undefined,
    humidity: d.humidity ?? undefined,
    co2: d.co2_ppm ?? undefined,
    co: d.co_ppm ?? undefined,
    ph: d.ph ?? undefined,
  }));

  return (
    <section id="history" className="relative py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3 font-mono-data">История данных</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            📈 <span className="text-gradient">Исторические графики</span>
          </h2>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-2">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono-data transition-all ${
                  range === r.value
                    ? "bg-primary text-black font-bold"
                    : "glass border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{filtered.length} точек</span>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-sm glass border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
            >
              {loading ? "⟳" : "🔄 Обновить"}
            </button>
            <button
              onClick={() => exportCSV(filtered)}
              disabled={!filtered.length}
              className="px-3 py-1.5 rounded-lg text-sm glass border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all disabled:opacity-40"
            >
              📥 CSV
            </button>
          </div>
        </div>

        {!filtered.length ? (
          <div className="glass rounded-xl p-10 neon-border text-center">
            <p className="text-muted-foreground">
              {history.length === 0
                ? "Нет данных. ESP32 ещё не подключалась."
                : `Нет данных за выбранный период. Всего записей: ${history.length}`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Temperature & Humidity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl neon-border overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-orange-500 to-blue-500" />
              <div className="p-5">
                <p className="text-sm text-muted-foreground mb-4">🌡️ Температура и влажность</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(144 20% 15%)" />
                    <XAxis dataKey="time" tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0a0a0a", border: "1px solid hsl(153,100%,50%)", borderRadius: 8, fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: "hsl(140 15% 55%)" }} />
                    <Line type="monotone" dataKey="temp" name="Температура °C" stroke="hsl(30,100%,60%)" strokeWidth={2} dot={false} connectNulls />
                    <Line type="monotone" dataKey="humidity" name="Влажность %" stroke="hsl(210,100%,60%)" strokeWidth={2} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* CO2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl neon-border overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-primary to-cyan-400" />
              <div className="p-5">
                <p className="text-sm text-muted-foreground mb-4">💨 CO₂ (ppm)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(153,100%,50%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(153,100%,50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(144 20% 15%)" />
                    <XAxis dataKey="time" tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0a0a0a", border: "1px solid hsl(153,100%,50%)", borderRadius: 8, fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="co2" name="CO₂ ppm" stroke="hsl(153,100%,50%)" fill="url(#co2Grad)" strokeWidth={2} dot={false} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* CO (MQ-7) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl neon-border overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-red-500 to-orange-400" />
              <div className="p-5">
                <p className="text-sm text-muted-foreground mb-4">⚠️ CO угарный газ MQ-7 (ppm)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="coGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0,75%,60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(0,75%,60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(144 20% 15%)" />
                    <XAxis dataKey="time" tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0a0a0a", border: "1px solid hsl(0,75%,60%)", borderRadius: 8, fontSize: 11 }}
                    />
                    {/* Danger line at 50 */}
                    <Line type="monotone" dataKey={() => 50} name="Норма 50ppm" stroke="hsl(45,100%,50%)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                    <Area type="monotone" dataKey="co" name="CO ppm" stroke="hsl(0,75%,60%)" fill="url(#coGrad)" strokeWidth={2} dot={false} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* pH */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl neon-border overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
              <div className="p-5">
                <p className="text-sm text-muted-foreground mb-4">🧪 pH воды</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(144 20% 15%)" />
                    <XAxis dataKey="time" tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} tickLine={false} />
                    <YAxis domain={[5.5, 8.5]} tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0a0a0a", border: "1px solid hsl(153,100%,50%)", borderRadius: 8, fontSize: 11 }}
                    />
                    <Line type="monotone" dataKey="ph" name="pH" stroke="hsl(153,100%,50%)" strokeWidth={2} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HistoricalSection;
