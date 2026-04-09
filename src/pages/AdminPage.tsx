import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar,
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

interface DailyStat {
  date: string;
  avgTemp: number;
  avgHumidity: number;
  avgCo2: number;
  avgCo: number;
  count: number;
}

function exportCSV(data: HistoryPoint[], filename: string) {
  if (!data.length) return;
  const headers = ["timestamp", "temperature", "humidity", "co2_ppm", "co_ppm", "ph"];
  const rows = data.map(d => headers.map(h => d[h as keyof HistoryPoint] ?? "").join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function groupByDay(history: HistoryPoint[]): DailyStat[] {
  const days: Record<string, number[][]> = {};
  for (const d of history) {
    try {
      const date = d.timestamp.slice(0, 10);
      if (!days[date]) days[date] = [[], [], [], []];
      if (d.temperature != null) days[date][0].push(d.temperature);
      if (d.humidity != null)    days[date][1].push(d.humidity);
      if (d.co2_ppm != null)     days[date][2].push(d.co2_ppm);
      if (d.co_ppm != null)      days[date][3].push(d.co_ppm);
    } catch { /* ignore */ }
  }
  return Object.entries(days).map(([date, arrs]) => ({
    date,
    avgTemp:     arrs[0].length ? +(arrs[0].reduce((a,b)=>a+b,0)/arrs[0].length).toFixed(1) : 0,
    avgHumidity: arrs[1].length ? +(arrs[1].reduce((a,b)=>a+b,0)/arrs[1].length).toFixed(1) : 0,
    avgCo2:      arrs[2].length ? +(arrs[2].reduce((a,b)=>a+b,0)/arrs[2].length).toFixed(0) : 0,
    avgCo:       arrs[3].length ? +(arrs[3].reduce((a,b)=>a+b,0)/arrs[3].length).toFixed(1) : 0,
    count:       arrs[0].length,
  })).sort((a, b) => a.date.localeCompare(b.date));
}

const AdminPage = () => {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<Record<string, unknown>>({});
  const [tab, setTab] = useState<"overview" | "table" | "daily">("overview");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [histRes, healthRes] = await Promise.all([
        fetch("/api/sensor-history?limit=500"),
        fetch("/api/health"),
      ]);
      const histJson = await histRes.json();
      const healthJson = await healthRes.json();
      if (histJson.status === "ok") setHistory(histJson.history);
      setHealth(healthJson);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 30_000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const daily = groupByDay(history);
  const totalPages = Math.ceil(history.length / PAGE_SIZE);
  const pageData = history.slice().reverse().slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="font-headline text-xl font-bold text-gradient">GreenPulse</a>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-sm text-muted-foreground">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${health.esp32_connected ? "bg-primary animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs text-muted-foreground font-mono-data">
            {health.esp32_connected ? "ESP32 онлайн" : "ESP32 офлайн"}
          </span>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-sm glass border border-white/10 text-muted-foreground hover:text-primary transition-all"
          >
            {loading ? "⟳" : "🔄"}
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Всего записей", value: String(history.length), icon: "📊" },
            { label: "GPS точек", value: String((health.gps_track_points as number) ?? 0), icon: "📍" },
            { label: "Дней данных", value: String(daily.length), icon: "📅" },
            { label: "Статус", value: health.esp32_connected ? "Онлайн" : "Офлайн", icon: "📡" },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 neon-border"
            >
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="font-mono-data text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["overview", "table", "daily"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                tab === t
                  ? "bg-primary text-black font-bold"
                  : "glass border border-white/10 text-muted-foreground hover:text-primary"
              }`}
            >
              {{ overview: "📈 Обзор", table: "📋 Таблица", daily: "📅 По дням" }[t]}
            </button>
          ))}
          <button
            onClick={() => exportCSV(history, `greenpulse-full-${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={!history.length}
            className="ml-auto px-4 py-2 rounded-lg text-sm glass border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all disabled:opacity-40"
          >
            📥 Экспорт всего CSV
          </button>
        </div>

        {/* Overview charts */}
        {tab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-5 neon-border">
              <p className="text-sm text-muted-foreground mb-4">Температура (последние 100)</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={history.slice(-100).map((d, i) => ({ i, v: d.temperature }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(144 20% 12%)" />
                  <XAxis dataKey="i" hide />
                  <YAxis tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid hsl(153,100%,50%)", borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="v" name="°C" stroke="hsl(30,100%,60%)" strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-5 neon-border">
              <p className="text-sm text-muted-foreground mb-4">CO (угарный газ) (последние 100)</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={history.slice(-100).map((d, i) => ({ i, v: d.co_ppm }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(144 20% 12%)" />
                  <XAxis dataKey="i" hide />
                  <YAxis tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid hsl(0,75%,60%)", borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="v" name="CO ppm" stroke="hsl(0,75%,60%)" strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-5 neon-border">
              <p className="text-sm text-muted-foreground mb-4">CO₂ (последние 100)</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={history.slice(-100).map((d, i) => ({ i, v: d.co2_ppm }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(144 20% 12%)" />
                  <XAxis dataKey="i" hide />
                  <YAxis tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid hsl(153,100%,50%)", borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="v" name="CO₂ ppm" stroke="hsl(153,100%,50%)" strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-5 neon-border">
              <p className="text-sm text-muted-foreground mb-4">pH (последние 100)</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={history.slice(-100).map((d, i) => ({ i, v: d.ph }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(144 20% 12%)" />
                  <XAxis dataKey="i" hide />
                  <YAxis domain={[5, 9]} tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid hsl(153,100%,50%)", borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="v" name="pH" stroke="hsl(153,100%,50%)" strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Raw table */}
        {tab === "table" && (
          <div className="glass rounded-xl neon-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono-data">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Время</th>
                    <th className="px-4 py-3">Темп °C</th>
                    <th className="px-4 py-3">Влаж %</th>
                    <th className="px-4 py-3">CO₂ ppm</th>
                    <th className="px-4 py-3">CO ppm</th>
                    <th className="px-4 py-3">pH</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((d, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-2 text-muted-foreground">{history.length - (page * PAGE_SIZE + i)}</td>
                      <td className="px-4 py-2 text-foreground/80">{d.timestamp?.slice(0, 19).replace("T", " ")}</td>
                      <td className={`px-4 py-2 ${d.temperature != null && (d.temperature < 18 || d.temperature > 30) ? "text-orange-400" : "text-primary"}`}>
                        {d.temperature?.toFixed(1) ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-cyan-400">{d.humidity?.toFixed(0) ?? "—"}</td>
                      <td className="px-4 py-2 text-primary">{d.co2_ppm?.toFixed(0) ?? "—"}</td>
                      <td className={`px-4 py-2 ${(d.co_ppm ?? 0) > 50 ? "text-red-400 font-bold" : "text-foreground/80"}`}>
                        {d.co_ppm?.toFixed(1) ?? "—"}
                      </td>
                      <td className={`px-4 py-2 ${d.ph != null && (d.ph < 6 || d.ph > 8) ? "text-orange-400" : "text-foreground/80"}`}>
                        {d.ph?.toFixed(2) ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <span className="text-xs text-muted-foreground">Страница {page + 1} из {totalPages || 1}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 rounded text-xs glass border border-white/10 disabled:opacity-30 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all"
                >← Назад</button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1 rounded text-xs glass border border-white/10 disabled:opacity-30 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all"
                >Вперёд →</button>
              </div>
            </div>
          </div>
        )}

        {/* Daily stats */}
        {tab === "daily" && (
          <div className="space-y-6">
            <div className="glass rounded-xl p-5 neon-border">
              <p className="text-sm text-muted-foreground mb-4">Средняя температура по дням</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(144 20% 12%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(140 15% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid hsl(153,100%,50%)", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="avgTemp" name="Температура °C" fill="hsl(30,100%,60%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl neon-border overflow-hidden">
              <table className="w-full text-xs font-mono-data">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="px-4 py-3">Дата</th>
                    <th className="px-4 py-3">Ср. Темп °C</th>
                    <th className="px-4 py-3">Ср. Влаж %</th>
                    <th className="px-4 py-3">Ср. CO₂</th>
                    <th className="px-4 py-3">Ср. CO</th>
                    <th className="px-4 py-3">Записей</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((d) => (
                    <tr key={d.date} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-2 text-primary">{d.date}</td>
                      <td className="px-4 py-2">{d.avgTemp}</td>
                      <td className="px-4 py-2">{d.avgHumidity}</td>
                      <td className="px-4 py-2">{d.avgCo2}</td>
                      <td className={`px-4 py-2 ${d.avgCo > 50 ? "text-red-400" : ""}`}>{d.avgCo}</td>
                      <td className="px-4 py-2 text-muted-foreground">{d.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
