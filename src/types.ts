export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface CropPrediction {
  id: string;
  userId: string;
  username: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  pH: number;
  rainfall: number;
  recommendedCrop: string;
  predictedYield: number; // tons per hectare
  fertilizerRecommendation: string;
  createdAt: string;
}

export interface DiseasePrediction {
  id: string;
  userId: string;
  username: string;
  diseaseName: string;
  confidence: number;
  description: string;
  treatment: string[];
  prevention: string[];
  imageUrl: string;
  createdAt: string;
}

export interface DiseaseDetail {
  id: string;
  diseaseName: string;
  cropType: string;
  description: string;
  treatment: string[];
  prevention: string[];
}

export interface SystemStats {
  totalUsers: number;
  totalCropPredictions: number;
  totalDiseasePredictions: number;
  totalDiseasesDb: number;
}
