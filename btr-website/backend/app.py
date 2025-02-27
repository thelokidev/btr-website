from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import suncalc
import pytz
import json
from math import floor
import numpy as np

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

# Load dummy rectification table (replace with actual data if available)
with open('rectification_table.json', 'r') as f:
    RECTIFICATION_TABLE = json.load(f)

# Tatwa durations
DIRECT_TATWAS = [
    ('Prithvi', 6), ('Jala', 12), ('Tejo', 18), ('Vayu', 24), ('Akash', 30)
]
REVERSE_TATWAS = [
    ('Akash', 30), ('Vayu', 24), ('Tejo', 18), ('Jala', 12), ('Prithvi', 6)
]
TATWA_DURATIONS = {'Prithvi': 6, 'Jala': 12, 'Tejo': 18, 'Vayu': 24, 'Akash': 30}

def calculate_sunrise(birth_datetime, location):
    # For simplicity, assume location provides lat/lon (hardcoded for Chennai here)
    lat, lon = 13.0827, 80.2707  # Chennai coordinates
    sunrise = suncalc.get_times(birth_datetime, lat, lon)['sunrise']
    # Convert numpy.datetime64 to Python datetime before timezone conversion
    if sunrise is None:
        # If sunrise calculation fails, return the birth_datetime at 6 AM as a fallback
        default_sunrise = birth_datetime.replace(hour=6, minute=0, second=0, microsecond=0)
        return default_sunrise.astimezone(pytz.timezone('Asia/Kolkata'))
    
    if isinstance(sunrise, (np.datetime64, np.ndarray)):
        sunrise = sunrise.astype('datetime64[us]').item()
    return sunrise.astimezone(pytz.timezone('Asia/Kolkata'))

def adjust_birth_time(birth_datetime, sunrise):
    ref_sunrise = birth_datetime.replace(hour=6, minute=0, second=0, microsecond=0)
    sunrise_time = sunrise.time()
    sunrise_datetime = birth_datetime.replace(
        hour=sunrise_time.hour, minute=sunrise_time.minute, second=sunrise_time.second, microsecond=0
    )

    if birth_datetime.time() < sunrise_time and birth_datetime.time() >= datetime.time(4, 32):
        # Early morning births (4:32 AM – 6:03 AM)
        adjusted = birth_datetime + datetime.timedelta(hours=12) - datetime.timedelta(hours=9)
        sunrise_diff = (ref_sunrise - sunrise_datetime).total_seconds() / 60
        adjusted += datetime.timedelta(minutes=sunrise_diff)
    elif sunrise_time < datetime.time(6, 0):
        # Sunrise before 6 AM
        diff = (ref_sunrise - sunrise_datetime).total_seconds() / 60
        adjusted = birth_datetime + datetime.timedelta(minutes=diff)
    else:
        # Sunrise after 6 AM
        diff = (sunrise_datetime - ref_sunrise).total_seconds() / 60
        adjusted = birth_datetime - datetime.timedelta(minutes=diff)
    return adjusted

def calculate_tatwa_cycle(adjusted_time):
    ref_sunrise = adjusted_time.replace(hour=6, minute=0, second=0, microsecond=0)
    total_minutes = (adjusted_time - ref_sunrise).total_seconds() / 60
    cycle_number = floor(total_minutes / 180)
    cycle_type = 'Direct' if cycle_number % 2 else 'Reverse'
    
    minutes_in_cycle = total_minutes % 180 if total_minutes >= 0 else 180 + (total_minutes % 180)
    tatwas = DIRECT_TATWAS if cycle_type == 'Direct' else REVERSE_TATWAS
    remaining = minutes_in_cycle % 90
    
    current_time = 0
    for tatwa, duration in tatwas:
        current_time += duration
        if remaining <= current_time:
            main_tatwa = tatwa
            break
    
    # Antar Tatwa calculation
    main_duration = TATWA_DURATIONS[main_tatwa]
    offset = remaining - (current_time - main_duration)
    antar_tatwas = []
    for sub_tatwa, sub_duration in (DIRECT_TATWAS if cycle_type == 'Direct' else REVERSE_TATWAS):
        antar_duration = (main_duration * sub_duration) / 90
        antar_tatwas.append((sub_tatwa, antar_duration))
    
    antar_time = 0
    for antar_tatwa, duration in antar_tatwas:
        antar_time += duration
        if offset <= antar_time:
            return main_tatwa, antar_tatwa, cycle_type, total_minutes
    
    return main_tatwa, antar_tatwas[-1][0], cycle_type, total_minutes

def is_valid_tatwa(tatwa, sex, moon_star_lord, lagna_type):
    male_tatwas = ['Prithvi', 'Tejo', 'Akash']
    female_tatwas = ['Jala', 'Vayu']
    if sex == 'Male' and tatwa not in male_tatwas:
        return False
    if sex == 'Female' and tatwa not in female_tatwas:
        return False
    # Check rectification table (simplified)
    key = f"{moon_star_lord}-{lagna_type}"
    valid_tatwas = RECTIFICATION_TABLE.get(key, {}).get(sex, [])
    return tatwa in valid_tatwas

def rectify_time(adjusted_time, main_tatwa, antar_tatwa, sex, moon_star_lord, lagna_type):
    if is_valid_tatwa(main_tatwa, sex, moon_star_lord, lagna_type):
        return adjusted_time, "No adjustment needed"
    
    # Adjust within antartatwa window (12 seconds)
    tatwas = ['Prithvi', 'Jala', 'Tejo', 'Vayu', 'Akash']
    target_tatwas = ['Jala', 'Vayu'] if sex == 'Female' else ['Prithvi', 'Tejo', 'Akash']
    adjustment = datetime.timedelta(seconds=12)
    for delta in range(-12, 13, 1):
        new_time = adjusted_time + datetime.timedelta(seconds=delta)
        new_main, new_antar, cycle, _ = calculate_tatwa_cycle(new_time)
        if new_main in target_tatwas and is_valid_tatwa(new_main, sex, moon_star_lord, lagna_type):
            return new_time, f"Adjusted by {delta} seconds to {new_main} tatwa"
    
    return adjusted_time, "Could not rectify within 12 seconds"

@app.route('/rectify', methods=['POST'])
def rectify():
    data = request.json
    try:
        birth_datetime = datetime.datetime.fromisoformat(data['birthDateTime'].replace('Z', '+00:00'))
        location = data['location']
        sex = data['sex']
        moon_star_lord = data['moonStarLord']
        lagna_type = data['lagnaType']
        
        sunrise = calculate_sunrise(birth_datetime, location)
        adjusted_time = adjust_birth_time(birth_datetime, sunrise)
        main_tatwa, antar_tatwa, cycle_type, total_minutes = calculate_tatwa_cycle(adjusted_time)
        rectified_time, adjustment = rectify_time(adjusted_time, main_tatwa, antar_tatwa, sex, moon_star_lord, lagna_type)
        
        return jsonify({
            'rectifiedTime': rectified_time.strftime('%Y-%m-%d %H:%M:%S'),
            'tatwa': main_tatwa,
            'antarTatwa': antar_tatwa,
            'cycleType': cycle_type,
            'adjustment': adjustment
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print('Starting Flask server...')
    app.run(host='0.0.0.0', port=5000, debug=True)