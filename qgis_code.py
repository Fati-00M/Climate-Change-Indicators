import pandas as pd
import folium
from folium.plugins import FastMarkerCluster

# 1. Load data
df = pd.read_csv('fire_archive_province.csv')

# 2. Filtering - Start with these to ensure the script finishes quickly
# You can tighten these later once you see the map works
filtered_fires = df[
    (df['brightness'] > 330) & 
    (df['frp'] > 2.0)
].copy()

print(f"Processing {len(filtered_fires)} fire points...")

# 3. Create map
m = folium.Map(location=[30.3753, 69.3451], zoom_start=6, tiles='CartoDB dark_matter')

# 4. Use FastMarkerCluster for better performance
# It takes a list of [lat, lon] pairs
data = filtered_fires[['latitude', 'longitude']].values.tolist()

FastMarkerCluster(data).add_to(m)

# 5. Save
print("Saving map to index.html (this may take a moment)...")
m.save('index.html')
print("Done! Open index.html in your browser.")