import pandas as pd
import folium
from folium.plugins import FastMarkerCluster

# Initialize Map
m = folium.Map(location=[30.3753, 69.3451], zoom_start=6, tiles='CartoDB dark_matter')

# --- LAYER 1: Archive Province Data ---
df_archive = pd.read_csv('fire_archive_province.csv')
archive_pts = df_archive[['latitude', 'longitude']].values.tolist()
fg_archive = folium.FeatureGroup(name="Historical Fire Alerts (Archive)")
FastMarkerCluster(archive_pts).add_to(fg_archive)
fg_archive.add_to(m)

# --- LAYER 2: Recent Fire Points ---
# Using the columns from your image: latitude, longitude, frp, etc.
df_recent = pd.read_csv('recent_fire_pts.csv')
recent_pts = df_recent[['latitude', 'longitude']].values.tolist()
fg_recent = folium.FeatureGroup(name="Recent Fire Alerts (Live/Recent)")
FastMarkerCluster(recent_pts, callback=None).add_to(fg_recent)
fg_recent.add_to(m)

# --- Add the Toggle Menu ---
folium.LayerControl(collapsed=False).add_to(m)

# Save
m.save('index.html')
print("Multi-layer map generated successfully!")



# import pandas as pd
# import folium
# from folium.plugins import FastMarkerCluster

# # 1. Load data
# df = pd.read_csv('fire_archive_province.csv')

# # 2. Filtering - Start with these to ensure the script finishes quickly
# # You can tighten these later once you see the map works
# filtered_fires = df[
#     (df['brightness'] > 330) & 
#     (df['frp'] > 2.0)
# ].copy()

# print(f"Processing {len(filtered_fires)} fire points...")

# # 3. Create map
# m = folium.Map(location=[30.3753, 69.3451], zoom_start=6, tiles='CartoDB dark_matter')

# # 4. Use FastMarkerCluster for better performance
# # It takes a list of [lat, lon] pairs
# data = filtered_fires[['latitude', 'longitude']].values.tolist()

# FastMarkerCluster(data).add_to(m)

# # 5. Save
# print("Saving map to index.html (this may take a moment)...")
# m.save('index.html')
# print("Done! Open index.html in your browser.")