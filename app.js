/* ============================================
   EcoReclaim - Global E-Waste Intelligence Platform
   Main Application JavaScript
   ============================================ */

// ==================== GLOBAL STATE ====================
let csvData = [];
let filteredData = [];
let charts = {};
let currentPage = 1;
const rowsPerPage = 15;
let sortColumn = -1;
let sortDirection = 'asc';

// Collections & Handoffs storage
let collections = JSON.parse(localStorage.getItem('ecoreclaim_collections') || '[]');
let handoffs = JSON.parse(localStorage.getItem('ecoreclaim_handoffs') || '[]');
let dealerRequests = JSON.parse(localStorage.getItem('ecoreclaim_dealer_requests') || 'null');

// Default initial dealer requests if empty
if (!dealerRequests || dealerRequests.length === 0) {
    dealerRequests = [
        {
            id: 'REQ-A9B2',
            direction: 'Buy/Acquire',
            typeClass: 'buying',
            org: 'GreenTech Smelters Corp',
            contact: 'Marcus Vance (procurement@greentech.com)',
            targetDealer: 'Global Safe Polymers Co',
            category: 'Sorted Motherboards & PCBs',
            weight: '1,500 kg',
            region: 'North America / Europe',
            price: '$18.50 / kg',
            deadline: '2026-11-15',
            notes: 'High gold/copper grade boards required. Full R2 decontamination manifest required.',
            timestamp: '15 mins ago'
        },
        {
            id: 'REQ-K4E1',
            direction: 'Sell/Dispatch',
            typeClass: 'selling',
            org: 'Apex Urban Recyclers',
            contact: 'Elena Rostova (logistics@apexurban.org)',
            targetDealer: 'RenewLithium Extraction Hub',
            category: 'Lithium-Ion / LiFePO4 Batteries',
            weight: '800 kg',
            region: 'Frankfurt, Germany',
            price: '$6.20 / kg (Bidding Open)',
            deadline: '2026-10-30',
            notes: 'Discharged and insulated packs. Fire-safe barrels included.',
            timestamp: '1 hour ago'
        },
        {
            id: 'REQ-M7P3',
            direction: 'Recycle-Service',
            typeClass: 'service',
            org: 'Horizon Microelectronics Ltd.',
            contact: 'Rajesh K. (compliance@horizonmicro.in)',
            targetDealer: 'EcoCircuit Refurbishers Ltd',
            category: 'Smartphones & Mobile Scrap',
            weight: '2.4 MT',
            region: 'Bengaluru, India',
            price: 'Negotiable / Quote Req.',
            deadline: '2026-12-01',
            notes: 'Looking for verified ISO 14001 certified destruction & gold recovery certificate.',
            timestamp: '3 hours ago'
        }
    ];
    localStorage.setItem('ecoreclaim_dealer_requests', JSON.stringify(dealerRequests));
}

// Country flags
const countryFlags = {
    'USA': '🇺🇸', 'China': '🇨🇳', 'India': '🇮🇳', 'Germany': '🇩🇪',
    'UK': '🇬🇧', 'France': '🇫🇷', 'Japan': '🇯🇵', 'South Korea': '🇰🇷',
    'Brazil': '🇧🇷', 'Canada': '🇨🇦'
};

// Chart colors
const chartColors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1'
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadCSVData();
    initPreloader();
    initNavbar();
    initParticles();
    initThemeToggle();
    initFactsCarousel();
    generateEntryIds();
    initSupplierPortal();
    updateRegistrySidebar();
    calculateImpact();

    // Smart search enter key
    document.getElementById('smartSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSmartSearch();
    });
});

// ==================== PRELOADER ====================
function initPreloader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('preloader').classList.add('hidden');
        }, 1200);
    });
}

// ==================== CSV DATA LOADING ====================
function loadCSVData() {
    fetch('data/Global_Tech_Gadget_Consumption.csv')
        .then(response => response.text())
        .then(text => {
            parseCSV(text);
            populateFilters();
            renderDashboard();
            renderTable();
            animateStats();
        })
        .catch(err => {
            console.error('Error loading CSV:', err);
            // Fallback: use embedded data
            useEmbeddedData();
        });
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');

    csvData = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 9) {
            csvData.push({
                country: values[0].trim(),
                year: parseInt(values[1]),
                smartphoneSales: parseFloat(values[2]),
                laptopShipments: parseFloat(values[3]),
                gamingConsole: parseFloat(values[4]),
                smartwatch: parseFloat(values[5]),
                avgSpending: parseFloat(values[6]),
                eWaste: parseFloat(values[7]),
                fiveG: parseFloat(values[8])
            });
        }
    }
    filteredData = [...csvData];
}

function useEmbeddedData() {
    // Embedded data as fallback
    const rawData = `Country,Year,Smartphone Sales (Millions),Laptop Shipments (Millions),Gaming Console Adoption (%),Smartwatch Penetration (%),Average Consumer Spending on Gadgets ($),E-Waste Generated (Metric Tons),5G Penetration Rate (%)
USA,2015,111.37,123.63,12.05,14.49,311.21,939.89,54.64
USA,2016,224.65,65.27,12.92,9.88,250.46,1361.42,53.61
USA,2017,102.12,26.75,19.63,17.35,2404.22,872.52,29.94
USA,2018,148.1,129.28,26.44,12.45,1883.37,1241.41,75.88
USA,2019,83.93,97.81,20.84,6.18,777.42,1939.39,76.26
USA,2020,300.49,100.59,28.16,17.68,593.73,136.97,58.45
USA,2021,328.38,64.96,26.18,18.71,1804.6,183.51,35.56
USA,2022,239.21,63.46,7.04,14.72,339.59,175.0,65.69
USA,2023,104.51,40.42,9.66,24.81,1602.85,1482.32,57.97
USA,2024,444.57,58.6,7.67,15.42,1107.74,1902.16,55.95
USA,2025,367.74,78.09,35.38,19.68,2611.6,923.74,33.02
China,2015,77.62,87.58,18.77,10.89,2018.37,1187.13,28.59
China,2016,93.38,137.35,21.03,23.74,1655.0,563.9,26.13
China,2017,499.89,99.05,22.01,5.32,1465.64,1037.5,12.43
China,2018,478.75,45.72,35.63,2.04,2653.45,1325.48,58.19
China,2019,254.1,130.87,16.48,19.44,1491.33,1825.14,13.12
China,2020,429.4,141.36,14.01,4.91,1727.35,1886.61,55.44
China,2021,250.08,117.16,19.03,7.44,1920.48,888.49,11.07
China,2022,137.11,28.04,12.11,17.71,2084.91,1455.58,32.98
China,2023,267.07,58.25,36.96,14.99,657.41,414.1,69.57
China,2024,279.7,149.21,8.97,15.41,1979.5,1162.67,27.24
China,2025,276.79,45.2,19.13,11.09,2445.38,281.04,3.67
India,2015,324.15,99.54,23.04,16.56,1016.61,1024.09,58.57
India,2016,432.38,103.99,13.68,15.47,1373.48,1575.08,19.32
India,2017,411.94,89.39,7.05,12.29,649.28,389.65,19.31
India,2018,234.01,114.65,26.77,5.95,369.56,1511.64,41.1
India,2019,177.82,115.12,36.48,7.1,2126.6,938.92,44.67
India,2020,177.61,101.7,28.29,20.73,1369.3,336.19,17.1
India,2021,367.68,103.96,28.35,23.52,2614.95,998.97,73.55
India,2022,102.28,44.12,21.45,8.0,2376.46,1414.84,12.84
India,2023,292.4,76.3,19.89,18.76,1949.03,1962.59,71.74
India,2024,252.77,30.57,33.58,16.57,806.79,496.94,23.76
India,2025,79.66,69.94,25.43,11.21,2783.15,1458.72,27.75
Germany,2015,484.23,107.09,35.51,7.1,780.8,170.48,70.31
Germany,2016,377.2,111.91,27.7,8.82,2707.97,869.76,56.29
Germany,2017,145.26,87.22,15.98,15.53,1006.76,621.83,3.49
Germany,2018,136.62,104.62,28.32,7.77,1122.06,1902.52,67.1
Germany,2019,322.77,65.04,25.8,3.33,1309.68,842.08,46.36
Germany,2020,214.97,79.49,36.14,23.23,1581.44,1348.62,48.75
Germany,2021,385.96,77.26,25.57,20.1,228.65,673.92,11.5
Germany,2022,177.97,26.7,5.49,17.47,2381.88,821.56,65.25
Germany,2023,225.73,98.82,37.82,20.04,2535.51,589.3,53.17
Germany,2024,123.54,32.81,6.47,17.0,1792.64,1317.18,36.14
Germany,2025,216.96,146.61,16.78,9.22,2804.31,744.28,21.97
UK,2015,444.2,102.1,17.26,12.12,483.61,716.4,29.99
UK,2016,453.75,27.25,8.54,18.72,449.1,826.85,51.02
UK,2017,83.3,140.79,12.07,12.47,1185.36,1231.37,59.46
UK,2018,480.5,54.61,14.21,12.78,1050.9,871.4,7.75
UK,2019,463.34,29.73,10.88,21.93,2580.06,385.22,18.99
UK,2020,438.43,107.03,33.65,9.13,517.6,742.94,63.13
UK,2021,370.91,63.17,8.12,23.36,1001.54,1190.87,73.6
UK,2022,112.33,142.4,14.68,23.32,731.68,131.73,35.91
UK,2023,211.25,58.89,11.99,23.76,1918.65,278.39,68.4
UK,2024,258.61,46.53,30.99,11.38,816.45,495.75,22.45
UK,2025,380.98,115.64,36.81,5.65,2763.54,1511.48,47.23
France,2015,274.6,34.69,16.11,19.86,2211.6,269.0,47.31
France,2016,117.55,64.14,12.7,14.61,838.38,1589.3,65.64
France,2017,248.46,20.79,23.46,3.66,1275.42,1450.58,79.34
France,2018,335.8,47.83,23.91,23.57,2269.04,151.03,51.65
France,2019,388.74,71.46,28.46,14.92,2966.44,1833.82,56.83
France,2020,497.64,126.48,9.05,2.74,1574.43,620.9,70.17
France,2021,175.04,133.04,20.98,13.39,1175.56,415.64,37.29
France,2022,170.19,79.17,19.28,18.23,380.56,1113.36,53.06
France,2023,64.0,141.03,22.89,12.47,1863.44,734.12,59.01
France,2024,234.44,140.2,16.26,8.07,755.94,1270.77,47.55
France,2025,248.61,76.79,5.89,10.01,1878.9,958.76,70.19
Japan,2015,321.55,57.47,22.4,21.94,1311.28,788.59,71.85
Japan,2016,230.77,140.33,35.96,15.89,2025.31,234.75,45.11
Japan,2017,462.59,32.63,21.32,10.79,2989.54,898.48,22.91
Japan,2018,434.29,92.69,26.69,5.69,2784.25,1365.17,75.07
Japan,2019,114.85,62.89,13.91,8.99,372.31,1707.08,62.33
Japan,2020,334.36,145.02,39.47,11.8,1009.34,1517.56,8.26
Japan,2021,218.89,60.98,5.5,24.37,487.74,1454.07,2.99
Japan,2022,238.54,72.65,28.46,8.33,458.93,1118.76,58.11
Japan,2023,174.81,67.51,27.0,5.46,1026.01,1111.27,33.94
Japan,2024,104.79,63.99,8.78,10.06,2522.49,819.13,37.28
Japan,2025,373.42,97.39,29.27,22.31,912.69,393.45,54.59
South Korea,2015,241.26,116.14,19.64,21.05,470.41,147.73,21.34
South Korea,2016,111.02,21.29,16.48,6.36,1872.46,111.47,62.47
South Korea,2017,296.16,80.02,29.15,14.79,1843.64,1116.37,34.04
South Korea,2018,156.86,62.5,26.47,16.1,301.39,1576.45,25.62
South Korea,2019,222.51,102.42,13.11,12.07,2149.04,1743.79,79.33
South Korea,2020,450.75,92.5,30.57,13.17,1382.89,454.98,79.25
South Korea,2021,157.06,23.41,10.6,24.49,1372.4,1753.39,41.23
South Korea,2022,444.6,80.76,35.63,2.64,2891.9,142.36,55.94
South Korea,2023,438.16,124.26,36.37,6.95,2390.63,1007.5,19.74
South Korea,2024,474.94,110.49,19.74,21.89,1119.35,750.67,10.16
South Korea,2025,148.42,107.51,13.3,21.52,1989.35,1835.76,39.8
Brazil,2015,487.73,95.83,31.67,11.78,2633.96,1681.23,69.94
Brazil,2016,275.85,103.08,14.34,21.31,1161.32,1635.14,55.96
Brazil,2017,327.88,87.59,6.58,22.57,2113.65,1957.62,11.21
Brazil,2018,329.09,142.58,16.16,5.26,2476.34,1348.88,27.93
Brazil,2019,349.91,43.47,17.36,21.09,603.13,158.64,36.01
Brazil,2020,296.16,56.45,39.22,16.09,220.09,1913.13,56.91
Brazil,2021,397.0,125.19,12.59,22.75,1845.58,1250.45,67.93
Brazil,2022,82.81,118.43,16.92,8.27,2840.47,1022.45,24.53
Brazil,2023,92.85,81.79,19.4,20.42,1244.47,479.54,39.02
Brazil,2024,158.13,74.04,12.23,12.24,2832.17,1229.28,63.94
Brazil,2025,447.89,87.92,32.7,14.55,667.79,1859.55,8.41
Canada,2015,200.11,148.27,13.55,10.93,2741.31,1892.67,32.72
Canada,2016,95.47,30.55,15.33,3.45,225.38,1517.83,17.2
Canada,2017,283.3,42.42,30.26,16.78,1982.4,1489.69,56.93
Canada,2018,153.43,86.03,37.85,24.2,1989.85,1731.98,51.45
Canada,2019,352.69,111.5,37.65,6.98,1800.1,499.86,13.2
Canada,2020,261.03,87.32,19.64,8.98,1153.0,663.87,13.64
Canada,2021,458.94,25.18,36.58,12.61,2765.28,1954.06,32.34
Canada,2022,124.51,132.45,25.12,5.59,2740.43,251.69,73.44
Canada,2023,82.4,90.87,37.58,22.0,1770.03,1368.87,53.54
Canada,2024,382.35,135.66,39.39,23.25,2061.97,1783.59,5.91
Canada,2025,194.84,148.29,17.07,10.25,1156.52,165.18,14.86`;

    parseCSV(rawData);
    populateFilters();
    renderDashboard();
    renderTable();
    animateStats();
}

// ==================== FILTERS ====================
function populateFilters() {
    const countries = [...new Set(csvData.map(d => d.country))];
    const years = [...new Set(csvData.map(d => d.year))].sort();

    // Dashboard country filter
    const dashCountry = document.getElementById('dashCountryFilter');
    const tableCountry = document.getElementById('tableCountryFilter');
    const tableYear = document.getElementById('tableYearFilter');

    countries.forEach(c => {
        dashCountry.innerHTML += `<option value="${c}">${countryFlags[c] || ''} ${c}</option>`;
        tableCountry.innerHTML += `<option value="${c}">${countryFlags[c] || ''} ${c}</option>`;
    });

    years.forEach(y => {
        tableYear.innerHTML += `<option value="${y}">${y}</option>`;
    });
}

// ==================== NAVBAR ====================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button
        const backToTop = document.getElementById('backToTop');
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link based on scroll
        updateActiveNavLink();
    });

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === current) {
            link.classList.add('active');
        }
    });
}

// ==================== PARTICLES ====================
function initParticles() {
    const container = document.getElementById('heroParticles');
    const colors = ['#10b981', '#06b6d4', '#6366f1', '#8b5cf6'];

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'hero-particle';
        const size = Math.random() * 6 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 15 + 10}s;
            animation-delay: ${Math.random() * 10}s;
        `;
        container.appendChild(particle);
    }
}

// ==================== THEME TOGGLE ====================
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('ecoreclaim_theme') || 'dark';

    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('ecoreclaim_theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('ecoreclaim_theme', 'light');
        }
        // Recreate charts with new theme
        renderDashboard();
    });
}

// ==================== ANIMATE STATS ====================
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(el => {
        const target = parseInt(el.getAttribute('data-count'));
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, 30);
    });

    // Summary card values
    const totalEwaste = csvData.reduce((sum, d) => sum + d.eWaste, 0);
    const totalSmartphone = csvData.reduce((sum, d) => sum + d.smartphoneSales, 0);
    const totalLaptop = csvData.reduce((sum, d) => sum + d.laptopShipments, 0);
    const avgSpending = csvData.reduce((sum, d) => sum + d.avgSpending, 0) / csvData.length;

    animateValue('totalEwaste', totalEwaste.toFixed(0));
    animateValue('totalSmartphone', totalSmartphone.toFixed(0));
    animateValue('totalLaptop', totalLaptop.toFixed(0));
    animateValue('avgSpending', '$' + avgSpending.toFixed(0));
}

function animateValue(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = targetValue;
}

// ==================== DASHBOARD CHARTS ====================
function renderDashboard() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const gridColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
    const textColor = isLight ? '#475569' : '#94a3b8';

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    createEwasteChart(gridColor, textColor);
    createPieChart();
    createSmartphoneChart(gridColor, textColor);
    createLaptopChart(gridColor, textColor);
    createFiveGChart(gridColor, textColor);
    createCorrelationChart(gridColor, textColor);
}

function createEwasteChart(gridColor, textColor) {
    const ctx = document.getElementById('ewasteChart');
    if (charts.ewaste) charts.ewaste.destroy();

    const countries = [...new Set(csvData.map(d => d.country))];
    const years = [...new Set(csvData.map(d => d.year))].sort();

    const datasets = countries.map((country, i) => ({
        label: country,
        data: years.map(y => {
            const record = csvData.find(d => d.country === country && d.year === y);
            return record ? record.eWaste : 0;
        }),
        borderColor: chartColors[i],
        backgroundColor: chartColors[i] + '20',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false
    }));

    charts.ewaste = new Chart(ctx, {
        type: 'line',
        data: { labels: years, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } } },
                tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, cornerRadius: 8 }
            },
            scales: {
                x: { grid: { color: gridColor } },
                y: { grid: { color: gridColor }, title: { display: true, text: 'Metric Tons', color: textColor } }
            }
        }
    });
}

function createPieChart() {
    const ctx = document.getElementById('ewastePieChart');
    if (charts.pie) charts.pie.destroy();

    const countries = [...new Set(csvData.map(d => d.country))];
    const data2025 = countries.map(c => {
        const record = csvData.find(d => d.country === c && d.year === 2025);
        return record ? record.eWaste : 0;
    });

    charts.pie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: countries.map(c => `${countryFlags[c] || ''} ${c}`),
            datasets: [{
                data: data2025,
                backgroundColor: chartColors,
                borderWidth: 2,
                borderColor: 'transparent'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '55%',
            plugins: {
                legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 11 } } },
                tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, cornerRadius: 8 }
            }
        }
    });
}

function createSmartphoneChart(gridColor, textColor) {
    const ctx = document.getElementById('smartphoneChart');
    if (charts.smartphone) charts.smartphone.destroy();

    const countries = [...new Set(csvData.map(d => d.country))];
    const latestYear = 2025;
    const data = countries.map(c => {
        const record = csvData.find(d => d.country === c && d.year === latestYear);
        return record ? record.smartphoneSales : 0;
    });

    charts.smartphone = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: countries.map(c => `${countryFlags[c] || ''} ${c}`),
            datasets: [{
                label: `Smartphone Sales ${latestYear} (M)`,
                data: data,
                backgroundColor: chartColors.map(c => c + '80'),
                borderColor: chartColors,
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, cornerRadius: 8 }
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: gridColor }, title: { display: true, text: 'Millions', color: textColor } }
            }
        }
    });
}

function createLaptopChart(gridColor, textColor) {
    const ctx = document.getElementById('laptopChart');
    if (charts.laptop) charts.laptop.destroy();

    const years = [...new Set(csvData.map(d => d.year))].sort();
    const avgByYear = years.map(y => {
        const yearData = csvData.filter(d => d.year === y);
        return yearData.reduce((sum, d) => sum + d.laptopShipments, 0) / yearData.length;
    });

    charts.laptop = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: 'Avg Laptop Shipments (M)',
                data: avgByYear,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, cornerRadius: 8 }
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: gridColor }, title: { display: true, text: 'Millions', color: textColor } }
            }
        }
    });
}

function createFiveGChart(gridColor, textColor) {
    const ctx = document.getElementById('fiveGChart');
    if (charts.fiveG) charts.fiveG.destroy();

    const countries = [...new Set(csvData.map(d => d.country))];
    const data2025 = countries.map(c => {
        const record = csvData.find(d => d.country === c && d.year === 2025);
        return record ? record.fiveG : 0;
    });

    charts.fiveG = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: countries,
            datasets: [{
                data: data2025,
                backgroundColor: chartColors.map(c => c + '60'),
                borderColor: chartColors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true, font: { size: 10 } } },
                tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, cornerRadius: 8 }
            },
            scales: {
                r: { grid: { color: gridColor }, ticks: { display: false } }
            }
        }
    });
}

function createCorrelationChart(gridColor, textColor) {
    const ctx = document.getElementById('correlationChart');
    if (charts.correlation) charts.correlation.destroy();

    const countries = [...new Set(csvData.map(d => d.country))];

    const datasets = countries.map((country, i) => {
        const countryData = csvData.filter(d => d.country === country);
        return {
            label: country,
            data: countryData.map(d => ({ x: d.avgSpending, y: d.eWaste })),
            backgroundColor: chartColors[i] + '80',
            borderColor: chartColors[i],
            pointRadius: 6,
            pointHoverRadius: 10
        };
    });

    charts.correlation = new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, font: { size: 11 } } },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: Spending $${ctx.parsed.x}, E-Waste ${ctx.parsed.y} MT`
                    }
                }
            },
            scales: {
                x: { grid: { color: gridColor }, title: { display: true, text: 'Avg Consumer Spending ($)', color: textColor } },
                y: { grid: { color: gridColor }, title: { display: true, text: 'E-Waste Generated (MT)', color: textColor } }
            }
        }
    });
}

function switchChartType(chartId, type, btn) {
    btn.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (chartId === 'ewasteChart' && charts.ewaste) {
        charts.ewaste.config.type = type;
        charts.ewaste.update();
    }
}

function applyDashboardFilters() {
    renderDashboard();
    showToast('Dashboard filters applied!');
}

// ==================== DATA TABLE ====================
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    pageData.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span style="margin-right:6px">${countryFlags[d.country] || ''}</span>${d.country}</td>
            <td>${d.year}</td>
            <td>${d.smartphoneSales.toFixed(2)}</td>
            <td>${d.laptopShipments.toFixed(2)}</td>
            <td>${d.gamingConsole.toFixed(2)}%</td>
            <td>${d.smartwatch.toFixed(2)}%</td>
            <td>$${d.avgSpending.toFixed(2)}</td>
            <td><strong style="color: var(--accent-red)">${d.eWaste.toFixed(2)}</strong></td>
            <td>${d.fiveG.toFixed(2)}%</td>
        `;
        tbody.appendChild(tr);
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
    document.getElementById('recordCount').textContent = `${filteredData.length} records`;
}

function filterTable() {
    const search = document.getElementById('tableSearch').value.toLowerCase();
    const country = document.getElementById('tableCountryFilter').value;
    const year = document.getElementById('tableYearFilter').value;

    filteredData = csvData.filter(d => {
        const matchSearch = !search || Object.values(d).some(v => String(v).toLowerCase().includes(search));
        const matchCountry = country === 'all' || d.country === country;
        const matchYear = year === 'all' || d.year === parseInt(year);
        return matchSearch && matchCountry && matchYear;
    });

    currentPage = 1;
    renderTable();
}

function sortTable(colIndex) {
    const keys = ['country', 'year', 'smartphoneSales', 'laptopShipments', 'gamingConsole', 'smartwatch', 'avgSpending', 'eWaste', 'fiveG'];
    const key = keys[colIndex];

    if (sortColumn === colIndex) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = colIndex;
        sortDirection = 'asc';
    }

    filteredData.sort((a, b) => {
        let va = a[key], vb = b[key];
        if (typeof va === 'string') {
            return sortDirection === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        return sortDirection === 'asc' ? va - vb : vb - va;
    });

    currentPage = 1;
    renderTable();
}

function changePage(delta) {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    currentPage = Math.max(1, Math.min(totalPages, currentPage + delta));
    renderTable();
}

function exportTableCSV() {
    let csv = 'Country,Year,Smartphone Sales (M),Laptop Shipments (M),Gaming Console (%),Smartwatch (%),Avg Spending ($),E-Waste (MT),5G Rate (%)\n';
    filteredData.forEach(d => {
        csv += `${d.country},${d.year},${d.smartphoneSales},${d.laptopShipments},${d.gamingConsole},${d.smartwatch},${d.avgSpending},${d.eWaste},${d.fiveG}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ewaste_data_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully!');
}

function printTable() {
    window.print();
}

// ==================== SMART SEARCH ====================
function performSmartSearch() {
    const query = document.getElementById('smartSearch').value.trim().toLowerCase();
    if (!query) return;

    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    // Parse query for keywords
    const tokens = query.split(/\s+/);
    let results = [...csvData];

    // Filter by country
    const countryMatch = Object.keys(countryFlags).find(c => tokens.some(t => c.toLowerCase().includes(t)));
    if (countryMatch) {
        results = results.filter(d => d.country === countryMatch);
    }

    // Filter by year
    const yearMatch = tokens.find(t => /^20\d{2}$/.test(t));
    if (yearMatch) {
        results = results.filter(d => d.year === parseInt(yearMatch));
    }

    // Special queries
    const isHighest = tokens.includes('highest') || tokens.includes('top') || tokens.includes('max') || tokens.includes('most');
    const isLowest = tokens.includes('lowest') || tokens.includes('bottom') || tokens.includes('min') || tokens.includes('least');

    let metricKey = 'eWaste';
    let metricLabel = 'E-Waste Generated';
    if (tokens.some(t => ['smartphone', 'phone', 'mobile'].includes(t))) {
        metricKey = 'smartphoneSales';
        metricLabel = 'Smartphone Sales';
    } else if (tokens.some(t => ['laptop', 'computer'].includes(t))) {
        metricKey = 'laptopShipments';
        metricLabel = 'Laptop Shipments';
    } else if (tokens.some(t => ['spending', 'spend', 'money', 'cost'].includes(t))) {
        metricKey = 'avgSpending';
        metricLabel = 'Consumer Spending';
    } else if (tokens.some(t => ['5g', 'fiveg', 'penetration'].includes(t))) {
        metricKey = 'fiveG';
        metricLabel = '5G Penetration';
    } else if (tokens.some(t => ['gaming', 'console', 'game'].includes(t))) {
        metricKey = 'gamingConsole';
        metricLabel = 'Gaming Console Adoption';
    } else if (tokens.some(t => ['smartwatch', 'watch', 'wearable'].includes(t))) {
        metricKey = 'smartwatch';
        metricLabel = 'Smartwatch Penetration';
    }

    if (isHighest) {
        results.sort((a, b) => b[metricKey] - a[metricKey]);
        results = results.slice(0, 5);
    } else if (isLowest) {
        results.sort((a, b) => a[metricKey] - b[metricKey]);
        results = results.slice(0, 5);
    }

    // General text search if no specific filters matched
    if (!countryMatch && !yearMatch && !isHighest && !isLowest) {
        results = csvData.filter(d =>
            Object.values(d).some(v => String(v).toLowerCase().includes(query))
        );
    }

    // Show summary
    const summary = document.createElement('div');
    summary.className = 'search-summary';
    summary.innerHTML = `<i class="fas fa-info-circle"></i> Found <strong>${results.length}</strong> results for "<strong>${query}</strong>"${countryMatch ? ` in ${countryFlags[countryMatch]} ${countryMatch}` : ''}${yearMatch ? ` for year ${yearMatch}` : ''}${isHighest ? ` — Top 5 by ${metricLabel}` : ''}${isLowest ? ` — Bottom 5 by ${metricLabel}` : ''}`;
    resultsContainer.appendChild(summary);

    if (results.length === 0) {
        resultsContainer.innerHTML += `
            <div class="search-empty">
                <i class="fas fa-search-minus fa-3x"></i>
                <h3>No Results Found</h3>
                <p>Try different keywords like country names, years, or metrics (e.g., "smartphone", "e-waste", "5g")</p>
            </div>`;
        return;
    }

    // Render results
    results.forEach((d, i) => {
        const card = document.createElement('div');
        card.className = 'search-result-card';
        card.style.animationDelay = `${i * 0.05}s`;
        card.innerHTML = `
            <div class="result-header">
                <span class="result-flag">${countryFlags[d.country] || '🌍'}</span>
                <span class="result-country">${d.country}</span>
                <span class="result-year">${d.year}</span>
            </div>
            <div class="result-metrics">
                <div class="result-metric">
                    <div class="result-metric-label">📱 Smartphone Sales</div>
                    <div class="result-metric-value">${d.smartphoneSales}M</div>
                </div>
                <div class="result-metric">
                    <div class="result-metric-label">💻 Laptop Shipments</div>
                    <div class="result-metric-value">${d.laptopShipments}M</div>
                </div>
                <div class="result-metric">
                    <div class="result-metric-label">🗑️ E-Waste</div>
                    <div class="result-metric-value highlight">${d.eWaste} MT</div>
                </div>
                <div class="result-metric">
                    <div class="result-metric-label">💰 Avg Spending</div>
                    <div class="result-metric-value">$${d.avgSpending}</div>
                </div>
                <div class="result-metric">
                    <div class="result-metric-label">📡 5G Rate</div>
                    <div class="result-metric-value">${d.fiveG}%</div>
                </div>
                <div class="result-metric">
                    <div class="result-metric-label">🎮 Gaming Console</div>
                    <div class="result-metric-value">${d.gamingConsole}%</div>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

function quickSearch(query) {
    document.getElementById('smartSearch').value = query;
    performSmartSearch();
    scrollToSection('search');
}

// ==================== REGISTRATION ====================
function generateEntryIds() {
    const collId = 'COL-' + Date.now().toString(36).toUpperCase().slice(-6);
    const handId = 'HND-' + Date.now().toString(36).toUpperCase().slice(-6);
    document.getElementById('entryId').value = collId;
    document.getElementById('handoffId').value = handId;

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('collectionDate').value = today;
    document.getElementById('dispatchDate').value = today;

    // Populate linked collection IDs dropdown
    updateLinkedCollections();
}

function updateLinkedCollections() {
    const select = document.getElementById('linkedCollectionId');
    select.innerHTML = '<option value="">Select Collection Entry</option>';
    collections.forEach(c => {
        select.innerHTML += `<option value="${c.entryId}">${c.entryId} - ${c.productCategory} (${c.totalWeight} kg)</option>`;
    });
}

function switchFormTab(tab, btn) {
    document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.reg-form').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tab === 'collection' ? 'collectionForm' : 'processingForm').classList.add('active');
}

function submitCollection(e) {
    e.preventDefault();

    const collection = {
        entryId: document.getElementById('entryId').value,
        date: document.getElementById('collectionDate').value,
        collector: document.getElementById('collectorName').value,
        location: document.getElementById('collectionLocation').value,
        productCategory: document.getElementById('productCategory').value,
        totalWeight: parseFloat(document.getElementById('totalWeight').value),
        quantity: parseInt(document.getElementById('quantity').value),
        condition: document.getElementById('condition').value,
        primaryMaterial: document.getElementById('primaryMaterial').value,
        extractedMaterials: document.getElementById('extractedMaterials').value,
        extractedWeight: parseFloat(document.getElementById('extractedWeight').value) || 0,
        hazardous: document.getElementById('hazardous').value,
        notes: document.getElementById('collectionNotes').value,
        status: 'Collected',
        timestamp: new Date().toISOString()
    };

    collections.push(collection);
    localStorage.setItem('ecoreclaim_collections', JSON.stringify(collections));

    showToast(`✅ Collection ${collection.entryId} registered successfully!`);
    resetCollectionForm();
    updateRegistrySidebar();
    updateTrackingTable();
    updateLinkedCollections();
}

function submitProcessing(e) {
    e.preventDefault();

    const handoff = {
        handoffId: document.getElementById('handoffId').value,
        linkedCollectionId: document.getElementById('linkedCollectionId').value,
        companyName: document.getElementById('companyName').value,
        companyLocation: document.getElementById('companyLocation').value,
        dispatchDate: document.getElementById('dispatchDate').value,
        expectedDelivery: document.getElementById('expectedDelivery').value,
        weight: parseFloat(document.getElementById('handoffWeight').value),
        material: document.getElementById('handoffMaterial').value,
        transport: document.getElementById('transportMethod').value,
        processingType: document.getElementById('processingType').value,
        certification: document.getElementById('certification').value,
        status: document.getElementById('handoffStatus').value,
        notes: document.getElementById('handoffNotes').value,
        timestamp: new Date().toISOString()
    };

    handoffs.push(handoff);
    localStorage.setItem('ecoreclaim_handoffs', JSON.stringify(handoffs));

    showToast(`✅ Handoff ${handoff.handoffId} submitted successfully!`);

    // Reset and regenerate ID
    document.getElementById('processingForm').reset();
    document.getElementById('handoffId').value = 'HND-' + Date.now().toString(36).toUpperCase().slice(-6);

    updateRegistrySidebar();
    updateTrackingTable();
}

function resetCollectionForm() {
    document.getElementById('collectionForm').reset();
    document.getElementById('entryId').value = 'COL-' + Date.now().toString(36).toUpperCase().slice(-6);
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('collectionDate').value = today;
}

function updateRegistrySidebar() {
    // Recent Collections
    const recentCol = document.getElementById('recentCollections');
    if (collections.length === 0) {
        recentCol.innerHTML = '<div class="empty-state-small"><i class="fas fa-inbox"></i><p>No collections yet.</p></div>';
    } else {
        recentCol.innerHTML = collections.slice(-5).reverse().map(c => `
            <div class="recent-item">
                <div class="item-title">${c.entryId} — ${c.productCategory}</div>
                <div class="item-detail">${c.totalWeight} kg | ${c.location} | ${c.date}</div>
            </div>
        `).join('');
    }

    // Recent Handoffs
    const recentHnd = document.getElementById('recentHandoffs');
    if (handoffs.length === 0) {
        recentHnd.innerHTML = '<div class="empty-state-small"><i class="fas fa-truck-loading"></i><p>No handoffs yet.</p></div>';
    } else {
        recentHnd.innerHTML = handoffs.slice(-5).reverse().map(h => `
            <div class="recent-item">
                <div class="item-title">${h.handoffId} → ${h.companyName}</div>
                <div class="item-detail">${h.weight} kg ${h.material} | ${h.status}</div>
            </div>
        `).join('');
    }

    // Stats
    document.getElementById('totalCollections').textContent = collections.length;
    document.getElementById('totalCollWeight').textContent = collections.reduce((sum, c) => sum + c.totalWeight, 0).toFixed(1);
    document.getElementById('totalHandoffs').textContent = handoffs.length;
    document.getElementById('totalRecovered').textContent = collections.reduce((sum, c) => sum + c.extractedWeight, 0).toFixed(1) + ' kg';
}

// ==================== TRACKING TABLE ====================
function updateTrackingTable() {
    const tbody = document.getElementById('trackingBody');
    const allRecords = [
        ...collections.map(c => ({
            id: c.entryId, type: 'Collection', date: c.date,
            category: c.productCategory, weight: c.totalWeight,
            location: c.location, status: c.status, recordType: 'collection'
        })),
        ...handoffs.map(h => ({
            id: h.handoffId, type: 'Handoff', date: h.dispatchDate,
            category: h.material, weight: h.weight,
            location: h.companyName, status: h.status, recordType: 'handoff'
        }))
    ];

    if (allRecords.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8" class="empty-table">
                <i class="fas fa-folder-open fa-2x"></i>
                <p>No records yet. Register e-waste collections to see tracking data.</p>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = allRecords.reverse().map(r => {
        const statusClass = r.status.toLowerCase().replace(/\s+/g, '-');
        return `
            <tr>
                <td><strong>${r.id}</strong></td>
                <td><span class="status-badge ${r.recordType}">${r.type}</span></td>
                <td>${r.date}</td>
                <td>${r.category}</td>
                <td>${r.weight} kg</td>
                <td>${r.location}</td>
                <td><span class="status-badge ${r.recordType}">${r.status}</span></td>
                <td>
                    <button class="action-btn" onclick="viewRecord('${r.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="deleteRecord('${r.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterTracking() {
    const filter = document.getElementById('trackingFilter').value;
    updateTrackingTable();
    // Additional filtering logic can be added here
}

function viewRecord(id) {
    const collection = collections.find(c => c.entryId === id);
    const handoff = handoffs.find(h => h.handoffId === id);

    if (collection) {
        alert(`📋 Collection Details\n\nID: ${collection.entryId}\nDate: ${collection.date}\nCollector: ${collection.collector}\nLocation: ${collection.location}\nCategory: ${collection.productCategory}\nWeight: ${collection.totalWeight} kg\nQuantity: ${collection.quantity} units\nCondition: ${collection.condition}\nMaterial: ${collection.primaryMaterial}\nExtracted: ${collection.extractedMaterials || 'N/A'}\nHazardous: ${collection.hazardous}\nNotes: ${collection.notes || 'N/A'}`);
    } else if (handoff) {
        alert(`🚚 Handoff Details\n\nID: ${handoff.handoffId}\nLinked To: ${handoff.linkedCollectionId}\nCompany: ${handoff.companyName}\nLocation: ${handoff.companyLocation}\nDispatch: ${handoff.dispatchDate}\nDelivery: ${handoff.expectedDelivery || 'TBD'}\nWeight: ${handoff.weight} kg\nMaterial: ${handoff.material}\nTransport: ${handoff.transport}\nProcessing: ${handoff.processingType}\nCertification: ${handoff.certification}\nStatus: ${handoff.status}`);
    }
}

function deleteRecord(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    collections = collections.filter(c => c.entryId !== id);
    handoffs = handoffs.filter(h => h.handoffId !== id);

    localStorage.setItem('ecoreclaim_collections', JSON.stringify(collections));
    localStorage.setItem('ecoreclaim_handoffs', JSON.stringify(handoffs));

    updateRegistrySidebar();
    updateTrackingTable();
    updateLinkedCollections();
    showToast('Record deleted successfully');
}

function exportTrackingData() {
    const allRecords = [...collections, ...handoffs];
    const blob = new Blob([JSON.stringify(allRecords, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ewaste_tracking_data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Tracking data exported!');
}

// ==================== IMPACT CALCULATOR ====================
function calculateImpact() {
    const weight = parseFloat(document.getElementById('impactWeight').value) || 100;
    const category = document.getElementById('impactCategory').value;

    // Impact multipliers per kg (approximate values)
    const multipliers = {
        mixed: { co2: 2.5, water: 15, energy: 4.5, landfill: 0.85, trees: 0.003, toxic: 15 },
        smartphones: { co2: 3.8, water: 22, energy: 7.2, landfill: 0.95, trees: 0.005, toxic: 25 },
        laptops: { co2: 4.2, water: 28, energy: 8.5, landfill: 0.90, trees: 0.006, toxic: 20 },
        batteries: { co2: 5.5, water: 35, energy: 12, landfill: 0.99, trees: 0.008, toxic: 45 },
        circuit_boards: { co2: 8.0, water: 40, energy: 15, landfill: 0.92, trees: 0.01, toxic: 60 }
    };

    const m = multipliers[category] || multipliers.mixed;

    const results = {
        co2: (weight * m.co2).toFixed(1),
        water: (weight * m.water).toFixed(0),
        energy: (weight * m.energy).toFixed(1),
        landfill: (weight * m.landfill).toFixed(1),
        trees: (weight * m.trees).toFixed(1),
        toxic: (weight * m.toxic).toFixed(0)
    };

    // Animate values
    animateImpactValue('co2Saved', results.co2);
    animateImpactValue('waterSaved', results.water);
    animateImpactValue('energySaved', results.energy);
    animateImpactValue('landfillSaved', results.landfill);
    animateImpactValue('treesEquiv', results.trees);
    animateImpactValue('toxicPrevented', results.toxic);
}

function animateImpactValue(id, target) {
    const el = document.getElementById(id);
    const targetNum = parseFloat(target);
    let current = 0;
    const increment = targetNum / 40;
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNum) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = current.toFixed(current < 10 ? 1 : 0);
        }
    }, 30);
}

// ==================== FACTS CAROUSEL ====================
let currentFact = 0;

function initFactsCarousel() {
    const facts = document.querySelectorAll('.fact-card');
    const dotsContainer = document.getElementById('factsDots');

    facts.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `fact-dot ${i === 0 ? 'active' : ''}`;
        dot.onclick = () => goToFact(i);
        dotsContainer.appendChild(dot);
    });

    // Auto-rotate
    setInterval(() => nextFact(), 6000);
}

function nextFact() {
    const facts = document.querySelectorAll('.fact-card');
    currentFact = (currentFact + 1) % facts.length;
    showFact(currentFact);
}

function prevFact() {
    const facts = document.querySelectorAll('.fact-card');
    currentFact = (currentFact - 1 + facts.length) % facts.length;
    showFact(currentFact);
}

function goToFact(index) {
    currentFact = index;
    showFact(index);
}

function showFact(index) {
    document.querySelectorAll('.fact-card').forEach((f, i) => {
        f.classList.toggle('active', i === index);
    });
    document.querySelectorAll('.fact-dot').forEach((d, i) => {
        d.classList.toggle('active', i === index);
    });
}

// ==================== UTILITIES ====================
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== B2B SUPPLIER & DEALER PORTAL ====================
let currentFeedFilter = 'all';

function initSupplierPortal() {
    generateSupplierRequestId();
    renderDealerFeed();
    updateDealerPortalStats();
}

function generateSupplierRequestId() {
    const reqIdInput = document.getElementById('reqId');
    if (reqIdInput) {
        reqIdInput.value = 'REQ-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
    const deadlineInput = document.getElementById('reqDeadline');
    if (deadlineInput && !deadlineInput.value) {
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 21);
        deadlineInput.value = nextMonth.toISOString().split('T')[0];
    }
}

function handleDirectionChange() {
    // Dynamic placeholder or tip based on selection
    const dir = document.getElementById('reqDirection').value;
    const priceInput = document.getElementById('reqPrice');
    if (dir === 'Buy/Acquire') {
        priceInput.placeholder = 'e.g. Target Buy Offer: $12.50/kg';
    } else if (dir === 'Sell/Dispatch') {
        priceInput.placeholder = 'e.g. Asking Price: $5.00/kg or Highest Bid';
    } else {
        priceInput.placeholder = 'e.g. Service Fee Budget or RFQ';
    }
}

function submitSupplierRequest(e) {
    e.preventDefault();

    const direction = document.getElementById('reqDirection').value;
    let typeClass = 'buying';
    if (direction.includes('Sell')) typeClass = 'selling';
    else if (direction.includes('Service')) typeClass = 'service';

    const newRequest = {
        id: document.getElementById('reqId').value,
        direction: direction,
        typeClass: typeClass,
        org: document.getElementById('reqOrg').value,
        contact: document.getElementById('reqContact').value,
        targetDealer: document.getElementById('reqTargetDealer').value,
        category: document.getElementById('reqCategory').value,
        weight: document.getElementById('reqWeight').value,
        region: document.getElementById('reqRegion').value,
        price: document.getElementById('reqPrice').value || 'Open to Bids',
        deadline: document.getElementById('reqDeadline').value,
        notes: document.getElementById('reqNotes').value || 'Standard compliant e-waste handling requested.',
        timestamp: 'Just now'
    };

    dealerRequests.unshift(newRequest);
    localStorage.setItem('ecoreclaim_dealer_requests', JSON.stringify(dealerRequests));

    showToast(`📡 Request ${newRequest.id} broadcasted to dealer network!`);
    resetSupplierForm();
    renderDealerFeed();
    updateDealerPortalStats();
}

function resetSupplierForm() {
    document.getElementById('supplierRequestForm').reset();
    generateSupplierRequestId();
}

function renderDealerFeed() {
    const container = document.getElementById('dealerRequestsList');
    if (!container) return;

    let items = dealerRequests;
    if (currentFeedFilter === 'buying') {
        items = items.filter(i => i.typeClass === 'buying');
    } else if (currentFeedFilter === 'selling') {
        items = items.filter(i => i.typeClass === 'selling');
    }

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small" style="padding: 40px 20px;">
                <i class="fas fa-handshake-slash fa-2x"></i>
                <p>No active requests in this category. Submit your first request!</p>
            </div>`;
        return;
    }

    container.innerHTML = items.map(item => {
        let badgeType = 'buy';
        let badgeText = '🛒 Buy / Procurement';
        if (item.typeClass === 'selling') {
            badgeType = 'sell';
            badgeText = '📦 Material Lot Available';
        } else if (item.typeClass === 'service') {
            badgeType = 'service';
            badgeText = '⚙️ Service / Extraction RFQ';
        }

        return `
            <div class="dealer-item-card ${item.typeClass}">
                <div class="dealer-item-header">
                    <span class="dealer-type-badge ${badgeType}">${badgeText}</span>
                    <span class="dealer-item-time"><i class="fas fa-clock"></i> ${item.timestamp}</span>
                </div>
                <div class="dealer-item-title">${item.category}</div>
                <div class="dealer-item-org"><i class="fas fa-building"></i> <strong>${item.org}</strong> &bull; ${item.region}</div>
                
                <div class="dealer-item-meta">
                    <div class="dealer-meta-row"><i class="fas fa-weight-hanging"></i> Volume: <strong>${item.weight}</strong></div>
                    <div class="dealer-meta-row"><i class="fas fa-network-wired"></i> To: <strong>${item.targetDealer.split('(')[0]}</strong></div>
                    <div class="dealer-meta-row"><i class="fas fa-calendar-check"></i> Deadline: <strong>${item.deadline}</strong></div>
                    <div class="dealer-meta-row"><i class="fas fa-certificate"></i> Standards: <strong>R2 / ISO Verified</strong></div>
                </div>

                <div class="dealer-item-footer">
                    <div class="dealer-bid-price">${item.price}</div>
                    <button class="quote-reply-btn" onclick="respondToDealerRequest('${item.id}', '${item.org}')">
                        <i class="fas fa-reply"></i> Submit Bid / Offer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterDealerFeed(filter, btn) {
    currentFeedFilter = filter;
    document.querySelectorAll('.feed-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderDealerFeed();
}

function respondToDealerRequest(reqId, orgName) {
    const quote = prompt(`Enter your counter-bid or proposal for ${reqId} (${orgName}):\n(e.g., "$17.00/kg including logistics and certification")`);
    if (quote && quote.trim()) {
        showToast(`✅ Counter-bid submitted for ${reqId}! Dealer notified.`);
    }
}

function updateDealerPortalStats() {
    const openReqs = document.getElementById('openRequestsCount');
    if (openReqs) {
        openReqs.textContent = dealerRequests.length;
    }
}

