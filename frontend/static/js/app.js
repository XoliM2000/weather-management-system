const API_BASE = 'http://localhost:5000/api';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const currentWeather = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecastSection');
const historySection = document.getElementById('historySection');
const loadCitiesBtn = document.getElementById('loadCitiesBtn');
const savedCitiesContainer = document.getElementById('savedCitiesContainer');

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});
loadCitiesBtn.addEventListener('click', loadSavedCities);

// Search Weather
async function searchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    hideError();
    showLoading();
    hideAllSections();
    
    try {
        // Get current weather
        await getCurrentWeather(city);
        
        // Get forecast
        await getForecast(city);
        
        // Get history
        await getHistory(city);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Get Current Weather
async function getCurrentWeather(city) {
    const response = await fetch(`${API_BASE}/weather/current/${city}`);
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.message);
    }
    
    const data = result.data;
    
    // Update UI
    document.getElementById('cityName').textContent = `${data.city}, ${data.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.temperature)}°C`;
    document.getElementById('condition').textContent = data.description;
    document.getElementById('humidity').textContent = `${data.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind_speed} m/s`;
    document.getElementById('pressure').textContent = `${data.pressure} hPa`;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.icon}@4x.png`;
    
    currentWeather.classList.remove('hidden');
}

// Get Forecast
async function getForecast(city) {
    const response = await fetch(`${API_BASE}/weather/forecast/${city}`);
    const result = await response.json();
    
    if (!result.success) {
        return; // Don't throw error, just skip forecast
    }
    
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';
    
    // Show one forecast per day (take midday forecasts)
    const dailyForecasts = result.data.filter((item, index) => index % 8 === 4).slice(0, 5);
    
    dailyForecasts.forEach(item => {
        const date = new Date(item.datetime);
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <img src="https://openweathermap.org/img/wn/${item.icon}@2x.png" alt="${item.description}">
            <div class="forecast-temp">${Math.round(item.temperature)}°C</div>
            <div style="font-size: 0.85em; color: #666; text-transform: capitalize;">${item.description}</div>
        `;
        forecastContainer.appendChild(forecastItem);
    });
    
    forecastSection.classList.remove('hidden');
}

// Get History
async function getHistory(city) {
    const response = await fetch(`${API_BASE}/weather/history/${city}?days=7`);
    const result = await response.json();
    
    if (!result.success || result.count === 0) {
        return; // No history available
    }
    
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = '';
    
    const table = document.createElement('table');
    table.className = 'history-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date & Time</th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>Wind Speed</th>
                <th>Condition</th>
            </tr>
        </thead>
        <tbody id="historyTableBody"></tbody>
    `;
    
    historyContainer.appendChild(table);
    const tbody = document.getElementById('historyTableBody');
    
    result.data.forEach(item => {
        const row = document.createElement('tr');
        const date = new Date(item.date_time);
        row.innerHTML = `
            <td>${date.toLocaleString()}</td>
            <td>${item.temperature}°C</td>
            <td>${item.humidity}%</td>
            <td>${item.wind_speed} m/s</td>
            <td style="text-transform: capitalize;">${item.description}</td>
        `;
        tbody.appendChild(row);
    });
    
    historySection.classList.remove('hidden');
}

// Load Saved Cities
async function loadSavedCities() {
    try {
        const response = await fetch(`${API_BASE}/weather/cities`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message);
        }
        
        savedCitiesContainer.innerHTML = '';
        
        if (result.data.length === 0) {
            savedCitiesContainer.innerHTML = '<p style="color: #666;">No cities saved yet. Search for a city to begin!</p>';
            return;
        }
        
        result.data.forEach(item => {
            const cityCard = document.createElement('div');
            cityCard.className = 'city-card';
            cityCard.innerHTML = `
                <h4>${item.city}</h4>
                <p>${Math.round(item.temperature)}°C</p>
                <p style="text-transform: capitalize;">${item.weather_condition}</p>
                <p style="font-size: 0.8em; color: #999;">${new Date(item.date_time).toLocaleDateString()}</p>
            `;
            
            cityCard.addEventListener('click', () => {
                cityInput.value = item.city;
                searchWeather();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            savedCitiesContainer.appendChild(cityCard);
        });
        
    } catch (error) {
        showError('Failed to load saved cities');
    }
}

// Utility Functions
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => hideError(), 5000);
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function hideAllSections() {
    currentWeather.classList.add('hidden');
    forecastSection.classList.add('hidden');
    historySection.classList.add('hidden');
}

// Load default city on page load
window.addEventListener('DOMContentLoaded', () => {
    cityInput.value = 'Johannesburg';
    loadSavedCities();
});