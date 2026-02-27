// Configuration file for GreenPulse - Water Purification System

// OpenAI API Key (ИСПОЛЬЗОВАТЬ o4-mini или o4)
const CONFIG = {
    OPENAI_API_KEY: 'sk-your-api-key-here',
    OPENAI_MODEL: 'gpt-4o-mini',
    MAP_CENTER: [55.7558, 37.6173], // Москва, Россия
    MAP_ZOOM: 11,
    UPDATE_INTERVAL: 30000, // 30 секунд
    MAX_TOKENS: 1200,
};

// Water Purification Stations (Arduino with GPS Sensors)
const STATIONS = [
    {
        id: 1,
        name: 'GreenPulse Station 01 - Москва',
        lat: 55.7558,
        lng: 37.6173,
        location: 'Москва, Центр города',
        coordinates: '55.7558°N, 37.6173°E',
        temperature: 22,
        humidity: 45,
        pressure: 1013,
        pm25: 85,

        // pH Levels - Начало: 6.0, Конец: 7.5
        phStart: 6.0,
        phEnd: 7.5,
        phCurrent: 6.0,

        // CO2 Levels (в мг/л)
        // Начало: ~15 мг/л → Конец: ~2 мг/л
        co2Start: 15, // мг/л
        co2End: 2,    // мг/л
        co2Current: 15,
        co2Absorbed: 0, // поглощено

        // Расчёт поглощённого CO2
        // Формула: CO2_поглощено = (pH_start - pH_end) × объём × коэффициент
        volumeWater: 8, // литры воды
        timeHours: 3.5, // часов

        // Purification Stats
        purificationStatus: 'Активна',
        isPurifying: true,
        efficiency: 92,

        // CO2/CO2 Absorbed (в граммах - расчёт по формуле)
        // Поглощено = 13 мг/л × объём воды (8л) = 104 мг = ~0.1 грамм
        co2CleanedToday: 0.104, // граммы
        co2CleanedThisMonth: 3.12, // граммы

        // Radius Coverage (км)
        radiusKm: 0.8,
        areaKm2: 2.01,
        populationCovered: 15000,

        // Filter Status
        filterUsagePercent: 35,
        filterStatus: 'Нормальное состояние',

        // System Status
        powerStatus: 'Online',
        gpsStatus: 'Online',
        sensorStatus: 'Normal',

        // Arduino Connection
        arduinoConnected: true,
        lastUpdate: '2024-02-27 14:30',
        signalStrength: 95,
    },
];

// Get station by ID
function getStationById(id) {
    return STATIONS.find(s => s.id === id);
}

// Calculate stats
function calculateStats() {
    const activeCount = STATIONS.filter(s => s.isPurifying).length;
    const totalCo2Today = STATIONS.reduce((sum, s) => sum + s.co2CleanedToday, 0);
    const totalCo2Month = STATIONS.reduce((sum, s) => sum + s.co2CleanedThisMonth, 0);
    const needsAttention = STATIONS.filter(
        s => s.phCurrent < 6.5 || s.efficiency < 85
    ).length;

    return {
        activeStations: activeCount,
        co2TodayTotal: totalCo2Today,
        co2MonthTotal: totalCo2Month,
        needsAttention: needsAttention,
        systemStatus: needsAttention > 0 ? 'Критично' : 'Нормально',
    };
}

// Функция расчёта поглощённого CO2 по формуле
function calculateCO2Absorbed(station) {
    // Формула: Поглощено = (pH_start - pH_end) × объём воды (мг/л)
    // Поглощено = 13 мг/л × объём воды (8л) = 104 мг = ~0.1 грамм

    const co2Difference = station.co2Start - station.co2End; // 15 - 2 = 13 мг/л
    const co2AbsorbedMg = co2Difference * station.volumeWater; // 13 × 8 = 104 мг
    const co2AbsorbedGrams = co2AbsorbedMg / 1000; // 104 / 1000 = 0.104 г

    return {
        mgPerLiter: co2Difference, // мг/л
        totalMg: co2AbsorbedMg, // общее в мг
        totalGrams: co2AbsorbedGrams, // общее в граммах
        perHour: co2AbsorbedGrams / station.timeHours // граммов в час
    };
}

// Arduino Simulation - Обновление данных с датчиков
function updateArduinoData() {
    STATIONS.forEach(station => {
        // Имитация изменения pH с течением времени
        const progress = Math.min(1, (new Date().getHours() % 4) / 4);
        station.phCurrent = station.phStart + (station.phEnd - station.phStart) * progress;

        // Имитация изменения CO2 с течением времени
        station.co2Current = station.co2Start - (station.co2Start - station.co2End) * progress;

        // Обновление температуры
        station.temperature += (Math.random() - 0.5) * 0.3;
        station.temperature = Math.max(10, Math.min(30, station.temperature));

        // Обновление статуса в зависимости от pH
        if (station.phCurrent < 6.5) {
            station.purificationStatus = 'Активная очистка';
            station.efficiency = Math.floor(85 + Math.random() * 15);
        } else if (station.phCurrent < 7.0) {
            station.purificationStatus = 'Активна';
            station.efficiency = Math.floor(88 + Math.random() * 12);
        } else {
            station.purificationStatus = 'Оптимальное состояние';
            station.efficiency = Math.floor(92 + Math.random() * 8);
        }

        // Расчёт поглощённого CO2
        const co2Data = calculateCO2Absorbed(station);
        station.co2Absorbed = co2Data.totalGrams;

        // Обновление статистики очистки
        const cleanedPerHour = co2Data.perHour * 0.5; // граммов в час с коэффициентом
        station.co2CleanedToday = (new Date().getHours()) * cleanedPerHour;
        station.co2CleanedThisMonth = station.co2CleanedToday * 30;

        // Обновление статуса фильтров
        station.filterUsagePercent = Math.min(100, station.filterUsagePercent + Math.random() * 0.1);
        if (station.filterUsagePercent < 50) {
            station.sensorStatus = 'Normal';
            station.filterStatus = 'Нормальное состояние';
        } else if (station.filterUsagePercent < 80) {
            station.sensorStatus = 'Normal';
            station.filterStatus = 'Скоро потребуется замена';
        } else {
            station.sensorStatus = 'Warning';
            station.filterStatus = `Требуется замена через ${Math.ceil(100 - station.filterUsagePercent)} часов`;
        }

        // Обновление времени
        station.lastUpdate = new Date().toLocaleString('ru-RU');
    });
}
