'use client';

import { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';

const CATEGORIES = [
  {
    id: "collaboration",
    icon: "🎥",
    title: "Collaboration & Video",
    subtitle: "Conference rooms, huddle spaces, video endpoints",
    color: "#0ea5e9",
    fields: [
      { id: "room_type", label: "What type of space?", type: "select", options: ["Large Conference Room (12+ people)", "Medium Conference Room (6-12)", "Huddle Room (2-5)", "Executive Office", "Training Room / All-Hands", "Open Collaboration Area"] },
      { id: "dimensions", label: "Room dimensions (LxW in feet)", type: "text", placeholder: "e.g. 20x15" },
      { id: "platform", label: "Which platform do you use?", type: "select", options: ["Microsoft Teams", "Zoom", "Google Meet", "Cisco Webex", "Not sure / Open to recommendations", "Multiple platforms"] },
      { id: "display_pref", label: "Display preference", type: "select", options: ["Single large display", "Dual displays", "LED video wall", "No preference / Recommend for me"] },
      { id: "audio_needs", label: "Audio requirements", type: "multi", options: ["Ceiling microphones", "Table microphones", "Soundbar", "Separate speakers", "Wireless audio sharing", "Not sure"] },
      { id: "camera_needs", label: "Camera features needed", type: "multi", options: ["Auto-framing / speaker tracking", "Panoramic view", "Multiple camera angles", "Whiteboard capture", "Content camera", "Basic fixed camera is fine"] },
      { id: "budget", label: "Budget range", type: "select", options: ["Under $5,000", "$5,000 - $10,000", "$10,000 - $25,000", "$25,000 - $50,000", "$50,000+", "Not sure yet"] },
      { id: "notes", label: "Anything else we should know?", type: "textarea", placeholder: "Existing equipment, specific challenges, timeline, etc." }
    ]
  },
  {
    id: "ucaas",
    icon: "📞",
    title: "UCaaS & Voice",
    subtitle: "Cloud phone systems, contact center, SIP trunking",
    color: "#8b5cf6",
    fields: [
      { id: "user_count", label: "How many total users/extensions?", type: "select", options: ["1-10 users", "11-25 users", "26-50 users", "51-100 users", "101-250 users", "250+ users"] },
      { id: "locations", label: "How many office locations?", type: "select", options: ["1 location", "2-3 locations", "4-10 locations", "10+ locations", "Fully remote"] },
      { id: "current_system", label: "What's your current phone system?", type: "select", options: ["Traditional PBX (on-premise)", "Hosted VoIP (already cloud)", "Analog / POTS lines", "No phone system yet", "Not sure"] },
      { id: "contact_center", label: "Do you need a contact center?", type: "select", options: ["No, just standard phones", "Yes, basic call queues (under 10 agents)", "Yes, full contact center (10+ agents)", "Yes, omnichannel (voice + chat + email)", "Not sure"] },
      { id: "features_needed", label: "Must-have features", type: "multi", options: ["Mobile app / softphone", "Call recording", "Auto attendant / IVR", "CRM integration", "SMS / texting", "Video meetings built-in", "Fax capability", "International calling", "E911 compliance"] },
      { id: "integrations", label: "Key integrations needed", type: "multi", options: ["Microsoft Teams", "Salesforce", "HubSpot", "Epic EHR", "Google Workspace", "Slack", "Other CRM", "None / Not sure"] },
      { id: "budget_voice", label: "Monthly budget per user", type: "select", options: ["Under $15/user", "$15-25/user", "$25-40/user", "$40+/user", "Not sure / Need guidance"] },
      { id: "notes", label: "Special requirements or challenges?", type: "textarea", placeholder: "Compliance needs, porting numbers, specific pain points..." }
    ]
  },
  {
    id: "networking",
    icon: "🌐",
    title: "Network Infrastructure",
    subtitle: "Switches, Wi-Fi, firewalls, SD-WAN, cabling",
    color: "#10b981",
    fields: [
      { id: "project_type", label: "What type of project?", type: "select", options: ["New office buildout", "Network refresh / upgrade", "Adding Wi-Fi coverage", "Firewall / security upgrade", "SD-WAN deployment", "Network troubleshooting / assessment"] },
      { id: "office_size", label: "Office square footage", type: "text", placeholder: "e.g. 5000 sq ft" },
      { id: "device_count", label: "How many wired devices?", type: "select", options: ["Under 25", "25-50", "51-100", "101-250", "250+"] },
      { id: "wireless_users", label: "How many wireless users/devices?", type: "select", options: ["Under 25", "25-50", "51-100", "101-250", "250+"] },
      { id: "requirements", label: "Network requirements", type: "multi", options: ["Guest Wi-Fi (isolated)", "VoIP support / QoS", "VLAN segmentation", "PoE for cameras/phones", "Redundant internet", "VPN for remote workers", "IoT device support", "Outdoor Wi-Fi coverage"] },
      { id: "current_isp", label: "Current internet connection", type: "select", options: ["Fiber (1Gbps+)", "Fiber (under 1Gbps)", "Cable / coax", "DSL", "Fixed wireless", "Not sure", "Multiple ISPs"] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $5,000", "$5,000 - $15,000", "$15,000 - $30,000", "$30,000 - $75,000", "$75,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Floor plan available? Existing equipment? Compliance requirements?" }
    ]
  },
  {
    id: "datacenter",
    icon: "🏗️",
    title: "Data Center & Cloud",
    subtitle: "Server rooms, cloud migration, hybrid infrastructure",
    color: "#f59e0b",
    fields: [
      { id: "project_scope", label: "What are you looking to do?", type: "select", options: ["Build new server room / data center", "Migrate to cloud (full)", "Hybrid cloud setup", "Server refresh / upgrade", "Disaster recovery site", "Colocation evaluation"] },
      { id: "current_state", label: "Current infrastructure", type: "select", options: ["All on-premise servers", "Mostly on-premise, some cloud", "Mostly cloud, some on-premise", "Starting from scratch", "Not sure of current state"] },
      { id: "workloads", label: "Primary workloads", type: "multi", options: ["File server / storage", "Email (Exchange)", "Active Directory / identity", "Line-of-business applications", "Database servers (SQL)", "Web servers", "Virtual desktops (VDI)", "Backup & replication", "Development / test environments"] },
      { id: "vm_count", label: "Number of servers / VMs", type: "select", options: ["1-5", "6-15", "16-30", "31-50", "50+", "Not sure"] },
      { id: "storage_needs", label: "Total storage requirements", type: "select", options: ["Under 1 TB", "1-5 TB", "5-20 TB", "20-50 TB", "50+ TB", "Not sure"] },
      { id: "compliance", label: "Compliance requirements", type: "multi", options: ["HIPAA", "PCI-DSS", "SOC 2", "CMMC / NIST 800-171", "FERPA", "None / Not sure"] },
      { id: "budget_dc", label: "Budget range", type: "select", options: ["Under $25,000", "$25,000 - $50,000", "$50,000 - $100,000", "$100,000 - $250,000", "$250,000+", "Need guidance"] },
      { id: "notes", label: "Additional context?", type: "textarea", placeholder: "Timeline, existing contracts, specific applications..." }
    ]
  },
  {
    id: "security",
    icon: "🛡️",
    title: "Cybersecurity",
    subtitle: "Endpoint protection, SIEM, compliance, zero trust",
    color: "#ef4444",
    fields: [
      { id: "security_goal", label: "Primary goal", type: "select", options: ["Comprehensive security assessment", "Endpoint protection deployment", "Compliance readiness (HIPAA, PCI, etc.)", "Incident response planning", "Security awareness training", "Zero trust implementation", "Email security hardening"] },
      { id: "employee_count", label: "Number of employees", type: "select", options: ["1-10", "11-25", "26-50", "51-100", "101-250", "250+"] },
      { id: "industry", label: "Your industry", type: "select", options: ["Healthcare", "Financial services", "Manufacturing", "Legal", "Government / public sector", "Retail / ecommerce", "Professional services", "Other"] },
      { id: "current_tools", label: "Current security tools in place", type: "multi", options: ["Antivirus (traditional)", "EDR / XDR", "Firewall with UTM", "Email filtering", "MFA everywhere", "Security awareness training", "Backup solution", "SIEM / log management", "Dark web monitoring", "None / starting fresh"] },
      { id: "pain_points", label: "Biggest concerns", type: "multi", options: ["Ransomware protection", "Phishing attacks", "Insider threats", "Compliance audit coming up", "No visibility into threats", "Shadow IT / unmanaged devices", "Remote worker security", "Third-party vendor risk"] },
      { id: "compliance_req", label: "Compliance framework needed", type: "multi", options: ["HIPAA", "PCI-DSS", "SOC 2", "CMMC", "NIST CSF", "CIS Controls", "ISO 27001", "None / Not sure"] },
      { id: "budget_sec", label: "Monthly security budget per user", type: "select", options: ["Under $5/user", "$5-15/user", "$15-30/user", "$30+/user", "Need guidance"] },
      { id: "notes", label: "Tell us more about your situation", type: "textarea", placeholder: "Recent incidents, audit dates, specific concerns..." }
    ]
  },
  {
    id: "bcdr",
    icon: "🔄",
    title: "Backup & Disaster Recovery",
    subtitle: "Business continuity, backup, failover, RTO/RPO planning",
    color: "#6366f1",
    fields: [
      { id: "bcdr_goal", label: "What are you solving for?", type: "select", options: ["No backup solution currently", "Replacing current backup", "Adding disaster recovery", "Full BCP / DR planning", "Cloud-to-cloud backup (M365, Google)", "Compliance-driven backup requirements"] },
      { id: "data_volume", label: "Total data to protect", type: "select", options: ["Under 500 GB", "500 GB - 2 TB", "2 TB - 10 TB", "10 TB - 50 TB", "50+ TB", "Not sure"] },
      { id: "rto", label: "Recovery Time Objective (how fast do you need to be back up?)", type: "select", options: ["Minutes (near-zero downtime)", "1-4 hours", "4-8 hours", "Same day", "Next business day", "Not sure / Help me decide"] },
      { id: "rpo", label: "Recovery Point Objective (how much data can you lose?)", type: "select", options: ["None (real-time replication)", "15 minutes", "1 hour", "4 hours", "24 hours", "Not sure / Help me decide"] },
      { id: "environment", label: "What needs protecting?", type: "multi", options: ["Physical servers", "Virtual machines (VMware/Hyper-V)", "Microsoft 365 (email, SharePoint, OneDrive)", "Google Workspace", "Cloud servers (AWS/Azure)", "Workstations / laptops", "Databases (SQL)", "SaaS applications"] },
      { id: "retention", label: "How long do you need to retain backups?", type: "select", options: ["30 days", "90 days", "1 year", "3+ years", "7+ years (compliance)", "Not sure"] },
      { id: "budget_bcdr", label: "Monthly budget", type: "select", options: ["Under $200/mo", "$200-500/mo", "$500-1,500/mo", "$1,500-3,000/mo", "$3,000+/mo", "Need guidance"] },
      { id: "notes", label: "Additional context?", type: "textarea", placeholder: "Current backup solution, recent data loss events, compliance deadlines..." }
    ]
  }
];

const MOCK_RECOMMENDATION = {
  collaboration: {
    title: "Recommended Conference Room Build",
    summary: "Based on your 20x15 ft room for 12 people using Microsoft Teams, here's a setup that maximizes video quality and audio coverage while staying within your budget.",
    sections: [
      {
        heading: "Display",
        items: [
          { name: "75\" Samsung QM75C Commercial Display", spec: "4K UHD, built-in Teams certification", price: "$2,400", reason: "Optimal size for 20ft viewing distance — covers the full wall visibility zone for all 12 seats" }
        ]
      },
      {
        heading: "Camera",
        items: [
          { name: "Poly Studio E70 Smart Camera", spec: "Dual 20MP lenses, AI speaker tracking, whiteboard mode", price: "$3,200", reason: "Auto-frames active speakers and provides panoramic view of the full table — critical for rooms with 12+ participants" }
        ]
      },
      {
        heading: "Audio",
        items: [
          { name: "Shure MXA920 Ceiling Microphone Array", spec: "Steerable coverage zones, Dante-enabled", price: "$2,800", reason: "Eliminates table clutter, covers 20x15 room with configurable pickup zones — no dead spots at end seats" },
          { name: "Shure MXN5-C Ceiling Speakers (x2)", spec: "Dante networked speakers", price: "$1,200", reason: "Even audio distribution across the full room — far-end participants sound natural from every seat" }
        ]
      },
      {
        heading: "Compute",
        items: [
          { name: "Lenovo ThinkSmart Core + Controller", spec: "Teams Rooms certified, touch panel controller", price: "$3,100", reason: "Native Teams Rooms experience — one-touch join, wireless sharing, calendar integration out of the box" }
        ]
      }
    ],
    totalEstimate: "$12,700",
    notes: "This build prioritizes audio quality (the #1 complaint in conference rooms) and automatic framing so remote participants always see who's speaking. Installation and cabling typically adds $1,500-2,500 depending on your AV integrator."
  }
};

interface Field {
  id: string;
  label: string;
  type: 'select' | 'multi' | 'text' | 'textarea';
  options?: string[];
  placeholder?: string;
}

interface Category {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  fields: Field[];
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SparkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 1L12.5 7.5L19 10L12.5 12.5L10 19L7.5 12.5L1 10L7.5 7.5L10 1Z" fill="currentColor"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H10L14 6V13C14 13.5523 13.5523 14 13 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 14V9H5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 2V5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function MultiSelect({ options, selected = [], onChange }: { options: string[], selected: string[], onChange: (val: string[]) => void }) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            border: selected.includes(opt) ? "2px solid #0ea5e9" : "2px solid #2a2f3a",
            background: selected.includes(opt) ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.03)",
            color: selected.includes(opt) ? "#38bdf8" : "#94a3b8",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "inherit"
          }}
        >
          {selected.includes(opt) && <CheckIcon />}
          {opt}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ current, total, color }: { current: number, total: number, color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
      <div style={{ flex: 1, height: "4px", background: "#1e2330", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          width: `${(current / total) * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: "2px",
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)"
        }} />
      </div>
      <span style={{ color: "#64748b", fontSize: "13px", fontFamily: "'DM Mono', monospace", minWidth: "40px" }}>
        {current}/{total}
      </span>
    </div>
  );
}

export default function AISolutionsArchitect() {
  const router = useRouter();
  const [view, setView] = useState<'home' | 'configure'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const category = CATEGORIES.find(c => c.id === selectedCategory);

  const handleCategorySelect = (catId: string) => {
    // Redirect to dedicated Collaboration page
    if (catId === 'collaboration') {
      router.push('/ai-solutions/collaboration');
      return;
    }

    setSelectedCategory(catId);
    setCurrentStep(0);
    setFormData({});
    setShowResult(false);
    setView('configure');
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = () => {
    if (category && currentStep < category.fields.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (contentRef.current) contentRef.current.scrollTop = 0;
    } else {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setShowResult(true);
      }, 3000);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const currentField = category?.fields[currentStep];
  const isLastStep = category && currentStep === category.fields.length - 1;

  // HOME VIEW
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950">
        <SiteHeader />

        <div style={{
          minHeight: "calc(100vh - 80px)",
          background: "#0c0f18",
          color: "#e2e8f0",
          fontFamily: "'Outfit', sans-serif",
          position: "relative",
          overflow: "hidden"
        }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
            @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .cat-card:hover { transform: translateY(-4px) !important; border-color: var(--accent) !important; box-shadow: 0 8px 40px var(--glow) !important; }
            .cat-card:hover .cat-arrow { transform: translateX(4px); opacity: 1; }
          `}</style>

          {/* Ambient background */}
          <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-300px", left: "-200px", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

          <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: "64px", animation: "slideUp 0.8s ease" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", marginBottom: "20px", fontSize: "13px", color: "#38bdf8" }}>
                <SparkIcon /> AI-Powered Solutions Architecture
              </div>
              <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "16px" }}>
                Design your IT solution<br />
                <span style={{ background: "linear-gradient(135deg, #0ea5e9, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in minutes, not weeks</span>
              </h1>
              <p style={{ fontSize: "17px", color: "#64748b", maxWidth: "560px", margin: "0 auto", lineHeight: 1.6 }}>
                Tell us what you need. Our AI architect will design a complete, vendor-neutral solution with real pricing — no sales calls required.
              </p>
            </div>

            {/* Category Grid */}
            <div style={{ marginBottom: "64px" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 500, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px", fontFamily: "'DM Mono', monospace", animation: "slideUp 0.8s ease 0.1s both" }}>Choose your project type</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
                {CATEGORIES.map((cat, i) => (
                  <div
                    key={cat.id}
                    className="cat-card"
                    onClick={() => handleCategorySelect(cat.id)}
                    style={{
                      // @ts-ignore
                      "--accent": cat.color,
                      "--glow": cat.color + "20",
                      padding: "24px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                      animation: `slideUp 0.6s ease ${0.1 + i * 0.05}s both`
                    }}
                  >
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "10px",
                      background: `${cat.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "22px", flexShrink: 0
                    }}>
                      {cat.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{cat.title}</h3>
                        <span className="cat-arrow" style={{ color: "#475569", opacity: 0, transition: "all 0.3s" }}>
                          <ArrowRight />
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>{cat.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // CONFIGURE VIEW
  if (view === 'configure' && !showResult && category) {
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950">
        <SiteHeader />

        <div style={{
          minHeight: "calc(100vh - 80px)",
          background: "#0c0f18",
          color: "#e2e8f0",
          fontFamily: "'Outfit', sans-serif"
        }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
            @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
            .opt-btn:hover { border-color: ${category?.color} !important; background: ${category?.color}15 !important; color: #e2e8f0 !important; }
          `}</style>

          {/* Header */}
          <header style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => setView('home')} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>← Back</button>
              <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: "20px" }}>{category?.icon}</span>
              <span style={{ fontSize: "15px", fontWeight: 500 }}>{category?.title}</span>
            </div>
          </header>

          {/* Generation Loading */}
          {isGenerating ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: "24px", animation: "fadeIn 0.5s ease" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                border: `3px solid ${category?.color}20`,
                borderTopColor: category?.color,
                animation: "spin 1s linear infinite"
              }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "18px", fontWeight: 500, marginBottom: "8px" }}>Designing your solution...</p>
                <p style={{ fontSize: "14px", color: "#475569", animation: "pulse 2s ease infinite" }}>Analyzing requirements, comparing vendors, calculating costs</p>
              </div>
            </div>
          ) : (
            <main ref={contentRef} style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 40px" }}>
              <ProgressBar current={currentStep + 1} total={category?.fields.length} color={category?.color} />

              <div key={currentStep} style={{ animation: "slideUp 0.4s ease" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  {currentField?.label}
                </h2>
                <p style={{ fontSize: "13px", color: "#475569", marginBottom: "28px" }}>
                  Step {currentStep + 1} of {category?.fields.length}
                </p>

                {currentField?.type === 'select' && currentField.options && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {currentField.options.map(opt => (
                      <button
                        key={opt}
                        className="opt-btn"
                        onClick={() => { handleFieldChange(currentField.id, opt); if (!isLastStep) setTimeout(handleNext, 300); }}
                        style={{
                          padding: "14px 18px",
                          borderRadius: "10px",
                          border: formData[currentField.id] === opt ? `2px solid ${category?.color}` : "2px solid rgba(255,255,255,0.06)",
                          background: formData[currentField.id] === opt ? `${category?.color}15` : "rgba(255,255,255,0.02)",
                          color: formData[currentField.id] === opt ? "#e2e8f0" : "#94a3b8",
                          fontSize: "14px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s",
                          fontFamily: "inherit",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        {opt}
                        {formData[currentField.id] === opt && <CheckIcon />}
                      </button>
                    ))}
                  </div>
                )}

                {currentField?.type === 'multi' && currentField.options && (
                  <div>
                    <MultiSelect
                      options={currentField.options}
                      selected={formData[currentField.id] || []}
                      onChange={(val) => handleFieldChange(currentField.id, val)}
                    />
                    <p style={{ fontSize: "12px", color: "#475569", marginTop: "12px" }}>Select all that apply</p>
                  </div>
                )}

                {currentField?.type === 'text' && (
                  <input
                    type="text"
                    value={formData[currentField.id] || ""}
                    onChange={(e) => handleFieldChange(currentField.id, e.target.value)}
                    placeholder={currentField.placeholder}
                    style={{
                      width: "100%", padding: "14px 18px", borderRadius: "10px",
                      border: "2px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
                      color: "#e2e8f0", fontSize: "15px", outline: "none", fontFamily: "inherit",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = category?.color}
                    onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                )}

                {currentField?.type === 'textarea' && (
                  <textarea
                    value={formData[currentField.id] || ""}
                    onChange={(e) => handleFieldChange(currentField.id, e.target.value)}
                    placeholder={currentField.placeholder}
                    rows={4}
                    style={{
                      width: "100%", padding: "14px 18px", borderRadius: "10px",
                      border: "2px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
                      color: "#e2e8f0", fontSize: "15px", outline: "none", fontFamily: "inherit",
                      resize: "vertical", transition: "border-color 0.2s", lineHeight: 1.5
                    }}
                    onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = category?.color}
                    onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                )}
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "36px" }}>
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  style={{
                    padding: "10px 20px", borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent", color: currentStep === 0 ? "#334155" : "#94a3b8",
                    cursor: currentStep === 0 ? "default" : "pointer",
                    fontSize: "14px", fontFamily: "inherit"
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  style={{
                    padding: "10px 24px", borderRadius: "8px", border: "none",
                    background: isLastStep ? `linear-gradient(135deg, ${category?.color}, ${category?.color}cc)` : "rgba(255,255,255,0.06)",
                    color: isLastStep ? "#fff" : "#94a3b8",
                    cursor: "pointer", fontSize: "14px", fontWeight: 500, fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: "8px"
                  }}
                >
                  {isLastStep ? (
                    <><SparkIcon /> Generate Solution</>
                  ) : (
                    <>Next <ArrowRight /></>
                  )}
                </button>
              </div>
            </main>
          )}
        </div>
      </div>
    );
  }

  // RESULT VIEW
  if (view === 'configure' && showResult && category) {
    const rec = MOCK_RECOMMENDATION.collaboration;
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950">
        <SiteHeader />

        <div style={{
          minHeight: "calc(100vh - 80px)",
          background: "#0c0f18",
          color: "#e2e8f0",
          fontFamily: "'Outfit', sans-serif"
        }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
            @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}</style>

          <header style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => setView('home')} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>← Back</button>
              <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: "20px" }}>{category?.icon}</span>
              <span style={{ fontSize: "15px", fontWeight: 500 }}>{category?.title}</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
                <SaveIcon /> Save Configuration
              </button>
              <button style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", fontSize: "13px", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>
                Export PDF
              </button>
            </div>
          </header>

          <main style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 40px" }}>
            {/* Result Header */}
            <div style={{ marginBottom: "40px", animation: "slideUp 0.6s ease" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 12px", borderRadius: "16px", background: "rgba(16,185,129,0.1)", color: "#34d399", fontSize: "12px", fontWeight: 500, marginBottom: "16px", fontFamily: "'DM Mono', monospace" }}>
                <SparkIcon /> AI-Generated Solution
              </div>
              <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "10px" }}>{rec.title}</h1>
              <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.6 }}>{rec.summary}</p>
            </div>

            {/* Solution Sections */}
            {rec.sections.map((section, si) => (
              <div key={section.heading} style={{ marginBottom: "24px", animation: `slideUp 0.6s ease ${0.1 + si * 0.1}s both` }}>
                <h3 style={{ fontSize: "11px", fontWeight: 500, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>{section.heading}</h3>
                {section.items.map((item, ii) => (
                  <div key={ii} style={{
                    padding: "18px 20px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    marginBottom: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{item.spec}</div>
                      </div>
                      <span style={{
                        fontSize: "15px", fontWeight: 600, color: category?.color,
                        fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", marginLeft: "16px"
                      }}>
                        {item.price}
                      </span>
                    </div>
                    <div style={{
                      fontSize: "13px", color: "#94a3b8", lineHeight: 1.5,
                      marginTop: "10px", paddingTop: "10px",
                      borderTop: "1px solid rgba(255,255,255,0.04)"
                    }}>
                      <span style={{ color: "#475569", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Why this: </span>
                      {item.reason}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Total */}
            <div style={{
              padding: "20px 24px",
              borderRadius: "10px",
              background: `linear-gradient(135deg, ${category?.color}10, ${category?.color}05)`,
              border: `1px solid ${category?.color}30`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "24px",
              animation: "slideUp 0.6s ease 0.5s both"
            }}>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Estimated Total (equipment only)</span>
              <span style={{ fontSize: "24px", fontWeight: 700, color: category?.color, fontFamily: "'DM Mono', monospace" }}>{rec.totalEstimate}</span>
            </div>

            {/* Notes */}
            <div style={{
              padding: "16px 20px", borderRadius: "10px",
              background: "rgba(245,158,11,0.05)",
              border: "1px solid rgba(245,158,11,0.15)",
              fontSize: "13px", color: "#94a3b8", lineHeight: 1.6,
              animation: "slideUp 0.6s ease 0.6s both"
            }}>
              <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "12px" }}>💡 Note: </span>
              {rec.notes}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "32px", animation: "slideUp 0.6s ease 0.7s both" }}>
              <button
                onClick={() => { setShowResult(false); setCurrentStep(0); }}
                style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}
              >
                Modify Requirements
              </button>
              <button style={{ padding: "12px 20px", borderRadius: "8px", border: "none", background: "rgba(16,185,129,0.15)", color: "#34d399", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                Ask Sparky a Question
              </button>
              <button style={{ flex: 1, padding: "12px 20px", borderRadius: "8px", border: "none", background: `linear-gradient(135deg, ${category?.color}, ${category?.color}cc)`, color: "#fff", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                Request Quote from InterPeak →
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}
