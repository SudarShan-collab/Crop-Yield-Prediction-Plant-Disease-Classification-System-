import fs from 'fs';
import path from 'path';
import { User, CropPrediction, DiseasePrediction, DiseaseDetail } from './src/types';

export interface SoilHealthAnalysis {
  id: string;
  userId: string;
  username: string;
  organicMatter: number;
  zinc: number;
  iron: number;
  boron: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pH: number;
  texture: string;
  score: number;
  recommendedCrops: string[];
  fertilizerCorrection: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  cropPredictions: CropPrediction[];
  diseasePredictions: DiseasePrediction[];
  diseaseDetails: DiseaseDetail[];
  soilHealthAnalyses: SoilHealthAnalysis[];
}

const DB_PATH = path.resolve('database.json');

const initialDiseases: DiseaseDetail[] = [
  {
    id: "dis-1",
    diseaseName: "Tomato Early Blight (Alternaria solani)",
    cropType: "Tomato",
    description: "A common fungal pathogen causing concentric 'target-like' black spots on older leaves, leading to severe defoliation and yield collapse.",
    treatment: [
      "Apply copper-based fungicides or chlorothalonil immediately upon leaf spotting.",
      "Prune lower foliage to prevent fungal spores from splashing up from the soil."
    ],
    prevention: [
      "Rotate crops annually with non-solanaceous options (e.g., corn or beans).",
      "Sterilize soil beds and clean up all fallen plant debris."
    ]
  },
  {
    id: "dis-2",
    diseaseName: "Potato Late Blight (Phytophthora infestans)",
    cropType: "Potato",
    description: "The historical water-mold strain responsible for the Irish Potato Famine. Appears as dark, water-soaked lesions under high humidity.",
    treatment: [
      "Apply localized systemic fungicides like mancozeb or metalaxyl.",
      "Remove and incinerate infected vines to arrest airborne zoospore dispersal."
    ],
    prevention: [
      "Sow strictly certified, disease-free seed tubers.",
      "Establish deep hilling soil configurations."
    ]
  },
  {
    id: "dis-3",
    diseaseName: "Apple Scab (Venturia inaequalis)",
    cropType: "Apple",
    description: "A virulent airborne fungus causing olive-green velvety lesions on leaves and cracked, corky scabs on outer apple skins.",
    treatment: [
      "Spray preventative lime-sulfur or captan solutions in the early spring cycle.",
      "Apply bio-agents like Bacillus subtilis to limit spore attachment."
    ],
    prevention: [
      "Prune apple branch configurations to promote light penetration.",
      "Plant scab-resistant cultivars."
    ]
  },
  {
    id: "dis-4",
    diseaseName: "Maize Common Rust (Puccinia sorghi)",
    cropType: "Maize",
    description: "Fungal rust producing powdery golden-brown pustules on both upper and lower surface leaf layers, reducing photosynthetic surface area.",
    treatment: [
      "Deploy triazole-class fungicides during initial blister stages on premium crops.",
      "Utilize organic neem-oil extracts to suppress early pustule development."
    ],
    prevention: [
      "Sow high-tolerance rust-resistant hybrid corn genetics.",
      "Till soil deeply post-harvest to speed up decay of fungal resting spores."
    ]
  },
  {
    id: "dis-5",
    diseaseName: "Healthy Crop Leaf",
    cropType: "All Crops",
    description: "No pathogenic activity or physical anomaly detected. Leaf exhibits rich chlorophyll composition, strong cell wall structure, and optimal turgor.",
    treatment: [
      "Maintain active, balanced N-P-K mineral levels to keep defense pathways strong."
    ],
    prevention: [
      "Sustain healthy soil biological activity with organic compost supplements.",
      "Ensure adequate row spacing to regulate canopy humidity levels."
    ]
  }
];

export function getDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      // Basic initialization check for structure safety
      if (!parsed.users) parsed.users = [];
      if (!parsed.cropPredictions) parsed.cropPredictions = [];
      if (!parsed.diseasePredictions) parsed.diseasePredictions = [];
      if (!parsed.diseaseDetails) parsed.diseaseDetails = initialDiseases;
      if (!parsed.soilHealthAnalyses) parsed.soilHealthAnalyses = [];
      return parsed;
    }
  } catch (err) {
    console.warn("Database reload failed or corrupt, building clean state:", err);
  }

  // Return seed database if file does not exist or is corrupt
  const seedDb: DatabaseSchema = {
    users: [
      { id: "usr-1", username: "john_doe", email: "john@agri.org", role: "user", createdAt: new Date().toISOString() },
      { id: "u-admin", username: "admin_agri", email: "admin@agri.gov", role: "admin", createdAt: new Date().toISOString() }
    ],
    cropPredictions: [],
    diseasePredictions: [],
    diseaseDetails: initialDiseases,
    soilHealthAnalyses: []
  };
  saveDatabase(seedDb);
  return seedDb;
}

export function saveDatabase(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error("Critical: Could not synchronize local JSON dataset:", err);
  }
}
