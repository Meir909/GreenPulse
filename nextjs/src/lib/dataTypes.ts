/**
 * GreenPulse Data Types & Status Schema
 *
 * This file defines the canonical data contracts between backend and frontend.
 * Every data value displayed in the UI has a clearly defined origin type.
 */

// ── Data Origin ───────────────────────────────────────────────────────────────

/** How a data value was produced. Always surfaced in UI context labels. */
export type DataOrigin =
  | "live_measured"      // Direct sensor reading from ESP32 hardware
  | "estimated"          // Calculated via scientific model from measured inputs
  | "historical"         // Stored measurement from past sensor reading
  | "simulated"          // Local JS simulation (no hardware connection)
  | "default_assumed"    // Hardcoded fallback when no data available
  | "ai_generated"       // AI-produced text / interpretation
  | "literature_value"   // Published research baseline (not from this device)
  | "none";              // No data available

/** Human-readable label for each origin type */
export const ORIGIN_LABELS: Record<DataOrigin, string> = {
  live_measured:    "Live · ESP32",
  estimated:        "Estimated",
  historical:       "Historical",
  simulated:        "Simulated",
  default_assumed:  "Demo / Default",
  ai_generated:     "AI Analysis",
  literature_value: "Literature",
  none:             "No data",
};

/** Short badge text */
export const ORIGIN_BADGE: Record<DataOrigin, string> = {
  live_measured:    "LIVE",
  estimated:        "EST",
  historical:       "HIST",
  simulated:        "SIM",
  default_assumed:  "DEMO",
  ai_generated:     "AI",
  literature_value: "LIT",
  none:             "N/A",
};

/** Color class for origin badge */
export const ORIGIN_COLOR: Record<DataOrigin, string> = {
  live_measured:    "text-[#00ff88]",
  estimated:        "text-[#00d4ff]",
  historical:       "text-[#7c3aed]",
  simulated:        "text-[#f97316]",
  default_assumed:  "text-white/30",
  ai_generated:     "text-[#00d4ff]",
  literature_value: "text-white/45",
  none:             "text-white/20",
};

// ── Sensor Data ───────────────────────────────────────────────────────────────

export interface SensorData {
  temperature?:     number;
  humidity?:        number;
  co2_ppm?:         number;
  co_ppm?:          number;
  ph?:              number;
  light_intensity?: number;
  latitude?:        number;
  longitude?:       number;
  altitude?:        number;
  gps_valid?:       boolean;
  satellites?:      number;
  timestamp?:       string;
  station_name?:    string;
  station_id?:      number;
  water_level?:     number;
}

// ── Sensor Alert Thresholds ───────────────────────────────────────────────────
// Based on Chlorella vulgaris optimal growth conditions and urban air safety.

export const SENSOR_THRESHOLDS = {
  temperature: { min: 20, max: 30, warnLow: 15, warnHigh: 35, unit: "°C" },
  humidity:    { min: 60, max: 80, warnLow: 40, warnHigh: 90, unit: "%" },
  co2_ppm:     { min: 380, max: 450, warnHigh: 800, dangerHigh: 1500, unit: "ppm" },
  co_ppm:      { min: 0,  max: 50,  warnHigh: 100, dangerHigh: 200,  unit: "ppm" },
  ph:          { min: 6.5, max: 7.5, warnLow: 6.0, warnHigh: 8.0,   unit: "" },
  light:       { min: 400, max: 600, warnLow: 200, warnHigh: 2000,   unit: "lux" },
} as const;

// ── CO2 Absorption Model ──────────────────────────────────────────────────────
// These are literature-based constants, not directly measured from this unit.

export const CO2_MODEL = {
  /** Annual absorption at 100% efficiency [kg/year] — Chlorella vulgaris, 1m² culture */
  maxKgPerYear: 38,
  /** Equivalent in average trees (avg tree ~2.5 kg CO2/year) */
  treeEquivalent: 15,
  /** Source reference */
  source: "Converti et al. (2009), Bioresource Technology 100(1):556-561",
  /** Confidence note */
  confidence: "Literature-based estimate. Actual absorption depends on culture density, light, and CO2 gradient.",
  /** Accuracy range */
  accuracy: "±30–50%",
};

// ── Photosynthetic Efficiency (client-side mirror of backend model) ────────────

export function photoEfficiency(temp?: number | null): number {
  if (temp == null) return 0;
  if (temp >= 40 || temp < 0) return 0;
  if (temp < 10) return 0.02;
  if (temp < 15) return 0.15;
  if (temp < 20) return 0.45;
  if (temp <= 30) return 1.0;
  if (temp <= 35) return 0.50;
  return 0.10;
}

// ── Dashboard State ───────────────────────────────────────────────────────────

export type DataState =
  | "live"           // Fresh ESP32 data (<30s old)
  | "stale"          // ESP32 data older than 30s
  | "simulated"      // Local simulation active
  | "offline"        // No data available
  | "loading";       // Initial load

export function getDataState(
  connected: boolean,
  offline: boolean,
  loading: boolean,
  lastUpdate: Date | null
): DataState {
  if (loading) return "loading";
  if (connected && lastUpdate) {
    const ageMs = Date.now() - lastUpdate.getTime();
    return ageMs < 30_000 ? "live" : "stale";
  }
  if (offline) return "offline";
  return "offline";
}

export const DATA_STATE_LABEL: Record<DataState, string> = {
  live:      "Live · ESP32",
  stale:     "Stale data",
  simulated: "Simulation",
  offline:   "Offline",
  loading:   "Connecting...",
};

export const DATA_STATE_COLOR: Record<DataState, string> = {
  live:      "text-[#00ff88]",
  stale:     "text-[#f97316]",
  simulated: "text-[#f97316]",
  offline:   "text-white/30",
  loading:   "text-white/30",
};
