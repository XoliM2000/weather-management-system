# 🌤️ Weather Management System

A comprehensive weather management system providing real-time weather data, forecasts, and historical tracking.

## 🚀 Features
- Real-time weather data for any city
- 5-day weather forecast
- Historical weather tracking
- MySQL database integration
- RESTful API design
- Responsive web interface

## 🛠️ Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python Flask
- **Database**: MySQL
- **API**: OpenWeatherMap API

## 📋 Prerequisites
- Python 3.8+
- MySQL 8.0+
- OpenWeatherMap API key

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/weather-management-system.git
cd weather-management-system
```

### 2. Set up virtual environment
```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure environment
Create `.env` file in backend directory:
```env
OPENWEATHER_API_KEY=your_api_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=weather_db
```

### 5. Set up database
```bash
mysql -u root -p
CREATE DATABASE weather_db;
EXIT;
```

### 6. Run the application
```bash
python app.py
```

Visit: `http://localhost:5000`

## 📁 Project Structure
```
weather-management-system/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env
│   ├── config/
│   │   └── database.py
│   └── routes/
├── frontend/
│   ├── templates/
│   │   └── index.html
│   └── static/
│       ├── css/
│       └── js/
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather/current/<city>` | Current weather |
| GET | `/api/weather/forecast/<city>` | 5-day forecast |
| GET | `/api/weather/history/<city>` | Historical data |
| GET | `/api/weather/cities` | Saved cities |

## 💡 Use Cases
- Agriculture planning
- Disaster management
- Travel planning
- Smart cities
- Aviation

## 👤 Author
Your Name - [@XoliM2000](https://github.com/Xolisile-Zwane)

## 📝 License
MIT License

---
⭐ Star this repo if you find it helpful!
