# 🌾 Crop Yield Prediction & Plant Disease Classification System

An AI-powered agricultural decision-support web app that predicts crop yield from soil and weather data and detects plant diseases from leaf images — built to help farmers make faster, data-driven decisions without needing lab access or expert consultation.

**Live app:** https://ai.studio/apps/b436d6d8-256d-4925-b350-97181ab6ad80

## Overview

Small-scale farmers often lack access to soil testing labs or expert diagnosis, so nutrient imbalances and crop diseases are frequently caught too late to prevent yield loss. This project combines a data-driven yield prediction engine with an AI-powered image classifier to give farmers fast, actionable insights from a simple web interface — estimating crop yield from soil/weather inputs and identifying plant diseases (from a set of 38 categories) directly from a smartphone photo.

## Features

- 🌱 **Crop Yield Prediction** — estimates yield from soil nutrients (N, P, K), pH, and rainfall
- 🍃 **Plant Disease Classification** — detects disease from an uploaded leaf image across 38 disease categories
- 💊 **Treatment Guidance** — returns relevant treatment/prevention suggestions per detected disease
- 🗄️ **Persistent Data** — stores prediction history and reference data via backend database scripts
- 🌐 **Web Interface** — responsive frontend built with Vite + TypeScript

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | TypeScript, Vite |
| Backend | Node.js (`server.ts`, `dbServer.ts`) |
| AI/ML | Google Gemini API, supplementary Python scripts |
| Data | `database_scripts/`, `dataset_folder/`, `models/` |

## Project Structure

```
Crop-Yield-Prediction-Plant-Disease-Classification-System/
├── src/                  # Frontend TypeScript source
├── database_scripts/     # Database setup / query scripts
├── dataset_folder/       # Reference dataset(s)
├── models/               # Model artifacts / configs
├── server.ts             # Main backend server
├── dbServer.ts           # Database server logic
├── index.html            # App entry point
├── package.json          # Node dependencies
├── requirements.txt      # Python dependencies
├── vite.config.ts        # Vite build configuration
├── tsconfig.json
├── metadata.json
└── .env.example          # Template for required environment variables
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A Google Gemini API key ([get one here](https://aistudio.google.com/apikey))
- Python 3.x (for scripts in `requirements.txt`, if used)

### 1. Clone the repository
```bash
git clone https://github.com/SudarShan-collab/Crop-Yield-Prediction-Plant-Disease-Classification-System-.git
cd Crop-Yield-Prediction-Plant-Disease-Classification-System-
```

### 2. Install dependencies
```bash
npm install
```
If the Python scripts are used locally:
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables
Copy `.env.example` to `.env.local` and add your Gemini API key:
```bash
cp .env.example .env.local
```
```
GEMINI_API_KEY=your_api_key_here
```

### 4. Run the app locally
```bash
npm run dev
```

## How It Works

1. **Soil & weather input** — the user enters Nitrogen, Phosphorus, Potassium, pH, temperature, humidity, and rainfall values through the web form.
2. **Yield prediction** — the backend processes these inputs to estimate expected crop yield.
3. **Leaf image upload** — the user uploads a photo of a plant leaf.
4. **Disease classification** — the image is analyzed to identify one of 38 disease categories (or a healthy result), returning a diagnosis and treatment recommendation.

## Future Enhancements

- IoT sensor integration for real-time soil monitoring
- Live weather API integration for dynamic yield adjustments
- Expanded dataset coverage for more regional crops

## Author

**Sudarshan S** — BCA Student, Kongunadu Arts and Science College, Coimbatore
📧 sudarshan554411@gmail.com
