import csv
import os
import json
from datetime import datetime

def parse_date(date_str):
    for fmt in ('%d/%m/%Y', '%Y/%m/%d', '%Y-%m-%d'):
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime('%Y-%m-%d'), dt.year
        except ValueError:
            continue
    return None, None

def process_data():
    archive_path = 'fire_archive_province.csv'
    recent_path = 'recent_fire_pts.csv'
    output_js_path = 'data.js'
    
    combined_data = []
    
    # Process archive
    print(f"Reading {archive_path}...")
    if os.path.exists(archive_path):
        with open(archive_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    lat = float(row['latitude'])
                    lon = float(row['longitude'])
                    date_str, year = parse_date(row['acq_date'])
                    if not date_str:
                        continue
                    
                    brightness = float(row['brightness']) if row['brightness'] else 0.0
                    bright_t31 = float(row['bright_t31']) if row['bright_t31'] else 0.0
                    frp = float(row['frp']) if row['frp'] else 0.0
                    confidence = row['confidence'].lower().strip() if row['confidence'] else 'h'
                    scan = float(row['scan']) if row['scan'] else 0.0
                    province = row['name'].strip() if row['name'] else 'Unknown'
                    
                    combined_data.append([
                        lat, lon, date_str, brightness, bright_t31, frp, confidence, scan, province
                    ])
                except Exception as e:
                    print(f"Error parsing row in archive: {e}, row: {row}")
    else:
        print(f"Warning: {archive_path} not found!")

    # Process recent
    print(f"Reading {recent_path}...")
    if os.path.exists(recent_path):
        with open(recent_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    lat = float(row['latitude'])
                    lon = float(row['longitude'])
                    date_str, year = parse_date(row['acq_date'])
                    if not date_str:
                        continue
                    
                    brightness = float(row['brightness']) if row['brightness'] else 0.0
                    bright_t31 = float(row['bright_t31']) if row['bright_t31'] else 0.0
                    frp = float(row['frp']) if row['frp'] else 0.0
                    confidence = row['confidence'].lower().strip() if row['confidence'] else 'n'
                    scan = float(row['scan']) if row['scan'] else 0.0
                    province = row['name'].strip() if row['name'] else 'Unknown'
                    
                    combined_data.append([
                        lat, lon, date_str, brightness, bright_t31, frp, confidence, scan, province
                    ])
                except Exception as e:
                    print(f"Error parsing row in recent: {e}, row: {row}")
    else:
        print(f"Warning: {recent_path} not found!")

    # Sort data by date (chronological order)
    combined_data.sort(key=lambda x: x[2])
    
    print(f"Writing {len(combined_data)} rows to {output_js_path}...")
    with open(output_js_path, 'w', encoding='utf-8') as f:
        f.write("// Pakistan Fire Data compiled for Interactive Dashboard\n")
        f.write("// Format of each item: [latitude, longitude, acq_date, brightness, bright_t31, frp, confidence, scan, province]\n")
        f.write("window.FIRE_DATA_KEYS = " + json.dumps(["lat", "lon", "date", "brightness", "bright_t31", "frp", "confidence", "scan", "province"]) + ";\n")
        f.write("window.FIRE_DATA = ")
        json.dump(combined_data, f)
        f.write(";\n")
        
    print("Done! Data compilation complete.")

if __name__ == '__main__':
    process_data()
