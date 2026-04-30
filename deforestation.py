import pandas as pd
import folium
from folium.plugins import FastMarkerCluster

# 1. Initialize Map centered on Pakistan's forested regions
m = folium.Map(location=[34.0, 73.0], zoom_start=7, tiles='CartoDB dark_matter')

# --- LOADING DEFORESTATION DATA ---
try:
    df = pd.read_csv('Copy of deforestation_by_location.csv')
    
    # Drop NaNs to prevent the Folium crash
    df = df.dropna(subset=['center_lat', 'center_lon'])
    
    # Extract points
    forest_pts = df[['center_lat', 'center_lon']].values.tolist()
    
    # Create the Feature Group
    fg = folium.FeatureGroup(name="🌳 Hansen Forest Loss (>30% Canopy)")
    
    # Custom Green Markers
    FastMarkerCluster(
        forest_pts, 
        callback="""
            function (row) {
                return L.circleMarker(row, {
                    radius: 6, 
                    color: '#2ecc71', 
                    fillColor: '#27ae60', 
                    fillOpacity: 0.8
                });
            }
        """
    ).add_to(fg)
    
    fg.add_to(m)
    print(f"Processed {len(forest_pts)} deforestation markers.")

except Exception as e:
    print(f"Error: {e}")

# Save as a NEW file name
m.save('deforestation.html')
print("Standalone deforestation page generated: deforestation.html")