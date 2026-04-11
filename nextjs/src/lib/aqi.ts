export interface AQIResult {
  score: number;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export function calculateAQI(
  co_ppm?: number | null,
  co2_ppm?: number | null,
  temperature?: number | null
): AQIResult {
  let penalty = 0;

  if (co_ppm != null) {
    if (co_ppm > 200) penalty += 50;
    else if (co_ppm > 100) penalty += 35;
    else if (co_ppm > 50) penalty += 20;
    else if (co_ppm > 20) penalty += 8;
  }

  if (co2_ppm != null) {
    if (co2_ppm > 2000) penalty += 30;
    else if (co2_ppm > 1000) penalty += 15;
    else if (co2_ppm > 800) penalty += 7;
    else if (co2_ppm > 600) penalty += 3;
  }

  if (temperature != null) {
    const ideal = 22;
    const diff = Math.abs(temperature - ideal);
    if (diff > 15) penalty += 20;
    else if (diff > 10) penalty += 12;
    else if (diff > 7) penalty += 6;
    else if (diff > 4) penalty += 2;
  }

  const score = Math.max(0, 100 - penalty);

  if (score >= 80) return { score, label: "Отлично",   emoji: "🟢", color: "text-[#00ff88]", bgColor: "bg-[rgba(0,255,136,0.08)] border-[rgba(0,255,136,0.25)]" };
  if (score >= 60) return { score, label: "Хорошо",    emoji: "🔵", color: "text-[#00d4ff]", bgColor: "bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.25)]" };
  if (score >= 40) return { score, label: "Умеренно",  emoji: "🟡", color: "text-[#f97316]", bgColor: "bg-[rgba(249,115,22,0.08)] border-[rgba(249,115,22,0.25)]" };
  if (score >= 20) return { score, label: "Плохо",     emoji: "🟠", color: "text-[#f97316]", bgColor: "bg-[rgba(249,115,22,0.08)] border-[rgba(249,115,22,0.25)]" };
  return              { score, label: "Опасно",    emoji: "🔴", color: "text-[#ef4444]", bgColor: "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.25)]" };
}
