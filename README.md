# Pakistan Climate Change Indicators: Fire & Deforestation Analysis

An interactive data visualization portfolio monitoring environmental impact markers in Pakistan using satellite data and automated Python workflows.

### 📍 Live Dashboards
*   [**Main Dashboard: Active Fire Alerts**](https://fati-00m.github.io/Climate-Change-Indicators/) – *Comparing historical archives with recent satellite detections.*
*   [**Deep Dive: Deforestation Analysis**](https://fati-00m.github.io/Climate-Change-Indicators/deforestation.html) – *Visualizing canopy loss using the Hansen Global Forest Change dataset.*

---

## 🛠 Project Overview
This project bridges the gap between raw satellite data and actionable environmental insights. By automating the data pipeline, we can monitor critical climate markers across Pakistan's provinces without manual GIS software intervention.

### Core Objectives
*   **Fire Monitoring:** Using the **FIRMS (VIIRS Satellite) API** to track thermal anomalies. We apply specific thresholds to `brightness` and `frp` (Fire Radiative Power) to isolate confirmed large-scale fires.
*   **Forest Loss:** Visualizing **Hansen Global Forest Change** data (sourced via Google Earth Engine) to identify areas where canopy cover has dropped significantly (threshold set to >30% canopy).

## 🚀 Technical Stack
*   **Language:** Python 3.10
*   **Data Science:** Pandas (Data cleaning and NaN handling)
*   **Geospatial:** Folium & FastMarkerCluster (Web-based mapping)
*   **Environment:** Conda (Managing geospatial dependencies)
*   **Deployment:** GitHub Pages (Automated web hosting)

## 📂 Repository Structure
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