// ⚠️ EXAMPLE CONFIGURATION FILE
// Copy this file to config.js and add your actual API key
// NEVER commit config.js with real API key to Git!

// Configuration file for GreenPulse

// OpenAI API Key - Get it from https://platform.openai.com/api-keys
// ВАЖНО: Эта строка нужна для работы AI функций
// DANGER: НИКОГДА не коммитьте реальный ключ!
const CONFIG = {
    // Ваш OpenAI API Key (получить на https://platform.openai.com/api-keys)
    OPENAI_API_KEY: 'sk-your-api-key-here',

    // Координаты центра карты (по умолчанию: Москва)
    MAP_CENTER: [55.7558, 37.6173],

    // Уровень зума карты
    MAP_ZOOM: 11,

    // Интервал обновления данных (в миллисекундах)
    UPDATE_INTERVAL: 30000, // 30 секунд

    // Модель OpenAI для использования
    OPENAI_MODEL: 'gpt-4o-mini',

    // Максимальное количество токенов в ответе AI
    MAX_TOKENS: 1000,
};

// Пример данных станции
const STATION_EXAMPLE = {
    id: 1,                              // Уникальный ID станции
    name: 'Станция "Москва-Север"',     // Название станции
    lat: 55.8152,                       // Широта (GPS координата)
    lng: 37.6113,                       // Долгота (GPS координата)
    location: 'Москва, СЗАО',           // Текстовое описание расположения
    temperature: 18,                    // Температура воды (°C)
    ph: 7.2,                           // pH уровень (0-14)
    pollution: 35,                      // Уровень загрязнения (0-100%)
    purificationStatus: 'Активна',      // Статус: 'Активна' или 'Требует внимания'
    isPurifying: true,                  // Очищается ли вода сейчас
    efficiency: 92,                     // Эффективность очистки (0-100%)
    lastUpdate: '2024-02-27 14:30',    // Время последнего обновления
};

// Production mode - использовать backend для API
// Раскомментируйте для production среды:
/*
const CONFIG = {
    API_ENDPOINT: 'https://your-backend.com/api/analyze',
    MAP_CENTER: [55.7558, 37.6173],
    MAP_ZOOM: 11,
    // API ключ на frontend больше не нужен!
};
*/
