/**
 * Simple Air Quality Index (AQI) calculator
 * Based on CO, CO2, and temperature deviations
 */

export interface AQIResult {
  score: number;       // 0–100 (100 = perfect)
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
}

export function calculateAQI(
  co_ppm?: number | null,
  co2_ppm?: number | null,
  temperature?: number | null
): AQIResult {
  let penalty = 0;

  // CO contribution (weight: 50%)
  if (co_ppm != null) {
    if (co_ppm >= 200) penalty += 50;
    else if (co_ppm >= 100) penalty += 35;
    else if (co_ppm >= 50) penalty += 20;
    else if (co_ppm >= 25) penalty += 8;
  }

  // CO2 contribution (weight: 30%)
  if (co2_ppm != null) {
    if (co2_ppm >= 2000) penalty += 30;
    else if (co2_ppm >= 1500) penalty += 22;
    else if (co2_ppm >= 1000) penalty += 15;
    else if (co2_ppm >= 800) penalty += 7;
    else if (co2_ppm >= 600) penalty += 3;
  }

  // Temperature deviation (weight: 20%)
  if (temperature != null) {
    const deviation = Math.max(0, Math.abs(temperature - 22) - 3); // 19–25°C is ideal
    if (deviation >= 10) penalty += 20;
    else if (deviation >= 5) penalty += 12;
    else if (deviation >= 2) penalty += 5;
  }

  const score = Math.max(0, Math.min(100, 100 - penalty));

  if (score >= 80) return { score, label: "Отлично", color: "text-green-400", bgColor: "bg-green-500/20 border-green-500/40", emoji: "🟢" };
  if (score >= 60) return { score, label: "Хорошо", color: "text-cyan-400", bgColor: "bg-cyan-500/20 border-cyan-500/40", emoji: "🔵" };
  if (score >= 40) return { score, label: "Умеренно", color: "text-yellow-400", bgColor: "bg-yellow-500/20 border-yellow-500/40", emoji: "🟡" };
  if (score >= 20) return { score, label: "Плохо", color: "text-orange-400", bgColor: "bg-orange-500/20 border-orange-500/40", emoji: "🟠" };
  return { score, label: "Опасно", color: "text-red-400", bgColor: "bg-red-500/20 border-red-500/40", emoji: "🔴" };
}
