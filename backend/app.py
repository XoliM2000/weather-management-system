from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from config.database import get_db_connection, init_db

load_dotenv()

app = Flask(__name__, 
            template_folder='../frontend/templates',
            static_folder='../frontend/static')
CORS(app)

API_KEY = os.getenv('OPENWEATHER_API_KEY')
BASE_URL = 'https://api.openweathermap.org/data/2.5'

# Initialize database
init_db()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/weather/current/<city>', methods=['GET'])
def get_current_weather(city):
    try:
        url = f"{BASE_URL}/weather?q={city}&appid={API_KEY}&units=metric"
        response = requests.get(url)
        data = response.json()
        
        if response.status_code != 200:
            return jsonify({
                'success': False,
                'message': data.get('message', 'City not found')
            }), 404
        
        weather_data = {
            'city': data['name'],
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'wind_speed': data['wind']['speed'],
            'pressure': data['main']['pressure'],
            'condition': data['weather'][0]['main'],
            'description': data['weather'][0]['description'],
            'icon': data['weather'][0]['icon'],
            'country': data['sys']['country']
        }
        
        save_weather_data(weather_data)
        
        return jsonify({
            'success': True,
            'data': weather_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/weather/forecast/<city>', methods=['GET'])
def get_forecast(city):
    try:
        url = f"{BASE_URL}/forecast?q={city}&appid={API_KEY}&units=metric"
        response = requests.get(url)
        data = response.json()
        
        if response.status_code != 200:
            return jsonify({
                'success': False,
                'message': data.get('message', 'City not found')
            }), 404
        
        forecast_list = []
        for item in data['list'][:40]:
            forecast_list.append({
                'datetime': item['dt_txt'],
                'temperature': item['main']['temp'],
                'humidity': item['main']['humidity'],
                'condition': item['weather'][0]['main'],
                'description': item['weather'][0]['description'],
                'icon': item['weather'][0]['icon']
            })
        
        return jsonify({
            'success': True,
            'city': data['city']['name'],
            'data': forecast_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/weather/history/<city>', methods=['GET'])
def get_history(city):
    try:
        days = request.args.get('days', 7, type=int)
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT * FROM weather 
            WHERE city = %s 
            AND date_time >= DATE_SUB(NOW(), INTERVAL %s DAY)
            ORDER BY date_time DESC
            LIMIT 100
        """
        
        cursor.execute(query, (city, days))
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/weather/cities', methods=['GET'])
def get_cities():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT w1.* FROM weather w1
            INNER JOIN (
                SELECT city, MAX(date_time) as max_date
                FROM weather
                GROUP BY city
            ) w2 ON w1.city = w2.city AND w1.date_time = w2.max_date
            ORDER BY w1.city
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

def save_weather_data(weather_data):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = """
            INSERT INTO weather 
            (city, temperature, humidity, wind_speed, pressure, 
             weather_condition, description, icon)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            weather_data['city'],
            weather_data['temperature'],
            weather_data['humidity'],
            weather_data['wind_speed'],
            weather_data['pressure'],
            weather_data['condition'],
            weather_data['description'],
            weather_data['icon']
        )
        
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"Error saving to database: {e}")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
