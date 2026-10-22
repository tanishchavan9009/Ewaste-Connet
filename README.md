# EcoReclaim - Global E-Waste Intelligence & Lifecycle Management Platform

**EcoReclaim** is an interactive, modern web application built for analyzing global electronic waste generation, tracking consumer electronics consumption, and managing end-to-end e-waste collection and processing lifecycles.

---

## 🌟 Key Features

### 1. 🖥️ Interactive Homepage & Hero
- **Modern UI/UX**: Emerald-green futuristic palette, particle effects, dark/light theme toggle, and smooth scrolling navigation.
- **Hero Metrics**: Quick KPI counters highlighting tracked countries, dataset records, and multi-year spans.
- **Engaging Animations**: Dynamic headers and smooth transitions.

### 2. 📊 Visual Analytics Dashboard (Chart.js)
- **E-Waste Generation Trends**: Interactive multi-country line and bar charts (2015–2025).
- **2025 E-Waste Distribution**: Doughnut breakdown by nation.
- **Gadget Metrics**: Comparison graphs for smartphone sales, laptop shipments, and 5G penetration rates.
- **Economic Correlation**: Scatter plot analyzing the correlation between Average Consumer Spending ($) and E-Waste Generated (Metric Tons).
- **Dynamic Filters**: Filter graphs and summaries by country, year range, and primary metric.

### 3. 🔍 Smart Search Engine
- **Instant Query Engine**: Search across countries, years, and specific metrics (e.g., `"USA 2024"`, `"India smartphone"`, `"highest e-waste"`).
- **Pre-set Search Tags**: Single-click access to top records, highest e-waste producers, and gadget statistics.

### 4. 🗃️ Comprehensive Data Explorer
- **Interactive Data Table**: View, filter, and sort through the entire Global Tech Gadget Consumption dataset.
- **Column Sorting**: Sort by country, year, spending, sales, and e-waste volume.
- **Export & Print**: One-click **CSV export** and printable view.

### 5. 📝 E-Waste Collection Registry
- **Collection Entry Form**:
  - Auto-generated Entry IDs (e.g., `COL-XXXXXX`).
  - Collector name, location, and collection date.
  - Product category (smartphones, laptops, monitors, PCBs, batteries, etc.).
  - Total weight (kg), quantity, and hardware condition.
  - Material breakdown (Plastics, Copper, Aluminum, Gold, Silver, Lithium, etc.).
  - Extracted weight and hazardous substance flags (Lead, Mercury, Cadmium).
- **Local Persistence**: Records automatically save to browser `localStorage`.

### 6. 🚚 Processing & Handoff Tracker
- **Downstream Processing Form**:
  - Handoff ID generator (`HND-XXXXXX`).
  - Link handoffs directly to collected items.
  - Receiving recycling company name, location, dispatch date, and transport type.
  - Processing classification (Recycling, Refurbishment, Material Recovery, Safe Disposal).
  - Facility certification tracking (R2, e-Stewards, ISO 14001, WEEELABEX).
  - Lifecycle statuses: *Dispatched*, *In Transit*, *Delivered*, *Processing*, *Completed*.

### 7. 🤝 B2B Supplier & Scrap Dealer Request Window
- **Live Interactive Marketplace**:
  - Broadcast buy/sell and recycling service requests to certified partners.
  - Organization contact credentials, category, target volume, and delivery region.
  - Target price / bid submission with fulfillment deadlines.
  - Active dealer feed with real-time bidding, procurement filters, and quote counter-offers.
  - Verified credentials (R2, ISO 14001 compliance badges).

### 8. 🌿 Environmental Impact Calculator & Facts
- **Eco Savings Calculator**: Calculate CO₂ emissions prevented, water saved, energy conserved, and landfill waste diverted based on recyclable weight.
- **Educational Carousel**: Curated real-world statistics about global e-waste generation, mineral recovery, and recycling awareness.
- **Enhanced Light UI/UX**: Crisp high-contrast readable typography, larger headings, and an attractive nature-inspired texture backdrop.

---

## 📁 Project Structure

```text
ewaste fa/
├── index.html                           # Main web application page
├── README.md                            # Project documentation
├── css/
│   └── style.css                        # Modern custom styling, themes, and animations
├── js/
│   └── app.js                           # Dataset parsing, Chart.js engine, registry, and search logic
└── data/
    └── Global_Tech_Gadget_Consumption.csv # Global e-waste & gadget consumption dataset
```

---

## 🚀 How to Run the Project

### Option 1: Direct Browser Launch
Simply double-click or open [index.html](file:///c:/Users/tanis/OneDrive/Desktop/ewaste%20fa/index.html) in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox).

### Option 2: Local HTTP Server (Recommended)
If you prefer running via a local web server (to avoid local file CORS restrictions on CSV fetching):

#### Using Python:
```bash
# In the project directory:
python -m http.server 8000
```
Then open your browser and navigate to:
```text
http://localhost:8000
```

#### Using Node.js / npx:
```bash
npx serve .
```

#### Using VS Code:
Right-click [index.html](file:///c:/Users/tanis/OneDrive/Desktop/ewaste%20fa/index.html) and select **"Open with Live Server"**.

---

## 📊 Dataset Information
- **Source File**: `data/Global_Tech_Gadget_Consumption.csv`
- **Countries Covered**: USA, China, India, Germany, UK, France, Japan, South Korea, Brazil, Canada
- **Timeframe**: 2015 – 2025
- **Attributes**:
  - `Country`
  - `Year`
  - `Smartphone Sales (Millions)`
  - `Laptop Shipments (Millions)`
  - `Gaming Console Adoption (%)`
  - `Smartwatch Penetration (%)`
  - `Average Consumer Spending on Gadgets ($)`
  - `E-Waste Generated (Metric Tons)`
  - `5G Penetration Rate (%)`

---

## 🛠️ Built With
- **HTML5 & CSS3**: Responsive layout with modern CSS Grid and Flexbox.
- **JavaScript (ES6+)**: Interactive logic, CSV parser, and local storage state management.
- **[Chart.js](https://www.chartjs.org/)**: Charts, line plots, doughnuts, and scatter plots.
- **[Font Awesome](https://fontawesome.com/)**: Clean UI icons.
- **Google Fonts**: Inter & Space Grotesk.

