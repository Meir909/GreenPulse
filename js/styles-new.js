// GreenPulse - Modern Website JavaScript

// Configuration
const EXPERIMENT_START = new Date('2024-01-15'); // Дата начала эксперимента
const CO2_PER_BENCH_PER_DAY = 0.104; // граммы CO2 в день на одну скамейку
const WATER_PER_BENCH_PER_DAY = 8; // литры воды в день

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initLiveDashboard();
    initCalculator();
    initContactForm();
    initMap();
    updateExperimentTimer();

    // Update timer every second
    setInterval(updateExperimentTimer, 1000);

    // Update live dashboard every 5 seconds
    setInterval(updateLiveDashboardData, 5000);
});

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function showSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('active'));

    // Show selected section
    const selectedSection = document.getElementById(section);
    if (selectedSection) {
        selectedSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function scrollToSection(section) {
    const link = document.querySelector(`[data-section="${section}"]`);
    if (link) {
        link.click();
    }
}

// Experiment Timer
function updateExperimentTimer() {
    const now = new Date();
    const diff = now - EXPERIMENT_START;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const daysEl = document.getElementById('experimentDays');
    if (daysEl) {
        daysEl.textContent = days;
    }

    // Calculate total CO2 cleaned (simulated)
    const totalCO2 = (days * 24 * CO2_PER_BENCH_PER_DAY * 10).toFixed(1); // 10 скамеек
    const co2TotalEl = document.getElementById('co2Total');
    if (co2TotalEl) {
        co2TotalEl.textContent = totalCO2;
    }
}

// Live Dashboard
function initLiveDashboard() {
    updateLiveDashboardData();
}

function updateLiveDashboardData() {
    // Simulate live data with some randomness
    const baseTemp = 22;
    const basePh = 6.5;
    const baseCo2 = 7.5;
    const baseEff = 92;

    // Add slight variations
    const temp = (baseTemp + (Math.random() - 0.5) * 2).toFixed(1);
    const ph = (basePh + (Math.random() - 0.5) * 0.3).toFixed(2);
    const co2 = (baseCo2 + (Math.random() - 0.5) * 1.5).toFixed(1);
    const eff = Math.round(baseEff + (Math.random() - 0.5) * 5);

    // Update values
    document.getElementById('tempValue').textContent = temp;
    document.getElementById('phValue').textContent = ph;
    document.getElementById('co2Value').textContent = co2;
    document.getElementById('effValue').textContent = eff;

    // Update bars
    updateMetricBar('tempBar', (temp / 30) * 100);
    updateMetricBar('phBar', ((ph - 6.0) / (7.5 - 6.0)) * 100);
    updateMetricBar('co2Bar', (co2 / 15) * 100);
    updateMetricBar('effBar', eff);

    // Update cleaned today
    const cleanedToday = (Math.random() * 3).toFixed(2);
    document.getElementById('cleanedTodayValue').textContent = cleanedToday;

    // Update last update time
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('ru-RU');

    // Update chart
    updateRealtimeChart();
}

function updateMetricBar(elementId, percent) {
    const bar = document.getElementById(elementId);
    if (bar) {
        bar.style.width = Math.min(100, percent) + '%';
    }
}

function updateRealtimeChart() {
    // This would be updated with actual chart data
    // For now, it's a placeholder
}

// CO2 Calculator
function initCalculator() {
    document.getElementById('benchCount').addEventListener('input', calculateCO2);
    document.getElementById('workingDays').addEventListener('input', calculateCO2);
    document.getElementById('hoursPerDay').addEventListener('input', calculateCO2);
    document.getElementById('citySelect').addEventListener('change', calculateCO2);
}

function calculateCO2() {
    const benchCount = parseInt(document.getElementById('benchCount').value) || 10;
    const workingDays = parseInt(document.getElementById('workingDays').value) || 365;
    const hoursPerDay = parseInt(document.getElementById('hoursPerDay').value) || 8;
    const city = document.getElementById('citySelect').value;

    // Update sliders display
    document.getElementById('benchCountDisplay').textContent = benchCount + ' скамеек';
    document.getElementById('workingDaysDisplay').textContent = workingDays + ' дней';
    document.getElementById('hoursPerDayDisplay').textContent = hoursPerDay + ' часов';

    // Base calculation
    const co2PerBenchPerHour = CO2_PER_BENCH_PER_DAY / 24; // граммы в час
    const waterPerBench = WATER_PER_BENCH_PER_DAY; // литры в день

    // Calculate yearly results
    const hoursPerYear = workingDays * hoursPerDay;
    const co2YearlyGrams = co2PerBenchPerHour * hoursPerYear * benchCount;
    const co2YearlyKg = (co2YearlyGrams / 1000).toFixed(1);
    const waterYearly = waterPerBench * workingDays * benchCount;

    // Calculate tree equivalent (1 tree = ~25 kg CO2 per year)
    const treeEquivalent = Math.round((co2YearlyGrams / 1000) / 25);

    // Calculate car equivalent (1 car = ~4.6 tons CO2 per year = 4600 kg)
    const carEquivalent = ((co2YearlyGrams / 1000) / 4600).toFixed(1);

    // Update results
    document.getElementById('yearlyResult').textContent = co2YearlyKg + ' кг';
    document.getElementById('yearlyResultInfo').textContent = 'Эквивалент: ' + carEquivalent + ' автомобилей в год';
    document.getElementById('waterResult').textContent = (waterYearly / 1000).toFixed(0) + ' тысяч л';
    document.getElementById('treeEquivalent').textContent = treeEquivalent;

    // Update visualization
    const productivity = Math.min(100, (benchCount / 100) * 100);
    document.getElementById('visFill').style.width = productivity + '%';
    document.getElementById('visText').textContent = 'Производительность: ' + Math.round(productivity) + '%';
}

// Map (using Leaflet)
function initMap() {
    const mapContainer = document.getElementById('kazakhstanMap');
    if (!mapContainer) return;

    // Initialize Leaflet map
    const map = L.map('kazakhstanMap').setView([48.0196, 66.9237], 5);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);

    // Cities data
    const cities = [
        { name: 'Алматы', lat: 43.2380, lng: 76.9450, population: 1700000, pollution: 'high' },
        { name: 'Астана', lat: 51.1694, lng: 71.4491, population: 1400000, pollution: 'medium' },
        { name: 'Карганда', lat: 49.8047, lng: 72.1350, population: 600000, pollution: 'high' },
        { name: 'Кокшетау', lat: 53.2853, lng: 69.3847, population: 130000, pollution: 'low' },
        { name: 'Актобе', lat: 50.2839, lng: 57.2061, population: 450000, pollution: 'medium' },
    ];

    // Add markers for each city
    cities.forEach(city => {
        const color = city.pollution === 'high' ? '#ef4444' : city.pollution === 'medium' ? '#f59e0b' : '#10b981';
        const icon = L.divIcon({
            html: `<div style="background: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">📍</div>`,
            iconSize: [30, 30],
            className: 'custom-marker'
        });

        const marker = L.marker([city.lat, city.lng], { icon: icon }).addTo(map);
        marker.bindPopup(`
            <div style="color: #000; font-weight: bold;">
                <h3>${city.name}</h3>
                <p>Население: ~${(city.population / 1000000).toFixed(1)}M</p>
                <p>Загрязнение: ${city.pollution === 'high' ? '⚠️ Высокое' : city.pollution === 'medium' ? '⚡ Среднее' : '✅ Низкое'}</p>
            </div>
        `);
    });
}

// Contact Form
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const message = form.querySelector('textarea').value;

        // Prepare mailto link
        const subject = `Новое сообщение от ${name}`;
        const body = `Сообщение:\n${message}\n\nОтправитель: ${name}\nEmail: ${email}`;

        // Open email client
        window.location.href = `mailto:nurmiko22@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Reset form
        form.reset();

        // Show message
        alert('Спасибо! Ваше письмо готово к отправке.');
    });
}

// City card click handlers
document.addEventListener('DOMContentLoaded', () => {
    const cityCards = document.querySelectorAll('.city-card');
    cityCards.forEach(card => {
        card.addEventListener('click', () => {
            const city = card.dataset.city;
            console.log('Selected city:', city);
            // This can be extended to update calculator based on city
        });
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') {
            e.preventDefault();
        }
    });
});

// Add scroll animations
window.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.card, .dashboard-card, .benefit-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
});

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', () => {
    calculateCO2();
});
