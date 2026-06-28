// Pakistan Fire Alerts Dashboard Logic
document.addEventListener("DOMContentLoaded", () => {
    // Check if data is loaded
    if (!window.FIRE_DATA || !window.FIRE_DATA_KEYS) {
        console.error("Fire data failed to load.");
        document.querySelector(".loading-text").innerText = "Error: Fire data not found!";
        return;
    }

    const data = window.FIRE_DATA;
    const keys = window.FIRE_DATA_KEYS;
    
    // UI elements
    const totalFiresEl = document.getElementById("kpi-total");
    const maxFrpEl = document.getElementById("kpi-max-frp");
    const avgBrightEl = document.getElementById("kpi-avg-bright");
    const topProvinceEl = document.getElementById("kpi-top-province");
    const loadingOverlay = document.getElementById("loading-overlay");
    
    // Pagination elements
    let currentPage = 1;
    const rowsPerPage = 10;
    let filteredData = [...data];
    
    const tableBody = document.getElementById("table-body");
    const pageInfo = document.getElementById("page-info");
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");
    
    // Export and Reset buttons
    const btnExport = document.getElementById("btn-export");
    const btnReset = document.getElementById("btn-reset");
    const btnApply = document.getElementById("btn-apply");

    // Map instances
    let map;
    let markerCluster;
    let heatLayer;
    let mapMode = 'cluster'; // 'cluster' or 'heat'
    
    // Chart instances
    let trendChart;
    let provinceChart;
    let scatterChart;

    // Available values for filters (from data)
    const provinces = [...new Set(data.map(d => d[8]))].sort();
    const years = [...new Set(data.map(d => parseInt(d[2].substring(0, 4))))].sort((a,b)=>a-b);
    const confidences = ["h", "n", "l"];

    // Initialize DOM Filter Elements
    initFilterDom();
    
    // Get filter references
    const filterRefs = getFilterReferences();
    
    // Set initial filter values in inputs
    resetFilterInputs();

    // Initialize Leaflet Map
    initMap();

    // Initialize Charts
    initCharts();

    // Perform initial filter and render
    applyFilters();

    // Hide loader
    setTimeout(() => {
        loadingOverlay.classList.add("hidden");
    }, 600);

    // --- FUNCTIONS ---

    function initFilterDom() {
        // Render Year checkboxes
        const yearGroup = document.getElementById("filter-years");
        yearGroup.innerHTML = '';
        years.forEach(yr => {
            const label = document.createElement("label");
            label.className = "checkbox-label checked";
            label.innerHTML = `<input type="checkbox" value="${yr}" checked> ${yr}`;
            yearGroup.appendChild(label);
            
            // Add change listener to toggle class
            label.querySelector("input").addEventListener("change", (e) => {
                if (e.target.checked) label.classList.add("checked");
                else label.classList.remove("checked");
            });
        });

        // Render Province checkboxes
        const provGroup = document.getElementById("filter-provinces");
        provGroup.innerHTML = '';
        provinces.forEach(prov => {
            const label = document.createElement("label");
            label.className = "checkbox-label checked";
            label.innerHTML = `<input type="checkbox" value="${prov}" checked> ${prov}`;
            provGroup.appendChild(label);
            
            // Add change listener to toggle class
            label.querySelector("input").addEventListener("change", (e) => {
                if (e.target.checked) label.classList.add("checked");
                else label.classList.remove("checked");
            });
        });

        // Confidence checkboxes event listeners
        document.querySelectorAll("#filter-confidence input").forEach(input => {
            const label = input.closest("label");
            if (input.checked) label.classList.add("checked");
            
            input.addEventListener("change", (e) => {
                if (e.target.checked) label.classList.add("checked");
                else label.classList.remove("checked");
            });
        });
    }

    function getFilterReferences() {
        return {
            yearsContainer: document.getElementById("filter-years"),
            provincesContainer: document.getElementById("filter-provinces"),
            confidenceContainer: document.getElementById("filter-confidence"),
            
            frpMinSlider: document.getElementById("frp-min"),
            frpMaxSlider: document.getElementById("frp-max"),
            frpMinNum: document.getElementById("frp-min-num"),
            frpMaxNum: document.getElementById("frp-max-num"),
            
            brightMinSlider: document.getElementById("bright-min"),
            brightMaxSlider: document.getElementById("bright-max"),
            brightMinNum: document.getElementById("bright-min-num"),
            brightMaxNum: document.getElementById("bright-max-num"),
            
            t31MinSlider: document.getElementById("t31-min"),
            t31MaxSlider: document.getElementById("t31-max"),
            t31MinNum: document.getElementById("t31-min-num"),
            t31MaxNum: document.getElementById("t31-max-num"),
            
            scanMinSlider: document.getElementById("scan-min"),
            scanMaxSlider: document.getElementById("scan-max"),
            scanMinNum: document.getElementById("scan-min-num"),
            scanMaxNum: document.getElementById("scan-max-num")
        };
    }

    function resetFilterInputs() {
        // Check all checkboxes
        filterRefs.yearsContainer.querySelectorAll("input").forEach(i => {
            i.checked = true;
            i.closest("label").classList.add("checked");
        });
        filterRefs.provincesContainer.querySelectorAll("input").forEach(i => {
            i.checked = true;
            i.closest("label").classList.add("checked");
        });
        filterRefs.confidenceContainer.querySelectorAll("input").forEach(i => {
            i.checked = true;
            i.closest("label").classList.add("checked");
        });

        // Sync FRP range
        syncSliderAndNumber(filterRefs.frpMinSlider, filterRefs.frpMinNum, 0);
        syncSliderAndNumber(filterRefs.frpMaxSlider, filterRefs.frpMaxNum, 250);

        // Sync Brightness
        syncSliderAndNumber(filterRefs.brightMinSlider, filterRefs.brightMinNum, 290);
        syncSliderAndNumber(filterRefs.brightMaxSlider, filterRefs.brightMaxNum, 370);

        // Sync Bright_t31
        syncSliderAndNumber(filterRefs.t31MinSlider, filterRefs.t31MinNum, 250);
        syncSliderAndNumber(filterRefs.t31MaxSlider, filterRefs.t31MaxNum, 370);

        // Sync Scan
        syncSliderAndNumber(filterRefs.scanMinSlider, filterRefs.scanMinNum, 0.3);
        syncSliderAndNumber(filterRefs.scanMaxSlider, filterRefs.scanMaxNum, 0.8);
    }

    function syncSliderAndNumber(slider, num, val) {
        slider.value = val;
        num.value = val;
    }

    // Set up range inputs dual synchronization
    function setupDualSync(slider, num) {
        slider.addEventListener("input", (e) => {
            num.value = e.target.value;
        });
        num.addEventListener("change", (e) => {
            let val = parseFloat(e.target.value);
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            if (isNaN(val)) val = min;
            if (val < min) val = min;
            if (val > max) val = max;
            e.target.value = val;
            slider.value = val;
        });
    }

    setupDualSync(filterRefs.frpMinSlider, filterRefs.frpMinNum);
    setupDualSync(filterRefs.frpMaxSlider, filterRefs.frpMaxNum);
    setupDualSync(filterRefs.brightMinSlider, filterRefs.brightMinNum);
    setupDualSync(filterRefs.brightMaxSlider, filterRefs.brightMaxNum);
    setupDualSync(filterRefs.t31MinSlider, filterRefs.t31MinNum);
    setupDualSync(filterRefs.t31MaxSlider, filterRefs.t31MaxNum);
    setupDualSync(filterRefs.scanMinSlider, filterRefs.scanMinNum);
    setupDualSync(filterRefs.scanMaxSlider, filterRefs.scanMaxNum);

    // Initialize Map
    function initMap() {
        // Center of Pakistan approx
        map = L.map("map-container", {
            center: [30.3753, 69.3451],
            zoom: 5.5,
            zoomControl: true,
            preferCanvas: true
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 20
        }).addTo(map);

        markerCluster = L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 50,
            showCoverageOnHover: false
        });
        
        heatLayer = L.heatLayer([], {
            radius: 15,
            blur: 10,
            maxZoom: 10,
            gradient: {
                0.2: 'blue',
                0.4: 'cyan',
                0.6: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        });

        // Add layer to map
        map.addLayer(markerCluster);
        
        // Wire up map mode togglers
        const toggleCluster = document.getElementById("toggle-cluster");
        const toggleHeat = document.getElementById("toggle-heat");

        toggleCluster.addEventListener("click", () => {
            if (mapMode === 'cluster') return;
            mapMode = 'cluster';
            toggleCluster.classList.add("active");
            toggleHeat.classList.remove("active");
            map.removeLayer(heatLayer);
            map.addLayer(markerCluster);
            updateMapData();
        });

        toggleHeat.addEventListener("click", () => {
            if (mapMode === 'heat') return;
            mapMode = 'heat';
            toggleHeat.classList.add("active");
            toggleCluster.classList.remove("active");
            map.removeLayer(markerCluster);
            map.addLayer(heatLayer);
            updateMapData();
        });
    }

    // Initialize Charts using Chart.js
    function initCharts() {
        // Trend Chart
        const ctxTrend = document.getElementById("trendChart").getContext("2d");
        trendChart = new Chart(ctxTrend, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: 'Fire Count',
                    data: years.map(()=>0),
                    backgroundColor: 'rgba(255, 123, 0, 0.65)',
                    borderColor: 'rgba(255, 69, 0, 1)',
                    borderWidth: 1.5,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#111422',
                        titleColor: '#ffffff',
                        bodyColor: '#e5e7eb',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 9 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 9 } }
                    }
                }
            }
        });

        // Province Chart
        const ctxProvince = document.getElementById("provinceChart").getContext("2d");
        provinceChart = new Chart(ctxProvince, {
            type: 'bar',
            data: {
                labels: provinces,
                datasets: [{
                    label: 'Fire Count',
                    data: provinces.map(()=>0),
                    backgroundColor: 'rgba(239, 68, 68, 0.65)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1.5,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#111422',
                        titleColor: '#ffffff',
                        bodyColor: '#e5e7eb',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 9 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 9 } }
                    }
                }
            }
        });

        // Scatter Plot
        const ctxScatter = document.getElementById("scatterChart").getContext("2d");
        scatterChart = new Chart(ctxScatter, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Fires (Sampled)',
                    data: [],
                    backgroundColor: 'rgba(255, 183, 0, 0.6)',
                    borderColor: 'rgba(255, 183, 0, 1)',
                    borderWidth: 0.5,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#111422',
                        titleColor: '#ffffff',
                        bodyColor: '#e5e7eb',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const p = context.raw;
                                return `Bright: ${p.x.toFixed(1)} K | FRP: ${p.y.toFixed(1)} MW | ${p.prov} (${p.date})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Brightness (Kelvin)', color: '#9ca3af', font: { family: 'Outfit', size: 10 } },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 9 } }
                    },
                    y: {
                        title: { display: true, text: 'FRP (MW)', color: '#9ca3af', font: { family: 'Outfit', size: 10 } },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 9 } }
                    }
                }
            }
        });
    }

    // Apply Filter Logic
    function applyFilters() {
        // Collect active checkbox values
        const selectedYears = Array.from(filterRefs.yearsContainer.querySelectorAll("input:checked")).map(i => parseInt(i.value));
        const selectedProvinces = Array.from(filterRefs.provincesContainer.querySelectorAll("input:checked")).map(i => i.value);
        const selectedConfidence = Array.from(filterRefs.confidenceContainer.querySelectorAll("input:checked")).map(i => i.value);

        // Ranges
        const frpMin = parseFloat(filterRefs.frpMinSlider.value);
        const frpMax = parseFloat(filterRefs.frpMaxSlider.value);
        
        const brightMin = parseFloat(filterRefs.brightMinSlider.value);
        const brightMax = parseFloat(filterRefs.brightMaxSlider.value);
        
        const t31Min = parseFloat(filterRefs.t31MinSlider.value);
        const t31Max = parseFloat(filterRefs.t31MaxSlider.value);
        
        const scanMin = parseFloat(filterRefs.scanMinSlider.value);
        const scanMax = parseFloat(filterRefs.scanMaxSlider.value);

        // Core filter loop
        filteredData = data.filter(d => {
            const yr = parseInt(d[2].substring(0, 4));
            const prov = d[8];
            const conf = d[6];
            const brightness = d[3];
            const t31 = d[4];
            const frp = d[5];
            const scan = d[7];

            // Condition checks
            if (!selectedYears.includes(yr)) return false;
            if (!selectedProvinces.includes(prov)) return false;
            if (!selectedConfidence.includes(conf)) return false;
            
            if (frp < frpMin || frp > frpMax) return false;
            if (brightness < brightMin || brightness > brightMax) return false;
            if (t31 < t31Min || t31 > t31Max) return false;
            if (scan < scanMin || scan > scanMax) return false;

            return true;
        });

        currentPage = 1;
        
        // Update components
        updateKPIs();
        updateMapData();
        updateChartsData();
        renderTable();
    }

    // Update KPI panels
    function updateKPIs() {
        const count = filteredData.length;
        totalFiresEl.innerText = count.toLocaleString();

        if (count === 0) {
            maxFrpEl.innerText = "0.0 MW";
            avgBrightEl.innerText = "0.0 K";
            topProvinceEl.innerText = "N/A";
            return;
        }

        // Calculate values
        let maxFrp = 0.0;
        let sumBright = 0.0;
        const provCounts = {};

        filteredData.forEach(d => {
            const brightness = d[3];
            const frp = d[5];
            const prov = d[8];

            if (frp > maxFrp) maxFrp = frp;
            sumBright += brightness;
            provCounts[prov] = (provCounts[prov] || 0) + 1;
        });

        const avgBright = sumBright / count;
        
        // Top Province
        let topProv = "N/A";
        let topCount = 0;
        for (const prov in provCounts) {
            if (provCounts[prov] > topCount) {
                topCount = provCounts[prov];
                topProv = prov;
            }
        }

        maxFrpEl.innerText = `${maxFrp.toFixed(1)} MW`;
        avgBrightEl.innerText = `${avgBright.toFixed(1)} K`;
        topProvinceEl.innerText = `${topProv} (${topCount.toLocaleString()})`;
    }

    // Update Map points
    function updateMapData() {
        if (mapMode === 'cluster') {
            markerCluster.clearLayers();
            
            const markers = [];
            filteredData.forEach(d => {
                // Circle marker options colored by FRP intensity
                const frp = d[5];
                let color = '#ffb700'; // low
                if (frp > 15) color = '#ff3e3e'; // extreme
                else if (frp > 5) color = '#ff7b00'; // high

                const marker = L.circleMarker([d[0], d[1]], {
                    radius: 5,
                    fillColor: color,
                    color: '#000000',
                    weight: 0.8,
                    opacity: 0.8,
                    fillOpacity: 0.6
                });

                marker.bindPopup(createPopupHtml(d));
                markers.push(marker);
            });
            
            markerCluster.addLayers(markers);
        } else {
            // Heatmap mode
            // Heatpoint: [lat, lon, intensity]
            // We scale intensity by FRP
            const heatPoints = filteredData.map(d => [d[0], d[1], Math.min(d[5] / 10, 1.0)]);
            heatLayer.setLatLngs(heatPoints);
        }
    }

    function createPopupHtml(d) {
        const confText = d[6] === 'h' ? 'High' : (d[6] === 'n' ? 'Nominal' : 'Low');
        const badgeClass = d[6] === 'h' ? 'badge-high' : (d[6] === 'n' ? 'badge-nominal' : 'badge-low');
        
        return `
            <div class="popup-details">
                <div class="popup-title">Fire Alert Details</div>
                <div class="popup-row"><span class="popup-label">Province:</span><span class="popup-value">${d[8]}</span></div>
                <div class="popup-row"><span class="popup-label">Date:</span><span class="popup-value">${d[2]}</span></div>
                <div class="popup-row"><span class="popup-label">Coordinates:</span><span class="popup-value">${d[0].toFixed(4)}, ${d[1].toFixed(4)}</span></div>
                <div class="popup-row"><span class="popup-label">FRP:</span><span class="popup-value">${d[5].toFixed(2)} MW</span></div>
                <div class="popup-row"><span class="popup-label">Brightness:</span><span class="popup-value">${d[3].toFixed(2)} K</span></div>
                <div class="popup-row"><span class="popup-label">Bright t31:</span><span class="popup-value">${d[4].toFixed(2)} K</span></div>
                <div class="popup-row"><span class="popup-label">Scan / Track:</span><span class="popup-value">${d[7].toFixed(2)}</span></div>
                <div class="popup-row"><span class="popup-label">Confidence:</span><span class="badge ${badgeClass}">${confText}</span></div>
            </div>
        `;
    }

    // Update Charts data
    function updateChartsData() {
        // 1. Trend Chart
        const trendCounts = {};
        years.forEach(yr => { trendCounts[yr] = 0; });
        filteredData.forEach(d => {
            const yr = parseInt(d[2].substring(0, 4));
            if (trendCounts[yr] !== undefined) {
                trendCounts[yr]++;
            }
        });
        trendChart.data.datasets[0].data = years.map(yr => trendCounts[yr]);
        trendChart.update();

        // 2. Province Chart
        const provCounts = {};
        provinces.forEach(p => { provCounts[p] = 0; });
        filteredData.forEach(d => {
            const p = d[8];
            if (provCounts[p] !== undefined) {
                provCounts[p]++;
            }
        });
        provinceChart.data.datasets[0].data = provinces.map(p => provCounts[p]);
        provinceChart.update();

        // 3. Scatter Chart (sampled up to 500 points for responsiveness)
        const sampleSize = Math.min(filteredData.length, 500);
        let samplePoints = [];
        
        if (filteredData.length <= 500) {
            samplePoints = filteredData;
        } else {
            // Take step sample
            const step = Math.floor(filteredData.length / sampleSize);
            for (let i = 0; i < sampleSize; i++) {
                samplePoints.push(filteredData[i * step]);
            }
        }

        const scatterPoints = samplePoints.map(d => ({
            x: d[3], // brightness
            y: d[5], // frp
            prov: d[8],
            date: d[2]
        }));
        
        scatterChart.data.datasets[0].data = scatterPoints;
        scatterChart.update();
    }

    // Render Paginated Details Table
    function renderTable() {
        tableBody.innerHTML = '';
        
        const count = filteredData.length;
        const totalPages = Math.ceil(count / rowsPerPage) || 1;
        
        if (currentPage > totalPages) currentPage = totalPages;
        
        const start = (currentPage - 1) * rowsPerPage;
        const end = Math.min(start + rowsPerPage, count);
        
        // Update pagination buttons state
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        
        pageInfo.innerText = `Page ${currentPage} of ${totalPages} (Showing ${count > 0 ? start + 1 : 0}-${end} of ${count})`;

        if (count === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No records match the current filter selection.</td></tr>`;
            return;
        }

        for (let i = start; i < end; i++) {
            const d = filteredData[i];
            const confText = d[6] === 'h' ? 'High' : (d[6] === 'n' ? 'Nominal' : 'Low');
            const badgeClass = d[6] === 'h' ? 'badge-high' : (d[6] === 'n' ? 'badge-nominal' : 'badge-low');
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${d[2]}</td>
                <td><strong>${d[8]}</strong></td>
                <td>${d[5].toFixed(2)} MW</td>
                <td>${d[3].toFixed(1)} K</td>
                <td>${d[4].toFixed(1)} K</td>
                <td><span class="badge ${badgeClass}">${confText}</span></td>
            `;
            tableBody.appendChild(tr);
        }
    }

    // Pagination events
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // Apply filter button
    btnApply.addEventListener("click", () => {
        loadingOverlay.classList.remove("hidden");
        document.querySelector(".loading-text").innerText = "Filtering data points...";
        
        setTimeout(() => {
            applyFilters();
            loadingOverlay.classList.add("hidden");
        }, 150);
    });

    // Reset button
    btnReset.addEventListener("click", () => {
        loadingOverlay.classList.remove("hidden");
        document.querySelector(".loading-text").innerText = "Resetting filters...";
        
        setTimeout(() => {
            resetFilterInputs();
            applyFilters();
            loadingOverlay.classList.add("hidden");
        }, 150);
    });

    // Export current filtered view to CSV
    btnExport.addEventListener("click", () => {
        if (filteredData.length === 0) {
            alert("No data available to export.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add header
        csvContent += keys.join(",") + "\n";
        
        // Add rows
        filteredData.forEach(row => {
            // Join array items
            csvContent += row.map(val => {
                if (typeof val === 'string' && val.includes(',')) {
                    return `"${val}"`;
                }
                return val;
            }).join(",") + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        
        // Filename with timestamp
        const timestamp = new Date().toISOString().substring(0, 10);
        link.setAttribute("download", `pakistan_fire_alerts_filtered_${timestamp}.csv`);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
    });
});
