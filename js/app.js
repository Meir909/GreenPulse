// Main application logic for GreenPulse water purification system

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initApp();
});

function initApp() {
    // Initialize map
    initMap();

    // Update statistics
    updateStatistics();

    // Setup navigation and page switching
    setupNavigation();

    // Setup dashboard
    updateDashboardDate();

    // Auto-update data every 30 seconds (simulate real-time sensor updates)
    setInterval(updateStationData, 30000);

    // Auto-update dashboard every 30 seconds
    setInterval(updateDashboard, 30000);
}

function updateStatistics() {
    const stats = calculateStats();

    document.getElementById('activeStations').textContent = stats.activeStations;
    document.getElementById('co2TodayTotal').textContent = (stats.co2TodayTotal * 1000).toFixed(2) + ' мг';
    document.getElementById('co2MonthTotal').textContent = (stats.co2MonthTotal * 1000).toFixed(2) + ' мг';
    document.getElementById('needsAttention').textContent = stats.needsAttention > 0 ? '⚠️ ' + stats.needsAttention : '✅ 0';
    document.getElementById('systemStatus').textContent = stats.systemStatus;

    // Update CO2 in dashboard
    document.getElementById('dashCo2Today').textContent = (stats.co2TodayTotal * 1000).toFixed(2);
}

function updateStationData() {
    // Обновление данных с Arduino датчиков
    updateArduinoData();

    // Если модалка открыта, обновляем её
    const modal = document.getElementById('stationModal');
    if (modal.classList.contains('active')) {
        // Обновляем данные в модальном окне
        const station = getStationById(currentStationId);
        if (station) {
            updateModalData(station);
        }
    }

    // Обновляем статистику
    updateStatistics();
}

function updateModalData(station) {
    document.getElementById('co2Level').textContent = station.phCurrent.toFixed(2);
    document.getElementById('temperature').textContent = station.temperature.toFixed(1) + '°C';
    document.getElementById('humidity').textContent = '45%'; // Static value
    document.getElementById('pressure').textContent = '1013 hPa'; // Static value
    document.getElementById('pm25').textContent = '85 µg/m³'; // Static value
    document.getElementById('efficiency').textContent = station.co2Current.toFixed(1) + ' мг/л';
    document.getElementById('purifiedToday').textContent = (station.co2CleanedToday * 1000).toFixed(2) + ' мг';
    document.getElementById('filterStatus').textContent = station.filterUsagePercent.toFixed(0) + '% использованы';

    // Update bars
    updatePhBar(station.phCurrent);
    updateCo2Bar(station.co2Current);
    updateFilterBar(station.filterUsagePercent);
}

function updatePhBar(ph) {
    const bar = document.getElementById('co2Bar');
    const percent = Math.max(0, Math.min(100, ((ph - 6.0) / (7.5 - 6.0)) * 100));
    bar.style.width = percent + '%';

    // Color coding for pH
    if (ph < 6.2) {
        bar.className = 'bar-fill critical';
    } else if (ph < 6.5) {
        bar.className = 'bar-fill warning';
    } else {
        bar.className = 'bar-fill';
    }
}

function updateCo2Bar(co2) {
    const bar = document.getElementById('efficiencyBar');
    const percent = Math.min(100, (co2 / 15) * 100);
    bar.style.width = percent + '%';
}

function updateEfficiencyBar(efficiency) {
    const bar = document.getElementById('efficiencyBar');
    bar.style.width = efficiency + '%';
}

function updateFilterBar(filterUsage) {
    const bar = document.getElementById('filterStatus').nextElementSibling;
    if (bar && bar.classList.contains('info-bar')) {
        bar.querySelector('.bar-fill').style.width = filterUsage + '%';
    }
}


function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-page]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active to clicked link
            link.classList.add('active');

            // Get page to show
            const page = link.dataset.page;

            // Hide all views
            document.getElementById('map-view').style.display = 'none';
            document.getElementById('dashboard-view').style.display = 'none';

            // Show selected view
            if (page === 'map') {
                document.getElementById('map-view').style.display = 'block';
                // Refresh map
                if (map) map.invalidateSize();
            } else if (page === 'dashboard') {
                document.getElementById('dashboard-view').style.display = 'block';
                updateDashboard();
            }
        });
    });

    // Set initial active state
    navLinks[0].classList.add('active');
}

function updateDashboard() {
    const stats = calculateStats();
    const station = STATIONS[0];

    if (!station) return;

    // Update CO2 stats
    document.getElementById('dashCo2Today').textContent = stats.co2TodayTotal.toFixed(1);
    document.getElementById('dashCo2Avg').textContent = (stats.co2TodayTotal / 24 * 60).toFixed(1);
    document.getElementById('dashCo2Peak').textContent = (station.co2CleanedToday * 0.8).toFixed(1);
}

function updateDashboardDate() {
    const dateEl = document.getElementById('dashboardDate');
    if (dateEl) {
        const today = new Date();
        dateEl.textContent = today.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Handle window resize for responsive design
window.addEventListener('resize', () => {
    if (map && map._container) {
        map.invalidateSize();
    }
});
