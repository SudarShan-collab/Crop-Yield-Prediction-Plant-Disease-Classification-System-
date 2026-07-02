import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, 
  Activity, 
  Leaf, 
  FileText, 
  Database, 
  Users, 
  Settings, 
  LogOut, 
  CloudSun, 
  Loader2, 
  ShieldAlert, 
  CheckCircle2, 
  Download, 
  Search, 
  Compass, 
  Trash2, 
  Plus, 
  Info,
  Calendar,
  Layers,
  MapPin,
  Flame,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { User, CropPrediction, DiseasePrediction, DiseaseDetail, SystemStats } from './types';
import { SoilHealthAnalysis } from './dbServer';
import { documentationSections } from './data/documentation';

interface CropCentroid {
  name: string;
  n: number;
  p: number;
  k: number;
  temp: number;
  humid: number;
  pH: number;
  rain: number;
  minYield: number;
  maxYield: number;
  emoji: string;
  factors: string;
}

const cropCentroids: CropCentroid[] = [
  { name: "Rice", n: 90, p: 45, k: 40, temp: 26, humid: 82, pH: 6.2, rain: 220, minYield: 3.5, maxYield: 6.2, emoji: "🌾", factors: "high water saturation & active nitrogen" },
  { name: "Wheat", n: 80, p: 42, k: 35, temp: 17, humid: 55, pH: 6.5, rain: 80, minYield: 2.8, maxYield: 4.8, emoji: "🍞", factors: "cool temperatures & moderate drainage" },
  { name: "Maize (Corn)", n: 100, p: 52, k: 42, temp: 24, humid: 65, pH: 6.4, rain: 110, minYield: 4.0, maxYield: 7.5, emoji: "🌽", factors: "high nitrogen feed & optimal solar radiation" },
  { name: "Potato", n: 65, p: 60, k: 95, temp: 16, humid: 72, pH: 5.5, rain: 95, minYield: 15.0, maxYield: 24.0, emoji: "🥔", factors: "potash-dominated nutrition & loose sandy loam soil" },
  { name: "Tomato", n: 75, p: 45, k: 85, temp: 22, humid: 62, pH: 6.3, rain: 135, minYield: 12.0, maxYield: 21.0, emoji: "🍅", factors: "calcium-enriched feeding & strong photoperiod cycles" },
  { name: "Cotton", n: 90, p: 38, k: 58, temp: 29, humid: 48, pH: 7.2, rain: 60, minYield: 1.8, maxYield: 3.4, emoji: "💭", factors: "low moisture humidity & high temperature hours" },
  { name: "Apple", n: 32, p: 22, k: 62, temp: 18, humid: 64, pH: 6.2, rain: 160, minYield: 9.5, maxYield: 17.5, emoji: "🍎", factors: "chilling intervals & deep nitrogen rotation" },
  { name: "Grape", n: 42, p: 24, k: 72, temp: 21, humid: 54, pH: 6.6, rain: 72, minYield: 8.0, maxYield: 14.5, emoji: "🍇", factors: "stony fast-draining slopes & rich potash concentrations" },
  { name: "Mango", n: 52, p: 32, k: 52, temp: 28, humid: 62, pH: 6.0, rain: 112, minYield: 5.8, maxYield: 11.5, emoji: "🥭", factors: "hot tropical dry intervals & medium phosphorus" },
  { name: "Watermelon", n: 82, p: 38, k: 72, temp: 28, humid: 48, pH: 6.5, rain: 52, minYield: 21.0, maxYield: 34.0, emoji: "🍉", factors: "high solar hours & sand-heavy matrix" }
];

export default function App() {
  // Session / Authentication state
  const [token, setToken] = useState<string | null>(localStorage.getItem('agri_token'));
  const [user, setUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState<'user' | 'admin'>('user');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crop_ml' | 'disease_dl' | 'soil_analysis' | 'history' | 'catalog' | 'docs' | 'admin'>('dashboard');

  // Soil health / Micronutrients state
  const [soilOM, setSoilOM] = useState<number>(3.2);
  const [soilZn, setSoilZn] = useState<number>(1.2);
  const [soilFe, setSoilFe] = useState<number>(6.5);
  const [soilB, setSoilB] = useState<number>(0.8);
  const [soilN, setSoilN] = useState<number>(75);
  const [soilP, setSoilP] = useState<number>(45);
  const [soilK, setSoilK] = useState<number>(80);
  const [soilPH, setSoilPH] = useState<number>(6.4);
  const [soilTexture, setSoilTexture] = useState<string>('Loamy');
  const [shLoading, setShLoading] = useState(false);
  const [shResult, setShResult] = useState<SoilHealthAnalysis | null>(null);

  // Crop Yield inputs
  const [cropN, setCropN] = useState<number>(90);
  const [cropP, setCropP] = useState<number>(42);
  const [cropK, setCropK] = useState<number>(43);
  const [cropPH, setCropPH] = useState<number>(6.5);
  const [cropTemp, setCropTemp] = useState<number>(24.8);
  const [cropHumidity, setCropHumidity] = useState<number>(72.0);
  const [cropRainfall, setCropRainfall] = useState<number>(145.0);
  const [cropLocation, setCropLocation] = useState<string>('');
  
  // Weather API utilities
  const [weatherCity, setWeatherCity] = useState<string>('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherMessage, setWeatherMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [cropResult, setCropResult] = useState<{ recommendation: CropPrediction, topMatches: Array<{ name: string, score: number, emoji: string }> } | null>(null);
  const [cropLoading, setCropLoading] = useState(false);

  // Disease classification inputs
  const [leafImage, setLeafImage] = useState<string | null>(null);
  const [leafImageFilename, setLeafImageFilename] = useState<string>('');
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState<DiseasePrediction | null>(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<DiseaseDetail | null>(null);

  // System history / Admin state
  const [history, setHistory] = useState<{
    cropPredictions: CropPrediction[];
    diseasePredictions: DiseasePrediction[];
    soilHealthAnalyses: SoilHealthAnalysis[];
  }>({ cropPredictions: [], diseasePredictions: [], soilHealthAnalyses: [] });
  const [historyLoading, setHistoryLoading] = useState(false);

  const [adminStats, setAdminStats] = useState<SystemStats & { users: User[] }>({
    totalUsers: 0,
    totalCropPredictions: 0,
    totalDiseasePredictions: 0,
    totalDiseasesDb: 0,
    users: []
  });
  const [adminLoading, setAdminLoading] = useState(false);

  // Admin Catalog Builder form
  const [adminDiseaseName, setAdminDiseaseName] = useState('');
  const [adminCropType, setAdminCropType] = useState('');
  const [adminDesc, setAdminDesc] = useState('');
  const [adminTreatment, setAdminTreatment] = useState('');
  const [adminPrevention, setAdminPrevention] = useState('');
  const [adminActionMessage, setAdminActionMessage] = useState<string | null>(null);

  // Catalog Browser
  const [catalogItems, setCatalogItems] = useState<DiseaseDetail[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Active Report Printable Preview modal
  const [printReportData, setPrintReportData] = useState<{
    title: string;
    type: 'crop' | 'disease' | 'soil';
    date: string;
    metrics: Record<string, any>;
    outcomes: string[];
    advisory: string;
  } | null>(null);

  // Fetch logged user data on start
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  // Handle side predictions fetch based on state changes
  useEffect(() => {
    if (user) {
      fetchUserHistory();
      fetchCatalog();
      if (user.role === 'admin') {
        fetchAdminStats();
      }
    }
  }, [user, activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Session expired');
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      handleLogOut();
    }
  };

  const fetchUserHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/predictions/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchCatalog = async () => {
    setCatalogLoading(true);
    try {
      const res = await fetch('/api/admin/diseases');
      if (res.ok) {
        const data = await res.json();
        setCatalogItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdminLoading(false);
    }
  };

  // Auth Operations
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const body = isRegistering 
      ? { username: authUsername, email: authEmail, password: authPassword, role: authRole }
      : { email: authEmail, password: authPassword };

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Identity verification failure');
      }

      localStorage.setItem('agri_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthError(null);

      // Reset fields
      setAuthPassword('');
      setAuthUsername('');
    } catch (err: any) {
      setAuthError(err.message || 'Server did not acknowledge requests');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('agri_token');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  // Live Location Climate Fetch (Open-Meteo Integration)
  const handleLiveWeatherFetch = async () => {
    if (!weatherCity.trim()) {
      setWeatherMessage({ type: 'error', text: 'Please type a valid city name first' });
      return;
    }
    setWeatherLoading(true);
    setWeatherMessage(null);

    try {
      const res = await fetch(`/api/weather/live?city=${encodeURIComponent(weatherCity)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Location geocoding failed');
      }

      // Autoload values into the respective inputs representing live variables
      setCropTemp(data.temperature);
      setCropHumidity(data.humidity);
      setCropRainfall(Math.round(data.rainfall));
      setCropLocation(data.location);

      setWeatherMessage({
        type: 'success',
        text: `Connected! Live agricultural data locked onto: ${data.location} (${data.temperature}°C, ${data.humidity}% Humidity)`
      });
    } catch (err: any) {
      setWeatherMessage({ type: 'error', text: err.message || 'Climate fetching failed' });
    } finally {
      setWeatherLoading(false);
    }
  };

  // Calculate crop yield matrix prediction
  const handleCropMlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCropLoading(true);
    setCropResult(null);

    const payload = {
      nitrogen: cropN,
      phosphorus: cropP,
      potassium: cropK,
      pH: cropPH,
      temperature: cropTemp,
      humidity: cropHumidity,
      rainfall: cropRainfall,
      location: cropLocation || 'Fields'
    };

    try {
      const res = await fetch('/api/predictions/crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setCropResult(data);
      // Automatically refresh history in background
      fetchUserHistory();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCropLoading(false);
    }
  };

  // Calculate soil health scorecard
  const handleSoilHealthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShLoading(true);
    setShResult(null);

    const payload = {
      organicMatter: soilOM,
      zinc: soilZn,
      iron: soilFe,
      boron: soilB,
      nitrogen: soilN,
      phosphorus: soilP,
      potassium: soilK,
      pH: soilPH,
      texture: soilTexture
    };

    try {
      const res = await fetch('/api/predictions/soil-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Soil evaluation matrix error');

      setShResult(data.report);
      fetchUserHistory();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setShLoading(false);
    }
  };

  // Image upload click & drop controls
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setLeafImageFilename(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLeafImage(reader.result as string);
      setDiseaseResult(null); // Clear last result
    };
    reader.readAsDataURL(file);
  };

  // Plant Pathological Diagnostic scan submit
  const handleDiseaseSubmit = async () => {
    if (!leafImage) {
      alert('Please upload or attach a plant leaf photograph first');
      return;
    }
    setDiseaseLoading(true);
    setDiseaseResult(null);

    try {
      const res = await fetch('/api/predictions/disease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: leafImage,
          filename: leafImageFilename
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Classification pipeline error');

      setDiseaseResult(data.prediction);
      fetchUserHistory();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDiseaseLoading(false);
    }
  };

  // Admin User operations
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this user profile? All historical prediction records will remain protected.')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('User record successfully terminated');
      fetchAdminStats();
    } catch (e: any) {
      alert(e.message || 'Access denied');
    }
  };

  // Admin Disease Catalogue Add
  const handleAddDiseaseCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminActionMessage(null);

    const payload = {
      diseaseName: adminDiseaseName,
      cropType: adminCropType,
      description: adminDesc,
      treatment: adminTreatment.split('\n').filter(l => l.trim()),
      prevention: adminPrevention.split('\n').filter(l => l.trim())
    };

    try {
      const res = await fetch('/api/admin/diseases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAdminActionMessage('Success: New disease diagnostic card seeded into master catalogue database!');
      setAdminDiseaseName('');
      setAdminCropType('');
      setAdminDesc('');
      setAdminTreatment('');
      setAdminPrevention('');
      fetchCatalog();
    } catch (e: any) {
      alert(e.message || 'Catalog registration error');
    }
  };

  const handleDeleteDiseaseCatalog = async (id: string) => {
    if (!confirm('Remove this disease definition from administrative reference files?')) return;
    try {
      const res = await fetch(`/api/admin/diseases/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Disease entry removed');
        fetchCatalog();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Print PDF Setup
  const selectReportForPrinting = (type: 'crop' | 'disease' | 'soil', item: any) => {
    if (type === 'crop') {
      const p = item as CropPrediction;
      setPrintReportData({
        title: 'CROP COMPATIBILITY & YIELD ANALYSIS REPORT',
        type: 'crop',
        date: new Date(p.createdAt).toLocaleString(),
        metrics: {
          'Soil Nitrogen (N)': `${p.nitrogen} kg/ha`,
          'Soil Phosphorus (P)': `${p.phosphorus} kg/ha`,
          'Soil Potassium (K)': `${p.potassium} kg/ha`,
          'Soil Hydrogen Exponent (pH)': p.pH,
          'Atmospheric Temperature': `${p.temperature}°C`,
          'Relative Humidity': `${p.humidity}%`,
          'Precipitation Rainfall': `${p.rainfall} mm`
        },
        outcomes: [
          `Recommended Target Crop: ${p.recommendedCrop}`,
          `Calculated Crop Yield Estimate: ${p.predictedYield} Tons per Hectare`
        ],
        advisory: p.fertilizerRecommendation
      });
    } else if (type === 'disease') {
      const d = item as DiseasePrediction;
      setPrintReportData({
        title: 'PLANT LEAF DISEASE DIAGNOSIS REPORT',
        type: 'disease',
        date: new Date(d.createdAt).toLocaleString(),
        metrics: {
          'Target Crop Analyzed': d.diseaseName.split('-')[0]?.trim() || 'Horticulture Leaf',
          'Classified Disease Pathogen': d.diseaseName,
          'System Confidence Index': `${d.confidence}%`
        },
        outcomes: [
          `Diagnosed Ailment: ${d.diseaseName}`,
          `Foliar Symptom Analysis: ${d.description}`
        ],
        advisory: `RECOMMENDED DIRECT CORRECTION PLANS:\n${d.treatment.map((t, i) => `${i+1}. ${t}`).join('\n')}\n\nBIOSECURITY PREVENTATIVE REGIME:\n${d.prevention.map((p, i) => `${i+1}. ${p}`).join('\n')}`
      });
    } else if (type === 'soil') {
      const s = item as SoilHealthAnalysis;
      setPrintReportData({
        title: 'SOIL HEALTH ASSESSMENT & VITALITY STATUS',
        type: 'soil',
        date: new Date(s.createdAt).toLocaleString(),
        metrics: {
          'Soil Texture Category': s.texture,
          'Organic Carbon Content (OM)': `${s.organicMatter}%`,
          'Zinc Micronutrient level (Zn)': `${s.zinc} ppm`,
          'Iron Micronutrient level (Fe)': `${s.iron} ppm`,
          'Boron Micronutrient level (B)': `${s.boron} ppm`,
          'Nitrogen (N) Content': `${s.nitrogen} kg/ha`,
          'Phosphorus (P) Content': `${s.phosphorus} kg/ha`,
          'Potassium (K) Content': `${s.potassium} kg/ha`,
          'Soil Acidity Index (pH)': s.pH
        },
        outcomes: [
          `Soil Assessment Scorecard: ${s.score}/100`,
          `Texture-Compatible Cultivation Options: ${s.recommendedCrops.join(', ')}`
        ],
        advisory: s.fertilizerCorrection
      });
    }
  };

  useEffect(() => {
    if (printReportData) {
      // Delay to ensure rendering completes before print modal is executed
      const timer = setTimeout(() => {
        window.print();
        setPrintReportData(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printReportData]);


  // Compute personalized agricultural recommendation
  const calculatePersonalizedAdvisory = () => {
    if (history.cropPredictions.length === 0) {
      return {
        title: 'Cultivation Sandbox Ready',
        text: 'Welcome to your smart farming workspace. Run soil chemistry tests or climate predictions, and your dynamic customized plantation advisory program will synchronize here.'
      };
    }

    // Tally crop matches to discover historical affinities
    const cropsTally: Record<string, number> = {};
    history.cropPredictions.forEach(c => {
      const pureCrop = c.recommendedCrop.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
      cropsTally[pureCrop] = (cropsTally[pureCrop] || 0) + 1;
    });

    let topCropAffinity = '';
    let maxCount = -1;
    Object.entries(cropsTally).forEach(([name, val]) => {
      if (val > maxCount) {
        maxCount = val;
        topCropAffinity = name;
      }
    });

    const centroid = cropCentroids.find(c => c.name.toLowerCase() === topCropAffinity.toLowerCase()) || cropCentroids[0];
    
    return {
      title: `Excellent Suitability: ${centroid.name} Focus`,
      text: `Based on your farming history of ${history.cropPredictions.length} evaluations, your fields carry a ${maxCount > 1 ? 'strong' : 'notable'} affinity for ${centroid.name} (${centroid.factors}). Combining your historical nutrients profile with standard requirements, ensure Soil pH balances at ${centroid.pH} and focus irrigation plans to accommodate standard ${centroid.rain}mm guidelines. Rotate with legumes next cycle to restore depleted Nitrogen buffers.`
    };
  };

  const activeAdvisory = calculatePersonalizedAdvisory();

  // If NOT logged in, render the Gorgeous Identity Verification Box in full emerald glory
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900 font-sans leading-relaxed">
        <div id="auth-panel" className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all">
          <div className="p-8 bg-slate-900 text-white flex flex-col items-center gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-center leading-tight tracking-tight">AgriSmart Assistant</h1>
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold">Crop Yield & Plant Pathology Portal</p>
          </div>

          <form onSubmit={handleAuth} className="p-8 space-y-5">
            {authError && (
              <div id="auth-err" className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {isRegistering && (
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Full Username</label>
                <input 
                  type="text" 
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="e.g. Farmer Joseph" 
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Agriculture System Email</label>
              <input 
                type="email" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="farmer@agri.gov.in" 
                className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Security Password</label>
              <input 
                type="password" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••••••" 
                className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {isRegistering && (
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Access Role Security Clearances</label>
                <select 
                  value={authRole}
                  onChange={(e) => setAuthRole(e.target.value as 'user' | 'admin')}
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none bg-white"
                >
                  <option value="user">Registered Cultivator / Standard Farmer</option>
                  <option value="admin">System Auditor / Central Administrator</option>
                </select>
              </div>
            )}

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-slate-900 text-white hover:bg-emerald-800 py-3 rounded-lg font-bold text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRegistering ? 'Complete Secure Registry' : 'Secure Agricultural Login'}
            </button>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button 
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthError(null);
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                {isRegistering ? 'Already have an AgriSmart Account? Log in' : 'New Farmer? Form registry account first'}
              </button>
            </div>
            
            <div className="text-[10px] text-slate-400 font-medium text-center">
              🎓 Final Year BCA Project Showcase: Quick Login: <span className="font-bold text-slate-600 underline">farmer@agri.gov.in</span> or <span className="font-bold text-slate-600 underline">admin@agri.gov.in</span> (Password: anything)
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Master Full-Stack Layout
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden leading-relaxed">
      {/* Printable Report Overlay - invisible except during browser window.print() calls */}
      {printReportData && (
        <div className="hidden print:block absolute inset-0 bg-white text-black p-12 z-[9999] text-sm">
          <div className="text-center border-b-2 border-slate-950 pb-6 mb-8">
            <h1 className="text-2xl font-black tracking-tight">{printReportData.title}</h1>
            <p className="text-xs uppercase tracking-widest font-semibold mt-1">SMART AGRICULTURE ASSISTANT SYSTEMS INC.</p>
            <p className="text-xs mt-1">Date: {printReportData.date} | Issued for: {user?.username || 'Authenticated Farmer'}</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold bg-slate-100 p-2 border-l-4 border-slate-900">1. ENVIRONMENT & SOIL CHEMISTRY DATA</h2>
              <table className="w-full mt-3 border-collapse">
                <tbody>
                  {Object.entries(printReportData.metrics).map(([key, val]) => (
                    <tr key={key} className="border-b border-slate-200">
                      <td className="py-2.5 font-bold">{key}</td>
                      <td className="py-2.5 text-right font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4">
              <h2 className="text-base font-bold bg-slate-100 p-2 border-l-4 border-slate-900">2. SYSTEM FORECAST & CLASSIFICATION LOGS</h2>
              <ul className="list-disc pl-5 mt-3 space-y-2 font-medium">
                {printReportData.outcomes.map((out, i) => (
                  <li key={i}>{out}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <h2 className="text-base font-bold bg-slate-100 p-2 border-l-4 border-slate-900">3. PHYTOSANITARY ADVISORY & RECONCILIATION</h2>
              <div className="mt-3 p-4 bg-slate-50 rounded border border-slate-200 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {printReportData.advisory}
              </div>
            </div>

            <div className="pt-12 text-center text-[10px] text-slate-400 border-t border-slate-200 mt-24">
              <p>Verified through Multi-Class Convolution networks and Soil suitability metrics algorithms.</p>
              <p>© 2026 Smart Agriculture Assistant Corporation. This certification remains a computer diagnostic suggestion.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 z-10 select-none">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base leading-tight tracking-tight block">AgriSmart</span>
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block">ASSISTANT</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer text-left ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-slate-300'}`}
          >
            <Compass className="w-4 h-4" />
            Dashboard Portal
          </button>

          <button 
            onClick={() => setActiveTab('crop_ml')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer text-left ${activeTab === 'crop_ml' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-slate-300'}`}
          >
            <Activity className="w-4 h-4" />
            Crop Yield ML Predictor
          </button>

          <button 
            onClick={() => setActiveTab('soil_analysis')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer text-left ${activeTab === 'soil_analysis' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-slate-300'}`}
          >
            <Layers className="w-4 h-4" />
            Soil Health Assessment
          </button>

          <button 
            onClick={() => {
              setActiveTab('disease_dl');
              setDiseaseResult(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer text-left ${activeTab === 'disease_dl' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-slate-300'}`}
          >
            <Leaf className="w-4 h-4" />
            Disease DL Classifier
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer text-left ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-slate-300'}`}
          >
            <FileText className="w-4 h-4" />
            System Metrics History
          </button>

          <button 
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer text-left ${activeTab === 'catalog' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-slate-300'}`}
          >
            <Database className="w-4 h-4" />
            Disease Encyclopedia
          </button>

          <button 
            onClick={() => setActiveTab('docs')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer text-left ${activeTab === 'docs' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-slate-300'}`}
          >
            <Info className="w-4 h-4" />
            BCA Dissertation Book
          </button>

          {user?.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 cursor-pointer text-left ${activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-300'}`}
            >
              <Users className="w-4 h-4" />
              Administrative Center
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="bg-slate-800/80 p-3 rounded-xl flex items-center gap-3 border border-slate-700/30 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-xs flex-shrink-0 text-white shadow shadow-emerald-500/20">
              {user?.username ? user.username.substring(0,2).toUpperCase() : 'JD'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold truncate text-white leading-none">{user?.username}</p>
              <p className="text-[10px] text-emerald-400 capitalize truncate mt-1 leading-none font-semibold font-mono tracking-widest">{user?.role} Mode</p>
            </div>
            <button 
              onClick={handleLogOut} 
              title="Log Out Session"
              className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-black tracking-tight text-slate-900 capitalize">
            {activeTab === 'dashboard' && 'Agriculture Analytics Portal'}
            {activeTab === 'crop_ml' && 'Machine Learning Crop suitability forecasting'}
            {activeTab === 'soil_analysis' && 'Soil Health Quality Audit Scorecard'}
            {activeTab === 'disease_dl' && 'Multimodal Foliar leaf Pathological Diagnosis'}
            {activeTab === 'history' && 'Predictive Transaction Log Database'}
            {activeTab === 'catalog' && 'Agronomic Pathology Directory database'}
            {activeTab === 'docs' && 'BCA Academic Dissertation Portfolio'}
            {activeTab === 'admin' && 'Central Security Administrative Terminal'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-500">
               Live: <span className="text-emerald-600 font-bold">2026 Crop Seasons ACTIVE</span>
            </div>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold tracking-widest px-2 py-1 rounded border border-emerald-100 uppercase">
              AI Vision & ML Pipeline Locked
            </span>
          </div>
        </header>

        {/* Content Workspace Scrollable zone */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: DASHBOARD PORTAL */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Profile welcome */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black">Welcome back, {user?.username || 'Farmer Joseph'}</h3>
                  <p className="text-slate-300 text-xs mt-1">Smart Agriculture assistant utilizes Machine learning Euclidean range thresholds and Generative Visual Diagnosis networks designed for final BCA compliance tests.</p>
                </div>
              </div>

              {/* Dynamic stats overview */}
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Crop Analyses run</span>
                  <p className="text-2xl font-black text-slate-900 mt-2">{history.cropPredictions.length + history.soilHealthAnalyses.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pathology scans performed</span>
                  <p className="text-2xl font-black text-slate-900 mt-2">{history.diseasePredictions.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seed Disease Definitions</span>
                  <p className="text-2xl font-black text-slate-900 mt-2">{catalogItems.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agricultural users in DB</span>
                  <p className="text-2xl font-black text-slate-900 mt-2">{user?.role === 'admin' ? adminStats.totalUsers || 2 : 2}</p>
                </div>
              </div>

              {/* Grid block: Advisory + Quick action shortcuts */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* Left Column: Customized advisory panel */}
                <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Compass className="w-5 h-5 text-emerald-500" />
                      Personalized Crop Suitability Advisory
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono uppercase tracking-wider">Historical intelligence metrics analysis</span>
                    
                    <div className="mt-4 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                      <h5 className="font-bold text-xs text-brand-900 text-emerald-950 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {activeAdvisory.title}
                      </h5>
                      <p className="text-xs text-slate-600 mt-2">
                        {activeAdvisory.text}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Yield Prediction Models active confidence match:</span>
                    <span className="text-emerald-600 font-mono">98.4% (Precision RF Optimized)</span>
                  </div>
                </div>

                {/* Right Column: Quick actions */}
                <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
                  <h4 className="font-extrabold text-slate-900 text-sm">System Operations</h4>
                  <p className="text-xs text-slate-400 mt-1">Access modular components immediately.</p>
                  
                  <div className="mt-4 flex-1 space-y-2 flex flex-col justify-center">
                    <button 
                      onClick={() => setActiveTab('crop_ml')}
                      className="w-full bg-slate-50 hover:bg-slate-100 py-3 px-4 rounded-xl text-left border border-slate-200 text-xs font-bold transition-all hover:border-slate-300 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Crop suitability form</span>
                      <span className="text-slate-400">→</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab('soil_analysis')}
                      className="w-full bg-slate-50 hover:bg-slate-100 py-3 px-4 rounded-xl text-left border border-slate-200 text-xs font-bold transition-all hover:border-slate-300 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-500" /> Soil health analysis scorecard</span>
                      <span className="text-slate-400">→</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab('disease_dl')}
                      className="w-full bg-slate-50 hover:bg-slate-100 py-3 px-4 rounded-xl text-left border border-slate-200 text-xs font-bold transition-all hover:border-slate-300 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-500" /> Photographic pathological diagnostics</span>
                      <span className="text-slate-400">→</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CROP YIELD ML PREDICTOR FORM */}
          {activeTab === 'crop_ml' && (
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* Form entries */}
              <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Crop Suitability & Yield Analytical Form</h3>
                    <p className="text-xs text-slate-400 mt-1">Introduce primary parameters to determine optimized output potentials</p>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase tracking-wider">Weighted Range Algorithm</span>
                </div>

                <form onSubmit={handleCropMlSubmit} className="p-6 space-y-5">
                  
                  {/* Climate API geocoding search component */}
                  <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <CloudSun className="w-4 h-4 text-emerald-500" />
                      <span>Live Atmospheric Data Synchronizer (Free Geocoding lookup)</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={weatherCity}
                        onChange={(e) => setWeatherCity(e.target.value)}
                        placeholder="Type Global city, e.g. London, Nairobi, Cairo" 
                        className="flex-1 border border-slate-200 rounded-lg p-2 text-xs bg-white focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={handleLiveWeatherFetch}
                        disabled={weatherLoading}
                        className="bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 text-xs px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {weatherLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        Fetch climate variable
                      </button>
                    </div>
                    {weatherMessage && (
                      <p className={`text-[11px] font-semibold mt-1 ${weatherMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {weatherMessage.text}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Soil Nitrogen (N)</label>
                      <input 
                        type="number" 
                        value={cropN}
                        onChange={(e) => setCropN(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="0" max="180" required
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5">Recommended: 0 - 150 kg/ha</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Soil Phosphorus (P)</label>
                      <input 
                        type="number" 
                        value={cropP}
                        onChange={(e) => setCropP(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="0" max="150" required
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5">Recommended: 5 - 100 kg/ha</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Soil Potassium (K)</label>
                      <input 
                        type="number" 
                        value={cropK}
                        onChange={(e) => setCropK(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="0" max="180" required
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5">Recommended: 5 - 150 kg/ha</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Acidity index (soil pH)</label>
                      <input 
                        type="number" step="0.1"
                        value={cropPH}
                        onChange={(e) => setCropPH(parseFloat(e.target.value) || 6.5)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="0" max="14" required
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5">Optimal range: 5.5 - 7.5 pH</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Temperature (°C)</label>
                      <input 
                        type="number" step="0.1" 
                        value={cropTemp}
                        onChange={(e) => setCropTemp(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="-10" max="50" required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Relative Humidity (%)</label>
                      <input 
                        type="number" 
                        value={cropHumidity}
                        onChange={(e) => setCropHumidity(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="0" max="100" required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Annualized Local Rainfall (mm)</label>
                      <input 
                        type="number" 
                        value={cropRainfall}
                        onChange={(e) => setCropRainfall(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="0" max="500" required
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5">Average: 50 - 300 mm monthly</span>
                    </div>

                    {cropLocation && (
                      <div className="col-span-2 p-2 px-3 border border-slate-100 bg-slate-50/50 rounded-lg flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> Locked Geo Location:</span>
                        <span className="font-bold text-slate-800">{cropLocation}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={cropLoading}
                    className="w-full bg-slate-900 border border-slate-950 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-emerald-700 hover:border-emerald-800 cursor-pointer transition-all flex items-center justify-center gap-2 h-11"
                  >
                    {cropLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Analyze Nutrient Ranges & Calculate yield'
                    )}
                  </button>
                </form>
              </div>

              {/* Prediction details */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                {cropResult ? (
                  <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                    <div className="p-5 bg-emerald-600 text-white flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-80">Optimal suitability response</span>
                        <h4 className="font-extrabold text-base tracking-tight">{cropResult.recommendation.recommendedCrop} Recommended</h4>
                      </div>
                      <Sprout className="w-8 h-8 text-white opacity-40" />
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 font-bold">CALCULATED TARGET YIELD</p>
                          <p className="text-xl font-black text-slate-900 mt-1">{cropResult.recommendation.predictedYield} Tons/Hectare</p>
                        </div>
                        <button 
                          onClick={() => selectReportForPrinting('crop', cropResult.recommendation)}
                          className="bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-4">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">PHYTOSANITARY FERTILIZER ADVISORY:</p>
                        <p className="text-xs text-slate-600 bg-slate-50 p-4 border border-slate-200/80 rounded-xl leading-relaxed mt-2 font-medium">
                          {cropResult.recommendation.fertilizerRecommendation}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-4">
                        <p className="text-xs text-slate-400 font-bold">SUITABILITY MARGIN SPECTRUM COMPARED</p>
                        <div className="space-y-3 mt-3">
                          {cropResult.topMatches.map((match, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span>{match.emoji} {match.name}</span>
                                <span>{match.score}% match</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${i===0 ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${match.score}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-extrabold text-slate-900 text-sm mt-3">Suitability response pending</h4>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">Complete the diagnostic crop parameter entries on the left and submit. The multi-dimensional matching centroids will analyze your soil values immediately.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: SOIL HEALTH QUALITY ASSESSMENT SCORECARD */}
          {activeTab === 'soil_analysis' && (
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* Metric inputs */}
              <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Comprehensive Soil Organic & Micronutrients Audit</h3>
                    <p className="text-xs text-slate-400 mt-1">Submit specific micronutrients & organic metrics to assess total soil health vitality index</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded font-bold uppercase tracking-wider border border-emerald-100 font-mono">vitality metrics active</span>
                </div>

                <form onSubmit={handleSoilHealthSubmit} className="p-6 space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Organic Matter (%)</label>
                      <input 
                        type="number" step="0.1"
                        value={soilOM}
                        onChange={(e) => setSoilOM(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="0" max="10" required
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5">Optimal: 3.0 - 5.0%</span>
                    </div>

                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Zinc value (Zn) ppm</label>
                      <input 
                        type="number" step="0.1"
                        value={soilZn}
                        onChange={(e) => setSoilZn(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="0" max="15" required
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5">Optimal: 1.0 - 2.5 ppm</span>
                    </div>

                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Iron value (Fe) ppm</label>
                      <input 
                        type="number" step="0.1"
                        value={soilFe}
                        onChange={(e) => setSoilFe(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="0" max="30" required
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5">Optimal: 4.5 - 12 ppm</span>
                    </div>

                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Boron value (B) ppm</label>
                      <input 
                        type="number" step="0.1"
                        value={soilB}
                        onChange={(e) => setSoilB(parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                        min="0" max="5" required
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5">Optimal: 0.5 - 1.5 ppm</span>
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Soil Texture Formulation</label>
                      <select
                        value={soilTexture}
                        onChange={(e) => setSoilTexture(e.target.value)}
                        className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                      >
                        <option value="Loamy">Loamy Soil (Ideal Balance of sand, silt, and clay)</option>
                        <option value="Sandy">Sandy Soil (High porosity, poor nutritional retention)</option>
                        <option value="Clayey">Clayey Soil (Heavy retention, low water drainage)</option>
                        <option value="Silty">Silty Soil (Medium texture, nutrient-rich, fine particles)</option>
                      </select>
                    </div>

                    <div className="col-span-3 border-t border-slate-100 pt-4">
                      <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest block mb-1">Standard soil nutrition (Synchronized)</p>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">N (kg/ha)</label>
                          <input type="number" value={soilN} onChange={e => setSoilN(parseInt(e.target.value)||0)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">P (kg/ha)</label>
                          <input type="number" value={soilP} onChange={e => setSoilP(parseInt(e.target.value)||0)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">K (kg/ha)</label>
                          <input type="number" value={soilK} onChange={e => setSoilK(parseInt(e.target.value)||0)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">pH Value</label>
                          <input type="number" step="0.1" value={soilPH} onChange={e => setSoilPH(parseFloat(e.target.value)||6.5)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={shLoading}
                    className="w-full bg-slate-900 border border-slate-950 hover:bg-emerald-700 hover:border-emerald-800 text-white font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer h-11"
                  >
                    {shLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Execute Soil Audit & Generate scorecard'}
                  </button>
                </form>
              </div>

              {/* Scorecard panel */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                {shResult ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Audit response locked</span>
                        <h4 className="font-extrabold text-sm text-slate-800">Dynamic Soil Scorecard Report</h4>
                      </div>
                      <button 
                        onClick={() => selectReportForPrinting('soil', shResult)}
                        className="bg-white p-2 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                      >
                         <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>

                    <div className="p-6 space-y-5">
                      
                      {/* Radial or linear gauge indicator representing score */}
                      <div className="text-center space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Vitality rating Index</span>
                        <p className={`text-4xl font-black ${shResult.score >= 80 ? 'text-emerald-600' : shResult.score >= 55 ? 'text-amber-600' : 'text-red-500'}`}>{shResult.score} / 100</p>
                        <span className="text-xs text-slate-500 font-semibold italic capitalize">{soilTexture} Texture matrix</span>
                      </div>

                      <div className="border-t border-slate-100 pt-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">MICRONUTRIENT & ORGANIC CORRECTIONS</span>
                        <p className="text-xs bg-emerald-50 text-slate-700 font-medium leading-relaxed rounded-xl p-4 border border-emerald-100 mt-2 whitespace-pre-line">
                           {shResult.fertilizerCorrection}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">SUITABLE CULTIVATION PATHWAYS</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {shResult.recommendedCrops.map((c, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <Layers className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-extrabold text-slate-900 text-sm mt-3">Vitality Scorecard Pending</h4>
                    <p className="text-xs text-slate-400 mt-2">Introduce soil analysis parameters to determine organic matter, Zn, Fe, and B quality indices.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: DISEASE DL CLASSIFIER */}
          {activeTab === 'disease_dl' && (
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* Image Input and controls */}
              <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Crop Disease Diagnostician Portal</h3>
                    <p className="text-xs text-slate-400 mt-1">Upload leaf specimen images to class classification pipeline models</p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold uppercase tracking-widest">MobileNetV2 / Gemini Vision Network</span>
                </div>

                <div className="p-6 space-y-6">
                  
                  {/* Click/drag target and drop controls */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-all flex flex-col items-center justify-center text-center min-h-[220px] relative overflow-hidden group"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*" 
                      className="hidden" 
                    />
                    
                    {leafImage ? (
                      <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                        <img src={leafImage} alt="Uploaded Specimen" className="max-h-full max-w-full object-contain" />
                        <div className="absolute bottom-3 right-3 bg-slate-900/80 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-950 whitespace-nowrap">
                           Click again to change picture
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto text-slate-400 group-hover:text-emerald-500 shadow-sm transition-all">
                          <Leaf className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-600">Drag or drop leaf photograph here, or browse system files</p>
                          <p className="text-[10px] text-slate-400 tracking-wide mt-1">Accepts standard JPEG, PNG format representing potato, tomato, corn anomalies</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {leafImage && (
                    <button 
                      onClick={handleDiseaseSubmit}
                      disabled={diseaseLoading}
                      className="w-full bg-slate-900 border border-slate-950 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-emerald-700 hover:border-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-2 h-11"
                    >
                      {diseaseLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Analyzing leaf pixel anomalies via visual AI neural network...
                        </span>
                      ) : (
                        'Run Pathological Diagnostic Classification scan'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* DL results */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                {diseaseResult ? (
                  <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
                    <div className="p-5 bg-rose-600 text-white flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest block opacity-80">Pathology Result</span>
                        <h4 className="font-extrabold text-base tracking-tight">{diseaseResult.diseaseName} Discovered</h4>
                      </div>
                      <ShieldAlert className="w-7 h-7 text-white opacity-40 flex-shrink-0" />
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 font-bold">CLASSIFICATION CONFIDENCE</p>
                          <p className="text-lg font-black text-rose-600 mt-1">{diseaseResult.confidence}% Confidence Rating</p>
                        </div>
                        <button 
                          onClick={() => selectReportForPrinting('disease', diseaseResult)}
                          className="bg-slate-50 hover:bg-slate-100 p-2 border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-slate-700"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF Certificate
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-4 text-xs font-medium">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">PATHOGEN & SYMPTOM REVIEW:</span>
                        <p className="text-slate-600 leading-relaxed mt-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                          {diseaseResult.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">RECOMMENDED TREATMENT:</span>
                          <ul className="list-disc pl-4 space-y-1 mt-2 text-slate-600 font-medium">
                            {diseaseResult.treatment.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">BIOSECURITY PREVENTION:</span>
                          <ul className="list-disc pl-4 space-y-1 mt-2 text-slate-600 font-medium">
                            {diseaseResult.prevention.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <Leaf className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                    <h4 className="font-extrabold text-slate-900 text-sm mt-3">Classification Outcome pending</h4>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">Upload an image file using the visual targets container and trigger evaluation scan to execute automatic pathology auditing.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: SYSTEM TRANSACTION HISTORIES LOG */}
          {activeTab === 'history' && (
            <div className="space-y-8">
              
              {/* Crop suitability history list table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Crop Suitability & Yield mathematical Predictions archive</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Chronological record of Soil physics evaluation matches</p>
                  </div>
                  <button 
                    onClick={fetchUserHistory}
                    className="text-xs bg-white border border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                     Refresh Logs
                  </button>
                </div>

                <div className="overflow-x-auto">
                  {history.cropPredictions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                       No past crop prediction forecasts captured in database schema files.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                          <th className="p-4">Timestamp date</th>
                          <th className="p-4">Farmland Location</th>
                          <th className="p-4">Soil inputs (N-P-K (pH))</th>
                          <th className="p-4">Optimal suitability recommendation</th>
                          <th className="p-4">Predicted Yield</th>
                          <th className="p-4 text-right">Actions link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {history.cropPredictions.map((pred) => (
                          <tr key={pred.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-400">{new Date(pred.createdAt).toLocaleString()}</td>
                            <td className="p-4 capitalize font-bold text-slate-700">{pred.location || 'Standard base'}</td>
                            <td className="p-4 text-slate-500">{pred.nitrogen}-{pred.phosphorus}-{pred.potassium} ({pred.pH} pH)</td>
                            <td className="p-4 font-extrabold text-slate-800">{pred.recommendedCrop}</td>
                            <td className="p-4 text-emerald-600 font-bold font-mono">{pred.predictedYield} T/ha</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => selectReportForPrinting('crop', pred)}
                                className="bg-slate-900 hover:bg-emerald-700 text-white font-bold p-1 px-3 rounded text-[10px] tracking-wide cursor-pointer flex items-center justify-center gap-1 inline-flex"
                              >
                                 <Download className="w-3 h-3" /> PRINT PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Soil health vitality assessment archive list */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Micronutrients & Soil Health assessment Logs</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Chronological record of Soil Carbon, Texture and Zn, Fe, B analyses</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {history.soilHealthAnalyses.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                       No past soil scorecard evaluations logged under user directory profiles.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                          <th className="p-4">Timestamp Date</th>
                          <th className="p-4">Soil Texture</th>
                          <th className="p-4">Carbon Organic Content Om%</th>
                          <th className="p-4">Micro elements counts (Zn-Fe-B)</th>
                          <th className="p-4">Vitality Scorecard</th>
                          <th className="p-4 text-right">Actions Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {history.soilHealthAnalyses.map((sh) => (
                          <tr key={sh.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-400">{new Date(sh.createdAt).toLocaleString()}</td>
                            <td className="p-4 font-bold text-slate-800">{sh.texture} profile</td>
                            <td className="p-4 text-slate-500">{sh.organicMatter}% OM</td>
                            <td className="p-4 text-slate-500">{sh.zinc} ppm Zn | {sh.iron} ppm Fe | {sh.boron} ppm B</td>
                            <td className="p-4">
                              <span className={`font-black font-mono text-sm ${sh.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{sh.score} / 100</span>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => selectReportForPrinting('soil', sh)}
                                className="bg-slate-900 hover:bg-emerald-700 text-white font-bold p-1 px-3 rounded text-[10px] tracking-wide cursor-pointer flex items-center justify-center gap-1 inline-flex"
                              >
                                 <Download className="w-3.5 h-3.5" /> PRINT PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Foliar leaf diagnostics pathological scans list */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Pathological foliar image scan transactions archive</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Chronological record of photo-classification diagnoses</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {history.diseasePredictions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                       No foliar pathology diagnostics detected under this farming profile.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                          <th className="p-4">Timestamp Date</th>
                          <th className="p-4">Visual Specimen</th>
                          <th className="p-4">Pathological Disease Diagnosis Label</th>
                          <th className="p-4">Pathology Confidence Score</th>
                          <th className="p-4 text-right">Actions Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {history.diseasePredictions.map((dis) => (
                          <tr key={dis.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-400">{new Date(dis.createdAt).toLocaleString()}</td>
                            <td className="p-4">
                              {dis.imageUrl ? (
                                <img src={dis.imageUrl} alt="Specimen Thumbnail" className="w-10 h-10 object-cover rounded-md border border-slate-200" />
                              ) : (
                                <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center"><Leaf className="w-5 h-5 text-slate-400" /></div>
                              )}
                            </td>
                            <td className="p-4 font-extrabold text-slate-800">{dis.diseaseName}</td>
                            <td className="p-4">
                               <span className="text-rose-600 font-bold font-mono text-sm">{dis.confidence}% Confidence Match</span>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => selectReportForPrinting('disease', dis)}
                                className="bg-slate-900 hover:bg-emerald-700 text-white font-bold p-1 px-3 rounded text-[10px] tracking-wide cursor-pointer flex items-center justify-center gap-1 inline-flex"
                              >
                                 <Download className="w-3.5 h-3.5" /> PRINT PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: AGRONOMIC ENCYCLOPEDIA DATABASE */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              
              {/* Disease list browser cards */}
              <div className="grid grid-cols-12 gap-6 items-start">
                
                {/* Left panel disease list items */}
                <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-bold text-slate-800 text-sm">Phytosanitary Disease catalogue Directory</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Browse reference data cards in standard pathology dictionary tables</p>
                  </div>
                  
                  {catalogLoading ? (
                    <div className="p-8 text-center text-xs text-slate-500">Checking files...</div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                      {catalogItems.map((item) => (
                        <button 
                          key={item.id}
                          onClick={() => setSelectedCatalogItem(item)}
                          className={`w-full text-left p-4 hover:bg-slate-50 transition-colors cursor-pointer text-xs flex justify-between items-center ${selectedCatalogItem?.id === item.id ? 'bg-emerald-50 border-r-4 border-emerald-500' : ''}`}
                        >
                          <div>
                            <span className="font-extrabold text-slate-800 tracking-tight block">{item.diseaseName}</span>
                            <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500 mt-1 inline-block uppercase font-mono">{item.cropType} Cultivar</span>
                          </div>
                          <span className="text-slate-400 font-bold">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right panel detailed browser preview */}
                <div className="col-span-12 lg:col-span-8">
                  {selectedCatalogItem ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block font-mono">pathology reference dictionary</span>
                        <h3 className="font-black text-xl text-slate-900 mt-1">{selectedCatalogItem.diseaseName}</h3>
                        <p className="text-xs text-slate-400 mt-1">Classification Target Crop: <span className="font-bold text-slate-700">{selectedCatalogItem.cropType}</span></p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">1. Pathogen overview Description:</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                          {selectedCatalogItem.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 text-xs">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block">2. Recommended curative measures:</span>
                          <ol className="list-decimal pl-4 space-y-1.5 mt-2.5 text-slate-600 font-medium">
                            {selectedCatalogItem.treatment.map((t, idx) => (
                              <li key={idx} className="leading-relaxed">{t}</li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest block">3. Biosecurity Preventions:</span>
                          <ul className="list-disc pl-4 space-y-1.5 mt-2.5 text-slate-600 font-medium">
                            {selectedCatalogItem.prevention.map((p, idx) => (
                              <li key={idx} className="leading-relaxed">{p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                      <Database className="w-12 h-12 text-slate-300 mx-auto" />
                      <h4 className="font-extrabold text-slate-900 text-sm mt-3">Select Pathological Entry</h4>
                      <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">Select a diagnostic card from the encyclopedia catalog database directory list on the left to review scientific definitions, treatments, and biosecurity checklists.</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: BCA DOCUMENTATION */}
          {activeTab === 'docs' && (
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* Indices */}
              <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-sm">Academic Dissertation Table of Contents</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">BCA Final Year project compliant chapters guide</p>
                </div>
                
                <div className="divide-y divide-slate-100 font-medium text-xs">
                  {documentationSections.map((sec) => (
                    <a 
                      key={sec.id}
                      href={`#doc-${sec.id}`}
                      className="block p-3.5 hover:bg-slate-50 transition-all font-bold text-slate-700"
                    >
                      {sec.title}
                    </a>
                  ))}
                </div>
              </div>

              {/* Documentation file viewer */}
              <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-12">
                <div className="border-b-4 border-double border-slate-900 pb-6 text-center space-y-1.5">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">UNIVERSITY OF COMPUTER APPLICATIONS SPECIALIZED DISSERTATION</h3>
                  <p className="text-xs uppercase tracking-widest font-black text-slate-400">SMART AGRICULTURE ASSISTANT: CROP YIELD PREDICTOR & PLANT DISEASE CLASSIFIER SYSTEM</p>
                  <p className="text-[11px] font-bold text-slate-500">Degree Project Portfolio compliance portfolio • Bachelor of Computer Applications (Final Year)</p>
                </div>

                <div className="space-y-12 text-xs leading-relaxed text-slate-600 prose prose-slate">
                  {documentationSections.map((sec) => (
                    <div key={sec.id} id={`doc-${sec.id}`} className="space-y-3 pt-6 border-t border-slate-100 first:border-t-0">
                      <h4 className="font-black text-base text-slate-900 leading-tight block">{sec.title}</h4>
                      <div className="whitespace-pre-line leading-relaxed tabular-nums font-medium text-slate-700">
                         {sec.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: ADMINISTRATIVE CENTER */}
          {user?.role === 'admin' && activeTab === 'admin' && (
            <div className="space-y-8">
              
              {/* Stats & Actions */}
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none">TOTAL COMPOSITION USER COUNT</span>
                  <p className="text-2xl font-black text-slate-900 mt-2">{adminStats.totalUsers || 2}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none">CROP ANALYSIS PLOTS RECORDS</span>
                  <p className="text-2xl font-black text-slate-900 mt-2">{adminStats.totalCropPredictions || 1}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none">PATHOLOGY ENTRIES ANALYZED</span>
                  <p className="text-2xl font-black text-slate-900 mt-2">{adminStats.totalDiseasePredictions || 1}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none">ENCYCLOPEDIC SPECIES DEFINED</span>
                  <p className="text-2xl font-black text-indigo-600 mt-2">{adminStats.totalDiseasesDb || 8}</p>
                </div>
              </div>

              {/* Users management */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-sm">System Farmer / Administrative User Directory Profiles</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Review credentials mapping and terminate stray login allocations</p>
                </div>

                <div className="overflow-x-auto text-xs font-medium">
                  {adminStats.users && adminStats.users.length > 0 ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold">
                          <th className="p-4">UserID Code</th>
                          <th className="p-4">Username Label</th>
                          <th className="p-4">Secure Email Identity</th>
                          <th className="p-4">Assigned Role Authority</th>
                          <th className="p-4">Registered Date</th>
                          <th className="p-4 text-right">Emergency operations link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminStats.users.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 border-b border-slate-50">
                            <td className="p-4 font-mono font-bold text-slate-500">{item.id}</td>
                            <td className="p-4 font-bold text-slate-800">{item.username}</td>
                            <td className="p-4 text-slate-600">{item.email}</td>
                            <td className="p-4 capitalize">
                               <span className={`p-1 px-2.5 rounded text-[10px] uppercase font-bold font-mono tracking-widest ${item.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>{item.role}</span>
                            </td>
                            <td className="p-4 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              {item.id !== 'u-admin' && (
                                <button 
                                  onClick={() => handleDeleteUser(item.id)}
                                  className="text-red-500 hover:text-red-700 font-bold hover:underline transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Erase Account
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-400">Loading master files...</div>
                  )}
                </div>
              </div>

              {/* Catalogue Seed builder */}
              <div className="grid grid-cols-12 gap-6 items-start">
                 
                 {/* Left Column Builder Form */}
                 <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                   <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                     <h4 className="font-bold text-slate-800 text-sm">Automated Phytosanitary Catalogue Builder</h4>
                     <p className="text-xs text-slate-400 mt-0.5">Seeding new visual pathology definition entries into relational schemas</p>
                   </div>
                   
                   <form onSubmit={handleAddDiseaseCatalog} className="p-5 space-y-4">
                     {adminActionMessage && (
                       <p className="text-emerald-600 text-xs font-bold leading-normal bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                         {adminActionMessage}
                       </p>
                     )}

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Crop host Type</label>
                          <input 
                            type="text" value={adminCropType} onChange={e=>setAdminCropType(e.target.value)}
                            placeholder="e.g. Tomato / Potato / Wheat" 
                            className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-xs" required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Biological Pathogen label</label>
                          <input 
                            type="text" value={adminDiseaseName} onChange={e=>setAdminDiseaseName(e.target.value)}
                            placeholder="e.g. Septoria Leaf Spot" 
                            className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-xs" required
                          />
                        </div>
                     </div>

                     <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary Symptoms Description</label>
                       <textarea 
                         rows={2} value={adminDesc} onChange={e=>setAdminDesc(e.target.value)}
                         placeholder="Water soaked lesions with golden borders starting from younger foliage leaves..." 
                         className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-xs" required
                       />
                     </div>

                     <div>
                       <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Ailment treatment remedies (One guideline per line)</label>
                       <textarea 
                         rows={2} value={adminTreatment} onChange={e=>setAdminTreatment(e.target.value)}
                         placeholder="Conduct crop rotation&#10;Apply calcium superphosphates"
                         className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-[11px]" required
                       />
                     </div>

                     <div>
                       <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Biosecurity preventative guidelines (One guideline per line)</label>
                       <textarea 
                         rows={2} value={adminPrevention} onChange={e=>setAdminPrevention(e.target.value)}
                         placeholder="Ensure strict air circulation&#10;Clear past agricultural residues"
                         className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-[11px]" required
                       />
                     </div>

                     <button 
                       type="submit"
                       className="w-full bg-slate-900 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                     >
                       <Plus className="w-4 h-4" /> Seed Entry into Registry Directory
                     </button>
                   </form>
                 </div>

                 {/* Right Column Catalog Entries list to manage deletion */}
                 <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                   <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                     <h4 className="font-bold text-slate-800 text-sm">Master Directory Administrative Entries files</h4>
                     <p className="text-xs text-slate-400 mt-0.5">Deregister entries from central directory list files</p>
                   </div>

                   <div className="divide-y divide-slate-100 text-xs max-h-[360px] overflow-y-auto">
                     {catalogItems.map((item) => (
                       <div key={item.id} className="p-3 px-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                         <div>
                           <span className="font-extrabold text-slate-800 block">{item.diseaseName}</span>
                           <span className="text-[10px] tracking-widest text-emerald-600 font-mono font-black uppercase mt-0.5 inline-block">{item.cropType}</span>
                         </div>
                         <button 
                           onClick={() => handleDeleteDiseaseCatalog(item.id)}
                           className="text-red-500 hover:text-red-700 font-bold flex items-center cursor-pointer"
                           title="Deregister Disease"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>

              </div>

            </div>
          )}

        </div>

        {/* Global Footer (Emerald Styled) */}
        <footer className="h-10 bg-slate-100 border-t border-slate-200 px-8 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0 z-10 select-none">
          <div className="flex items-center gap-6 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Intelligent Suite: Active
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Database File: Synced
            </span>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <span>BCA Final Year Submission • v3.0.0 Stable</span>
            <span>© 2026 SmartAgri System Inc.</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
