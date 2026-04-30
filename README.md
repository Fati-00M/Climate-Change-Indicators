# Pakistan Climate Change Indicators: Fire Activity Analysis

This repository provides an interactive visualization of climate change markers in Pakistan, specifically focusing on satellite-detected thermal anomalies (fires) and forest canopy changes.

### 📍 [View Live Interactive Map](https://fati-00m.github.io/Climate-Change-Indicators/)

---

## 🛠 Project Overview
This project automates the processing of environmental satellite data to identify "big fires" and areas of significant deforestation. By visualizing these indicators, we can better understand the environmental pressures facing various provinces in Pakistan.

### Data Sources
*   **FIRMS (VIIRS Satellite):** Thermal anomalies and active fire data.
*   **Hansen Global Forest Change:** Canopy cover loss data (processed via Google Earth Engine).
*   **Local Records:** Province-level historical fire archives.

## 🚀 Technical Workflow
1.  **Data Extraction:** Automated retrieval of fire alerts using the FIRMS API.
2.  **Filtering:** Applying thresholds to `brightness`, `bright_t31`, and `frp` (Fire Radiative Power) to isolate confirmed large-scale fires.
3.  **Visualization:** Data is processed via **Python (Pandas)** and rendered into an interactive web interface using **Folium**.
4.  **Deployment:** Hosted via GitHub Pages for public access and portfolio demonstration.

## 📂 Repository Structure
*   `index.html`: The generated interactive map.
*   `qgis_code.py`: Python script used to process CSVs and generate the map.
*   `fire_archive_province.csv`: Historical province-level fire data.
*   `recent_fire_pts.csv`: Latest satellite fire detections.

## 👤 Author
**Fati-00M**
Student focused on Business and Social Science | GIS & Data Analysis Portfolio