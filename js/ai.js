// AI Analysis using OpenAI API (GPT-4o-mini)

let currentStationData = null;

async function analyzeStation() {
    if (!currentStationId) return;

    const station = getStationById(currentStationId);
    if (!station) return;

    // Сохраняем данные текущей станции
    currentStationData = station;

    const analyzeButton = document.getElementById('analyzeButton');
    const aiResponse = document.getElementById('aiResponse');
    const aiSpinner = document.getElementById('aiSpinner');
    const aiContent = document.getElementById('aiContent');

    // Disable button and show spinner
    analyzeButton.disabled = true;
    analyzeButton.textContent = 'Анализирую...';
    aiResponse.style.display = 'block';
    aiContent.innerHTML = '';

    try {
        // Используем наш Flask API endpoint
        const response = await fetch('/api/ai-analyze-sensors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                temperature: station.temperature,
                humidity: station.humidity,
                light_intensity: 450, // дефолтное значение
                co2_ppm: 420, // дефолтное значение
                latitude: station.lat,
                longitude: station.lng,
                satellites: 8 // дефолтное значение
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка сервера ИИ');
        }

        const data = await response.json();
        
        // Hide spinner and display response
        aiSpinner.style.display = 'none';
        aiContent.innerHTML = formatAIResponse(data.analysis);

    } catch (error) {
        console.error('AI Analysis error:', error);
        aiSpinner.style.display = 'none';
        aiContent.innerHTML = `
            <div style="color: var(--critical-color); padding: 15px; background: rgba(255, 23, 68, 0.1); border-radius: 8px; border-left: 3px solid var(--critical-color);">
                <strong>⚠️ Ошибка анализа</strong><br>
                <small>${error.message || 'Убедитесь что Flask сервер запущен и настроен OpenAI API ключ'}</small>
            </div>
        `;
    } finally {
        analyzeButton.disabled = false;
        analyzeButton.textContent = 'Получить анализ';
    }
}

function prepareAnalysisPrompt(station) {
    const co2Data = calculateCO2Absorbed(station);
    return `You are an expert in water purification systems and quality monitoring. Analyze this real-time data from a water purification station with Arduino GPS sensor and provide a comprehensive report in Russian:

STATION DATA:
- Name: ${station.name}
- Location: ${station.location} (GPS: ${station.coordinates})
- Current pH Level: ${station.phCurrent.toFixed(2)} (Optimal range: 6.0 - 7.5)
- Dissolved CO2: ${station.co2Current.toFixed(1)} mg/l (Target: 2 mg/l)
- Water Temperature: ${station.temperature.toFixed(1)}°C
- Purification Efficiency: ${station.efficiency}%
- Status: ${station.purificationStatus}
- Filter Usage: ${station.filterUsagePercent.toFixed(0)}% (maintenance approaching)
- CO2 Absorbed Today: ${co2Data.totalGrams.toFixed(3)} grams (${(co2Data.perHour * 24).toFixed(2)} g/day rate)
- Coverage Radius: ${station.radiusKm} km
- Population in Service Area: ~${(station.populationCovered/1000).toFixed(0)}K people
- Arduino GPS Status: Connected and Synchronizing

WATER TREATMENT DATA:
- Water Volume Treated: ${station.volumeWater} liters
- Treatment Time: ${station.timeHours} hours
- pH Change: ${station.phStart} → ${station.phEnd}
- CO2 Reduction: ${station.co2Start} → ${station.co2End} mg/l

Provide analysis in Russian with following sections:
1. ⚠️ КРИТИЧНОСТЬ - оценка текущего состояния (шкала 1-10)
2. 🔬 АНАЛИЗ ПОКАЗАТЕЛЕЙ - что означают эти значения pH и CO2
3. 👥 КАЧЕСТВО ВОДЫ - какое влияние на население в зоне обслуживания
4. 📊 ПРОГНОЗ 24 ЧАСА - ожидаемые изменения параметров
5. 🔧 РЕКОМЕНДАЦИИ - конкретные действия по приоритету
6. ⏰ СРОКИ ОБСЛУЖИВАНИЯ - когда менять фильтры и почему

Be specific with numbers and timeframes. Use technical terms but make it understandable.`;
}

async function callOpenAIAPI(prompt) {
    // Используем наш Flask API как прокси для OpenAI
    const response = await fetch('/api/ai-analyze-sensors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: prompt,
            // Добавляем текущие данные датчиков
            temperature: currentStationData?.temperature || 22,
            humidity: currentStationData?.humidity || 65,
            light_intensity: currentStationData?.light_intensity || 450,
            co2_ppm: currentStationData?.co2_ppm || 420,
            latitude: currentStationData?.lat || 55.7558,
            longitude: currentStationData?.lng || 37.6173,
            satellites: currentStationData?.satellites || 8
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка сервера ИИ. Проверьте настройки API.');
    }

    const data = await response.json();
    return data.analysis;
}

function formatAIResponse(content) {
    // Convert markdown-like formatting to HTML
    let html = content
        // Headers
        .replace(/### (.*?)\n/g, '<h4>$1</h4>')
        .replace(/## (.*?)\n/g, '<h3>$1</h3>')
        .replace(/# (.*?)\n/g, '<h2>$1</h2>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Emoji and numbers at start of lines
        .replace(/^(.*?):/gm, '<strong>$1:</strong>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // Lists - handle both * and - and numbers
        .replace(/^[\*\-\d\.]\s+(.*?)(<br>|<\/p>|$)/gm, '<li>$1</li>');

    // Wrap in paragraphs
    html = '<p>' + html + '</p>';

    // Clean up
    html = html
        .replace(/<p><\/p>/g, '')
        .replace(/<li>/g, '<ul><li>')
        .replace(/<\/li>/g, '</li></ul>')
        .replace(/<\/ul>\s*<ul>/g, '');

    return html;
}

// Event listener for analyze button
document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeButton');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeStation);
    }
});
