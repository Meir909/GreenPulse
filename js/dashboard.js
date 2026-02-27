// Dashboard functionality for GreenPulse Water Purification System

// Получить прогноз от AI
document.addEventListener('DOMContentLoaded', () => {
    const forecastBtn = document.getElementById('getAiForecast');
    if (forecastBtn) {
        forecastBtn.addEventListener('click', getAIForecast);
    }
});

async function getAIForecast() {
    const forecastBtn = document.getElementById('getAiForecast');
    if (!forecastBtn) return;

    const station = STATIONS[0];
    if (!station) return;

    forecastBtn.disabled = true;
    forecastBtn.textContent = 'Получаю прогноз...';

    try {
        const co2Data = calculateCO2Absorbed(station);
        const prompt = `Ты эксперт в системах очистки воды. Дай подробный прогноз и анализ для систем очистки воды на основе этих данных:

Текущий pH уровень: ${station.phCurrent.toFixed(2)} (оптимальный диапазон: 6.0 - 7.5)
Растворённый CO2: ${station.co2Current.toFixed(1)} мг/л (норма: 2 мг/л)
Эффективность очистки: ${station.efficiency}%
Статус фильтров: ${station.filterUsagePercent.toFixed(0)}% использованы
CO2 поглощено сегодня: ${co2Data.totalGrams.toFixed(3)} граммов
Объём обработанной воды: ${station.volumeWater} литров за ${station.timeHours} часов
Зона обслуживания: ${station.radiusKm} км радиус, население: ${(station.populationCovered/1000).toFixed(0)}K человек

Дай:
1. Оценку критичности ситуации
2. Прогноз на 24 часа
3. Рекомендации по улучшению качества воды
4. Какое население может пострадать от низкого качества в зоне
5. Время до требуемого обслуживания фильтров

Ответь кратко, профессионально, с конкретными цифрами.`;

        const response = await callOpenAIAPI(prompt);

        // Отобразить прогноз
        const forecastContent = `
            <h4>📈 AI Прогноз и Анализ</h4>
            ${response}
            <div style="margin-top: 20px; padding: 15px; background: rgba(0, 255, 136, 0.1); border-radius: 8px; border-left: 3px solid var(--success-color); font-size: 12px; color: var(--text-light);">
                <strong>💡 Совет:</strong> Немедленно замените фильтры и проверьте датчики Arduino.
            </div>
        `;

        alert(forecastContent);

    } catch (error) {
        console.error('Forecast error:', error);
        alert('⚠️ Ошибка получения прогноза. Проверьте API ключ.');
    } finally {
        forecastBtn.disabled = false;
        forecastBtn.textContent = 'Получить детальный прогноз';
    }
}

// Обновить данные дашборда в реальном времени
function refreshDashboardMetrics() {
    const stats = calculateStats();
    const station = STATIONS[0];

    if (!station) return;

    // Обновить основные метрики
    document.getElementById('dashCo2Today').textContent = stats.co2TodayTotal.toFixed(1);
    document.getElementById('dashCo2Month').textContent = stats.co2MonthTotal.toFixed(0);

    // Обновить средние значения
    const avgCo2PerHour = (stats.co2TodayTotal / new Date().getHours()) || 0;
    document.getElementById('dashCo2Avg').textContent = avgCo2PerHour.toFixed(1);

    // Обновить пиковые значения (симуляция)
    const peakValue = (stats.co2TodayTotal * 0.75).toFixed(1);
    document.getElementById('dashCo2Peak').textContent = peakValue;

    // Обновить информацию о зоне охвата
    document.querySelectorAll('.coverage-item').forEach((item, index) => {
        if (index === 0) {
            item.innerHTML = `<span>Радиус действия:</span><strong>${station.radiusKm} км</strong>`;
        } else if (index === 1) {
            item.innerHTML = `<span>Площадь зоны:</span><strong>${station.areaKm2} км²</strong>`;
        } else if (index === 2) {
            item.innerHTML = `<span>Население в зоне:</span><strong>~${(station.populationCovered/1000).toFixed(0)}K человек</strong>`;
        }
    });
}

// Экспортировать данные (опционально)
function exportDashboardData() {
    const stats = calculateStats();
    const station = STATIONS[0];

    const data = {
        timestamp: new Date().toISOString(),
        co2AbsorbedToday: stats.co2TodayTotal,
        co2AbsorbedMonth: stats.co2MonthTotal,
        station: {
            name: station.name,
            location: station.location,
            phLevel: station.phCurrent,
            co2Dissolved: station.co2Current,
            efficiency: station.efficiency,
            filterUsage: station.filterUsagePercent,
        }
    };

    return JSON.stringify(data, null, 2);
}
