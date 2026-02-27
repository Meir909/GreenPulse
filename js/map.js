// Map initialization and management for GreenPulse water purification system

let map;
let markers = [];
let circles = [];

function initMap() {
    // Initialize Leaflet map centered on Moscow
    map = L.map('map').setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);

    // Add OpenStreetMap tiles with dark theme styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 8,
    }).addTo(map);

    // Add coverage circles and markers for each station
    STATIONS.forEach(station => {
        // Add coverage circle
        addCoverageCircle(station);

        // Add station marker
        addStationMarker(station);
    });

    // Handle map click to close modal if needed
    map.on('click', () => {
        // Modal will have its own close handler
    });
}

function addCoverageCircle(station) {
    // Добавить круг радиуса действия станции
    const circle = L.circle(
        [station.lat, station.lng],
        {
            radius: station.radiusKm * 1000, // Convert km to meters
            color: '#10b981',
            weight: 2,
            opacity: 0.3,
            fillColor: '#10b981',
            fillOpacity: 0.05,
            dashArray: '5, 5',
        }
    ).addTo(map);

    circles.push(circle);

    // Add popup to circle
    circle.bindPopup(`
        <div style="text-align: center; color: #0a0e27;">
            <strong>Зона очистки</strong><br>
            Радиус: ${station.radiusKm} км<br>
            Площадь: ${station.areaKm2} км²<br>
            Население: ~${(station.populationCovered/1000).toFixed(0)}K человек
        </div>
    `);
}

function addStationMarker(station) {
    // Determine marker style based on pH status
    let markerClass = 'normal';
    if (station.phCurrent < 6.2) {
        markerClass = 'critical'; // pH too low
    } else if (station.phCurrent < 6.5) {
        markerClass = 'warning'; // pH needs adjustment
    } else {
        markerClass = 'normal'; // pH optimal
    }

    // Создать пользовательский HTML иконку
    const iconHtml = document.createElement('div');
    iconHtml.className = `marker-icon ${markerClass}`;
    iconHtml.innerHTML = '🌍';
    iconHtml.style.cursor = 'pointer';

    const customIcon = L.divIcon({
        html: iconHtml.outerHTML,
        className: '',
        iconSize: [50, 50],
        popupAnchor: [0, -25],
    });

    // Создать маркер
    const marker = L.marker([station.lat, station.lng], {
        icon: customIcon,
        title: station.name,
    }).addTo(map);

    // Добавить popup
    const popupContent = `
        <div style="text-align: center; color: #0a0e27;">
            <strong style="font-size: 14px;">${station.name}</strong><br>
            <small>pH: ${station.phCurrent.toFixed(2)}</small><br>
            <small>CO2: ${station.co2Current.toFixed(1)} мг/л</small><br>
            <small>Статус: ${station.purificationStatus}</small>
        </div>
    `;

    marker.bindPopup(popupContent, {
        minWidth: 200,
    });

    // Click handler - открыть модалку
    marker.on('click', () => {
        openStationModal(station.id);
    });

    markers.push(marker);
}

function closeAllPopups() {
    markers.forEach(marker => {
        marker.closePopup();
    });
    circles.forEach(circle => {
        circle.closePopup();
    });
}

function fitMapToStations() {
    if (markers.length === 0) return;

    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
}

// Обновить маркеры при изменении данных
function updateMarkers() {
    STATIONS.forEach((station, index) => {
        if (markers[index]) {
            // Update marker color based on pH status
            const marker = markers[index];
            let markerClass = 'normal';
            if (station.phCurrent < 6.2) {
                markerClass = 'critical';
            } else if (station.phCurrent < 6.5) {
                markerClass = 'warning';
            } else {
                markerClass = 'normal';
            }

            // Пересоздать маркер с новым стилем
            map.removeLayer(marker);
            addStationMarker(station);
        }
    });
}
