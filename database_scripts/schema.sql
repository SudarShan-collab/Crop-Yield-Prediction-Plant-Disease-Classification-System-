-- ====================================================================
-- SMART AGRICULTURE ASSISTANT: DATABASE SCHEMA (MYSQL / MARIADB)
-- Final Year BCA Project Submission Reference File
-- ====================================================================

CREATE DATABASE IF NOT EXISTS smart_agri_db;
USE smart_agri_db;

-- Table 1: Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 2: Crop_Predictions
CREATE TABLE IF NOT EXISTS crop_predictions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    nitrogen INT NOT NULL,
    phosphorus INT NOT NULL,
    potassium INT NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    ph_level DECIMAL(4,2) NOT NULL,
    rainfall DECIMAL(6,2) NOT NULL,
    recommended_crop VARCHAR(50) NOT NULL,
    predicted_yield DECIMAL(5,2) NOT NULL,
    fertilizer_recommendation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 3: Disease_Details (Encyclopedia Catalog)
CREATE TABLE IF NOT EXISTS disease_details (
    id VARCHAR(36) PRIMARY KEY,
    disease_name VARCHAR(100) NOT NULL UNIQUE,
    crop_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    treatment_remedies TEXT NOT NULL,
    prevention_measures TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 4: Disease_Predictions (Foliar leaf scan transactions)
CREATE TABLE IF NOT EXISTS disease_predictions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    disease_name VARCHAR(100) NOT NULL,
    confidence INT NOT NULL,
    description TEXT NOT NULL,
    treatment TEXT NOT NULL,
    prevention TEXT NOT NULL,
    image_url LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table 5: Soil_Health_Analyses
CREATE TABLE IF NOT EXISTS soil_health_analyses (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    organic_matter DECIMAL(4,2) NOT NULL,
    zinc_content DECIMAL(4,2) NOT NULL,
    iron_content DECIMAL(4,2) NOT NULL,
    boron_content DECIMAL(4,2) NOT NULL,
    nitrogen INT NOT NULL,
    phosphorus INT NOT NULL,
    potassium INT NOT NULL,
    pH DECIMAL(4,2) NOT NULL,
    soil_texture VARCHAR(30) NOT NULL,
    health_score INT NOT NULL,
    recommended_crops TEXT NOT NULL,
    fertilizer_correction TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================================
-- Initial Default Seed Data insertions
-- ====================================================================

-- Insertion of default Admin and standard Farmer account (MD5 Hash representations)
INSERT IGNORE INTO users (id, username, email, password_hash, role) VALUES 
('u-admin', 'admin', 'admin@agri.gov.in', '21232f297a57a5a743894a0e4a801fc3', 'admin'),
('u-farmer', 'joseph', 'farmer@agri.gov.in', 'fcea920f7412b5da7be0cf42b8c93759', 'user');

-- Insertion of a base crop suitability search entry
INSERT IGNORE INTO crop_predictions (id, user_id, nitrogen, phosphorus, potassium, temperature, humidity, ph_level, rainfall, recommended_crop, predicted_yield, fertilizer_recommendation) VALUES
('cp-seed-01', 'u-farmer', 90, 42, 43, 20.80, 82.10, 6.50, 202.90, '🌾 Rice', 5.62, 'Apply organic compost or lime to buffer early development.');
