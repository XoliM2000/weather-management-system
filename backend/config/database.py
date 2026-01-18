import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'weather_db')
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

def init_db():
    try:
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
        cursor.close()
        connection.close()
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        create_table_query = """
        CREATE TABLE IF NOT EXISTS weather (
            id INT AUTO_INCREMENT PRIMARY KEY,
            city VARCHAR(100) NOT NULL,
            temperature DECIMAL(5,2),
            humidity INT,
            wind_speed DECIMAL(5,2),
            pressure INT,
            weather_condition VARCHAR(100),
            description VARCHAR(255),
            icon VARCHAR(10),
            date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_city_datetime (city, date_time DESC)
        )
        """
        
        cursor.execute(create_table_query)
        connection.commit()
        cursor.close()
        connection.close()
        
        print("✓ Database initialized successfully")
        
    except mysql.connector.Error as err:
        print(f"✗ Database error: {err}")
