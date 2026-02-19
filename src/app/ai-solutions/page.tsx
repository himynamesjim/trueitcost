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
    // Base field shown first before branching
    fields: [
      { id: "solution_type", label: "What type of solution are you looking for?", type: "multi", options: [
        { label: "UCaaS Only", description: "Cloud phone system for your whole business — calling, messaging, and meetings for every employee" },
        { label: "UCaaS + CCaaS", description: "Cloud phone system combined with a contact center — great for businesses that need both internal comms and customer-facing agents" },
        { label: "CCaaS Only", description: "Contact center platform only — for teams handling inbound/outbound customer calls, chats, or omnichannel support" },
      ] },
    ],
    // UCaaS-only questions
    fieldsUCaaS: [
      { id: "user_count", label: "How many total users/extensions?", type: "select", options: ["1-10 users", "11-25 users", "26-50 users", "51-100 users", "101-250 users", "250+ users"] },
      { id: "locations", label: "How many office locations?", type: "select", options: ["1 location", "2-3 locations", "4-10 locations", "10+ locations", "Fully remote"] },
      { id: "current_system", label: "What's your current phone system?", type: "select", options: ["Traditional PBX (on-premise)", "Hosted VoIP (already cloud)", "Analog / POTS lines", "No phone system yet", "Not sure"] },
      { id: "features_needed", label: "Must-have features", type: "multi", options: [
        { label: "Mobile app / softphone", description: "Make & receive calls from your smartphone or desktop app" },
        { label: "Call recording", description: "Automatically record calls for compliance, training, or review" },
        { label: "Auto attendant / IVR", description: "Automated menus that route callers to the right person or department" },
        { label: "CRM integration", description: "Sync call activity with Salesforce, HubSpot, or other CRMs" },
        { label: "SMS / texting", description: "Send and receive business text messages from your business number" },
        { label: "Video meetings built-in", description: "Host video calls without a separate tool like Zoom or Teams" },
        { label: "Fax capability", description: "Send and receive faxes digitally — no fax machine required" },
        { label: "International calling", description: "Make calls to numbers outside the US at reduced rates" },
        { label: "E911 compliance", description: "Ensures emergency services can locate your address when 911 is dialed" },
      ] },
      { id: "integrations", label: "Key integrations needed", type: "multi", options: [
        { label: "Microsoft Teams", description: "Sync calls and presence status directly inside Teams" },
        { label: "Cisco Webex Calling", description: "Native Webex Calling integration for Cisco-based environments" },
        { label: "Salesforce", description: "Log calls, pop contact records, and track activity automatically" },
        { label: "HubSpot", description: "Connect call data to HubSpot contacts, deals, and pipelines" },
        { label: "Epic EHR", description: "Integrate with Epic for healthcare workflows and patient communication" },
        { label: "Google Workspace", description: "Works with Gmail, Calendar, and Google Contacts" },
        { label: "Slack", description: "Trigger calls or receive notifications directly in Slack channels" },
        { label: "Other CRM", description: "Integration with another CRM via API or native connector" },
        { label: "None / Not sure", description: "No specific integration required at this time" },
      ] },
      { id: "budget_voice", label: "Monthly budget per user", type: "select", options: ["Under $15/user", "$15-25/user", "$25-40/user", "$40+/user", "Not sure / Need guidance"] },
      { id: "notes", label: "Special requirements or challenges?", type: "textarea", placeholder: "Compliance needs, porting numbers, specific pain points..." },
    ],
    // CCaaS-only questions
    fieldsCCaaS: [
      { id: "agent_count", label: "How many contact center agents?", type: "select", options: ["1-10 agents", "11-25 agents", "26-50 agents", "51-100 agents", "101-250 agents", "250+ agents"] },
      { id: "channels", label: "Which customer channels do you need?", type: "multi", options: [
        { label: "Inbound voice", description: "Agents receive incoming calls from customers" },
        { label: "Outbound voice / dialer", description: "Agents make outbound calls, with auto or preview dialing" },
        { label: "Live chat", description: "Real-time chat on your website or app" },
        { label: "Email", description: "Route and manage customer emails as tickets" },
        { label: "SMS / text", description: "Two-way texting with customers from a business number" },
        { label: "Social media", description: "Handle messages from Facebook, Instagram, Twitter/X" },
        { label: "Self-service / IVR", description: "Automated menus and bots that resolve issues without an agent" },
      ] },
      { id: "cc_features", label: "Contact center features needed", type: "multi", options: [
        { label: "Call recording & QA", description: "Record calls and score agent performance" },
        { label: "Real-time supervisor dashboards", description: "Live visibility into queue stats, agent status, and SLAs" },
        { label: "Workforce management (WFM)", description: "Agent scheduling, forecasting, and adherence tracking" },
        { label: "AI / virtual agent (bot)", description: "Automated bot to handle routine inquiries before escalating" },
        { label: "Speech analytics", description: "Transcribe and analyze calls for sentiment and trends" },
        { label: "CRM screen pop", description: "Auto-display customer record when a call arrives" },
        { label: "Skills-based routing", description: "Route calls to the best-matched agent by skill or language" },
        { label: "Cisco Webex Contact Center", description: "Cisco's cloud contact center platform with AI-powered routing and analytics" },
      ] },
      { id: "cc_integrations", label: "CRM or ticketing integrations", type: "multi", options: [
        { label: "Salesforce", description: "Log calls, pop contact records, and track activity automatically" },
        { label: "HubSpot", description: "Connect call data to HubSpot contacts, deals, and pipelines" },
        { label: "Zendesk", description: "Create and update tickets automatically from contact center interactions" },
        { label: "ServiceNow", description: "Integrate with ServiceNow for ITSM or customer service workflows" },
        { label: "Epic EHR", description: "Integrate with Epic for healthcare patient communication" },
        { label: "Microsoft Dynamics", description: "Connect with Dynamics 365 for sales and service workflows" },
        { label: "None / Not sure", description: "No specific integration required at this time" },
      ] },
      { id: "budget_cc", label: "Monthly budget per agent", type: "select", options: ["Under $75/agent", "$75-100/agent", "$100-150/agent", "$150+/agent", "Not sure / Need guidance"] },
      { id: "notes", label: "Special requirements or challenges?", type: "textarea", placeholder: "Compliance needs (HIPAA, PCI), current platform, pain points..." },
    ],
    // UCaaS + CCaaS combined questions
    fieldsBoth: [
      { id: "user_count", label: "How many total UCaaS users/extensions?", type: "select", options: ["1-10 users", "11-25 users", "26-50 users", "51-100 users", "101-250 users", "250+ users"] },
      { id: "agent_count", label: "How many contact center agents?", type: "select", options: ["1-10 agents", "11-25 agents", "26-50 agents", "51-100 agents", "101-250 agents", "250+ agents"] },
      { id: "locations", label: "How many office locations?", type: "select", options: ["1 location", "2-3 locations", "4-10 locations", "10+ locations", "Fully remote"] },
      { id: "current_system", label: "What's your current phone system?", type: "select", options: ["Traditional PBX (on-premise)", "Hosted VoIP (already cloud)", "Analog / POTS lines", "No phone system yet", "Not sure"] },
      { id: "channels", label: "Contact center channels needed", type: "multi", options: [
        { label: "Inbound voice", description: "Agents receive incoming calls from customers" },
        { label: "Outbound voice / dialer", description: "Agents make outbound calls, with auto or preview dialing" },
        { label: "Live chat", description: "Real-time chat on your website or app" },
        { label: "Email", description: "Route and manage customer emails as tickets" },
        { label: "SMS / text", description: "Two-way texting with customers from a business number" },
        { label: "Self-service / IVR", description: "Automated menus and bots that resolve issues without an agent" },
      ] },
      { id: "features_needed", label: "UCaaS features needed", type: "multi", options: [
        { label: "Mobile app / softphone", description: "Make & receive calls from your smartphone or desktop app" },
        { label: "Call recording", description: "Automatically record calls for compliance, training, or review" },
        { label: "Auto attendant / IVR", description: "Automated menus that route callers to the right person or department" },
        { label: "SMS / texting", description: "Send and receive business text messages from your business number" },
        { label: "Video meetings built-in", description: "Host video calls without a separate tool like Zoom or Teams" },
        { label: "Fax capability", description: "Send and receive faxes digitally — no fax machine required" },
        { label: "International calling", description: "Make calls to numbers outside the US at reduced rates" },
        { label: "E911 compliance", description: "Ensures emergency services can locate your address when 911 is dialed" },
      ] },
      { id: "integrations", label: "Key integrations needed", type: "multi", options: [
        { label: "Salesforce", description: "Log calls, pop contact records, and track activity automatically" },
        { label: "HubSpot", description: "Connect call data to HubSpot contacts, deals, and pipelines" },
        { label: "Microsoft Teams", description: "Sync calls and presence status directly inside Teams" },
        { label: "Cisco Webex Calling", description: "Native Webex Calling integration for Cisco-based environments" },
        { label: "Cisco Webex Contact Center", description: "Cisco's cloud contact center platform with AI-powered routing and analytics" },
        { label: "Zendesk", description: "Create and update tickets from contact center interactions" },
        { label: "Google Workspace", description: "Works with Gmail, Calendar, and Google Contacts" },
        { label: "Epic EHR", description: "Integrate with Epic for healthcare workflows" },
        { label: "None / Not sure", description: "No specific integration required at this time" },
      ] },
      { id: "budget_voice", label: "Monthly budget per UCaaS user", type: "select", options: ["Under $15/user", "$15-25/user", "$25-40/user", "$40+/user", "Not sure / Need guidance"] },
      { id: "budget_cc", label: "Monthly budget per CC agent", type: "select", options: ["Under $75/agent", "$75-100/agent", "$100-150/agent", "$150+/agent", "Not sure / Need guidance"] },
      { id: "notes", label: "Special requirements or challenges?", type: "textarea", placeholder: "Compliance needs, porting numbers, current platforms, pain points..." },
    ],
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
  options?: (string | { label: string; description?: string })[];
  placeholder?: string;
}

interface Category {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  fields: Field[];
  fieldsUCaaS?: Field[];
  fieldsCCaaS?: Field[];
  fieldsBoth?: Field[];
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

type MultiSelectOption = string | { label: string; description?: string };

function MultiSelect({ options, selected = [], onChange }: { options: MultiSelectOption[], selected: string[], onChange: (val: string[]) => void }) {
  const getLabel = (opt: MultiSelectOption) => typeof opt === "string" ? opt : opt.label;
  const getDescription = (opt: MultiSelectOption) => typeof opt === "string" ? undefined : opt.description;

  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter(s => s !== label));
    } else {
      onChange([...selected, label]);
    }
  };

  const hasDescriptions = options.some(opt => typeof opt !== "string" && opt.description);

  if (hasDescriptions) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
        {options.map(opt => {
          const label = getLabel(opt);
          const description = getDescription(opt);
          const isSelected = selected.includes(label);
          return (
            <button
              key={label}
              onClick={() => toggle(label)}
              style={{
                padding: "16px 18px",
                borderRadius: "12px",
                border: isSelected ? "2px solid #0ea5e9" : "2px solid #2a2f3a",
                background: isSelected ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.03)",
                color: isSelected ? "#38bdf8" : "#94a3b8",
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "6px",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "15px" }}>
                {isSelected && <CheckIcon />}
                {label}
              </div>
              {description && (
                <div style={{ fontSize: "13px", color: isSelected ? "rgba(56,189,248,0.8)" : "#94a3b8", lineHeight: "1.5" }}>
                  {description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map(opt => {
        const label = getLabel(opt);
        const isSelected = selected.includes(label);
        return (
          <button
            key={label}
            onClick={() => toggle(label)}
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              border: isSelected ? "2px solid #0ea5e9" : "2px solid #2a2f3a",
              background: isSelected ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.03)",
              color: isSelected ? "#38bdf8" : "#94a3b8",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "inherit"
            }}
          >
            {isSelected && <CheckIcon />}
            {label}
          </button>
        );
      })}
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
  const [apiResult, setApiResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(1); // default to "Better"
  const contentRef = useRef<HTMLDivElement>(null);

  const category = CATEGORIES.find(c => c.id === selectedCategory);

  // For UCaaS, pick the right field track based on the first answer
  const activeFields: Field[] = (() => {
    if (!category) return [];
    if (category.id !== 'ucaas') return category.fields;
    const solutionType: string[] = formData.solution_type || [];
    const isCCaaSOnly = solutionType.includes('CCaaS Only') && !solutionType.includes('UCaaS Only') && !solutionType.includes('UCaaS + CCaaS');
    const isUCaaSOnly = solutionType.includes('UCaaS Only') && !solutionType.includes('CCaaS Only') && !solutionType.includes('UCaaS + CCaaS');
    const isBoth = solutionType.includes('UCaaS + CCaaS') || (solutionType.includes('UCaaS Only') && solutionType.includes('CCaaS Only'));
    const tail = isCCaaSOnly ? (category.fieldsCCaaS ?? [])
                : isUCaaSOnly ? (category.fieldsUCaaS ?? [])
                : isBoth ? (category.fieldsBoth ?? [])
                : [];
    return [...category.fields, ...tail];
  })();

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

  const handleNext = async () => {
    if (category && currentStep < activeFields.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (contentRef.current) contentRef.current.scrollTop = 0;
    } else {
      setIsGenerating(true);
      setApiError(null);
      try {
        const res = await fetch('/api/generate-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: category?.title,
            formData,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate solution');
        // Claude returns content array; parse the JSON text from the first content block
        const text = data.content?.[0]?.text || '';
        const parsed = JSON.parse(text);
        setApiResult(parsed);
      } catch (err: any) {
        setApiError(err.message || 'Failed to generate solution');
      } finally {
        setIsGenerating(false);
        setShowResult(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const currentField = activeFields[currentStep];
  const isLastStep = category && currentStep === activeFields.length - 1;

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
            .nav-btn { transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease !important; }
            .nav-btn-back:not(:disabled):hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.25) !important; color: #e2e8f0 !important; transform: translateX(-2px); }
            .nav-btn-next:not(:disabled):hover { background: ${category?.color}30 !important; color: #fff !important; box-shadow: 0 4px 16px ${category?.color}40 !important; transform: translateX(2px); }
            .nav-btn-generate:not(:disabled):hover { filter: brightness(1.12); box-shadow: 0 4px 20px ${category?.color}60 !important; transform: translateY(-1px); }
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
              <ProgressBar current={currentStep + 1} total={activeFields.length} color={category?.color} />

              <div key={currentStep} style={{ animation: "slideUp 0.4s ease" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  {currentField?.label}
                </h2>
                <p style={{ fontSize: "13px", color: "#475569", marginBottom: "28px" }}>
                  Step {currentStep + 1} of {activeFields.length}
                </p>

                {currentField?.type === 'select' && currentField.options && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(currentField.options as string[]).map(opt => (
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
                  className="nav-btn nav-btn-back"
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
                  className={`nav-btn ${isLastStep ? "nav-btn-generate" : "nav-btn-next"}`}
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
    const rec = apiResult;
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
            .fab-btn { transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease, box-shadow 0.15s ease !important; }
            .fab-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); opacity: 1 !important; }
            .fab-btn:active { transform: translateY(0px); }
            .fab-btn-start:hover { background: rgba(255,255,255,0.08) !important; color: #e2e8f0 !important; }
            .fab-btn-save { background: rgba(16,185,129,0.15) !important; color: #34d399 !important; border-color: rgba(16,185,129,0.3) !important; }
            .fab-btn-save:hover { background: rgba(16,185,129,0.25) !important; box-shadow: 0 4px 16px rgba(16,185,129,0.2) !important; }
            .fab-btn-pdf { background: rgba(14,165,233,0.15) !important; color: #38bdf8 !important; border-color: rgba(14,165,233,0.3) !important; }
            .fab-btn-pdf:hover { background: rgba(14,165,233,0.25) !important; box-shadow: 0 4px 16px rgba(14,165,233,0.2) !important; }
            .fab-btn-quote:hover { filter: brightness(1.1); box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important; }
          `}</style>

          <header style={{ padding: "20px 40px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => setView('home')} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>← Back</button>
              <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: "20px" }}>{category?.icon}</span>
              <span style={{ fontSize: "15px", fontWeight: 500 }}>{category?.title}</span>
            </div>
          </header>

          <main style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 40px" }}>

            {/* Error state */}
            {apiError && (
              <div style={{ padding: "20px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", marginBottom: "24px" }}>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>Failed to generate solution</div>
                <div style={{ fontSize: "13px", opacity: 0.8 }}>{apiError}</div>
                <button
                  onClick={() => { setShowResult(false); setApiError(null); setCurrentStep(activeFields.length - 1); }}
                  style={{ marginTop: "12px", padding: "8px 16px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.4)", background: "transparent", color: "#f87171", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Try Again
                </button>
              </div>
            )}

            {rec && (
              <>
                {/* Result Header */}
                <div style={{ marginBottom: "32px", animation: "slideUp 0.6s ease" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 12px", borderRadius: "16px", background: "rgba(16,185,129,0.1)", color: "#34d399", fontSize: "12px", fontWeight: 500, marginBottom: "16px", fontFamily: "'DM Mono', monospace" }}>
                    <SparkIcon /> AI-Generated Solution
                  </div>
                  <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "10px" }}>{rec.title}</h1>
                  <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.6 }}>{rec.summary}</p>
                </div>

                {/* TIERED VIEW (UCaaS) */}
                {rec.tiers ? (() => {
                  const tier = rec.tiers[selectedTier];
                  return (
                    <>
                      {/* Tier Selector */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "32px", animation: "slideUp 0.6s ease 0.1s both" }}>
                        {rec.tiers.map((t: any, i: number) => (
                          <button
                            key={t.tierName}
                            onClick={() => setSelectedTier(i)}
                            style={{
                              padding: "16px",
                              borderRadius: "12px",
                              border: selectedTier === i ? `2px solid ${category?.color}` : "2px solid rgba(255,255,255,0.08)",
                              background: selectedTier === i ? `${category?.color}15` : "rgba(255,255,255,0.02)",
                              cursor: "pointer",
                              textAlign: "left",
                              fontFamily: "inherit",
                              position: "relative",
                              transition: "all 0.2s",
                            }}
                          >
                            {t.recommended && (
                              <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: category?.color, color: "#fff", fontSize: "10px", fontWeight: 700, padding: "2px 10px", borderRadius: "10px", whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace" }}>
                                RECOMMENDED
                              </div>
                            )}
                            <div style={{ fontSize: "16px", fontWeight: 700, color: selectedTier === i ? category?.color : "#e2e8f0", marginBottom: "4px" }}>{t.tierName}</div>
                            <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.4 }}>{t.tagline}</div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: selectedTier === i ? category?.color : "#94a3b8", marginTop: "10px", fontFamily: "'DM Mono', monospace" }}>{t.monthlyRecurring}</div>
                          </button>
                        ))}
                      </div>

                      {/* Selected Tier Sections */}
                      {tier.sections?.map((section: any, si: number) => (
                        <div key={section.heading} style={{ marginBottom: "24px", animation: `slideUp 0.4s ease ${si * 0.08}s both` }}>
                          <h3 style={{ fontSize: "11px", fontWeight: 500, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>{section.heading}</h3>
                          {section.items?.map((item: any, ii: number) => (
                            <div key={ii} style={{ padding: "18px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", marginBottom: "8px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                                <div>
                                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{item.name}</div>
                                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{item.spec}</div>
                                </div>
                                <span style={{ fontSize: "15px", fontWeight: 600, color: category?.color, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", marginLeft: "16px" }}>{item.price}</span>
                              </div>
                              <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5, marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{ color: "#475569", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Why this: </span>
                                {item.reason}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* Tier Totals */}
                      <div style={{ padding: "20px 24px", borderRadius: "10px", background: `linear-gradient(135deg, ${category?.color}10, ${category?.color}05)`, border: `1px solid ${category?.color}30`, marginBottom: "12px" }}>
                        <h3 style={{ fontSize: "11px", fontWeight: 500, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px", fontFamily: "'DM Mono', monospace" }}>Cost Summary</h3>

                        {/* Monthly Recurring — primary for UCaaS */}
                        {tier.monthlyRecurring && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <div>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>Monthly Platform Cost</div>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Licenses + add-ons, billed monthly</div>
                            </div>
                            <span style={{ fontSize: "22px", fontWeight: 700, color: category?.color, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", marginLeft: "16px" }}>{tier.monthlyRecurring}</span>
                          </div>
                        )}

                        {/* Hardware */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: tier.installationEstimate ? "12px" : "0" }}>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>One-Time Hardware Cost</div>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{tier.totalEstimateNote || "Desk phones, headsets, adapters (if needed)"}</div>
                          </div>
                          <span style={{ fontSize: "18px", fontWeight: 600, color: "#94a3b8", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", marginLeft: "16px" }}>{tier.totalEstimate}</span>
                        </div>

                        {/* Implementation */}
                        {tier.installationEstimate && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <div>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>Implementation & Onboarding</div>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Number porting, provisioning, training</div>
                            </div>
                            <span style={{ fontSize: "18px", fontWeight: 600, color: "#94a3b8", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", marginLeft: "16px" }}>{tier.installationEstimate}</span>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })() : (
                  <>
                    {/* NON-TIERED: flat sections */}
                    {rec.sections?.map((section: any, si: number) => (
                      <div key={section.heading} style={{ marginBottom: "24px", animation: `slideUp 0.6s ease ${0.1 + si * 0.1}s both` }}>
                        <h3 style={{ fontSize: "11px", fontWeight: 500, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>{section.heading}</h3>
                        {section.items?.map((item: any, ii: number) => (
                          <div key={ii} style={{ padding: "18px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", marginBottom: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                              <div>
                                <div style={{ fontSize: "15px", fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{item.spec}</div>
                              </div>
                              <span style={{ fontSize: "15px", fontWeight: 600, color: category?.color, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", marginLeft: "16px" }}>{item.price}</span>
                            </div>
                            <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5, marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                              <span style={{ color: "#475569", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Why this: </span>
                              {item.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Totals */}
                    <div style={{ padding: "20px 24px", borderRadius: "10px", background: `linear-gradient(135deg, ${category?.color}10, ${category?.color}05)`, border: `1px solid ${category?.color}30`, marginBottom: "12px", animation: "slideUp 0.6s ease 0.5s both" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: rec.monthlyRecurring ? "10px" : "0" }}>
                        <span style={{ fontSize: "14px", fontWeight: 500 }}>Estimated Upfront Cost</span>
                        <span style={{ fontSize: "24px", fontWeight: 700, color: category?.color, fontFamily: "'DM Mono', monospace" }}>{rec.totalEstimate}</span>
                      </div>
                      {rec.monthlyRecurring && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <span style={{ fontSize: "13px", color: "#94a3b8" }}>Monthly recurring</span>
                          <span style={{ fontSize: "16px", fontWeight: 600, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{rec.monthlyRecurring}</span>
                        </div>
                      )}
                      {rec.installationEstimate && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <span style={{ fontSize: "13px", color: "#94a3b8" }}>Implementation / setup</span>
                          <span style={{ fontSize: "16px", fontWeight: 600, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{rec.installationEstimate}</span>
                        </div>
                      )}
                    </div>

                    {/* Alternatives */}
                    {rec.alternatives?.length > 0 && (
                      <div style={{ marginBottom: "16px", animation: "slideUp 0.6s ease 0.65s both" }}>
                        <h3 style={{ fontSize: "11px", fontWeight: 500, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>Alternatives to Consider</h3>
                        {rec.alternatives.map((alt: any, i: number) => (
                          <div key={i} style={{ padding: "14px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)", marginBottom: "8px", fontSize: "13px", color: "#94a3b8" }}>
                            <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{alt.description}</span>
                            {alt.tradeoff && <span style={{ color: "#64748b" }}> — {alt.tradeoff}</span>}
                            {alt.priceImpact && <span style={{ color: category?.color, fontFamily: "'DM Mono', monospace", marginLeft: "8px" }}>{alt.priceImpact}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Notes */}
                {rec.notes && (
                  <div style={{ padding: "16px 20px", borderRadius: "10px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", fontSize: "13px", color: "#94a3b8", lineHeight: 1.6, marginBottom: "16px", animation: "slideUp 0.6s ease 0.6s both" }}>
                    <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "12px" }}>💡 Note: </span>
                    {rec.notes}
                  </div>
                )}

                {/* Questions to Ask */}
                {rec.questionsToAskVendor?.length > 0 && (
                  <div style={{ marginBottom: "24px", animation: "slideUp 0.6s ease 0.7s both" }}>
                    <h3 style={{ fontSize: "11px", fontWeight: 500, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>Questions to Ask Your Vendor</h3>
                    {rec.questionsToAskVendor.map((q: string, i: number) => (
                      <div key={i} style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)", marginBottom: "6px", fontSize: "13px", color: "#94a3b8", display: "flex", gap: "10px" }}>
                        <span style={{ color: category?.color, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                        {q}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Action Bar */}
            <div style={{ position: "sticky", bottom: 0, display: "flex", justifyContent: "center", padding: "16px 0", background: "linear-gradient(to top, #0c0f18 60%, transparent)", zIndex: 40 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "16px",
                background: "rgba(15, 20, 30, 0.9)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}>
                <button
                  className="fab-btn fab-btn-start"
                  onClick={() => { setShowResult(false); setCurrentStep(0); setApiResult(null); setSelectedTier(1); setView('home'); }}
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
                >
                  ↺ Start Over
                </button>

                <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)" }} />

                <button
                  className="fab-btn fab-btn-save"
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.15)", color: "#34d399", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
                >
                  <SaveIcon /> Save
                </button>

                <button
                  className="fab-btn fab-btn-pdf"
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(14,165,233,0.3)", background: "rgba(14,165,233,0.15)", color: "#38bdf8", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
                >
                  Export PDF
                </button>

                <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)" }} />

                <button
                  className="fab-btn fab-btn-quote"
                  style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${category?.color}, ${category?.color}cc)`, color: "#fff", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  Request Quote from InterPeak →
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}
