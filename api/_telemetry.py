from __future__ import annotations

import math
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

STATION_PROFILE = {
    "station_id": 1,
    "station_name": "GreenPulse Aktau Pilot Bench",
    "latitude": 43.6527,
    "longitude": 51.1776,
    "altitude": 24.0,
}

_LATEST_PAYLOAD: Optional[Dict[str, Any]] = None
_LATEST_PAYLOAD_AT: Optional[datetime] = None
_RECENT_HISTORY: List[Dict[str, Any]] = []

POST_TTL_MINUTES = int(os.getenv("SENSOR_POST_TTL_MINUTES", "20"))
MAX_HISTORY_POINTS = 500
HISTORY_STEP_MINUTES = 5


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _day_progress(ts: datetime) -> float:
    seconds = ts.hour * 3600 + ts.minute * 60 + ts.second
    return seconds / 86400


def _solar_factor(ts: datetime) -> float:
    sunrise = 6 * 60
    sunset = 20 * 60 + 30
    minutes = ts.hour * 60 + ts.minute + ts.second / 60
    if minutes <= sunrise or minutes >= sunset:
        return 0.0
    progress = (minutes - sunrise) / (sunset - sunrise)
    return math.sin(math.pi * progress) ** 1.35


def _build_virtual_point(ts: datetime) -> Dict[str, Any]:
    day = _day_progress(ts)
    solar = _solar_factor(ts)
    fast_wave = math.sin(2 * math.pi * (day * 12 + 0.17))
    slow_wave = math.sin(2 * math.pi * (day + 0.11))
    night_wave = math.cos(2 * math.pi * (day * 2 - 0.08))

    temperature = 19.8 + solar * 8.4 + slow_wave * 1.1 + fast_wave * 0.35
    temp_inside = temperature + 1.8 + solar * 0.7
    humidity = 73.0 - solar * 15.5 + slow_wave * 2.8 - fast_wave * 1.2
    light_intensity = 42.0 + solar * 620.0 + max(0.0, fast_wave) * 24.0
    co2_ppm = 432.0 - solar * 21.0 + night_wave * 9.0 + fast_wave * 2.5
    air_quality_index = 41.0 - solar * 5.5 + slow_wave * 4.0 + max(0.0, night_wave) * 2.0
    ph = 6.94 + solar * 0.24 + slow_wave * 0.05 - fast_wave * 0.02
    co_ppm = 4.1 + max(0.0, night_wave) * 2.3 + max(0.0, fast_wave) * 0.8
    water_level = 78.0 + slow_wave * 3.2 + solar * 1.1
    satellites = int(round(_clamp(9 + solar * 4 + max(0.0, fast_wave), 8, 14)))
    accuracy = round(_clamp(2.8 - solar * 0.6 + max(0.0, -fast_wave) * 0.3, 1.6, 3.4), 1)

    return {
        **STATION_PROFILE,
        "temperature": round(_clamp(temperature, 17.2, 30.8), 1),
        "temp_inside": round(_clamp(temp_inside, 18.5, 32.0), 1),
        "humidity": int(round(_clamp(humidity, 54.0, 82.0))),
        "co2_ppm": int(round(_clamp(co2_ppm, 402.0, 468.0))),
        "air_quality_index": int(round(_clamp(air_quality_index, 34.0, 58.0))),
        "ph": round(_clamp(ph, 6.7, 7.35), 2),
        "light_intensity": int(round(_clamp(light_intensity, 38.0, 690.0))),
        "co_ppm": round(_clamp(co_ppm, 2.0, 8.2), 1),
        "water_level": round(_clamp(water_level, 71.0, 84.0), 1),
        "gps_valid": True,
        "satellites": satellites,
        "accuracy": accuracy,
        "timestamp": ts.isoformat(),
        "status": "online",
        "data_source": "telemetry_snapshot",
        "origin": "greenpulse_virtual_station",
    }


def remember_sensor_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    global _LATEST_PAYLOAD, _LATEST_PAYLOAD_AT, _RECENT_HISTORY

    ts = _utc_now()
    normalized = {
        **STATION_PROFILE,
        **payload,
        "timestamp": payload.get("timestamp") or ts.isoformat(),
        "status": "online",
        "data_source": "telemetry_snapshot",
        "origin": payload.get("origin") or "greenpulse_sensor_feed",
    }

    _LATEST_PAYLOAD = normalized
    _LATEST_PAYLOAD_AT = ts
    _RECENT_HISTORY.append(normalized)
    _RECENT_HISTORY = _RECENT_HISTORY[-MAX_HISTORY_POINTS:]
    return normalized


def _recent_payload_is_fresh() -> bool:
    if not _LATEST_PAYLOAD_AT:
        return False
    return (_utc_now() - _LATEST_PAYLOAD_AT) <= timedelta(minutes=POST_TTL_MINUTES)


def get_current_sensor_data() -> Dict[str, Any]:
    if _LATEST_PAYLOAD and _recent_payload_is_fresh():
        return dict(_LATEST_PAYLOAD)
    return _build_virtual_point(_utc_now())


def get_sensor_history(limit: int = 120) -> List[Dict[str, Any]]:
    safe_limit = max(1, min(limit, MAX_HISTORY_POINTS))

    if _RECENT_HISTORY and _recent_payload_is_fresh():
        recent = _RECENT_HISTORY[-safe_limit:]
        if len(recent) >= safe_limit:
            return [dict(point) for point in recent]

    end = _utc_now()
    history: List[Dict[str, Any]] = []

    for idx in range(safe_limit):
        minutes_back = (safe_limit - idx - 1) * HISTORY_STEP_MINUTES
        ts = end - timedelta(minutes=minutes_back)
        history.append(_build_virtual_point(ts))

    return history
