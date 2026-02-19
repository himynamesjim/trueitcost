'use client';

import { useState, useRef, useEffect } from 'react';
import { SiteHeader } from '@/components/site-header';
import { ArrowLeft, CheckCircle2, Sparkles, Camera, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';

// ============================================================
// PRODUCT DATABASE
// ============================================================
const PRODUCT_DB: Record<string, { brand: string; category: string; icon: string; color: string; url?: string }> = {
  "shure mxa920": { brand: "Shure", category: "Ceiling Microphone", icon: "🎙️", color: "#1a73e8", url: "https://pubs.shure.com/guide/mxa920" },
  "shure mxa910": { brand: "Shure", category: "Ceiling Microphone", icon: "🎙️", color: "#1a73e8" },
  "shure mxa310": { brand: "Shure", category: "Table Microphone", icon: "🎙️", color: "#1a73e8" },
  "shure mxn5": { brand: "Shure", category: "Ceiling Speaker", icon: "🔊", color: "#1a73e8" },
  "shure p300": { brand: "Shure", category: "DSP Processor", icon: "⚙️", color: "#1a73e8" },
  "biamp parl": { brand: "Biamp", category: "Ceiling Microphone", icon: "🎙️", color: "#e63946" },
  "biamp tesira": { brand: "Biamp", category: "DSP Processor", icon: "⚙️", color: "#e63946" },
  "biamp desono": { brand: "Biamp", category: "Ceiling Speaker", icon: "🔊", color: "#e63946" },
  "poly studio e70": { brand: "Poly", category: "AI Camera", icon: "📷", color: "#00a4e4" },
  "poly studio x30": { brand: "Poly", category: "Video Bar", icon: "📹", color: "#00a4e4" },
  "poly studio x50": { brand: "Poly", category: "Video Bar", icon: "📹", color: "#00a4e4" },
  "poly studio x70": { brand: "Poly", category: "Video Bar", icon: "📹", color: "#00a4e4" },
  "logitech rally bar": { brand: "Logitech", category: "Video Bar", icon: "📹", color: "#00b956" },
  "logitech rally bar mini": { brand: "Logitech", category: "Video Bar", icon: "📹", color: "#00b956" },
  "logitech tap": { brand: "Logitech", category: "Touch Controller", icon: "🖥️", color: "#00b956" },
  "neat bar": { brand: "Neat", category: "Video Bar", icon: "📹", color: "#6c63ff" },
  "samsung qm": { brand: "Samsung", category: "Commercial Display", icon: "📺", color: "#1428a0" },
};

function getProductInfo(productName: string) {
  const lower = productName.toLowerCase();
  for (const [key, info] of Object.entries(PRODUCT_DB)) {
    if (lower.includes(key)) return info;
  }
  if (lower.includes("display") || lower.includes("monitor") || lower.includes("tv") || lower.includes("screen"))
    return { icon: "📺", category: "Display", color: "#6366f1", brand: "" };
  if (lower.includes("camera") || lower.includes("webcam"))
    return { icon: "📷", category: "Camera", color: "#f59e0b", brand: "" };
  if (lower.includes("mic"))
    return { icon: "🎙️", category: "Microphone", color: "#0ea5e9", brand: "" };
  if (lower.includes("speaker"))
    return { icon: "🔊", category: "Speaker", color: "#10b981", brand: "" };
  return { icon: "⚡", category: "AV Equipment", color: "#64748b", brand: "" };
}

// ============================================================
// SYSTEM PROMPTS
// ============================================================
const ROOM_ANALYSIS_PROMPT = `You are an expert AV solutions architect analyzing a conference room photo. Examine the image carefully and provide a detailed assessment.

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "roomAssessment": {
    "estimatedDimensions": "LxW estimate in feet",
    "estimatedCapacity": "number of people",
    "ceilingType": "drop tile / open / drywall / high ceiling",
    "ceilingHeight": "estimated height in feet",
    "wallMaterials": ["glass", "drywall", "wood", etc],
    "floorType": "carpet / hardwood / tile / concrete",
    "existingEquipment": ["list any visible AV equipment"],
    "windowsAndLighting": "description of natural light and window positions",
    "acousticConcerns": ["list potential acoustic issues"],
    "tableShape": "rectangular / boat / U-shape / round / none visible",
    "tableSize": "estimated length and width"
  },
  "recommendations": {
    "displaySize": "recommended display size based on room depth",
    "displayPlacement": "where to mount the display",
    "microphoneType": "ceiling array vs table mics and why",
    "cameraPlacement": "where to position the camera",
    "acousticTreatment": "what acoustic treatment is needed",
    "lightingNotes": "any lighting changes needed for video quality"
  },
  "concerns": ["list any issues or challenges you see with this room"],
  "summary": "2-3 sentence plain-English summary of the room and what it needs"
}`;

// ============================================================
// FIELD DEFINITIONS
// ============================================================
const FIELDS = [
  { id: 'room_type', label: 'What type of space are you outfitting?', type: 'select', options: ['Large Conference Room (12+ people)', 'Medium Conference Room (6-12)', 'Huddle Room (2-5)', 'Executive Office', 'Training Room / All-Hands', 'Open Collaboration Area'] },
  { id: 'dimensions', label: 'Room dimensions (L × W in feet)', type: 'text', placeholder: 'e.g. 20x15' },
  { id: 'capacity', label: 'How many people will typically use this room?', type: 'select', options: ['2-4 people', '5-8 people', '9-12 people', '13-20 people', '20+ people'] },
  { id: 'platform', label: 'Which video conferencing platform?', type: 'select', options: ['Microsoft Teams', 'Zoom', 'Google Meet', 'Cisco Webex', 'Not sure / Open to recommendations', 'Multiple platforms'] },
  { id: 'display_pref', label: 'Display preference', type: 'select', options: ['Single large display', 'Dual displays', 'Interactive touchscreen / whiteboard', 'LED video wall', 'No preference / Recommend for me'] },
  { id: 'audio_needs', label: 'Audio requirements', type: 'multi', options: ['Ceiling microphones', 'Table microphones', 'Soundbar (all-in-one)', 'Separate speakers', 'Not sure — recommend for me'] },
  { id: 'camera_needs', label: 'Camera features needed', type: 'multi', options: ['Auto-framing / speaker tracking', 'Panoramic view', 'Whiteboard capture', 'Content camera', 'Basic fixed camera is fine'] },
  { id: 'existing_equipment', label: 'Existing equipment to keep?', type: 'textarea', placeholder: 'e.g. We have a 65 inch TV, a Logitech webcam...' },
  { id: 'room_features', label: 'Room characteristics', type: 'multi', options: ['Glass walls', 'Hard floors', 'High ceilings (12ft+)', 'Drop/acoustic tile ceiling', 'Windows behind display wall', 'Carpeted floors', 'Standard drywall'] },
  { id: 'budget', label: 'Budget range (equipment only)', type: 'select', options: ['Under $3,000', '$3,000 - $6,000', '$6,000 - $12,000', '$12,000 - $25,000', '$25,000 - $50,000', '$50,000+', 'Not sure yet'] },
  { id: 'notes', label: 'Anything else?', type: 'textarea', placeholder: 'Timeline, challenges, brand preferences...' }
];

// ============================================================
// TYPES
// ============================================================
interface FormData {
  [key: string]: string | string[];
}

interface RoomAnalysis {
  roomAssessment?: {
    estimatedDimensions?: string;
    estimatedCapacity?: string;
    ceilingType?: string;
    ceilingHeight?: string;
    wallMaterials?: string[];
    floorType?: string;
    existingEquipment?: string[];
    windowsAndLighting?: string;
    acousticConcerns?: string[];
    tableShape?: string;
    tableSize?: string;
  };
  recommendations?: {
    displaySize?: string;
    displayPlacement?: string;
    microphoneType?: string;
    cameraPlacement?: string;
    acousticTreatment?: string;
    lightingNotes?: string;
  };
  concerns?: string[];
  summary?: string;
}

interface DesignResult {
  title: string;
  summary: string;
  sections?: Array<{
    heading: string;
    items?: Array<{
      name: string;
      spec: string;
      price: string;
      reason: string;
      imageSearch?: string;
    }>;
  }>;
  totalEstimate?: string;
  monthlyRecurring?: string;
  installationEstimate?: string;
  notes?: string;
  alternatives?: Array<{
    description: string;
    tradeoff: string;
    priceImpact: string;
  }>;
  questionsToAskVendor?: string[];
}

// ============================================================
// COMPONENTS
// ============================================================
interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}

function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected.includes(opt)
              ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-300'
              : 'bg-slate-700/30 border-2 border-slate-600/50 text-slate-400 hover:border-slate-500'
          }`}
        >
          {selected.includes(opt) && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
          {opt}
        </button>
      ))}
    </div>
  );
}

interface ProductCardProps {
  item: {
    name: string;
    spec: string;
    price: string;
    reason: string;
  };
}

function ProductCard({ item }: ProductCardProps) {
  const info = getProductInfo(item.name);
  return (
    <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 mb-3">
      <div className="flex gap-4 items-start">
        <div
          className="w-16 h-16 rounded-lg flex-shrink-0 flex flex-col items-center justify-center gap-0.5"
          style={{
            background: `linear-gradient(135deg, ${info.color}20, ${info.color}08)`,
            border: `1px solid ${info.color}30`
          }}
        >
          <span className="text-2xl">{info.icon}</span>
          {info.brand && (
            <span className="text-[8px] font-semibold uppercase tracking-wide" style={{ color: info.color }}>
              {info.brand}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-200">{item.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{item.spec}</div>
            </div>
            <span className="text-sm font-bold text-blue-400 font-mono whitespace-nowrap">{item.price}</span>
          </div>
          <div className="text-xs text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-700/50">
            <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Why: </span>
            {item.reason}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RoomAnalysisDisplayProps {
  analysis: RoomAnalysis;
  images: Array<{ preview: string }>;
}

function RoomAnalysisDisplay({ analysis, images }: RoomAnalysisDisplayProps) {
  const a = analysis.roomAssessment || {};

  return (
    <div className="mb-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-4 items-start flex-wrap">
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((img, idx) => (
              <div key={idx} className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                <img src={img.preview} alt={`Room angle ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 min-w-60">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-3">
            <Camera className="h-3 w-3" />
            Room Analysis Complete
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{analysis.summary}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
        {[
          { label: "Estimated Size", value: a.estimatedDimensions },
          { label: "Capacity", value: a.estimatedCapacity ? `~${a.estimatedCapacity} people` : null },
          { label: "Ceiling", value: a.ceilingType },
          { label: "Floor", value: a.floorType },
        ].filter(x => x.value).map((x, i) => (
          <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{x.label}</div>
            <div className="text-xs text-slate-300 mt-1">{x.value}</div>
          </div>
        ))}
      </div>
      {analysis.concerns && analysis.concerns.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <span className="text-xs text-amber-400 font-semibold">⚠️ Heads up: </span>
          <span className="text-xs text-slate-400">{analysis.concerns.join(" · ")}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CollaborationPage() {
  const [step, setStep] = useState(-1); // -1 = intro/upload
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [result, setResult] = useState<DesignResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomImages, setRoomImages] = useState<Array<{ base64: string; mediaType: string; preview: string }>>([]);
  const [roomAnalysis, setRoomAnalysis] = useState<RoomAnalysis | null>(null);
  const [analyzingRoom, setAnalyzingRoom] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const field = step >= 0 ? FIELDS[step] : null;
  const total = FIELDS.length;
  const isLast = step === total - 1;
  const progress = step >= 0 ? ((step + 1) / total) * 100 : 0;

  useEffect(() => {
    if (loading) {
      const msgs = [
        "Analyzing room dimensions...",
        "Calculating display size...",
        "Selecting microphone config...",
        "Matching cameras to layout...",
        "Comparing vendor options...",
        "Building recommendation..."
      ];
      let i = 0;
      setLoadMsg(msgs[0]);
      const iv = setInterval(() => {
        i = (i + 1) % msgs.length;
        setLoadMsg(msgs[i]);
      }, 2200);
      return () => clearInterval(iv);
    }
  }, [loading]);

  const analyzeRoom = async (images: Array<{ base64: string; mediaType: string; preview: string }>) => {
    setAnalyzingRoom(true);
    try {
      const promptText = images.length > 1
        ? `Analyze these ${images.length} conference room photos from different angles for AV/video conferencing design. Combine insights from all angles to provide a comprehensive assessment. ${ROOM_ANALYSIS_PROMPT}`
        : "Analyze this conference room photo for AV/video conferencing design. " + ROOM_ANALYSIS_PROMPT;

      const res = await fetch("/api/analyze-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map(img => ({ base64: img.base64, mediaType: img.mediaType })),
          prompt: promptText
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || `API returned status ${res.status}`);
      }

      const data = await res.json();
      const text = data.content?.map((c: any) => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed: RoomAnalysis = JSON.parse(clean);
      setRoomAnalysis(parsed);

      // Pre-fill form from analysis
      const a = parsed.roomAssessment || {};
      const r = parsed.recommendations || {};
      const prefill: FormData = {};

      if (a.estimatedDimensions) prefill.dimensions = a.estimatedDimensions;
      if (a.existingEquipment?.length) prefill.existing_equipment = a.existingEquipment.join(", ");

      // Pre-fill room type and capacity
      const cap = parseInt(a.estimatedCapacity || "0") || 0;
      if (cap > 0) {
        if (cap <= 5) {
          prefill.room_type = "Huddle Room (2-5)";
          prefill.capacity = "2-4 people";
        } else if (cap <= 8) {
          prefill.room_type = "Medium Conference Room (6-12)";
          prefill.capacity = "5-8 people";
        } else if (cap <= 12) {
          prefill.room_type = "Medium Conference Room (6-12)";
          prefill.capacity = "9-12 people";
        } else if (cap <= 20) {
          prefill.room_type = "Large Conference Room (12+ people)";
          prefill.capacity = "13-20 people";
        } else {
          prefill.room_type = "Training Room / All-Hands";
          prefill.capacity = "20+ people";
        }
      }

      // Pre-fill room features
      const features: string[] = [];
      const walls = (a.wallMaterials || []).map(w => w.toLowerCase()).join(" ");
      const floor = (a.floorType || "").toLowerCase();
      const ceiling = (a.ceilingType || "").toLowerCase();
      const ceilingH = parseInt(a.ceilingHeight || "0") || 0;
      const windows = (a.windowsAndLighting || "").toLowerCase();

      if (walls.includes("glass")) features.push("Glass walls");
      if (walls.includes("drywall")) features.push("Standard drywall");
      if (floor.includes("hard") || floor.includes("wood") || floor.includes("tile") || floor.includes("concrete"))
        features.push("Hard floors");
      if (floor.includes("carpet")) features.push("Carpeted floors");
      if (ceiling.includes("drop") || ceiling.includes("tile") || ceiling.includes("acoustic"))
        features.push("Drop/acoustic tile ceiling");
      if (ceiling.includes("high") || ceilingH >= 12) features.push("High ceilings (12ft+)");
      if (windows.includes("behind") || windows.includes("backlight"))
        features.push("Windows behind display wall");
      if (features.length) prefill.room_features = features;

      // Pre-fill audio recommendation
      if (r.microphoneType) {
        const micRec = r.microphoneType.toLowerCase();
        if (micRec.includes("ceiling")) {
          prefill.audio_needs = ["Ceiling microphones", "Separate speakers"];
        } else if (micRec.includes("soundbar") || micRec.includes("integrated")) {
          prefill.audio_needs = ["Soundbar (all-in-one)"];
        } else if (micRec.includes("table")) {
          prefill.audio_needs = ["Table microphones"];
        }
      }

      // Pre-fill camera needs
      if (cap > 8) {
        prefill.camera_needs = ["Auto-framing / speaker tracking"];
      } else if (cap > 4) {
        prefill.camera_needs = ["Auto-framing / speaker tracking"];
      }

      // Pre-fill display preference
      if (r.displaySize) {
        const disp = r.displaySize.toLowerCase();
        if (disp.includes("dual")) prefill.display_pref = "Dual displays";
        else if (disp.includes("video wall") || disp.includes("led wall")) prefill.display_pref = "LED video wall";
        else if (disp.includes("interactive") || disp.includes("touch")) prefill.display_pref = "Interactive touchscreen / whiteboard";
        else prefill.display_pref = "Single large display";
      }

      setFormData(f => ({ ...f, ...prefill }));
    } catch (err) {
      console.error("Room analysis error:", err);
      setError("Failed to analyze room. Please check your API key and try again.");
    }
    setAnalyzingRoom(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: Array<{ base64: string; mediaType: string; preview: string }> = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      const mediaType = file.type || "image/jpeg";
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const base64 = result.split(",")[1];
        newImages.push({ base64, mediaType, preview: result });
        processedCount++;

        // Once all files are processed, update state and analyze
        if (processedCount === files.length) {
          const allImages = [...roomImages, ...newImages];
          setRoomImages(allImages);
          analyzeRoom(allImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = roomImages.filter((_, i) => i !== index);
    setRoomImages(updatedImages);
    if (updatedImages.length > 0) {
      analyzeRoom(updatedImages);
    } else {
      setRoomAnalysis(null);
    }
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: roomImages.map(img => ({ base64: img.base64, mediaType: img.mediaType })),
          formData,
          roomAnalysis
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `API returned status ${res.status}`);
      }

      const data = await res.json();
      if (!data.content || data.content.length === 0) {
        throw new Error("No response received from AI");
      }

      const rawText = data.content.map((c: any) => c.text || "").join("");
      if (!rawText.trim()) {
        throw new Error("Empty response from AI");
      }

      let clean = rawText.trim();
      clean = clean.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

      const jsonStart = clean.indexOf("{");
      const jsonEnd = clean.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        clean = clean.substring(jsonStart, jsonEnd + 1);
      }

      const parsed: DesignResult = JSON.parse(clean);
      setResult(parsed);
      setLoading(false);
    } catch (err: any) {
      console.error("Generation error:", err);
      setLoading(false);
      setError(err.message || "Failed to generate solution. Please try again.");
    }
  };

  const updateField = (id: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const nextStep = () => {
    if (step < FIELDS.length - 1) {
      setStep(step + 1);
    } else {
      generate();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      setStep(-1);
    }
  };

  // ============================================================
  // RENDER: INTRO / PHOTO UPLOAD
  // ============================================================
  if (step === -1 && !loading && !result) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <Link
            href="/ai-solutions"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to AI Solutions
          </Link>

          <div className="text-center mb-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 text-sm text-blue-400">
              <Sparkles className="h-3 w-3" />
              AI-Powered Solutions Architecture
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
              Design your collaboration<br />room in minutes
            </h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload a photo of your room for AI analysis, or jump straight to the questionnaire.
            </p>
          </div>

          {/* Photo Upload Zone */}
          <div className="mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              multiple
              className="hidden"
            />
            {roomImages.length === 0 ? (
              <div
                onClick={() => fileRef.current?.click()}
                className="p-10 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 cursor-pointer text-center transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                <div className="flex justify-center mb-3 text-slate-400">
                  <Camera className="h-8 w-8" />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Upload photos of your room
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Multiple angles recommended for better AI analysis of dimensions, surfaces, and equipment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roomImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-700 group">
                      <img src={img.preview} alt={`Room angle ${idx + 1}`} className="w-full h-40 object-cover" />
                      {!analyzingRoom && (
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white font-medium">Angle {idx + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {analyzingRoom && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    <p className="text-sm text-slate-400">Analyzing {roomImages.length} room {roomImages.length === 1 ? 'photo' : 'photos'}...</p>
                  </div>
                )}
                {!analyzingRoom && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full p-3 rounded-lg border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-800/30 hover:bg-blue-950/30 transition-all text-sm text-slate-400 hover:text-blue-400 flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Add more photos
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Room Analysis Results */}
          {roomAnalysis && <RoomAnalysisDisplay analysis={roomAnalysis} images={roomImages} />}

          {/* Start Button */}
          <div className="flex gap-3 animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <button
              onClick={() => setStep(0)}
              className="flex-1 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {roomAnalysis ? "Continue to Questionnaire" : "Start Designing"}
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
          </div>
          {roomAnalysis && (
            <p className="text-center text-xs text-slate-500 mt-3">
              Your room analysis has pre-filled some answers. Review and adjust as needed.
            </p>
          )}
        </main>
      </div>
    );
  }

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-5">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-1.5">
            Designing your solution...
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">
            {loadMsg}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: RESULTS
  // ============================================================
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <SiteHeader />
        <main className="max-w-4xl mx-auto px-4 py-10 pb-16">
          {roomAnalysis && roomImages.length > 0 && (
            <RoomAnalysisDisplay analysis={roomAnalysis} images={roomImages} />
          )}

          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-3">
              <Sparkles className="h-3 w-3" />
              AI-Generated Solution
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              {result.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-7">
              {result.summary}
            </p>
          </div>

          {result.sections?.map((sec, si) => (
            <div key={si} className="mb-5" style={{ animation: `slideUp 0.5s ease ${si * 0.06}s both` }}>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                {sec.heading}
              </h3>
              {sec.items?.map((item, ii) => (
                <ProductCard key={ii} item={item} />
              ))}
            </div>
          ))}

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Equipment", value: result.totalEstimate },
              { label: "Monthly", value: result.monthlyRecurring },
              { label: "Installation", value: result.installationEstimate }
            ].map((t, i) => (
              <div key={i} className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">
                  {t.label}
                </div>
                <div className="text-base font-bold text-blue-400 font-mono">
                  {t.value || "N/A"}
                </div>
              </div>
            ))}
          </div>

          {result.notes && (
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs text-slate-400 leading-relaxed mb-4">
              <span className="text-amber-400 font-semibold">💡 </span>
              {result.notes}
            </div>
          )}

          {result.alternatives && result.alternatives.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Alternatives
              </h3>
              {result.alternatives.map((a, i) => (
                <div key={i} className="p-4 rounded-lg border border-slate-700 bg-slate-800/30 mb-2">
                  <div className="text-sm font-medium text-slate-300 mb-1">{a.description}</div>
                  <div className="text-xs text-slate-500">
                    {a.tradeoff} · <span className="text-blue-400">{a.priceImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.questionsToAskVendor && result.questionsToAskVendor.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Questions for Your Vendor
              </h3>
              <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/30">
                {result.questionsToAskVendor.map((q, i) => (
                  <div key={i} className="text-xs text-slate-400 leading-relaxed py-1 flex gap-2">
                    <span className="text-blue-400 font-semibold">{i + 1}.</span>
                    {q}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                setResult(null);
                setStep(0);
              }}
              className="px-5 py-2.5 rounded-lg border border-slate-600 bg-transparent text-slate-400 text-sm hover:bg-slate-800 transition-colors"
            >
              ← Modify
            </button>
            <button className="flex-1 min-w-48 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
              Request Quote from InterPeak →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // RENDER: ERROR STATE
  // ============================================================
  if (error && !loading && !result) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <SiteHeader />
        <main className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5 text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2.5">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
            {error}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed mb-7">
            This usually means the AI service is temporarily unavailable. Your answers have been saved.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setError(null);
                setStep(total - 1);
              }}
              className="px-5 py-2.5 rounded-lg border border-slate-600 bg-transparent text-slate-400 text-sm hover:bg-slate-800 transition-colors"
            >
              ← Back to Questions
            </button>
            <button
              onClick={() => {
                setError(null);
                generate();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Sparkles className="h-3 w-3" />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // RENDER: QUESTIONNAIRE
  // ============================================================
  if (!field) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => setStep(-1)}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Step {step + 1} of {FIELDS.length}
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1.5">
            {field.label}
          </h2>
          <div className="flex items-center gap-3 mb-6">
            <p className="text-xs text-slate-500 font-mono">
              Step {step + 1} of {total}
            </p>
            {formData[field.id] && roomAnalysis && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                📷 Pre-filled from photo
              </span>
            )}
          </div>

          {field.type === 'select' && (
            <div className="space-y-3">
              {field.options?.map(option => (
                <button
                  key={option}
                  onClick={() => {
                    updateField(field.id, option);
                    if (!isLast) setTimeout(() => setStep(s => s + 1), 200);
                  }}
                  className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                    formData[field.id] === option
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 dark:text-white font-medium">{option}</span>
                    {formData[field.id] === option && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {field.type === 'multi' && field.options && (
            <MultiSelect
              options={field.options}
              selected={(formData[field.id] as string[]) || []}
              onChange={(value) => updateField(field.id, value)}
            />
          )}

          {field.type === 'text' && (
            <input
              type="text"
              value={(formData[field.id] as string) || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-6 py-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              value={(formData[field.id] as string) || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="w-full px-6 py-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none"
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={prevStep}
              className="px-6 py-3 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={nextStep}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center gap-2 ${
                isLast
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {isLast ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Design
                </>
              ) : (
                'Next →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
