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
        // Используем наш Flask API endpoint для прогноза роста
        const response = await fetch('/api/ai-predict-growth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ph: station.phCurrent,
                temperature: station.temperature,
                light_intensity: 450
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка сервера ИИ');
        }

        const data = await response.json();

        // Отобразить прогноз
        const forecastContent = `
            <h4>📈 AI Прогноз и Анализ</h4>
            ${data.prediction}
            <div style="margin-top: 20px; padding: 15px; background: rgba(0, 255, 136, 0.1); border-radius: 8px; border-left: 3px solid var(--success-color); font-size: 12px; color: var(--text-light);">
                <strong>💡 Совет:</strong> Регулярно проверяйте параметры системы для оптимальной производительности.
            </div>
        `;

        alert(forecastContent);

    } catch (error) {
        console.error('Forecast error:', error);
        alert('⚠️ Ошибка получения прогноза. Убедитесь что сервер настроен и работает.');
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
