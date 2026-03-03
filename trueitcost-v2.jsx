import { useState, useRef, useEffect } from "react";

// ============================================================
// PRODUCT IMAGE DATABASE
// In production, these would be hosted on your own CDN or S3 bucket
// For now, we use a keyword-matching system that the AI references
// ============================================================
const PRODUCT_DB = {
  "shure mxa920": { brand: "Shure", category: "Ceiling Microphone", icon: "🎙️", color: "#1a73e8", url: "https://pubs.shure.com/guide/mxa920" },
  "shure mxa910": { brand: "Shure", category: "Ceiling Microphone", icon: "🎙️", color: "#1a73e8" },
  "shure mxa310": { brand: "Shure", category: "Table Microphone", icon: "🎙️", color: "#1a73e8" },
  "shure mxn5": { brand: "Shure", category: "Ceiling Speaker", icon: "🔊", color: "#1a73e8" },
  "shure p300": { brand: "Shure", category: "DSP Processor", icon: "⚙️", color: "#1a73e8" },
  "shure aniusb": { brand: "Shure", category: "USB Audio Interface", icon: "⚙️", color: "#1a73e8" },
  "biamp parl": { brand: "Biamp", category: "Ceiling Microphone", icon: "🎙️", color: "#e63946" },
  "biamp tesira": { brand: "Biamp", category: "DSP Processor", icon: "⚙️", color: "#e63946" },
  "biamp desono": { brand: "Biamp", category: "Ceiling Speaker", icon: "🔊", color: "#e63946" },
  "poly studio e70": { brand: "Poly", category: "AI Camera", icon: "📷", color: "#00a4e4" },
  "poly studio x30": { brand: "Poly", category: "Video Bar", icon: "📹", color: "#00a4e4" },
  "poly studio x50": { brand: "Poly", category: "Video Bar", icon: "📹", color: "#00a4e4" },
  "poly studio x52": { brand: "Poly", category: "Video Bar", icon: "📹", color: "#00a4e4" },
  "poly studio x70": { brand: "Poly", category: "Video Bar", icon: "📹", color: "#00a4e4" },
  "poly sync 60": { brand: "Poly", category: "Speakerphone", icon: "🔈", color: "#00a4e4" },
  "poly tc10": { brand: "Poly", category: "Touch Controller", icon: "🖥️", color: "#00a4e4" },
  "poly gc8": { brand: "Poly", category: "Room Compute", icon: "💻", color: "#00a4e4" },
  "poly table mic": { brand: "Poly", category: "Table Microphone", icon: "🎙️", color: "#00a4e4" },
  "poly eagle eye": { brand: "Poly", category: "PTZ Camera", icon: "📷", color: "#00a4e4" },
  "logitech rally bar": { brand: "Logitech", category: "Video Bar", icon: "📹", color: "#00b956" },
  "logitech rally bar mini": { brand: "Logitech", category: "Video Bar", icon: "📹", color: "#00b956" },
  "logitech rally camera": { brand: "Logitech", category: "PTZ Camera", icon: "📷", color: "#00b956" },
  "logitech rally mic": { brand: "Logitech", category: "Table Microphone", icon: "🎙️", color: "#00b956" },
  "logitech scribe": { brand: "Logitech", category: "Content Camera", icon: "📷", color: "#00b956" },
  "logitech tap": { brand: "Logitech", category: "Touch Controller", icon: "🖥️", color: "#00b956" },
  "logitech brio": { brand: "Logitech", category: "USB Camera", icon: "📷", color: "#00b956" },
  "lenovo thinksmart": { brand: "Lenovo", category: "Room Compute", icon: "💻", color: "#e2231a" },
  "hp presence": { brand: "HP", category: "Room Compute", icon: "💻", color: "#0096d6" },
  "crestron flex": { brand: "Crestron", category: "Room System", icon: "💻", color: "#ff6600" },
  "crestron airmedia": { brand: "Crestron", category: "Wireless Presentation", icon: "📡", color: "#ff6600" },
  "neat bar": { brand: "Neat", category: "Video Bar", icon: "📹", color: "#6c63ff" },
  "neat pad": { brand: "Neat", category: "Touch Controller", icon: "🖥️", color: "#6c63ff" },
  "neat board": { brand: "Neat", category: "Interactive Display", icon: "📺", color: "#6c63ff" },
  "jabra panacast": { brand: "Jabra", category: "Video Bar", icon: "📹", color: "#ffd700" },
  "samsung qm": { brand: "Samsung", category: "Commercial Display", icon: "📺", color: "#1428a0" },
  "samsung qb": { brand: "Samsung", category: "Commercial Display", icon: "📺", color: "#1428a0" },
  "samsung the wall": { brand: "Samsung", category: "LED Video Wall", icon: "📺", color: "#1428a0" },
  "lg createboard": { brand: "LG", category: "Interactive Display", icon: "📺", color: "#a50034" },
  "sony bravia": { brand: "Sony", category: "Commercial Display", icon: "📺", color: "#000000" },
  "dten": { brand: "DTEN", category: "All-in-One System", icon: "📺", color: "#0066cc" },
  "huddly": { brand: "Huddly", category: "AI Camera", icon: "📷", color: "#ff5722" },
  "nureva hdl": { brand: "Nureva", category: "Audio Bar", icon: "🔊", color: "#00bcd4" },
  "clearone": { brand: "ClearOne", category: "Audio System", icon: "🔊", color: "#003366" },
  "barco clickshare": { brand: "Barco", category: "Wireless Presentation", icon: "📡", color: "#e74c3c" },
  "qsc": { brand: "QSC", category: "Audio System", icon: "🔊", color: "#003399" },
  "audio-technica atnd": { brand: "Audio-Technica", category: "Ceiling Microphone", icon: "🎙️", color: "#1a1a1a" },
  "yealink vcm": { brand: "Yealink", category: "Ceiling Microphone", icon: "🎙️", color: "#006699" },
};

function getProductInfo(productName) {
  const lower = productName.toLowerCase();
  for (const [key, info] of Object.entries(PRODUCT_DB)) {
    if (lower.includes(key)) return info;
  }
  if (lower.includes("display") || lower.includes("monitor") || lower.includes("tv") || lower.includes("screen")) return { icon: "📺", category: "Display", color: "#6366f1", brand: "" };
  if (lower.includes("camera") || lower.includes("webcam")) return { icon: "📷", category: "Camera", color: "#f59e0b", brand: "" };
  if (lower.includes("mic")) return { icon: "🎙️", category: "Microphone", color: "#0ea5e9", brand: "" };
  if (lower.includes("speaker")) return { icon: "🔊", category: "Speaker", color: "#10b981", brand: "" };
  if (lower.includes("controller") || lower.includes("compute") || lower.includes("hub")) return { icon: "💻", category: "Compute", color: "#8b5cf6", brand: "" };
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

const DESIGN_PROMPT = `You are an expert AV/UC solutions architect with 20 years of experience designing conference rooms for SMBs. Design vendor-neutral solutions using AVIXA best practices.

DESIGN RULES:
[Display] Min screen height = farthest viewer / 6. Room 10-12ft: 55". 12-15ft: 65". 15-18ft: 75". 18-22ft: 85" or dual 65". 22-28ft: Dual 75-85". Mount bottom at 40-48" AFF. NEVER consumer TVs. 4K UHD min for 55"+. Commercial-grade only (Samsung QM, LG, Sony BRAVIA Pro).
[Platform] Teams: certified devices + $40/room/mo license. Zoom: certified + $49/room/mo. Meet: Series One by Lenovo. Webex: Cisco Room Kit. Multi: Crestron Flex, Logitech Rally Bar, Poly Studio X.
[Audio] #1 PRIORITY. Huddle (<150sqft): integrated soundbar. Small (150-250): 1-2 table pods or soundbar. Medium (250-400): CEILING MICS RECOMMENDED (Shure MXA920, Biamp Parlé). Large (400+): CEILING MICS MANDATORY. Ceiling coverage ~25ft diameter. Max height 12-14ft. PoE: plan 60W+/room.
[Camera] Huddle: integrated video bar. Small: video bar with AI framing. Medium: dedicated AI tracking cam (Poly Studio E70, Huddly L1). Large: AI tracking mandatory. Mount 42-48" AFF, centered on table, min 5ft from nearest person.
[Acoustics] Glass walls: panels on 2+ walls NRC 0.7+. Hard floors: carpet/rug. RT60 target 0.4-0.6s. Lighting: 300-500 lux, 150-250 vertical on faces, 3500-4000K.
[Budget] Huddle: $1.5-10K. Small: $3-20K. Medium: $6-35K. Large: $12-75K. Installation: +15-30%.
[Mistakes to flag] Consumer TV, table mics in 12+ person rooms, ceiling-mounted camera, no acoustic treatment with glass walls, undersized display, no dedicated compute, forgotten license costs, PoE budget oversight, no spare cables, bad lighting.

CRITICAL: Respond with ONLY valid JSON:
{"title":"string","summary":"string","sections":[{"heading":"string","items":[{"name":"Product name","spec":"Key specs","price":"$X,XXX","reason":"Why for this room","imageSearch":"product name for image lookup"}]}],"totalEstimate":"$X-$X","monthlyRecurring":"$XX/mo","installationEstimate":"$X-$X","notes":"string","alternatives":[{"description":"string","tradeoff":"string","priceImpact":"string"}],"questionsToAskVendor":["string"]}`;

// ============================================================
// QUESTIONNAIRE FIELDS
// ============================================================
const FIELDS = [
  { id: "room_type", label: "What type of space are you outfitting?", type: "select", options: ["Large Conference Room (12+ people)", "Medium Conference Room (6-12)", "Huddle Room (2-5)", "Executive Office", "Training Room / All-Hands", "Open Collaboration Area"] },
  { id: "dimensions", label: "Room dimensions (L × W in feet)", type: "text", placeholder: "e.g. 20x15" },
  { id: "capacity", label: "How many people will typically use this room?", type: "select", options: ["2-4 people", "5-8 people", "9-12 people", "13-20 people", "20+ people"] },
  { id: "platform", label: "Which video conferencing platform?", type: "select", options: ["Microsoft Teams", "Zoom", "Google Meet", "Cisco Webex", "Not sure / Open to recommendations", "Multiple platforms"] },
  { id: "display_pref", label: "Display preference", type: "select", options: ["Single large display", "Dual displays", "Interactive touchscreen / whiteboard", "LED video wall", "No preference / Recommend for me"] },
  { id: "audio_needs", label: "Audio requirements", type: "multi", options: ["Ceiling microphones", "Table microphones", "Soundbar (all-in-one)", "Separate speakers", "Not sure — recommend for me"] },
  { id: "camera_needs", label: "Camera features needed", type: "multi", options: ["Auto-framing / speaker tracking", "Panoramic view", "Whiteboard capture", "Content camera", "Basic fixed camera is fine"] },
  { id: "existing_equipment", label: "Existing equipment to keep?", type: "textarea", placeholder: "e.g. We have a 65 inch TV, a Logitech webcam..." },
  { id: "room_features", label: "Room characteristics", type: "multi", options: ["Glass walls", "Hard floors", "High ceilings (12ft+)", "Drop/acoustic tile ceiling", "Windows behind display wall", "Carpeted floors", "Standard drywall"] },
  { id: "budget", label: "Budget range (equipment only)", type: "select", options: ["Under $3,000", "$3,000 - $6,000", "$6,000 - $12,000", "$12,000 - $25,000", "$25,000 - $50,000", "$50,000+", "Not sure yet"] },
  { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Timeline, challenges, brand preferences..." }
];

// ============================================================
// ICONS
// ============================================================
const Check = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Arrow = () => <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Spark = ({s=16}) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 1L12.5 7.5L19 10L12.5 12.5L10 19L7.5 12.5L1 10L7.5 7.5L10 1Z" fill="currentColor"/></svg>;
const Camera = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const Upload = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>;

// ============================================================
// MULTI-SELECT COMPONENT
// ============================================================
function Multi({ options, selected=[], onChange, accent }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
      {options.map(o => {
        const on = selected.includes(o);
        return <button key={o} onClick={() => onChange(on ? selected.filter(s=>s!==o) : [...selected,o])} style={{
          padding:"8px 14px", borderRadius:"20px", cursor:"pointer", fontFamily:"inherit", fontSize:"13px",
          border: on ? `2px solid ${accent}` : "2px solid #1e2436",
          background: on ? `${accent}15` : "rgba(255,255,255,0.015)",
          color: on ? accent : "#7a8899", transition:"all 0.2s",
          display:"flex", alignItems:"center", gap:"5px"
        }}>{on && <Check />}{o}</button>;
      })}
    </div>
  );
}

// ============================================================
// PRODUCT CARD WITH IMAGE PLACEHOLDER
// ============================================================
function ProductCard({ item, accent }) {
  const info = getProductInfo(item.name);
  return (
    <div style={{ padding:"16px 18px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.015)", marginBottom:"8px" }}>
      <div style={{ display:"flex", gap:"14px", alignItems:"flex-start" }}>
        {/* Product Image Placeholder */}
        <div style={{
          width:"64px", height:"64px", borderRadius:"10px", flexShrink:0,
          background:`linear-gradient(135deg, ${info.color}20, ${info.color}08)`,
          border:`1px solid ${info.color}30`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"2px"
        }}>
          <span style={{ fontSize:"24px" }}>{info.icon}</span>
          <span style={{ fontSize:"8px", color:info.color, fontWeight:600, fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:"0.05em" }}>{info.brand}</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"8px" }}>
            <div>
              <div style={{ fontSize:"14px", fontWeight:600, color:"#e2e8f0" }}>{item.name}</div>
              <div style={{ fontSize:"11px", color:"#4b5c73", marginTop:"2px" }}>{item.spec}</div>
            </div>
            <span style={{ fontSize:"15px", fontWeight:700, color:accent, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{item.price}</span>
          </div>
          <div style={{ fontSize:"12px", color:"#8896ab", lineHeight:1.6, marginTop:"8px", paddingTop:"8px", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ color:"#4b5c73", fontWeight:600, fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Why: </span>{item.reason}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ROOM ANALYSIS COMPONENT
// ============================================================
function RoomAnalysis({ analysis, imagePreview }) {
  if (!analysis) return null;
  const a = analysis.roomAssessment || {};
  const r = analysis.recommendations || {};
  return (
    <div style={{ marginBottom:"28px", animation:"slideUp 0.5s ease" }}>
      <div style={{ display:"flex", gap:"16px", alignItems:"flex-start", flexWrap:"wrap" }}>
        {imagePreview && (
          <div style={{ width:"180px", height:"120px", borderRadius:"10px", overflow:"hidden", flexShrink:0, border:"1px solid rgba(255,255,255,0.08)" }}>
            <img src={imagePreview} alt="Room" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        )}
        <div style={{ flex:1, minWidth:"240px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"4px 10px", borderRadius:"12px", background:"rgba(16,185,129,0.1)", color:"#34d399", fontSize:"11px", fontWeight:500, marginBottom:"10px", fontFamily:"'DM Mono',monospace" }}>
            <Camera /> Room Analysis Complete
          </div>
          <p style={{ fontSize:"14px", color:"#94a3b8", lineHeight:1.6, marginBottom:"12px" }}>{analysis.summary}</p>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"8px", marginTop:"12px" }}>
        {[
          { label:"Estimated Size", value: a.estimatedDimensions },
          { label:"Capacity", value: a.estimatedCapacity ? `~${a.estimatedCapacity} people` : null },
          { label:"Ceiling", value: a.ceilingType },
          { label:"Floor", value: a.floorType },
        ].filter(x => x.value).map((x,i) => (
          <div key={i} style={{ padding:"10px 12px", borderRadius:"8px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize:"10px", color:"#4b5c73", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Mono',monospace" }}>{x.label}</div>
            <div style={{ fontSize:"13px", color:"#c5d0de", marginTop:"3px" }}>{x.value}</div>
          </div>
        ))}
      </div>
      {analysis.concerns?.length > 0 && (
        <div style={{ marginTop:"12px", padding:"10px 14px", borderRadius:"8px", background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.15)" }}>
          <span style={{ fontSize:"11px", color:"#fbbf24", fontWeight:600 }}>⚠️ Heads up: </span>
          <span style={{ fontSize:"12px", color:"#8896ab" }}>{analysis.concerns.join(" · ")}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function TrueITCostV2() {
  const [step, setStep] = useState(-1); // -1 = intro/upload
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [roomImage, setRoomImage] = useState(null);
  const [roomMediaType, setRoomMediaType] = useState("image/jpeg");
  const [roomPreview, setRoomPreview] = useState(null);
  const [roomAnalysis, setRoomAnalysis] = useState(null);
  const [analyzingRoom, setAnalyzingRoom] = useState(false);
  const fileRef = useRef(null);
  const accent = "#0ea5e9";

  const field = step >= 0 ? FIELDS[step] : null;
  const total = FIELDS.length;
  const isLast = step === total - 1;

  useEffect(() => {
    if (loading) {
      const msgs = ["Analyzing room dimensions...", "Calculating display size...", "Selecting microphone config...", "Matching cameras to layout...", "Comparing vendor options...", "Building recommendation..."];
      let i = 0; setLoadMsg(msgs[0]);
      const iv = setInterval(() => { i = (i+1) % msgs.length; setLoadMsg(msgs[i]); }, 2200);
      return () => clearInterval(iv);
    }
  }, [loading]);

  const analyzeRoom = async (base64, mediaType) => {
    setAnalyzingRoom(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 2000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: "Analyze this conference room photo for AV/video conferencing design. " + ROOM_ANALYSIS_PROMPT }
          ]}]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text||"").join("")||"";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setRoomAnalysis(parsed);
      // Pre-fill form from analysis
      const a = parsed.roomAssessment || {};
      const r = parsed.recommendations || {};
      const prefill = {};
      
      // Pre-fill dimensions
      if (a.estimatedDimensions) prefill.dimensions = a.estimatedDimensions;
      
      // Pre-fill existing equipment
      if (a.existingEquipment?.length) prefill.existing_equipment = a.existingEquipment.join(", ");
      
      // Pre-fill room type based on capacity
      const cap = parseInt(a.estimatedCapacity) || 0;
      if (cap > 0) {
        if (cap <= 5) { prefill.room_type = "Huddle Room (2-5)"; prefill.capacity = "2-4 people"; }
        else if (cap <= 8) { prefill.room_type = "Medium Conference Room (6-12)"; prefill.capacity = "5-8 people"; }
        else if (cap <= 12) { prefill.room_type = "Medium Conference Room (6-12)"; prefill.capacity = "9-12 people"; }
        else if (cap <= 20) { prefill.room_type = "Large Conference Room (12+ people)"; prefill.capacity = "13-20 people"; }
        else { prefill.room_type = "Training Room / All-Hands"; prefill.capacity = "20+ people"; }
      }
      
      // Pre-fill room features from detected materials
      const features = [];
      const walls = (a.wallMaterials || []).map(w => w.toLowerCase()).join(" ");
      const floor = (a.floorType || "").toLowerCase();
      const ceiling = (a.ceilingType || "").toLowerCase();
      const ceilingH = parseInt(a.ceilingHeight) || 0;
      const windows = (a.windowsAndLighting || "").toLowerCase();
      
      if (walls.includes("glass")) features.push("Glass walls");
      if (walls.includes("drywall")) features.push("Standard drywall");
      if (floor.includes("hard") || floor.includes("wood") || floor.includes("tile") || floor.includes("concrete")) features.push("Hard floors");
      if (floor.includes("carpet")) features.push("Carpeted floors");
      if (ceiling.includes("drop") || ceiling.includes("tile") || ceiling.includes("acoustic")) features.push("Drop/acoustic tile ceiling");
      if (ceiling.includes("high") || ceilingH >= 12) features.push("High ceilings (12ft+)");
      if (windows.includes("behind") || windows.includes("backlight")) features.push("Windows behind display wall");
      if (features.length) prefill.room_features = features;
      
      // Pre-fill audio recommendation
      if (r.microphoneType) {
        const micRec = r.microphoneType.toLowerCase();
        if (micRec.includes("ceiling")) prefill.audio_needs = ["Ceiling microphones", "Separate speakers"];
        else if (micRec.includes("soundbar") || micRec.includes("integrated")) prefill.audio_needs = ["Soundbar (all-in-one)"];
        else if (micRec.includes("table")) prefill.audio_needs = ["Table microphones"];
      }
      
      // Pre-fill camera needs based on room size
      if (cap > 8) {
        prefill.camera_needs = ["Auto-framing / speaker tracking"];
      } else if (cap > 4) {
        prefill.camera_needs = ["Auto-framing / speaker tracking"];
      }
      
      // Pre-fill display preference from recommendations
      if (r.displaySize) {
        const disp = r.displaySize.toLowerCase();
        if (disp.includes("dual")) prefill.display_pref = "Dual displays";
        else if (disp.includes("video wall") || disp.includes("led wall")) prefill.display_pref = "LED video wall";
        else if (disp.includes("interactive") || disp.includes("touch")) prefill.display_pref = "Interactive touchscreen / whiteboard";
        else prefill.display_pref = "Single large display";
      }
      
      setForm(f => ({ ...f, ...prefill }));
    } catch (err) {
      console.error("Room analysis error:", err);
    }
    setAnalyzingRoom(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mediaType = file.type || "image/jpeg";
    setRoomMediaType(mediaType);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRoomPreview(ev.target.result);
      const base64 = ev.target.result.split(",")[1];
      setRoomImage(base64);
      analyzeRoom(base64, mediaType);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      let userContent = [];
      if (roomImage) {
        userContent.push({ type: "image", source: { type: "base64", media_type: roomMediaType, data: roomImage } });
      }
      let text = `Design a complete AV solution for:\n\n${JSON.stringify(form, null, 2)}`;
      if (roomAnalysis) text += `\n\nRoom analysis from uploaded photo:\n${JSON.stringify(roomAnalysis, null, 2)}`;
      text += "\n\nRespond with ONLY the JSON object, no markdown fences, no explanation.";
      userContent.push({ type: "text", text });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 4000,
          system: DESIGN_PROMPT,
          messages: [{ role: "user", content: userContent }]
        })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API returned status ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.content || data.content.length === 0) {
        throw new Error("No response received from AI");
      }
      
      const rawText = data.content.map(c => c.text||"").join("");
      
      if (!rawText.trim()) {
        throw new Error("Empty response from AI");
      }
      
      // Clean and parse JSON
      let clean = rawText.trim();
      clean = clean.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      
      // Try to extract JSON if there's extra text
      const jsonStart = clean.indexOf("{");
      const jsonEnd = clean.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        clean = clean.substring(jsonStart, jsonEnd + 1);
      }
      
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setLoading(false);
    } catch (err) {
      console.error("Generation error:", err);
      setLoading(false);
      setError(err.message || "Failed to generate solution. Please try again.");
    }
  };

  // ============================================================
  // RENDER: INTRO / PHOTO UPLOAD
  // ============================================================
  if (step === -1 && !loading && !result) {
    return (
      <div style={{ minHeight:"100vh", background:"#0b0e17", color:"#c5d0de", fontFamily:"'Outfit',sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
          .up-zone:hover{border-color:${accent} !important;background:${accent}08 !important}
        `}</style>
        <header style={{ padding:"16px 28px", display:"flex", alignItems:"center", gap:"10px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ width:"28px", height:"28px", borderRadius:"7px", background:`linear-gradient(135deg,${accent},#8b5cf6)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:700, color:"#fff" }}>T</div>
          <span style={{ fontSize:"16px", fontWeight:600, color:"#e2e8f0" }}>TrueITCost</span>
          <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"10px", background:`${accent}18`, color:accent, fontWeight:500, fontFamily:"'DM Mono',monospace" }}>Collaboration Architect</span>
        </header>
        <main style={{ maxWidth:"640px", margin:"0 auto", padding:"48px 28px" }}>
          <div style={{ textAlign:"center", marginBottom:"40px", animation:"slideUp 0.6s ease" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"5px 14px", borderRadius:"20px", background:`${accent}12`, border:`1px solid ${accent}25`, marginBottom:"16px", fontSize:"12px", color:accent }}>
              <Spark /> AI-Powered Solutions Architecture
            </div>
            <h1 style={{ fontSize:"28px", fontWeight:700, color:"#e2e8f0", letterSpacing:"-0.03em", marginBottom:"10px", lineHeight:1.2 }}>
              Design your collaboration<br/>room in minutes
            </h1>
            <p style={{ fontSize:"15px", color:"#5a6b80", lineHeight:1.6 }}>Upload a photo of your room for AI analysis, or jump straight to the questionnaire.</p>
          </div>

          {/* Photo Upload Zone */}
          <div style={{ marginBottom:"24px", animation:"slideUp 0.6s ease 0.1s both" }}>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageUpload} style={{ display:"none" }} />
            {!roomPreview ? (
              <div className="up-zone" onClick={() => fileRef.current?.click()} style={{
                padding:"40px 24px", borderRadius:"12px", border:"2px dashed #1e2436",
                background:"rgba(255,255,255,0.01)", cursor:"pointer", textAlign:"center",
                transition:"all 0.3s"
              }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:"12px", color:"#4b5c73" }}><Camera /></div>
                <p style={{ fontSize:"15px", fontWeight:500, color:"#8896ab", marginBottom:"4px" }}>Upload a photo of your room</p>
                <p style={{ fontSize:"12px", color:"#3d4a5c" }}>Our AI will analyze dimensions, surfaces, and existing equipment</p>
              </div>
            ) : (
              <div style={{ borderRadius:"12px", overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)", position:"relative" }}>
                <img src={roomPreview} alt="Room" style={{ width:"100%", maxHeight:"280px", objectFit:"cover", display:"block" }} />
                {analyzingRoom && (
                  <div style={{ position:"absolute", inset:0, background:"rgba(11,14,23,0.85)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"12px" }}>
                    <div style={{ width:"36px", height:"36px", borderRadius:"50%", border:`3px solid ${accent}22`, borderTopColor:accent, animation:"spin 1s linear infinite" }} />
                    <p style={{ fontSize:"13px", color:"#8896ab", animation:"pulse 2s ease infinite" }}>Analyzing your room...</p>
                  </div>
                )}
                {!analyzingRoom && (
                  <button onClick={() => { setRoomPreview(null); setRoomImage(null); setRoomAnalysis(null); setRoomMediaType("image/jpeg"); }} style={{
                    position:"absolute", top:"8px", right:"8px", width:"28px", height:"28px", borderRadius:"50%",
                    background:"rgba(0,0,0,0.6)", border:"none", color:"#fff", cursor:"pointer", fontSize:"14px"
                  }}>✕</button>
                )}
              </div>
            )}
          </div>

          {/* Room Analysis Results */}
          {roomAnalysis && <RoomAnalysis analysis={roomAnalysis} imagePreview={roomPreview} />}

          {/* Start Button */}
          <div style={{ display:"flex", gap:"10px", animation:"slideUp 0.6s ease 0.2s both" }}>
            <button onClick={() => setStep(0)} style={{
              flex:1, padding:"14px 24px", borderRadius:"10px", border:"none", cursor:"pointer", fontFamily:"inherit",
              background:`linear-gradient(135deg,${accent},${accent}cc)`, color:"#fff",
              fontSize:"15px", fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px"
            }}>
              {roomAnalysis ? "Continue to Questionnaire" : "Start Designing"} <Arrow />
            </button>
          </div>
          {roomAnalysis && (
            <p style={{ textAlign:"center", fontSize:"12px", color:"#3d4a5c", marginTop:"10px" }}>
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
      <div style={{ minHeight:"100vh", background:"#0b0e17", color:"#c5d0de", fontFamily:"'Outfit',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"20px" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
          @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
          @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        `}</style>
        <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:`3px solid ${accent}22`, borderTopColor:accent, animation:"spin 1s linear infinite" }} />
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:"17px", fontWeight:500, color:"#e2e8f0", marginBottom:"6px" }}>Designing your solution...</p>
          <p style={{ fontSize:"13px", color:"#5a6b80", animation:"pulse 2.5s ease infinite" }}>{loadMsg}</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: RESULTS
  // ============================================================
  if (result) {
    return (
      <div style={{ minHeight:"100vh", background:"#0b0e17", color:"#c5d0de", fontFamily:"'Outfit',sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        <header style={{ padding:"16px 28px", display:"flex", alignItems:"center", gap:"10px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ width:"28px", height:"28px", borderRadius:"7px", background:`linear-gradient(135deg,${accent},#8b5cf6)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:700, color:"#fff" }}>T</div>
          <span style={{ fontSize:"16px", fontWeight:600, color:"#e2e8f0" }}>TrueITCost</span>
          <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"10px", background:`${accent}18`, color:accent, fontWeight:500, fontFamily:"'DM Mono',monospace" }}>Collaboration Architect</span>
        </header>
        <main style={{ maxWidth:"760px", margin:"0 auto", padding:"36px 28px 60px" }}>
          {roomAnalysis && <RoomAnalysis analysis={roomAnalysis} imagePreview={roomPreview} />}

          <div style={{ animation:"slideUp 0.5s ease" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"4px 10px", borderRadius:"14px", background:"rgba(16,185,129,0.1)", color:"#34d399", fontSize:"11px", fontWeight:500, marginBottom:"14px", fontFamily:"'DM Mono',monospace" }}>
              <Spark s={12} /> AI-Generated Solution
            </div>
            <h1 style={{ fontSize:"24px", fontWeight:700, color:"#e2e8f0", letterSpacing:"-0.03em", marginBottom:"8px" }}>{result.title}</h1>
            <p style={{ fontSize:"14px", color:"#8896ab", lineHeight:1.7, marginBottom:"28px" }}>{result.summary}</p>
          </div>

          {result.sections?.map((sec, si) => (
            <div key={si} style={{ marginBottom:"20px", animation:`slideUp 0.5s ease ${si*0.06}s both` }}>
              <h3 style={{ fontSize:"11px", fontWeight:600, color:"#4b5c73", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px", fontFamily:"'DM Mono',monospace" }}>{sec.heading}</h3>
              {sec.items?.map((item, ii) => <ProductCard key={ii} item={item} accent={accent} />)}
            </div>
          ))}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginBottom:"16px" }}>
            {[
              { label:"Equipment", value: result.totalEstimate },
              { label:"Monthly", value: result.monthlyRecurring },
              { label:"Installation", value: result.installationEstimate }
            ].map((t,i) => (
              <div key={i} style={{ padding:"14px", borderRadius:"10px", background:`${accent}08`, border:`1px solid ${accent}20` }}>
                <div style={{ fontSize:"10px", color:"#4b5c73", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Mono',monospace", marginBottom:"4px" }}>{t.label}</div>
                <div style={{ fontSize:"16px", fontWeight:700, color:accent, fontFamily:"'DM Mono',monospace" }}>{t.value||"N/A"}</div>
              </div>
            ))}
          </div>

          {result.notes && (
            <div style={{ padding:"12px 16px", borderRadius:"10px", background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.12)", fontSize:"12px", color:"#8896ab", lineHeight:1.6, marginBottom:"16px" }}>
              <span style={{ color:"#fbbf24", fontWeight:600 }}>💡 </span>{result.notes}
            </div>
          )}

          {result.alternatives?.length > 0 && (
            <div style={{ marginBottom:"16px" }}>
              <h3 style={{ fontSize:"11px", fontWeight:600, color:"#4b5c73", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px", fontFamily:"'DM Mono',monospace" }}>Alternatives</h3>
              {result.alternatives.map((a,i) => (
                <div key={i} style={{ padding:"12px 16px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.04)", background:"rgba(255,255,255,0.01)", marginBottom:"6px" }}>
                  <div style={{ fontSize:"13px", fontWeight:500, color:"#c5d0de", marginBottom:"3px" }}>{a.description}</div>
                  <div style={{ fontSize:"11px", color:"#5a6b80" }}>{a.tradeoff} · <span style={{color:accent}}>{a.priceImpact}</span></div>
                </div>
              ))}
            </div>
          )}

          {result.questionsToAskVendor?.length > 0 && (
            <div style={{ marginBottom:"24px" }}>
              <h3 style={{ fontSize:"11px", fontWeight:600, color:"#4b5c73", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px", fontFamily:"'DM Mono',monospace" }}>Questions for Your Vendor</h3>
              <div style={{ padding:"12px 16px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.04)", background:"rgba(255,255,255,0.01)" }}>
                {result.questionsToAskVendor.map((q,i) => (
                  <div key={i} style={{ fontSize:"12px", color:"#8896ab", lineHeight:1.7, padding:"3px 0", display:"flex", gap:"8px" }}>
                    <span style={{ color:accent, fontWeight:600 }}>{i+1}.</span>{q}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
            <button onClick={() => { setResult(null); setStep(0); }} style={{ padding:"12px 18px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#6b7c91", fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>← Modify</button>
            <button style={{ flex:1, minWidth:"180px", padding:"12px 18px", borderRadius:"8px", border:"none", background:`linear-gradient(135deg,${accent},${accent}cc)`, color:"#fff", fontSize:"14px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Request Quote from InterPeak →</button>
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
      <div style={{ minHeight:"100vh", background:"#0b0e17", color:"#c5d0de", fontFamily:"'Outfit',sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        <header style={{ padding:"16px 28px", display:"flex", alignItems:"center", gap:"10px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ width:"28px", height:"28px", borderRadius:"7px", background:`linear-gradient(135deg,${accent},#8b5cf6)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:700, color:"#fff" }}>T</div>
          <span style={{ fontSize:"16px", fontWeight:600, color:"#e2e8f0" }}>TrueITCost</span>
        </header>
        <main style={{ maxWidth:"480px", margin:"0 auto", padding:"80px 28px", textAlign:"center", animation:"slideUp 0.5s ease" }}>
          <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"rgba(239,68,68,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"24px" }}>⚠️</div>
          <h2 style={{ fontSize:"20px", fontWeight:600, color:"#e2e8f0", marginBottom:"10px" }}>Something went wrong</h2>
          <p style={{ fontSize:"14px", color:"#6b7c91", lineHeight:1.6, marginBottom:"8px" }}>{error}</p>
          <p style={{ fontSize:"12px", color:"#4b5c73", lineHeight:1.6, marginBottom:"28px" }}>This usually means the AI service is temporarily unavailable. Your answers have been saved.</p>
          <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
            <button onClick={() => { setError(null); setStep(total - 1); }} style={{ padding:"10px 20px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#8896ab", fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>← Back to Questions</button>
            <button onClick={() => { setError(null); generate(); }} style={{ padding:"10px 20px", borderRadius:"8px", border:"none", background:`linear-gradient(135deg,${accent},${accent}cc)`, color:"#fff", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:"6px" }}><Spark s={13} /> Try Again</button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // RENDER: QUESTIONNAIRE
  // ============================================================
  return (
    <div style={{ minHeight:"100vh", background:"#0b0e17", color:"#c5d0de", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .sb:hover{border-color:${accent} !important;background:${accent}12 !important;color:#c5d0de !important}
        input:focus,textarea:focus{border-color:${accent} !important;outline:none}
      `}</style>
      <header style={{ padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <button onClick={() => setStep(-1)} style={{ padding:"5px 10px", borderRadius:"6px", border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#6b7c91", cursor:"pointer", fontSize:"12px", fontFamily:"inherit" }}>← Back</button>
          <span style={{ fontSize:"14px", fontWeight:500, color:"#8896ab" }}>🎥 Collaboration</span>
        </div>
      </header>
      <main style={{ maxWidth:"640px", margin:"0 auto", padding:"32px 28px 60px" }}>
        {/* Progress */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"24px" }}>
          <div style={{ flex:1, height:"3px", background:"#161b28", borderRadius:"2px", overflow:"hidden" }}>
            <div style={{ width:`${((step+1)/total)*100}%`, height:"100%", background:`linear-gradient(90deg,${accent},${accent}88)`, borderRadius:"2px", transition:"width 0.4s" }} />
          </div>
          <span style={{ color:"#4b5c73", fontSize:"11px", fontFamily:"'DM Mono',monospace" }}>{step+1}/{total}</span>
        </div>

        <div key={step} style={{ animation:"slideUp 0.3s ease" }}>
          <h2 style={{ fontSize:"20px", fontWeight:600, color:"#e2e8f0", marginBottom:"4px", letterSpacing:"-0.02em" }}>{field.label}</h2>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
            <p style={{ fontSize:"11px", color:"#4b5c73", fontFamily:"'DM Mono',monospace" }}>Step {step+1} of {total}</p>
            {form[field.id] && roomAnalysis && (
              <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"10px", background:"rgba(16,185,129,0.1)", color:"#34d399", fontFamily:"'DM Mono',monospace" }}>📷 Pre-filled from photo</span>
            )}
          </div>

          {field.type === "select" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
              {field.options.map(o => {
                const on = form[field.id] === o;
                return <button key={o} className="sb" onClick={() => { setForm(f=>({...f,[field.id]:o})); if (!isLast) setTimeout(()=>setStep(s=>s+1),200); }} style={{
                  padding:"12px 15px", borderRadius:"10px", textAlign:"left", cursor:"pointer", fontFamily:"inherit", fontSize:"13px",
                  border: on ? `2px solid ${accent}` : "2px solid #181d2b",
                  background: on ? `${accent}12` : "rgba(255,255,255,0.01)",
                  color: on ? "#e2e8f0" : "#6b7c91", transition:"all 0.2s",
                  display:"flex", justifyContent:"space-between", alignItems:"center"
                }}>{o}{on && <Check />}</button>;
              })}
            </div>
          )}
          {field.type === "multi" && <Multi options={field.options} selected={form[field.id]||[]} onChange={v=>setForm(f=>({...f,[field.id]:v}))} accent={accent} />}
          {field.type === "text" && <input type="text" value={form[field.id]||""} onChange={e=>setForm(f=>({...f,[field.id]:e.target.value}))} placeholder={field.placeholder} style={{ width:"100%", padding:"12px 15px", borderRadius:"10px", fontSize:"14px", fontFamily:"inherit", border:"2px solid #181d2b", background:"rgba(255,255,255,0.015)", color:"#e2e8f0", transition:"border-color 0.2s" }} />}
          {field.type === "textarea" && <textarea value={form[field.id]||""} onChange={e=>setForm(f=>({...f,[field.id]:e.target.value}))} placeholder={field.placeholder} rows={3} style={{ width:"100%", padding:"12px 15px", borderRadius:"10px", fontSize:"13px", fontFamily:"inherit", border:"2px solid #181d2b", background:"rgba(255,255,255,0.015)", color:"#e2e8f0", resize:"vertical", transition:"border-color 0.2s", lineHeight:1.5 }} />}
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:"24px" }}>
          <button onClick={() => step > 0 ? setStep(s=>s-1) : setStep(-1)} style={{ padding:"9px 16px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.06)", background:"transparent", color:"#5a6b80", fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
          <button onClick={() => isLast ? generate() : setStep(s=>s+1)} style={{
            padding:"9px 20px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"inherit",
            background: isLast ? `linear-gradient(135deg,${accent},${accent}cc)` : "rgba(255,255,255,0.04)",
            color: isLast ? "#fff" : "#6b7c91", fontSize:"13px", fontWeight: isLast ? 600 : 400,
            display:"flex", alignItems:"center", gap:"6px"
          }}>
            {isLast ? <><Spark s={13} /> Generate Solution</> : <>Next <Arrow /></>}
          </button>
        </div>
      </main>
    </div>
  );
}
