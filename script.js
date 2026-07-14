// =======================================================
// SKYCAST ENGINE - FIX API DATA RENDERING SAFELY
// =======================================================

const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const AQI_API = "https://air-quality-api.open-meteo.com/v1/air-quality";

let currentChartInstance = null;
let activeCoords = { lat: -6.2146, lon: 106.8451, name: "Jakarta", country: "Indonesia" }; 
let favorites = JSON.parse(localStorage.getItem('skycast_favs')) || [];
let searchHistory = JSON.parse(localStorage.getItem('skycast_history')) || [];

document.addEventListener("DOMContentLoaded", () => {
    executeWeatherDataFetch();
    renderFavorites();
    renderHistory();
    setupCoreListeners();
});

function setupCoreListeners() {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const targetTheme = currentTheme === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", targetTheme);
        themeToggleBtn.innerHTML = targetTheme === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        
        if(currentChartInstance) {
            executeWeatherDataFetch();
        }
    });

    let debounceTimer;
    document.getElementById("citySearchInput").addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        if (query.length < 3) {
            document.getElementById("autocompleteList").classList.add("d-none");
            return;
        }
        debounceTimer = setTimeout(() => fetchAutocomplete(query), 300);
    });

    document.getElementById("searchBtn").addEventListener("click", executeSearchTrigger);
    document.getElementById("citySearchInput").addEventListener("keypress", (e) => {
        if(e.key === "Enter") executeSearchTrigger();
    });

    document.getElementById("geoLocBtn").addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    activeCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude, name: "Lokasi Anda", country: "GPS" };
                    executeWeatherDataFetch();
                },
                () => showError("Akses GPS ditolak perangkat.")
            );
        } else {
            showError("Browser tidak mendukung geolokasi.");
        }
    });

    document.getElementById("addFavBtn").addEventListener("click", () => {
        const found = favorites.find(f => f.name === activeCoords.name);
        if(found) {
            favorites = favorites.filter(f => f.name !== activeCoords.name);
        } else {
            favorites.push({...activeCoords});
        }
        localStorage.setItem('skycast_favs', JSON.stringify(favorites));
        updateFavoriteBtnState();
        renderFavorites();
    });

    document.addEventListener("click", (e) => {
        if(e.target.id !== "citySearchInput") {
            document.getElementById("autocompleteList").classList.add("d-none");
        }
    });
}

function showError(message) {
    const alertEl = document.getElementById("globalAlert");
    document.getElementById("alertMessage").textContent = message;
    alertEl.classList.remove("d-none");
    setTimeout(closeAlert, 5000);
}

function closeAlert() {
    document.getElementById("globalAlert").classList.add("d-none");
}

function toggleSkeleton(loading) {
    const targets = ["displayTemp", "displayWeatherDesc", "displayApparentTemp", "displayHumidity", "displayWind", "displayUV", "displayAQI"];
    targets.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            if (loading) el.classList.add("skeleton");
            else el.classList.remove("skeleton");
        }
    });
}

async function fetchAutocomplete(query) {
    try {
        const res = await fetch(`${GEO_API}?name=${encodeURIComponent(query)}&count=5&format=json`);
        const data = await res.json();
        const list = document.getElementById("autocompleteList");
        list.innerHTML = "";
        
        if(data.results && data.results.length > 0) {
            data.results.forEach(item => {
                const div = document.createElement("div");
                div.className = "search-item";
                div.textContent = `${item.name}, ${item.admin1 || ''} (${item.country || ''})`;
                div.addEventListener("click", () => {
                    activeCoords = { lat: item.latitude, lon: item.longitude, name: item.name, country: item.country };
                    document.getElementById("citySearchInput").value = item.name;
                    list.classList.add("d-none");
                    executeWeatherDataFetch();
                    saveToHistory(item.name);
                });
                list.appendChild(div);
            });
            list.classList.remove("d-none");
        }
    } catch (err) {
        console.error("Autocomplete Gagal");
    }
}

function executeSearchTrigger() {
    const val = document.getElementById("citySearchInput").value.trim();
    if(val) {
        fetchAutocomplete(val).then(() => {
            const list = document.getElementById("autocompleteList");
            if(list.firstChild) list.firstChild.click();
            else showError("Kota tidak ditemukan!");
        });
    }
}

async function executeWeatherDataFetch() {
    toggleSkeleton(true);
    try {
        // PERBAIKAN: Menyusun ulang query parameter agar valid sesuai dokumentasi Open-Meteo
        const url = `${WEATHER_API}?latitude=${activeCoords.lat}&longitude=${activeCoords.lon}` + 
                    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
                    `&hourly=temperature_2m` +
                    `&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max` + // Memindahkan uv_index_max ke belakang
                    `&forecast_days=7` + // Menegaskan durasi ramalan cuaca
                    `&timezone=auto`;

        const wRes = await fetch(url);
        if(!wRes.ok) throw new Error("Gagal mengambil data dari server cuaca.");
        const wData = await wRes.json();

        const aRes = await fetch(`${AQI_API}?latitude=${activeCoords.lat}&longitude=${activeCoords.lon}&current=european_aqi`);
        let aqiVal = "--";
        if(aRes.ok) {
            const aData = await aRes.json();
            aqiVal = aData.current.european_aqi || "--";
        }

        renderCoreData(wData, aqiVal);
        updateFavoriteBtnState();
    } catch (error) {
        showError(error.message);
        console.error("Detail Error:", error);
    } finally {
        toggleSkeleton(false);
    }
}

function renderCoreData(data, aqi) {
    document.getElementById("displayCityName").textContent = `${activeCoords.name}, ${activeCoords.country || ''}`;
    document.getElementById("displayTemp").textContent = `${Math.round(data.current.temperature_2m)}°C`;
    document.getElementById("displayApparentTemp").textContent = `Terasa seperti: ${Math.round(data.current.apparent_temperature)}°C`;
    document.getElementById("displayHumidity").textContent = `${data.current.relative_humidity_2m} %`;
    document.getElementById("displayWind").textContent = `${data.current.wind_speed_10m} km/jam`;
    
    const todayUV = data.daily && data.daily.uv_index_max ? data.daily.uv_index_max[0] : "--";
    document.getElementById("displayUV").textContent = todayUV;
    
    document.getElementById("displayAQI").textContent = aqi;
    document.getElementById("displayWeatherDesc").textContent = translateCode(data.current.weather_code);

    try {
        const options = { hour: '2-digit', minute: '2-digit', timeZone: data.timezone };
        document.getElementById("displayLocalTime").textContent = `Jam Setempat: ${new Date().toLocaleTimeString('id-ID', options)}`;
    } catch(e) {
        document.getElementById("displayLocalTime").textContent = `Jam Setempat: --:--`;
    }

    const dailyContainer = document.getElementById("dailyForecastContainer");
    dailyContainer.innerHTML = "";
    const daysNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    
    if (data.daily && data.daily.time) {
        for(let i=0; i<7; i++) {
            if (!data.daily.time[i]) break;
            const dateObj = new Date(data.daily.time[i]);
            dailyContainer.innerHTML += `
                <div class="forecast-item animate__animated animate__zoomIn">
                    <small class="d-block fw-bold text-primary">${daysNames[dateObj.getDay()]}</small>
                    <small class="d-block text-muted mb-2">${dateObj.getDate()}/${dateObj.getMonth()+1}</small>
                    <i class="fa-solid fa-cloud-sun text-warning my-2 d-block fs-5"></i>
                    <span class="fw-bold d-block">${Math.round(data.daily.temperature_2m_max[i])}°</span>
                    <span class="text-muted small">${Math.round(data.daily.temperature_2m_min[i])}°</span>
                </div>
            `;
        }
    }

    const canvas = document.getElementById('hourlyWeatherChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if (currentChartInstance) currentChartInstance.destroy();
    
    const hoursLabel = Array.from({length: 24}, (_, i) => `${i}:00`);
    const tempsData = data.hourly && data.hourly.temperature_2m ? data.hourly.temperature_2m.slice(0, 24) : [];

    const isDark = document.body.getAttribute("data-theme") === "dark";
    const gridColor = isDark ? '#223147' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    currentChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hoursLabel,
            datasets: [{
                label: 'Suhu (°C)',
                data: tempsData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 1
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                x: { grid: { color: gridColor }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            } 
        }
    });
}

function translateCode(code) {
    if (code === 0) return "Cerah";
    if ([1, 2, 3].includes(code)) return "Berawan Sebagian";
    if ([45, 48].includes(code)) return "Berkabut";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Hujan";
    return "Badai Petir";
}

function updateFavoriteBtnState() {
    const addFavBtn = document.getElementById("addFavBtn");
    if (!addFavBtn) return;
    
    const found = favorites.find(f => f.name === activeCoords.name);
    if(found) {
        addFavBtn.innerHTML = '<i class="fa-solid fa-star me-1"></i>Kota Favorit';
        addFavBtn.style.backgroundColor = '#fef08a';
        addFavBtn.style.color = '#a16207';
    } else {
        addFavBtn.innerHTML = '<i class="fa-regular fa-star me-1"></i>Favoritkan';
        addFavBtn.style.backgroundColor = '';
        addFavBtn.style.color = '';
    }
}

function renderFavorites() {
    const container = document.getElementById("favoriteCitiesContainer");
    if (!container) return;
    container.innerHTML = "";
    if(favorites.length === 0) {
        container.innerHTML = '<p class="text-muted mb-0">Belum ada kota favorit yang disimpan.</p>';
        return;
    }
    favorites.forEach(fav => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary btn-sm fav-badge";
        btn.innerHTML = `<i class="fa-solid fa-star text-warning me-1"></i> ${fav.name}`;
        btn.addEventListener("click", () => {
            activeCoords = fav;
            executeWeatherDataFetch();
        });
        container.appendChild(btn);
    });
}

function saveToHistory(name) {
    if(!searchHistory.includes(name)) {
        searchHistory.unshift(name);
        if(searchHistory.length > 4) searchHistory.pop();
        localStorage.setItem('skycast_history', JSON.stringify(searchHistory));
        renderHistory();
    }
}

function renderHistory() {
    const container = document.getElementById("historyBadges");
    if(!container) return;
    container.innerHTML = "";
    searchHistory.forEach(h => {
        const span = document.createElement("span");
        span.className = "badge bg-secondary-subtle text-secondary-emphasis mx-1 history-badge border";
        span.textContent = h;
        span.addEventListener("click", () => {
            document.getElementById("citySearchInput").value = h;
            fetchAutocomplete(h).then(() => {
                const list = document.getElementById("autocompleteList");
                if(list.firstChild) list.firstChild.click();
            });
        });
        container.appendChild(span);
    });
}