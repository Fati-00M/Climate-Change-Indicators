# Pakistan Climate Change Indicators: Fire & Deforestation Analysis

An interactive data visualization portfolio monitoring environmental impact markers in Pakistan using satellite data and automated Python workflows.

###  Live Dashboards
*   [**Active Fire Alerts**](https://fati-00m.github.io/Climate-Change-Indicators/) – *historical archives of fire points in VIIRS satellite with recent satellite fire detections.*
*   [**Deforestation**](https://fati-00m.github.io/Climate-Change-Indicators/deforestation.html) – *Visualizing canopy loss using the Hansen Global Forest Change dataset from Google Earth Engine.*

---

## Project Overview
I am collecting satellite data from NASA and Google Earth Engine to map out climate change markers specific to Pakistan.
-FIRE POINTS
 This project uses FIRMS (Fire Information for Resource Management System) data that was requested with country set as Pakistan and satellite set as VIIRS NOAA-20. It has been collecting fire data since 2018 to present. 
 I then uploaded that csv to Quantum Geographic Information System to attribute the fire points by location. Since firms had only given me the coordinates without the information which province or district they were happening in, I added a shapefile of Pakistan's provinces as vector. Then used the toolbox to join attributes by location. 
 - Set the to join features in the csv.
 - The geometric predicate was set to intersect.
 - By comparing to was set to the Pakistan shape file consisting all provinces.
 Then I exported the data as a csv file, keeping the CRS as EPSG:4326 WGS-84. 
 This data was still raw as it needed to weed out the low and neutral confidence fires. I filtered the confidence to only contain high confidence and then ran it on python to be displayed on a map.
- Deforestation
This climate change indicator needed data from Google Earth Engine. I made an individual non-commercial account that gave me access to Hansen global forest change. In that code, I set the canopy cover to >30% as that would indicate actual tree loss instead of focusing on grasslands. I got many thousands of coordinates that needed to be attributed by location using qgis. 
 - I followed the same process as I did with fire points in gqis and got deforestation by location which is pertinent data while studying how different provincial policies are leading to deforestation more in some areas than others.

### Core Objectives
*   **Fire Monitoring:** Using the FIRMS (VIIRS Satellite) API to track thermal anomalies. I apply specific thresholds to `brightness` and `frp` (Fire Radiative Power) to isolate confirmed large-scale fires. 
*   **Forest Loss:** Visualizing **Hansen Global Forest Change** data (sourced via Google Earth Engine) to identify areas where canopy cover has dropped significantly (threshold set to >30% canopy).

##  Technical Stack
*   **Language:** Python 3.10
*   **Data Science:** Pandas (Data cleaning and NaN handling)
*   **Geospatial:** Folium & FastMarkerCluster (Web-based mapping)
*   **Environment:** Conda (Managing geospatial dependencies)
*   **Deployment:** GitHub Pages (Automated web hosting)

##  Repository Structure
*   `index.html`: Main interactive map for fire alerts.
*   `deforestation.html`: Standalone map for forest loss analysis.
*   `qgis_code.py`: Script for processing fire archives and recent alerts.
*   `deforestation.py`: Dedicated script for the Hansen dataset visualization.
*   `fire_archive_province.csv`: Historical province-level data.
*   `recent_fire_pts.csv`: Current thermal anomaly detections.
*   `Copy of deforestation_by_location.csv`: Geospatial forest loss coordinates.

## 👤 Author
**Fati-00M**
*Business & Social Science Student | Data Analysis & GIS Portfolio*