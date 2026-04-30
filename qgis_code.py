import pandas as pd
import folium
from folium.plugins import FastMarkerCluster

# 1. Initialize the Base Map
# Centered on Pakistan with a dark theme for high-contrast visualization
m = folium.Map(location=[30.3753, 69.3451], zoom_start=6, tiles='CartoDB dark_matter')

# --- LAYER 1: Historical Fire Archive ---
try:
    df_archive = pd.read_csv('fire_archive_province.csv')
    # Filter to ensure we don't have NaNs in coordinates
    df_archive = df_archive.dropna(subset=['latitude', 'longitude'])
    archive_pts = df_archive[['latitude', 'longitude']].values.tolist()
    
    fg_archive = folium.FeatureGroup(name="🔥 Historical Fire Archive", show=False)
    FastMarkerCluster(archive_pts).add_to(fg_archive)
    fg_archive.add_to(m)
    print(f"Successfully processed {len(archive_pts)} archive points.")
except Exception as e:
    print(f"Error loading archive data: {e}")

# --- LAYER 2: Recent Fire Points ---
try:
    df_recent = pd.read_csv('recent_fire_pts.csv')
    df_recent = df_recent.dropna(subset=['latitude', 'longitude'])
    recent_pts = df_recent[['latitude', 'longitude']].values.tolist()
    
    fg_recent = folium.FeatureGroup(name="🛰️ Recent Satellite Fire Alerts", show=False)
    FastMarkerCluster(recent_pts).add_to(fg_recent)
    fg_recent.add_to(m)
    print(f"Successfully processed {len(recent_pts)} recent fire points.")
except Exception as e:
    print(f"Error loading recent fire data: {e}")

# --- LAYER 3: Deforestation Data (Hansen) ---
try:
    # Loading your specific file name
    df_deforest = pd.read_csv('Copy of deforestation_by_location.csv')
    
    # Cleaning data to prevent the 'Location values cannot contain NaNs' error
    df_deforest = df_deforest.dropna(subset=['center_lat', 'center_lon'])
    forest_pts = df_deforest[['center_lat', 'center_lon']].values.tolist()
    
    fg_forest = folium.FeatureGroup(name="🌳 Deforestation Markers (Hansen)", show=False)
    
    # Custom JS callback to make deforestation points Green
    FastMarkerCluster(
        forest_pts, 
        callback="""
            function (row) {
                return L.circleMarker(row, {
                    radius: 5, 
                    color: 'green', 
                    fillColor: '#2e8b57', 
                    fillOpacity: 0.7
                });
            }
        """
    ).add_to(fg_forest)
    fg_forest.add_to(m)
    print(f"Successfully processed {len(forest_pts)} deforestation points.")
except Exception as e:
    print(f"Error loading deforestation data: {e}")

# --- LAYER CONTROL MENU ---
# collapsed=False keeps the menu expanded on the screen by default
folium.LayerControl(collapsed=False).add_to(m)

# 2. Save the final output
m.save('index.html')
print("\nSuccess! index.html has been updated with all layers.")
print("Now run 'git push' to update your live portfolio.")



# import pandas as pd
# import folium
# from folium.plugins import FastMarkerCluster

# # Initialize Map
# m = folium.Map(location=[30.3753, 69.3451], zoom_start=6, tiles='CartoDB dark_matter')

# # --- LAYER 1: Archive Province Data ---
# df_archive = pd.read_csv('fire_archive_province.csv')
# archive_pts = df_archive[['latitude', 'longitude']].values.tolist()
# fg_archive = folium.FeatureGroup(name="Historical Fire Alerts (Archive)")
# FastMarkerCluster(archive_pts).add_to(fg_archive)
# fg_archive.add_to(m)

# # --- LAYER 2: Recent Fire Points ---
# # Using the columns from your image: latitude, longitude, frp, etc.
# df_recent = pd.read_csv('recent_fire_pts.csv')
# recent_pts = df_recent[['latitude', 'longitude']].values.tolist()
# fg_recent = folium.FeatureGroup(name="Recent Fire Alerts (Live/Recent)")
# FastMarkerCluster(recent_pts, callback=None).add_to(fg_recent)
# fg_recent.add_to(m)

# # --- Add the Toggle Menu ---
# folium.LayerControl(collapsed=False).add_to(m)

# # Save
# m.save('index.html')
# print("Multi-layer map generated successfully!")





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