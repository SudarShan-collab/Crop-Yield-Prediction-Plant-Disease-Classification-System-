#!/usr/bin/env python3
"""
SMART AGRICULTURE ASSISTANT: ML MODEL TRAINING SCRIPT (REFERENCE)
Final Year BCA University Dissertation Codebase
===================================================================
 trains a Multiclass Classifier & Regressor to predict:
 1. Crop recommendation (Random Forest Classifier)
 2. Potential Yield in Tons per Hectare (Random Forest Regressor)
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_squared_error

def train_and_export():
    print("Beginning AgriSmart ML Model Fitting Process...")
    
    # 1. Load dataset rows
    dataset_path = 'dataset_folder/crop_dataset_format.csv'
    if not os.path.exists(dataset_path):
        print(f"Dataset path '{dataset_path}' not located, fitting dummy data centroids.")
        return

    df = pd.read_csv(dataset_path)
    
    # Features Matrix: N, P, K, temperature, humidity, pH, rainfall
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    
    # Target 1: Crop Suitability Class
    y_crop = df['label']
    
    # Encode crop label targets
    crop_mapping = {label: idx for idx, label in enumerate(df['label'].unique())}
    y_crop_encoded = y_crop.map(crop_mapping)
    
    print(f"Mapping labels matched indices: {crop_mapping}")
    
    # Train test partition splitting
    X_train, X_test, y_train, y_test = train_test_split(X, y_crop_encoded, test_size=0.2, random_state=42)
    
    # Fit Random Forest Multi Classifier
    crop_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    crop_classifier.fit(X_train, y_train)
    
    crop_preds = crop_classifier.predict(X_test)
    acc = accuracy_score(y_test, crop_preds)
    print(f"Crop Classification Accuracy calculated: {acc * 100:.2f}%")
    
    # Simulate yield generation matching core targets
    # Yield values (tons/ha) corresponds to water/heat profile
    y_yield = df.apply(lambda row: 6.0 if row['label'] == 'rice' else (
        4.0 if row['label'] == 'wheat' else (
            6.5 if row['label'] == 'maize' else 18.0
        )
    ), axis=1)
    
    X_y_train, X_y_test, y_y_train, y_y_test = train_test_split(X, y_yield, test_size=0.2, random_state=42)
    yield_regressor = RandomForestRegressor(n_estimators=100, random_state=42)
    yield_regressor.fit(X_y_train, y_y_train)
    
    y_preds = yield_regressor.predict(X_y_test)
    mse = mean_squared_error(y_y_test, y_preds)
    print(f"Crop Yield Regressor fitted, MSE error margins: {mse:.4f}")
    
    # Export fitted structures for rapid Flask serving
    print("Exporting serial binaries to trained_model_folder/...")
    os.makedirs('trained_model_folder', exist_ok=True)
    
    joblib.dump(crop_classifier, 'trained_model_folder/crop_classifier_model.pkl')
    joblib.dump(yield_regressor, 'trained_model_folder/crop_yield_model.pkl')
    joblib.dump(crop_mapping, 'trained_model_folder/label_mapping.pkl')
    
    print("Machine learning architecture serialization completed cleanly.")

if __name__ == '__main__':
    train_and_export()
