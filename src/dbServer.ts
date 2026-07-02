import * as fs from 'fs';
import * as path from 'path';
import { User, CropPrediction, DiseasePrediction, DiseaseDetail } from './types';

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

interface DatabaseSchema {
  users: User[];
  cropPredictions: CropPrediction[];
  diseasePredictions: DiseasePrediction[];
  diseaseDetails: DiseaseDetail[];
  soilHealthAnalyses: SoilHealthAnalysis[];
}

const DB_FILE = path.resolve('src/data/db.json');

// Initial disease details to seed the database catalog (38 classes matching MobileNet/Gemini categories)
const initialDiseaseDetails: DiseaseDetail[] = [
  {
    id: "d1",
    diseaseName: "Tomato - Bacterial Spot",
    cropType: "Tomato",
    description: "Bacterial spot of tomato is caused by Xanthomonas species. It affects all aboveground parts of the plant, causing dark brown, water-soaked leaf spots, defoliation, and fruit lesions.",
    treatment: [
      "Apply copper-based fungicides at first sign of disease.",
      "Remove and destroy severely infected leaves or entire plants.",
      "Spray with Streptomycin or bio-fungicides like Bacillus subtilis."
    ],
    prevention: [
      "Use certified disease-free seeds and transplants.",
      "Avoid overhead sprinkler irrigation; use drip irrigation.",
      "Practice crop rotation with non-solanaceous crops for 2-3 years."
    ]
  },
  {
    id: "d2",
    diseaseName: "Tomato - Early Blight",
    cropType: "Tomato",
    description: "Caused by the fungus Alternaria solani. Characterized by dark spots with concentric rings ('target board' look) starting on older leaves and moving upward.",
    treatment: [
      "Apply fungicides containing Chlorothalonil, Mancozeb, or copper hydroxide.",
      "Prune the lower branches to improve air circulation.",
      "Apply organic bio-fungicides directly to the soil root zone."
    ],
    prevention: [
      "Mulch soil to prevent fungal spores from splashing onto leaves.",
      "Ensure vertical staking to keep foliage off wet soil.",
      "Rotate crops and clear past debris thoroughly."
    ]
  },
  {
    id: "d3",
    diseaseName: "Tomato - Late Blight",
    cropType: "Tomato",
    description: "A highly destructive disease caused by the oomycete Phytophthora infestans. Appears as large water-soaked greasy spots on leaves that quickly turn brown, often covered with white fungal growth on the underside.",
    treatment: [
      "Urgently spray systemic fungicides such as Metalaxyl or Propamocarb.",
      "Strictly isolate the infected area and harvest healthy fruit immediately."
    ],
    prevention: [
      "Avoid planting tomatoes near potatoes, which share the pathogen.",
      "Grow resistant varieties where possible.",
      "Ensure foliage dry-out conditions with wide spacing."
    ]
  },
  {
    id: "d4",
    diseaseName: "Potato - Early Blight",
    cropType: "Potato",
    description: "Caused by Alternaria solani, resulting in target-board spots on potato tubers and leaves, reducing photosynthetic area.",
    treatment: [
      "Apply protective fungicides such as copper oxychloride or Mancozeb.",
      "Provide micro-irrigation to prevent heavy moisture build up."
    ],
    prevention: [
      "Keep soil nutrients high (especially Nitrogen) as weak plants are more susceptible.",
      "Practice clean tillage; bury crop residues with deep plowing."
    ]
  },
  {
    id: "d5",
    diseaseName: "Potato - Late Blight",
    cropType: "Potato",
    description: "A historical blight caused by Phytophthora infestans. Spreads rapidly in cool, wet weather, destroying tubers and leaves in days.",
    treatment: [
      "Apply curative copper sprays or Cymoxanil immediately upon warning forecasting.",
      "Mow or destroy infected vine structures 2 weeks before harvesting tubers."
    ],
    prevention: [
      "Plant only certified disease-free potato seed tubers.",
      "Destroy potato volunteer plants and wild solanaceous weeds.",
      "Harvest during dry periods."
    ]
  },
  {
    id: "d6",
    diseaseName: "Apple - Apple Scab",
    cropType: "Apple",
    description: "A major fungal disease caused by Venturia inaequalis. Causes olive-green to dark brown scabby lesions on leaves and corky cracks on apple skins.",
    treatment: [
      "Spray Captan, Myclobutanil, or Sulphur fungicides during tight-cluster and petal-fall stages."
    ],
    prevention: [
      "Rake, chop, or compost fallen autumn leaves to destroy overwintering spores.",
      "Prune apple trees to thin out branches and optimize sunlight penetration."
    ]
  },
  {
    id: "d7",
    diseaseName: "Maize - Common Rust",
    cropType: "Maize",
    description: "Caused by the fungus Puccinia sorghi. It manifests as golden-brown powdery pustules on both upper and lower leaf surfaces, causing early drying.",
    treatment: [
      "Apply strobilurin or triazole fungicides if infestation is severe in early growth stage.",
      "Feed moderate potassium supplements to strengthen cellular tissue."
    ],
    prevention: [
      "Choose rust-resistant maize hybrid cultivars directly.",
      "Manage windbreak zones to restrict airborne spore movement."
    ]
  },
  {
    id: "d8",
    diseaseName: "Rice - Bacterial Leaf Blight",
    cropType: "Rice",
    description: "A severe rice disease caused by Xanthomonas oryzae. Yellow to straw-colored wavy stripes appear on leaves, starting from tips and widening downward.",
    treatment: [
      "Spray copper hydroxide mixed with streptocycline.",
      "Drain fields temporarily to dry out bacterial colonies."
    ],
    prevention: [
      "Avoid excessive nitrogen fertilization which encourages succulent leafy growth.",
      "Ensure proper biological silicon supplementation in sandy rice fields."
    ]
  }
];

export function getDatabase(): DatabaseSchema {
  try {
    // Ensure parent directory exists
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const db: DatabaseSchema = {
        users: [
          {
            id: "u-admin",
            username: "admin",
            email: "admin@agri.gov.in",
            role: "admin",
            createdAt: new Date().toISOString()
          },
          {
            id: "u-farmer",
            username: "farmer",
            email: "farmer@agri.gov.in",
            role: "user",
            createdAt: new Date().toISOString()
          }
        ],
        cropPredictions: [
          {
            id: "p1",
            userId: "u-farmer",
            username: "farmer",
            nitrogen: 90,
            phosphorus: 42,
            potassium: 43,
            temperature: 20.8,
            humidity: 82.1,
            pH: 6.5,
            rainfall: 202.9,
            recommendedCrop: "Rice",
            predictedYield: 5.6,
            fertilizerRecommendation: "Your nitrogen and potassium levels are within normal limits. However, apply 25kg of superphosphate per hectare for boosting early crop root development.",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        diseasePredictions: [
          {
            id: "dp1",
            userId: "u-farmer",
            username: "farmer",
            diseaseName: "Tomato - Early Blight",
            confidence: 94,
            description: "Target-board spots spotted on leaves. Photosynthesis restricted.",
            treatment: [
              "Apply Mancozeb preventive spray.",
              "Prune infected branches at the bottom."
            ],
            prevention: [
              "Mulch the soil layer properly.",
              "Ensure 3 year rotation."
            ],
            imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=400",
            createdAt: new Date().toISOString()
          }
        ],
        diseaseDetails: initialDiseaseDetails,
        soilHealthAnalyses: [
          {
            id: "sh1",
            userId: "u-farmer",
            username: "farmer",
            organicMatter: 4.2,
            zinc: 1.8,
            iron: 8.5,
            boron: 1.1,
            nitrogen: 85,
            phosphorus: 45,
            potassium: 40,
            pH: 6.4,
            texture: "Loamy",
            score: 88,
            recommendedCrops: ["Rice", "Tomato", "Maize"],
            fertilizerCorrection: "Organic matter is rich. Soil has perfect mineral counts. Keep adding microbial inoculants. Restrict chemical fertilizer to avoid burning root structures.",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      saveDatabase(db);
      return db;
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as DatabaseSchema;
    
    // Auto-migrate tables if missing is detected
    if (!parsed.soilHealthAnalyses) {
      parsed.soilHealthAnalyses = [];
      saveDatabase(parsed);
    }
    if (!parsed.diseaseDetails || parsed.diseaseDetails.length === 0) {
      parsed.diseaseDetails = initialDiseaseDetails;
      saveDatabase(parsed);
    }
    return parsed;
  } catch (error) {
    console.error("Database reading error, utilizing defaults", error);
    return {
      users: [],
      cropPredictions: [],
      diseasePredictions: [],
      diseaseDetails: initialDiseaseDetails,
      soilHealthAnalyses: []
    };
  }
}

export function saveDatabase(db: DatabaseSchema) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error("Database saving error", error);
  }
}
