# 🌾 Smart Agriculture Assistant

> **AI-Powered Crop Yield Prediction Engine, Gemini Leaf Disease Classifier & Microclimate Analytics System**

![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)
![React](https://img.shields.io/badge/React-v19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue.svg)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)

---

## 📌 Overview

The **Smart Agriculture Assistant** is an end-to-end full-stack web application designed for modern agricultural precision, farming optimization, and academic research. It combines a deterministic multi-variable **Machine Learning Crop Recommendation & Yield Engine** with **Google Gemini Vision AI** for automated plant leaf disease diagnosis and real-time microclimate weather integration via **Open-Meteo**.

Whether used by farmers in the field or presented as a university Computer Science / BCA capstone project, the system provides accurate, real-time agronomic insights without demanding complex hardware setups.

---

## ✨ Key Features

- 🌾 **Crop Recommendation & Yield ML Engine**:
  - Analyzes 7 vital soil & climate parameters: **Nitrogen (N), Phosphorus (P), Potassium (K), Temperature, Humidity, pH, and Rainfall**.
  - Calculates multi-dimensional Euclidean distance against optimized crop centroids (Rice, Wheat, Maize, Potato, Tomato, Cotton, Apple, Grape, Mango, Watermelon).
  - Provides instant suitablity scores (%), primary agronomic growth factors, and estimated yield bounds (in Tonnes/Hectare).

- 🍃 **AI Vision Leaf Disease Diagnostics**:
  - Uses **Google Gemini Vision AI** to diagnose plant diseases directly from uploaded leaf photos.
  - Generates detailed diagnostics including **Disease Name, Confidence Score, Severity Level, Symptoms, Treatment / Fungicide Advice, and Organic Remedies**.
  - Fallback engine allows offline testing even when API key is unconfigured.

- 🌦️ **Live Microclimate Weather Integration**:
  - Integrates with the **Open-Meteo API** (zero-config, keyless public weather service).
  - Fetches live localized temperature, humidity, rainfall forecasts, and wind conditions based on user latitude/longitude or city search.

- 📊 **Soil History & Data Management**:
  - Secure session-based authentication system.
  - History tracking for past soil health analyses with quick searching, filtering, and **CSV export** capabilities.

- 📖 **Embedded Academic & BCA Documentation**:
  - Includes full interactive theoretical project documentation detailing algorithm mechanics, dataset distributions, code architecture, and interview prep Q&A.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with **TypeScript**
- **Tailwind CSS v4** for clean, responsive UI layout
- **Lucide React** for lightweight iconography
- **Motion** for smooth state transitions

### Backend
- **Node.js** with **Express.js** (Server-side proxy & API handler)
- **@google/genai** (Google Gemini 2.5 Flash SDK)
- **esbuild & tsx** for high-performance builds

### External APIs & Data
- **Google Gemini API**: Multimodal vision analysis
- **Open-Meteo API**: Live public weather geolocation metrics

---

## 📁 Repository Structure

```text
.
├── server.ts             # Express backend server (ML engine, Gemini proxy, Weather proxy, Auth)
├── dbServer.ts           # Soil health analytics data layer & history persistence
├── src/
│   ├── App.tsx           # Primary React UI component & application state
│   ├── main.tsx          # React application root entry point
│   ├── data/
│   │   └── documentation.ts  # Academic BCA documentation & theoretical guides
│   └── index.css         # Tailwind CSS styling entry
├── dataset_folder/       # CSV datasets used for crop centroid training
├── models/               # Model definitions & documentation reference
├── metadata.json         # Platform configuration metadata
├── .env.example          # Environment variable template
├── package.json          # Node.js dependencies & scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite bundler configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** or **bun** / **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-agriculture-assistant.git
cd smart-agriculture-assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the environment template and configure your API keys:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Google Gemini API key (Required for AI Vision Leaf Diagnostics)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL (Default for local development)
APP_URL="http://localhost:3000"

# Optional OpenWeatherMap key (Defaults to free Open-Meteo API if left blank)
OPENWEATHERMAP_API_KEY=""
```

> 🔑 **Note**: You can get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user session |
| `POST` | `/api/auth/login` | Authenticate existing user |
| `POST` | `/api/soil-health/analyze` | Run soil NPK + Climate ML crop prediction engine |
| `POST` | `/api/diagnose-disease` | Upload image for Gemini AI leaf disease analysis |
| `GET` | `/api/weather/live` | Fetch live localized weather via Open-Meteo |
| `GET` | `/api/soil-health/history` | Retrieve saved soil health analysis logs |
| `DELETE`| `/api/soil-health/delete` | Delete a specific analysis record |
| `GET` | `/api/health` | System health check endpoint |

---

## 🧠 How the ML Prediction Engine Works

The core ML algorithm uses a normalized Euclidean distance function calculated across 7 agricultural dimensions:

$$\text{Distance} = \sqrt{ \sum_{i=1}^{7} w_i \cdot \left( \frac{X_i - C_{i}}{\sigma_i} \right)^2 }$$

Where:
- $X_i$ represents the user's input parameter (e.g. Nitrogen level, pH, Rainfall).
- $C_i$ is the target crop centroid baseline derived from agricultural field datasets.
- $\sigma_i$ is the feature scaling standard deviation to prevent high-magnitude metrics (like rainfall) from overwhelming smaller metrics (like pH).
- $w_i$ represents domain feature weights prioritizing primary limiting factors (e.g., Nitrogen & Water requirements).

The crop with the smallest distance is selected as the **Primary Recommended Crop**, while secondary candidates are presented with relative match percentages. Expected yield bounds ($\text{MinYield}$ – $\text{MaxYield}$) are dynamically calibrated according to soil parameter alignment.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check out the [issues page](../../issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.
