// Modal window management for GreenPulse water purification system

let currentStationId = null;

function openStationModal(stationId) {
    const station = getStationById(stationId);
    if (!station) return;

    currentStationId = stationId;
    closeAllPopups();

    // Update modal header
    document.getElementById('stationName').textContent = station.name;
    const statusEl = document.getElementById('stationStatus');
    statusEl.textContent = station.purificationStatus;

    // Update status styling based on pH
    statusEl.className = 'station-status';
    if (station.phCurrent < 6.2) {
        statusEl.classList.add('critical');
    } else if (station.phCurrent < 6.5) {
        statusEl.classList.add('warning');
    } else {
        statusEl.classList.add('normal');
    }

    // Update location and GPS coordinates
    document.getElementById('location').textContent = station.location;
    document.getElementById('coordinates').textContent = station.coordinates;

    // Update environmental data
    document.getElementById('temperature').textContent = station.temperature.toFixed(1) + '°C';
    document.getElementById('humidity').textContent = station.humidity.toFixed(1) + '%';
    document.getElementById('pressure').textContent = station.pressure + ' hPa';
    document.getElementById('pm25').textContent = Math.round(station.pm25) + ' µg/m³';

    // Update pH Level with status indicator
    updatePhLevel(station);

    // Calculate and display CO2 absorbed
    const co2Data = calculateCO2Absorbed(station);
    updateCo2AbsorptionData(co2Data);

    // Update efficiency
    updateEfficiency(station.efficiency);

    // Update purification stats
    document.getElementById('purifiedToday').textContent = (station.co2CleanedToday * 1000).toFixed(2) + ' мг';
    updateFilterStatus(station.filterUsagePercent, station.filterStatus);

    // Reset AI response section
    document.getElementById('aiResponse').style.display = 'none';
    document.getElementById('aiContent').innerHTML = '';

    // Show modal
    const modal = document.getElementById('stationModal');
    modal.classList.add('active');

    // Enable analyze button
    document.getElementById('analyzeButton').disabled = false;
    document.getElementById('analyzeButton').textContent = 'Получить анализ';
}

function closeStationModal() {
    document.getElementById('stationModal').classList.remove('active');
    currentStationId = null;
}

function updatePhLevel(station) {
    const phEl = document.getElementById('co2Level');
    const phBar = document.getElementById('co2Bar');

    phEl.textContent = station.phCurrent.toFixed(2);

    // pH scale: 6.0 to 7.5 (where 7.5 is optimal)
    const phPercent = ((station.phCurrent - 6.0) / (7.5 - 6.0)) * 100;
    phBar.style.width = Math.max(0, Math.min(100, phPercent)) + '%';

    // Color coding for pH
    phBar.className = 'bar-fill';
    phEl.className = 'info-value';
    if (station.phCurrent < 6.2) {
        phEl.className = 'info-value critical-text';
        phBar.classList.add('critical');
    } else if (station.phCurrent < 6.5) {
        phEl.className = 'info-value warning-text';
        phBar.classList.add('warning');
    }
}

function updateEfficiency(efficiency) {
    const efficiencyEl = document.getElementById('efficiency');
    const efficiencyBar = document.getElementById('efficiencyBar');

    efficiencyEl.textContent = efficiency + '%';
    efficiencyBar.style.width = efficiency + '%';

    // Color coding for efficiency
    if (efficiency >= 90) {
        efficiencyEl.style.color = 'var(--primary-light)';
    } else if (efficiency >= 75) {
        efficiencyEl.style.color = 'var(--warning-color)';
    } else {
        efficiencyEl.style.color = 'var(--critical-color)';
    }
}

function updateFilterStatus(filterUsage, filterText) {
    const filterEl = document.getElementById('filterStatus');
    filterEl.textContent = filterUsage.toFixed(0) + '% использованы';

    if (filterUsage >= 90) {
        filterEl.className = 'info-value warning-text';
    }

    // Update filter bar
    const filterBars = document.querySelectorAll('.info-bar');
    if (filterBars.length > 0) {
        const lastBar = filterBars[filterBars.length - 1];
        const barFill = lastBar.querySelector('.bar-fill');
        if (barFill) {
            barFill.style.width = filterUsage + '%';
            if (filterUsage >= 90) {
                barFill.classList.add('warning');
            }
        }
    }
}

function updateCo2AbsorptionData(co2Data) {
    // This function updates CO2 absorption calculation data if needed
    // co2Data contains: mgPerLiter, totalMg, totalGrams, perHour
}

// Event listeners
document.getElementById('closeModal').addEventListener('click', closeStationModal);
document.getElementById('modalOverlay').addEventListener('click', closeStationModal);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeStationModal();
    }
});

// Prevent closing when clicking on modal content
document.getElementById('stationModal').addEventListener('click', (e) => {
    if (e.target.id === 'stationModal') {
        closeStationModal();
    }
});
