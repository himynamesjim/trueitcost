'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { PaywallModal } from '@/components/paywall-modal';
import { useFeatureAccess } from '@/hooks/use-feature-access';
import NavMenu from '@/components/nav-menu';

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
  fieldsNewOffice?: Field[];
  fieldsRefresh?: Field[];
  fieldsWiFi?: Field[];
  fieldsFirewall?: Field[];
  fieldsSDWAN?: Field[];
  fieldsTroubleshooting?: Field[];
  fieldsGuestWiFi?: Field[];
  fieldsCabling?: Field[];
  fieldsISPFailover?: Field[];
  fieldsRemoteSite?: Field[];
  fieldsRemoteVPN?: Field[];
  fieldsNewDataCenter?: Field[];
  fieldsCloudMigration?: Field[];
  fieldsHybridCloud?: Field[];
  fieldsServerRefresh?: Field[];
  fieldsDR?: Field[];
  fieldsColo?: Field[];
  // Security conditional fields
  fieldsAssessment?: Field[];
  fieldsEndpoint?: Field[];
  fieldsCompliance?: Field[];
  fieldsEmail?: Field[];
  fieldsZeroTrust?: Field[];
  // BCDR conditional fields
  fieldsNewBackup?: Field[];
  fieldsReplacement?: Field[];
  fieldsSaaS?: Field[];
}

const CATEGORIES: Category[] = [
  {
    id: "collaboration",
    icon: "🎥",
    title: "Collaboration & Video",
    subtitle: "Conference rooms, huddle spaces, video endpoints",
    color: "#0ea5e9",
    fields: [
      { id: "room_type", label: "What type of space?", type: "select", options: ["Large Conference Room (12+ people)", "Medium Conference Room (6-12)", "Huddle Room (2-5)", "Executive Office", "Training Room / All-Hands", "Open Collaboration Area"] },
      { id: "dimensions", label: "Room dimensions (LxW in feet)", type: "text" as const, placeholder: "e.g. 20x15" },
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
      { id: "project_type", label: "What type of project?", type: "select", options: ["New office buildout", "Network refresh / upgrade", "Adding Wi-Fi coverage", "Firewall / security upgrade", "SD-WAN deployment", "Guest Wi-Fi / Public Wi-Fi", "Network cabling / structured cabling", "ISP failover / redundancy", "Remote site connectivity", "VPN for remote users", "Network troubleshooting / assessment"] },
    ],
    // New office buildout - needs full assessment
    fieldsNewOffice: [
      { id: "existing_infrastructure", label: "Current network infrastructure at other sites", type: "textarea", placeholder: "Describe existing equipment at other locations: e.g., 'Ubiquiti UDM Pro at main office with 3x UniFi switches' or 'Cisco WLC at datacenter managing 15 APs across 3 sites via P2P VPN' or 'This is our first office'" },
      { id: "office_size", label: "Office square footage", type: "text" as const, placeholder: "e.g. 5000 sq ft" },
      { id: "device_count", label: "How many wired devices?", type: "select", options: ["Under 25", "25-50", "51-100", "101-250", "250+"] },
      { id: "wireless_users", label: "How many wireless users/devices?", type: "select", options: ["Under 25", "25-50", "51-100", "101-250", "250+"] },
      { id: "requirements", label: "Network requirements", type: "multi", options: ["Guest Wi-Fi (isolated)", "VoIP support / QoS", "VLAN segmentation", "PoE for cameras/phones", "Redundant internet", "VPN for remote workers", "IoT device support", "Outdoor Wi-Fi coverage"] },
      { id: "current_isp", label: "Internet connection for this site", type: "select", options: ["Fiber (1Gbps+)", "Fiber (under 1Gbps)", "Cable / coax", "DSL", "Fixed wireless", "Not sure", "Multiple ISPs"] },
      { id: "wan_type", label: "WAN connectivity needed", type: "multi" as const, options: [
        { label: "MPLS", description: "Private multiprotocol label switching network for site-to-site connectivity" },
        { label: "DMVPN", description: "Dynamic Multipoint VPN - Cisco's scalable VPN solution over internet" },
        { label: "Point-to-Point VPN", description: "Traditional site-to-site VPN tunnels (IPSec, etc.)" },
        { label: "SD-WAN", description: "Software-defined WAN - intelligent routing across multiple links" },
        { label: "Direct internet only", description: "Standalone site, no site-to-site connectivity needed" },
        { label: "Not sure", description: "Need guidance on WAN options" },
      ] },
      { id: "vendor_preference", label: "Vendor preference (if any)", type: "multi" as const, options: [
        { label: "Cisco", description: "Cisco Meraki, Catalyst, Firepower - enterprise-grade with robust ecosystem" },
        { label: "Fortinet", description: "FortiGate firewalls and FortiSwitch - security-first approach with SD-WAN" },
        { label: "Aruba (HPE)", description: "Aruba switches and access points - strong in wireless and campus networks" },
        { label: "Ubiquiti / UniFi", description: "Cost-effective, cloud-managed gear for SMBs" },
        { label: "Palo Alto Networks", description: "Premium next-gen firewalls with advanced threat prevention" },
        { label: "Juniper", description: "Juniper Mist AI-driven wireless and switching solutions" },
        { label: "SonicWall", description: "Firewall and security appliances for SMB to enterprise" },
        { label: "Ruckus (CommScope)", description: "High-performance wireless access points" },
        { label: "No preference", description: "Open to any vendor based on best fit for requirements" },
      ] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $5,000", "$5,000 - $15,000", "$15,000 - $30,000", "$30,000 - $75,000", "$75,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Floor plan available? Timeline? Special requirements?" }
    ],
    // Network refresh/upgrade - focus on what they have and what needs updating
    fieldsRefresh: [
      { id: "existing_infrastructure", label: "Current network equipment", type: "textarea", placeholder: "Describe what you currently have: e.g., '5-year-old Cisco switches, outdated firewall, mix of consumer and enterprise APs'" },
      { id: "pain_points", label: "What's not working well?", type: "multi", options: ["Slow/unreliable Wi-Fi", "Firewall performance issues", "Out of switch ports", "No centralized management", "End-of-life equipment", "Can't support VoIP quality", "Security concerns", "No redundancy"] },
      { id: "vendor_preference", label: "Vendor preference (if any)", type: "multi" as const, options: [
        { label: "Cisco", description: "Cisco Meraki, Catalyst, Firepower - enterprise-grade with robust ecosystem" },
        { label: "Fortinet", description: "FortiGate firewalls and FortiSwitch - security-first approach with SD-WAN" },
        { label: "Aruba (HPE)", description: "Aruba switches and access points - strong in wireless and campus networks" },
        { label: "Ubiquiti / UniFi", description: "Cost-effective, cloud-managed gear for SMBs" },
        { label: "Palo Alto Networks", description: "Premium next-gen firewalls with advanced threat prevention" },
        { label: "Juniper", description: "Juniper Mist AI-driven wireless and switching solutions" },
        { label: "SonicWall", description: "Firewall and security appliances for SMB to enterprise" },
        { label: "Ruckus (CommScope)", description: "High-performance wireless access points" },
        { label: "No preference", description: "Open to any vendor based on best fit for requirements" },
      ] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $5,000", "$5,000 - $15,000", "$15,000 - $30,000", "$30,000 - $75,000", "$75,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Existing equipment list? Downtime constraints?" }
    ],
    // Adding Wi-Fi coverage - just Wi-Fi specific
    fieldsWiFi: [
      { id: "existing_infrastructure", label: "Current network infrastructure", type: "textarea", placeholder: "Describe existing equipment: e.g., 'Ubiquiti UDM Pro with 2 UniFi APs, need to expand coverage' or 'Cisco WLC at datacenter managing APs at other sites'" },
      { id: "coverage_area", label: "Area needing Wi-Fi coverage", type: "text" as const, placeholder: "e.g. 3000 sq ft warehouse, outdoor courtyard, etc." },
      { id: "wireless_users", label: "How many wireless users/devices?", type: "select", options: ["Under 25", "25-50", "51-100", "101-250", "250+"] },
      { id: "wifi_requirements", label: "Wi-Fi requirements", type: "multi", options: ["High-density (many devices)", "Outdoor coverage", "Guest isolation", "Roaming between APs", "IoT/sensor devices", "Video streaming"] },
      { id: "vendor_preference", label: "Vendor preference (if any)", type: "multi" as const, options: [
        { label: "Cisco", description: "Cisco Meraki, Catalyst, Firepower - enterprise-grade with robust ecosystem" },
        { label: "Aruba (HPE)", description: "Aruba switches and access points - strong in wireless and campus networks" },
        { label: "Ubiquiti / UniFi", description: "Cost-effective, cloud-managed gear for SMBs" },
        { label: "Fortinet", description: "FortiGate firewalls and FortiSwitch - security-first approach with SD-WAN" },
        { label: "Juniper", description: "Juniper Mist AI-driven wireless and switching solutions" },
        { label: "Ruckus (CommScope)", description: "High-performance wireless access points" },
        { label: "No preference", description: "Open to any vendor based on best fit for requirements" },
      ] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $2,500", "$2,500 - $5,000", "$5,000 - $10,000", "$10,000 - $20,000", "$20,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Floor plan available? Existing cabling?" }
    ],
    // Firewall/security upgrade - focus on firewall needs
    fieldsFirewall: [
      { id: "existing_infrastructure", label: "Current firewall/security setup", type: "textarea", placeholder: "What do you currently have? e.g., 'SonicWall TZ300, 5 years old' or 'Consumer router' or 'Cisco ASA end-of-life'" },
      { id: "internet_bandwidth", label: "Internet connection speed", type: "select", options: ["Under 100 Mbps", "100-500 Mbps", "500 Mbps - 1 Gbps", "1 Gbps+", "Not sure"] },
      { id: "firewall_features", label: "Required firewall features", type: "multi", options: ["VPN (site-to-site)", "VPN (remote users)", "IPS/IDS", "Content filtering", "Application control", "SD-WAN", "Redundant/HA pair", "Advanced threat protection"] },
      { id: "site_count", label: "Number of sites needing connectivity", type: "select", options: ["1 (single site)", "2-3 sites", "4-10 sites", "10+ sites"] },
      { id: "vendor_preference", label: "Vendor preference (if any)", type: "multi" as const, options: [
        { label: "Fortinet", description: "FortiGate firewalls and FortiSwitch - security-first approach with SD-WAN" },
        { label: "Palo Alto Networks", description: "Premium next-gen firewalls with advanced threat prevention" },
        { label: "Cisco", description: "Cisco Meraki MX, Firepower - enterprise-grade with robust ecosystem" },
        { label: "SonicWall", description: "Firewall and security appliances for SMB to enterprise" },
        { label: "Ubiquiti / UniFi", description: "Cost-effective, cloud-managed gear for SMBs" },
        { label: "No preference", description: "Open to any vendor based on best fit for requirements" },
      ] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $2,500", "$2,500 - $5,000", "$5,000 - $15,000", "$15,000 - $30,000", "$30,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Compliance requirements (HIPAA, PCI)? Existing VPN tunnels?" }
    ],
    // SD-WAN deployment - focus on multi-site connectivity
    fieldsSDWAN: [
      { id: "existing_infrastructure", label: "Current WAN infrastructure", type: "textarea", placeholder: "What do you have now? e.g., 'MPLS with 5 sites' or 'Point-to-point VPNs between 3 locations' or 'Each site independent, want to connect them'" },
      { id: "site_count", label: "Number of sites to connect", type: "select", options: ["2-3 sites", "4-10 sites", "10-25 sites", "25+ sites"] },
      { id: "sdwan_drivers", label: "Why SD-WAN?", type: "multi", options: ["Reduce MPLS costs", "Improve application performance", "Add internet/LTE backup links", "Centralize management", "Enable direct cloud access", "Replace aging VPN infrastructure"] },
      { id: "traffic_types", label: "Critical traffic types", type: "multi", options: ["VoIP/UCaaS", "Video conferencing", "Cloud apps (O365, Salesforce)", "File sharing", "Remote desktop", "Guest internet"] },
      { id: "vendor_preference", label: "Vendor preference (if any)", type: "multi" as const, options: [
        { label: "Cisco", description: "Cisco Meraki MX, Viptela - enterprise SD-WAN with deep integration" },
        { label: "Fortinet", description: "FortiGate SD-WAN - integrated security and WAN optimization" },
        { label: "Palo Alto Networks", description: "Prisma SD-WAN - security-first SD-WAN" },
        { label: "VMware (VeloCloud)", description: "VMware SD-WAN - cloud-first architecture" },
        { label: "Aruba (HPE)", description: "Aruba EdgeConnect - application-aware SD-WAN" },
        { label: "No preference", description: "Open to any vendor based on best fit for requirements" },
      ] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $15,000", "$15,000 - $30,000", "$30,000 - $75,000", "$75,000 - $150,000", "$150,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "MPLS contracts ending? Timeline? Managed service interest?" }
    ],
    // Network troubleshooting/assessment - diagnostic focus
    fieldsTroubleshooting: [
      { id: "existing_infrastructure", label: "Current network infrastructure", type: "textarea", placeholder: "Describe what you have: e.g., 'Mix of old Cisco and newer Ubiquiti, not sure what's where' or 'Inherited from previous IT provider, no documentation'" },
      { id: "issues", label: "What problems are you experiencing?", type: "textarea", placeholder: "e.g., 'Slow Wi-Fi in conference rooms, frequent disconnects, can't access servers from some locations, firewall locks up weekly'" },
      { id: "assessment_scope", label: "What needs assessment?", type: "multi", options: ["Full network audit", "Wi-Fi coverage/performance", "Firewall/security posture", "WAN connectivity", "Switch/cabling infrastructure", "Network documentation"] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $2,500", "$2,500 - $5,000", "$5,000 - $10,000", "$10,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Urgency? Documentation available? Access to equipment?" }
    ],
    // Guest Wi-Fi / Public Wi-Fi - captive portal, bandwidth management
    fieldsGuestWiFi: [
      { id: "existing_infrastructure", label: "Current network infrastructure", type: "textarea", placeholder: "Describe existing equipment: e.g., 'Cisco Meraki MR42 APs, need to add guest network' or 'Starting from scratch for retail location'" },
      { id: "venue_type", label: "Type of venue", type: "select", options: ["Retail store", "Hotel / Hospitality", "Restaurant / Cafe", "Healthcare waiting room", "Office building", "Event venue", "Other"] },
      { id: "guest_count", label: "Expected concurrent guest users", type: "select", options: ["Under 25", "25-50", "51-100", "101-250", "250-500", "500+"] },
      { id: "guest_wifi_features", label: "Guest Wi-Fi requirements", type: "multi", options: ["Captive portal (splash page)", "Social media login", "SMS verification", "Bandwidth limiting per user", "Time-based sessions", "Guest analytics/reporting", "Voucher/ticket system", "Terms & conditions acceptance"] },
      { id: "coverage_area", label: "Coverage area size", type: "text" as const, placeholder: "e.g. 5000 sq ft retail space, 50-room hotel, etc." },
      { id: "vendor_preference", label: "Vendor preference (if any)", type: "multi" as const, options: [
        { label: "Cisco", description: "Cisco Meraki, Catalyst - enterprise-grade with robust ecosystem" },
        { label: "Aruba (HPE)", description: "Aruba Instant On/ClearPass - strong guest access features" },
        { label: "Ruckus (CommScope)", description: "High-performance wireless for hospitality" },
        { label: "Ubiquiti / UniFi", description: "Cost-effective with built-in captive portal" },
        { label: "Fortinet", description: "FortiAP with FortiGate guest portal integration" },
        { label: "No preference", description: "Open to any vendor based on best fit for requirements" },
      ] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $2,500", "$2,500 - $5,000", "$5,000 - $10,000", "$10,000 - $25,000", "$25,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Branding requirements? Compliance needs?" }
    ],
    // Network cabling / structured cabling
    fieldsCabling: [
      { id: "project_scope", label: "Cabling project scope", type: "select", options: ["New installation (empty space)", "Cable upgrade/refresh", "Adding drops to existing system", "Cable repair/remediation", "Full audit & documentation"] },
      { id: "cable_type_needed", label: "Cable types needed", type: "multi", options: ["Cat6 horizontal runs", "Cat6a horizontal runs", "Fiber backbone (multi-mode)", "Fiber backbone (single-mode)", "Outdoor-rated cable", "Plenum-rated cable"] },
      { id: "drop_count", label: "Number of network drops needed", type: "select", options: ["Under 25 drops", "25-50 drops", "51-100 drops", "101-250 drops", "250+ drops", "Not sure"] },
      { id: "office_size", label: "Office/facility size", type: "text" as const, placeholder: "e.g. 10,000 sq ft across 2 floors" },
      { id: "special_requirements", label: "Special requirements", type: "multi", options: ["PoE support (cameras/phones/APs)", "Patch panel organization", "Cable labeling/documentation", "Cable testing & certification", "Conduit installation", "Cable trays/raceways", "MDF/IDF setup"] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $5,000", "$5,000 - $15,000", "$15,000 - $30,000", "$30,000 - $75,000", "$75,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Floor plan available? Building restrictions? Timeline?" }
    ],
    // ISP failover / redundancy
    fieldsISPFailover: [
      { id: "existing_infrastructure", label: "Current internet setup", type: "textarea", placeholder: "Describe what you have: e.g., 'Single fiber 500 Mbps from Comcast' or 'Fiber primary + cable backup, manual failover'" },
      { id: "primary_bandwidth", label: "Primary internet bandwidth", type: "select", options: ["Under 100 Mbps", "100-500 Mbps", "500 Mbps - 1 Gbps", "1-5 Gbps", "5+ Gbps", "Not sure"] },
      { id: "failover_drivers", label: "Why do you need failover/redundancy?", type: "multi", options: ["Business-critical uptime (e-commerce, SaaS)", "VoIP/UCaaS quality", "Compliance requirements", "Previous outages", "SD-WAN/dual-path WAN", "Remote workforce dependency"] },
      { id: "failover_requirements", label: "Failover requirements", type: "multi", options: ["Automatic failover (no manual intervention)", "Load balancing across both links", "Prioritize traffic (VoIP on primary, guest on backup)", "LTE/5G as third backup", "Sub-second failover", "Health monitoring/alerts"] },
      { id: "backup_isp_options", label: "Backup ISP options available", type: "multi", options: ["Cable/coax", "DSL", "Fixed wireless", "Fiber (different provider)", "LTE/5G", "Starlink", "Not sure what's available"] },
      { id: "vendor_preference", label: "Vendor preference (if any)", type: "multi" as const, options: [
        { label: "Cisco", description: "Cisco Meraki MX - dual WAN with SD-WAN features" },
        { label: "Fortinet", description: "FortiGate - advanced failover and SD-WAN" },
        { label: "Palo Alto Networks", description: "Premium firewalls with WAN redundancy" },
        { label: "Ubiquiti / UniFi", description: "Cost-effective failover solutions" },
        { label: "Cradlepoint", description: "LTE/5G wireless WAN specialists" },
        { label: "No preference", description: "Open to any vendor based on best fit for requirements" },
      ] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $2,500", "$2,500 - $5,000", "$5,000 - $15,000", "$15,000 - $30,000", "$30,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Monthly ISP budget? Contract constraints?" }
    ],
    // Remote site connectivity
    fieldsRemoteSite: [
      { id: "existing_infrastructure", label: "Existing infrastructure at main/datacenter site", type: "textarea", placeholder: "What do you have at HQ/datacenter? e.g., 'Fortinet FortiGate 100F at HQ with MPLS' or 'Cisco WLC managing all APs, need remote site to join' or 'Azure cloud infrastructure'" },
      { id: "remote_site_count", label: "Number of remote sites to connect", type: "select", options: ["1 site", "2-3 sites", "4-10 sites", "10+ sites"] },
      { id: "remote_site_size", label: "Typical remote site size", type: "select", options: ["1-5 users", "6-10 users", "11-25 users", "26-50 users", "50+ users"] },
      { id: "connectivity_type", label: "How should remote sites connect?", type: "multi" as const, options: [
        { label: "Site-to-site VPN over internet", description: "IPSec/SSL VPN tunnels - most cost-effective" },
        { label: "MPLS", description: "Private MPLS network - predictable performance" },
        { label: "SD-WAN", description: "Intelligent multi-path routing with failover" },
        { label: "Direct cloud connectivity", description: "Connect directly to Azure/AWS without backhauling through HQ" },
        { label: "Not sure", description: "Need guidance on best approach" },
      ] },
      { id: "remote_site_needs", label: "What does remote site need?", type: "multi", options: ["Firewall/router", "Switches", "Wi-Fi access points", "IP phones/PoE", "Local file server", "Backup internet circuit", "Centrally managed"] },
      { id: "vendor_preference", label: "Vendor preference (if any)", type: "multi" as const, options: [
        { label: "Cisco", description: "Cisco Meraki, Viptela - cloud-managed, easy remote deployment" },
        { label: "Fortinet", description: "FortiGate - zero-touch deployment, centralized management" },
        { label: "Aruba (HPE)", description: "Aruba ESP - cloud-native for branch/remote offices" },
        { label: "Ubiquiti / UniFi", description: "Cost-effective, cloud controller" },
        { label: "Palo Alto Networks", description: "Prisma SD-WAN for secure remote sites" },
        { label: "No preference", description: "Open to any vendor based on best fit for requirements" },
      ] },
      { id: "budget_net", label: "Budget range per site", type: "select", options: ["Under $2,500", "$2,500 - $5,000", "$5,000 - $10,000", "$10,000 - $25,000", "$25,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Timeline? Zero-touch deployment needed? Local IT support available?" }
    ],
    // VPN for remote users
    fieldsRemoteVPN: [
      { id: "existing_infrastructure", label: "Current firewall/VPN infrastructure", type: "textarea", placeholder: "What do you have? e.g., 'Cisco ASA with AnyConnect' or 'SonicWall with SSL-VPN' or 'No VPN currently, users access via RDP' or 'Need to replace end-of-life equipment'" },
      { id: "remote_user_count", label: "How many remote users need VPN?", type: "select", options: ["1-10 users", "11-25 users", "26-50 users", "51-100 users", "101-250 users", "250+ users"] },
      { id: "vpn_use_case", label: "What will users access via VPN?", type: "multi", options: ["File servers / shared drives", "Internal applications", "Remote desktop / terminal server", "Office network printers", "Cloud apps (already accessible)", "Full network access"] },
      { id: "vpn_requirements", label: "VPN requirements", type: "multi", options: ["Multi-factor authentication (MFA)", "Split tunneling (internet direct, only internal via VPN)", "Full tunneling (all traffic through VPN)", "Mobile device support (iOS/Android)", "Always-on VPN", "Per-app VPN", "Logging & reporting"] },
      { id: "device_types", label: "What devices will connect?", type: "multi", options: ["Windows laptops", "Mac laptops", "Company-owned mobile devices", "BYOD / personal devices", "Linux workstations", "Tablets"] },
      { id: "vendor_preference", label: "Vendor preference (if any)", type: "multi" as const, options: [
        { label: "Fortinet", description: "FortiClient VPN - integrated with FortiGate firewall" },
        { label: "Palo Alto Networks", description: "GlobalProtect VPN - best-in-class security" },
        { label: "Cisco", description: "AnyConnect or Meraki Client VPN" },
        { label: "SonicWall", description: "NetExtender / Mobile Connect VPN" },
        { label: "OpenVPN", description: "Open-source, flexible, cost-effective" },
        { label: "WireGuard", description: "Modern, lightweight VPN protocol" },
        { label: "No preference", description: "Open to any vendor based on best fit for requirements" },
      ] },
      { id: "budget_net", label: "Budget range", type: "select", options: ["Under $2,500", "$2,500 - $5,000", "$5,000 - $10,000", "$10,000 - $25,000", "$25,000+", "Need guidance"] },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Compliance requirements? Current bandwidth? Helpdesk support needs?" }
    ],
  },
  {
    id: "datacenter",
    icon: "🏗️",
    title: "Data Center & Cloud",
    subtitle: "Server rooms, cloud migration, hybrid infrastructure",
    color: "#f59e0b",
    fields: [
      { id: "project_scope", label: "What are you looking to do?", type: "select", options: ["Build new server room / data center", "Migrate to cloud (full)", "Hybrid cloud setup", "Server refresh / upgrade", "Disaster recovery site", "Colocation evaluation"] },
    ],
    // Build new server room / data center
    fieldsNewDataCenter: [
      { id: "datacenter_size", label: "Data center / server room size", type: "select", options: ["Small (1-2 racks)", "Medium (3-5 racks)", "Large (6-10 racks)", "Enterprise (10+ racks)", "Not sure"] },
      { id: "workloads", label: "Primary workloads", type: "multi", options: ["File server / storage", "Email (Exchange)", "Active Directory / identity", "Line-of-business applications", "Database servers (SQL)", "Web servers", "Virtual desktops (VDI)", "Backup & replication", "Development / test environments"] },
      { id: "vm_count", label: "Number of servers / VMs needed", type: "select", options: ["1-5", "6-15", "16-30", "31-50", "50+", "Not sure"] },
      { id: "storage_needs", label: "Total storage requirements", type: "select", options: ["Under 1 TB", "1-5 TB", "5-20 TB", "20-50 TB", "50+ TB", "Not sure"] },
      { id: "datacenter_requirements", label: "Infrastructure requirements", type: "multi", options: ["Cooling / HVAC", "UPS / battery backup", "Generator backup", "Fire suppression", "Physical security / access control", "Environmental monitoring", "Structured cabling", "Rack & stack services"] },
      { id: "compliance", label: "Compliance requirements", type: "multi", options: ["HIPAA", "PCI-DSS", "SOC 2", "CMMC / NIST 800-171", "FERPA", "None / Not sure"] },
      { id: "budget_dc", label: "Budget range", type: "select", options: ["Under $50,000", "$50,000 - $100,000", "$100,000 - $250,000", "$250,000 - $500,000", "$500,000+", "Need guidance"] },
      { id: "notes", label: "Additional context?", type: "textarea", placeholder: "Timeline, space constraints, existing building infrastructure..." }
    ],
    // Migrate to cloud (full)
    fieldsCloudMigration: [
      { id: "current_state", label: "Current on-premise infrastructure", type: "textarea", placeholder: "Describe what you have: e.g., '3 physical servers (AD, file, SQL), Exchange on-prem, VMware ESXi host with 10 VMs'" },
      { id: "workloads", label: "Workloads to migrate", type: "multi", options: ["File server / storage", "Email (Exchange to M365)", "Active Directory / identity", "Line-of-business applications", "Database servers (SQL)", "Web servers", "Virtual desktops (VDI)", "Backup & replication", "Development / test environments"] },
      { id: "cloud_platform_preference", label: "Preferred cloud platform", type: "multi", options: ["Microsoft Azure", "AWS (Amazon Web Services)", "Google Cloud Platform", "No preference / need guidance"] },
      { id: "migration_drivers", label: "Why migrate to cloud?", type: "multi", options: ["End-of-life hardware", "Reduce capital expenses", "Improve disaster recovery", "Scale flexibility", "Remote workforce enablement", "Eliminate on-prem maintenance", "Compliance / security"] },
      { id: "migration_timeline", label: "Migration timeline", type: "select", options: ["ASAP (urgent)", "1-3 months", "3-6 months", "6-12 months", "12+ months", "Flexible"] },
      { id: "user_count", label: "Total user count", type: "select", options: ["1-10", "11-25", "26-50", "51-100", "101-250", "250+"] },
      { id: "budget_dc", label: "Budget range (initial migration)", type: "select", options: ["Under $25,000", "$25,000 - $50,000", "$50,000 - $100,000", "$100,000+", "Need guidance"] },
      { id: "notes", label: "Additional context?", type: "textarea", placeholder: "Existing cloud subscriptions? Data sovereignty concerns? App dependencies?" }
    ],
    // Hybrid cloud setup
    fieldsHybridCloud: [
      { id: "current_state", label: "Current infrastructure", type: "textarea", placeholder: "What do you have now? e.g., 'On-prem AD and file server, already using M365 for email' or 'VMware environment, evaluating Azure Stack'" },
      { id: "hybrid_goals", label: "Hybrid cloud goals", type: "multi", options: ["Extend on-prem AD to cloud", "Cloud backup/DR for on-prem workloads", "Burst to cloud for peak capacity", "Migrate some apps to cloud, keep others on-prem", "Multi-cloud strategy", "Keep data on-prem, apps in cloud"] },
      { id: "workloads_onprem", label: "Workloads staying on-premise", type: "multi", options: ["Active Directory", "File servers", "Database servers", "Legacy applications", "Compliance-sensitive data", "High-performance computing"] },
      { id: "workloads_cloud", label: "Workloads moving to cloud", type: "multi", options: ["Email (M365)", "Backup / DR", "Development / test", "Web hosting", "Virtual desktops", "Collaboration tools"] },
      { id: "cloud_platform_preference", label: "Preferred cloud platform", type: "multi", options: ["Microsoft Azure", "AWS (Amazon Web Services)", "Google Cloud Platform", "No preference / need guidance"] },
      { id: "connectivity_needs", label: "On-prem to cloud connectivity", type: "multi", options: ["VPN (site-to-site)", "Direct connect / ExpressRoute", "SD-WAN integration", "Not sure / need guidance"] },
      { id: "budget_dc", label: "Budget range", type: "select", options: ["Under $25,000", "$25,000 - $75,000", "$75,000 - $150,000", "$150,000+", "Need guidance"] },
      { id: "notes", label: "Additional context?", type: "textarea", placeholder: "Existing cloud spend? Timeline? Bandwidth constraints?" }
    ],
    // Server refresh / upgrade
    fieldsServerRefresh: [
      { id: "current_infrastructure", label: "Current server infrastructure", type: "textarea", placeholder: "What do you have? e.g., '5-year-old Dell servers, VMware ESXi 6.5, running out of RAM and storage' or 'Physical servers for AD, file, SQL'" },
      { id: "refresh_drivers", label: "Why refresh/upgrade?", type: "multi", options: ["End-of-life / end-of-support hardware", "Performance issues (slow, running out of resources)", "Reliability concerns (failures, downtime)", "Add virtualization", "Increase capacity (more VMs, storage)", "Improve disaster recovery", "Reduce power/cooling costs"] },
      { id: "virtualization_platform", label: "Virtualization platform preference", type: "select", options: ["VMware vSphere / ESXi", "Microsoft Hyper-V", "Proxmox (open-source)", "Nutanix (HCI)", "Not virtualized / physical servers", "Not sure / need guidance"] },
      { id: "vm_count", label: "Number of servers / VMs", type: "select", options: ["1-5", "6-15", "16-30", "31-50", "50+", "Not sure"] },
      { id: "storage_needs", label: "Total storage requirements", type: "select", options: ["Under 1 TB", "1-5 TB", "5-20 TB", "20-50 TB", "50+ TB", "Not sure"] },
      { id: "server_requirements", label: "Server requirements", type: "multi", options: ["Redundant power supplies", "Hot-swap drives", "RAID storage", "SSD storage (performance)", "10Gb networking", "iDRAC / iLO remote management", "Extended warranty / support"] },
      { id: "budget_dc", label: "Budget range", type: "select", options: ["Under $25,000", "$25,000 - $50,000", "$50,000 - $100,000", "$100,000+", "Need guidance"] },
      { id: "notes", label: "Additional context?", type: "textarea", placeholder: "Timeline? Existing VMware licenses? Downtime window available?" }
    ],
    // Disaster recovery site
    fieldsDR: [
      { id: "current_dr_state", label: "Current disaster recovery setup", type: "select", options: ["No DR currently", "Backup to external drives / NAS", "Cloud backup only", "Replicate to second site", "Colocation DR site", "Not sure what we have"] },
      { id: "dr_drivers", label: "Why implement/improve DR?", type: "multi", options: ["Recent outage / data loss", "Compliance requirement", "Business continuity planning", "Ransomware protection", "Natural disaster risk", "Customer SLA requirements", "Insurance requirement"] },
      { id: "recovery_objectives", label: "Recovery objectives", type: "multi", options: ["RTO (Recovery Time Objective): < 1 hour", "RTO: 1-4 hours", "RTO: 4-24 hours", "RTO: 24+ hours acceptable", "RPO (Recovery Point Objective): Zero data loss", "RPO: < 1 hour data loss acceptable", "RPO: Daily backup acceptable"] },
      { id: "workloads_critical", label: "Mission-critical workloads", type: "multi", options: ["File servers", "Email", "Active Directory", "Database servers", "Line-of-business apps", "Web servers / ecommerce", "Virtual desktops"] },
      { id: "dr_site_preference", label: "DR site preference", type: "multi", options: ["Cloud DR (Azure Site Recovery, AWS, etc.)", "Secondary physical site (owned)", "Colocation facility", "Hot site (always running)", "Warm site (standby)", "Cold site (restore from backup)", "Not sure / need guidance"] },
      { id: "budget_dc", label: "Budget range", type: "select", options: ["Under $25,000", "$25,000 - $75,000", "$75,000 - $150,000", "$150,000+", "Need guidance"] },
      { id: "notes", label: "Additional context?", type: "textarea", placeholder: "Distance from primary site? Existing backup solution? Testing requirements?" }
    ],
    // Colocation evaluation
    fieldsColo: [
      { id: "current_state", label: "Current data center setup", type: "textarea", placeholder: "What do you have? e.g., 'On-prem server room with aging HVAC' or 'Renting a small office, no room for servers' or 'Expanding, need more capacity'" },
      { id: "colo_drivers", label: "Why consider colocation?", type: "multi", options: ["No space for server room", "Power / cooling costs too high", "Need redundant power/internet", "Compliance (physical security, SOC 2)", "Eliminate facility management overhead", "Disaster recovery site", "Scalability / room to grow"] },
      { id: "space_needed", label: "Space needed", type: "select", options: ["Quarter rack", "Half rack", "Full rack", "2-3 racks", "4-10 racks", "10+ racks", "Not sure"] },
      { id: "power_needs", label: "Estimated power requirements", type: "select", options: ["Under 1 kW", "1-3 kW", "3-5 kW", "5-10 kW", "10+ kW", "Not sure"] },
      { id: "bandwidth_needs", label: "Internet bandwidth needed", type: "select", options: ["Under 100 Mbps", "100-500 Mbps", "500 Mbps - 1 Gbps", "1-10 Gbps", "10+ Gbps", "Not sure"] },
      { id: "colo_requirements", label: "Colocation requirements", type: "multi", options: ["Redundant power (N+1, 2N)", "Carrier-neutral (multiple ISP options)", "Remote hands service", "24/7 on-site security", "Compliance certifications (SOC 2, HIPAA)", "On-site office space / staging area", "Geographic location preference"] },
      { id: "budget_dc", label: "Monthly budget range", type: "select", options: ["Under $500/mo", "$500 - $1,500/mo", "$1,500 - $3,000/mo", "$3,000 - $10,000/mo", "$10,000+/mo", "Need guidance"] },
      { id: "notes", label: "Additional context?", type: "textarea", placeholder: "Geographic requirements? Existing colo contracts? Migration timeline?" }
    ],
  },
  {
    id: "security",
    icon: "🛡️",
    title: "Cybersecurity",
    subtitle: "Endpoint protection, SIEM, compliance, zero trust",
    color: "#ef4444",
    // Base field shown first before branching
    fields: [
      { id: "security_goal", label: "What's your primary security goal?", type: "multi", options: [
        { label: "Comprehensive Security Assessment", description: "Full security audit and gap analysis to identify vulnerabilities and create a roadmap" },
        { label: "Endpoint Protection", description: "Deploy or upgrade antivirus, EDR/XDR, and device protection across your organization" },
        { label: "Compliance Readiness", description: "Prepare for HIPAA, PCI-DSS, SOC 2, CMMC, or other regulatory requirements" },
        { label: "Email & Phishing Defense", description: "Advanced email filtering, anti-phishing training, and incident response for email threats" },
        { label: "Zero Trust & Identity", description: "Implement zero trust architecture with MFA, conditional access, and identity governance" },
      ] },
    ],
    // Security Assessment questions
    fieldsAssessment: [
      { id: "employee_count", label: "Number of employees", type: "select", options: ["1-10", "11-25", "26-50", "51-100", "101-250", "250+"] },
      { id: "industry", label: "Your industry", type: "select", options: ["Healthcare", "Financial services", "Manufacturing", "Legal", "Government / public sector", "Retail / ecommerce", "Professional services", "Education", "Other"] },
      { id: "current_tools", label: "Current security tools in place", type: "multi", options: [
        { label: "Antivirus (traditional)", description: "Basic signature-based antivirus on endpoints" },
        { label: "EDR / XDR", description: "Advanced endpoint detection and response platform" },
        { label: "Firewall with UTM", description: "Next-gen firewall with unified threat management" },
        { label: "Email filtering", description: "Anti-spam and malware scanning for email" },
        { label: "MFA", description: "Multi-factor authentication deployed" },
        { label: "Security awareness training", description: "Regular phishing and security training for staff" },
        { label: "Backup solution", description: "Automated backup with offsite/cloud copies" },
        { label: "SIEM / log management", description: "Security information and event management platform" },
        { label: "Dark web monitoring", description: "Monitoring for leaked credentials or data" },
        { label: "None / starting fresh", description: "No formal security tools currently in place" },
      ] },
      { id: "assessment_drivers", label: "What's driving this assessment?", type: "multi", options: [
        { label: "Recent security incident", description: "Experienced ransomware, breach, or phishing attack" },
        { label: "Compliance requirement", description: "Need to meet regulatory or customer security standards" },
        { label: "Cyber insurance application", description: "Insurer requires security documentation or improvements" },
        { label: "M&A activity", description: "Merger, acquisition, or due diligence process" },
        { label: "Leadership directive", description: "Board or executive mandate to improve security posture" },
        { label: "Proactive planning", description: "Want to stay ahead of threats and build a roadmap" },
      ] },
      { id: "assessment_scope", label: "What should the assessment cover?", type: "multi", options: [
        { label: "Network security", description: "Firewalls, segmentation, VPN, wireless security" },
        { label: "Endpoint security", description: "Laptops, desktops, mobile devices, servers" },
        { label: "Identity & access", description: "User accounts, privileges, MFA, password policies" },
        { label: "Email & phishing", description: "Email security, spam filtering, user awareness" },
        { label: "Data protection", description: "Encryption, DLP, backup, data classification" },
        { label: "Cloud security", description: "AWS, Azure, Google Cloud, SaaS application security" },
        { label: "Physical security", description: "Badge access, cameras, visitor management" },
        { label: "Incident response", description: "IR plan, playbooks, forensics readiness" },
        { label: "Vendor/third-party risk", description: "Supply chain and vendor security assessments" },
      ] },
      { id: "budget_assessment", label: "Budget for security assessment", type: "select", options: ["Under $5,000", "$5,000-10,000", "$10,000-25,000", "$25,000-50,000", "$50,000+", "Need guidance"] },
      { id: "notes", label: "Additional context", type: "textarea", placeholder: "Recent incidents, timeline, specific areas of concern..." },
    ],
    // Endpoint Protection questions
    fieldsEndpoint: [
      { id: "employee_count", label: "Number of employees/devices to protect", type: "select", options: ["1-10", "11-25", "26-50", "51-100", "101-250", "250-500", "500+"] },
      { id: "device_types", label: "What devices need protection?", type: "multi", options: [
        { label: "Windows laptops/desktops", description: "Standard Windows endpoints" },
        { label: "Mac computers", description: "macOS devices" },
        { label: "Linux workstations/servers", description: "Linux-based systems" },
        { label: "Mobile devices (BYOD)", description: "Personal iOS/Android phones and tablets" },
        { label: "Company-owned mobile", description: "Corporate-managed iOS/Android devices" },
        { label: "Servers (on-prem)", description: "Physical or virtual servers in your datacenter" },
        { label: "Cloud servers", description: "AWS, Azure, or Google Cloud VMs" },
      ] },
      { id: "current_av", label: "Current antivirus/endpoint solution?", type: "select", options: ["Traditional antivirus (e.g. McAfee, Norton)", "EDR solution (e.g. CrowdStrike, SentinelOne)", "Built-in only (Windows Defender)", "Multiple tools (inconsistent)", "None / No protection", "Not sure what we have"] },
      { id: "endpoint_features", label: "Required endpoint protection features", type: "multi", options: [
        { label: "Next-gen antivirus (NGAV)", description: "AI/ML-based threat detection beyond signatures" },
        { label: "Endpoint detection & response (EDR)", description: "Real-time monitoring, threat hunting, and forensics" },
        { label: "Ransomware rollback", description: "Automatic restoration of encrypted files" },
        { label: "Behavioral analysis", description: "Detect suspicious activity patterns and zero-days" },
        { label: "24/7 SOC monitoring", description: "Managed detection and response (MDR) with human analysts" },
        { label: "USB device control", description: "Block or monitor removable media" },
        { label: "Application control", description: "Whitelist/blacklist applications by policy" },
        { label: "Vulnerability management", description: "Scan and remediate OS and software vulnerabilities" },
      ] },
      { id: "management_preference", label: "How do you want to manage it?", type: "select", options: ["Fully managed (MDR with 24/7 SOC)", "Co-managed (vendor assists, we retain control)", "Self-managed (we handle alerts and response)", "Not sure / Need recommendation"] },
      { id: "budget_endpoint", label: "Monthly budget per endpoint", type: "select", options: ["Under $5/device", "$5-10/device", "$10-20/device", "$20-40/device", "$40+/device", "Need guidance"] },
      { id: "notes", label: "Special requirements or challenges?", type: "textarea", placeholder: "Industry-specific needs, air-gapped systems, deployment timeline..." },
    ],
    // Compliance questions
    fieldsCompliance: [
      { id: "employee_count", label: "Number of employees in scope", type: "select", options: ["1-10", "11-25", "26-50", "51-100", "101-250", "250+"] },
      { id: "industry", label: "Your industry", type: "select", options: ["Healthcare", "Financial services", "Manufacturing", "Legal", "Government / public sector", "Retail / ecommerce", "Professional services", "Education", "Other"] },
      { id: "compliance_frameworks", label: "Which compliance frameworks do you need?", type: "multi", options: [
        { label: "HIPAA", description: "Healthcare data protection (PHI)" },
        { label: "PCI-DSS", description: "Payment card industry security standards" },
        { label: "SOC 2 Type I or II", description: "Service organization controls audit" },
        { label: "CMMC", description: "Cybersecurity Maturity Model Certification (DoD)" },
        { label: "NIST CSF", description: "NIST Cybersecurity Framework" },
        { label: "CIS Controls", description: "Center for Internet Security benchmarks" },
        { label: "ISO 27001", description: "International information security standard" },
        { label: "GDPR", description: "EU General Data Protection Regulation" },
        { label: "StateRAMP / FedRAMP", description: "Government cloud authorization" },
        { label: "Not sure / Need help identifying", description: "Need guidance on which frameworks apply" },
      ] },
      { id: "compliance_driver", label: "Why do you need compliance?", type: "select", options: ["Customer contract requirement", "Regulatory audit scheduled", "Cyber insurance requirement", "RFP / new sales opportunity", "Board or leadership mandate", "Proactive risk management"] },
      { id: "audit_timeline", label: "When is your audit or deadline?", type: "select", options: ["Already overdue", "Within 30 days", "1-3 months", "3-6 months", "6-12 months", "12+ months / planning ahead"] },
      { id: "current_state", label: "Current compliance readiness", type: "select", options: ["No preparation yet", "Some documentation started", "Partially compliant", "Compliant but need audit validation", "Not sure where we stand"] },
      { id: "compliance_scope", label: "What needs to be addressed?", type: "multi", options: [
        { label: "Policies & procedures", description: "Security policies, acceptable use, incident response" },
        { label: "Risk assessment", description: "Identify and document security risks" },
        { label: "Access controls", description: "User permissions, MFA, least privilege" },
        { label: "Encryption", description: "Data at rest and in transit" },
        { label: "Backup & recovery", description: "Business continuity and disaster recovery" },
        { label: "Audit logging", description: "SIEM, log retention, monitoring" },
        { label: "Security awareness training", description: "Staff training and phishing simulation" },
        { label: "Vendor management", description: "Third-party risk assessments and BAAs" },
        { label: "Penetration testing", description: "External pentest or vulnerability scan" },
        { label: "Everything / full compliance program", description: "Need comprehensive compliance support" },
      ] },
      { id: "budget_compliance", label: "Budget for compliance project", type: "select", options: ["Under $10,000", "$10,000-25,000", "$25,000-50,000", "$50,000-100,000", "$100,000+", "Need guidance"] },
      { id: "notes", label: "Additional context", type: "textarea", placeholder: "Audit findings, specific gaps, customer requirements..." },
    ],
    // Email & Phishing Defense questions
    fieldsEmail: [
      { id: "employee_count", label: "Number of email users", type: "select", options: ["1-10", "11-25", "26-50", "51-100", "101-250", "250-500", "500+"] },
      { id: "email_platform", label: "What email platform do you use?", type: "select", options: ["Microsoft 365", "Google Workspace", "On-premise Exchange", "Other hosted email", "Mixed environment", "Not sure"] },
      { id: "current_email_security", label: "Current email security tools", type: "multi", options: [
        { label: "Built-in protection only", description: "Native Microsoft or Google filtering" },
        { label: "Third-party email gateway", description: "Proofpoint, Mimecast, Barracuda, etc." },
        { label: "Advanced threat protection", description: "Sandbox, URL rewriting, ATP features" },
        { label: "DMARC / SPF / DKIM", description: "Email authentication protocols configured" },
        { label: "Phishing simulation training", description: "Regular fake phishing tests for users" },
        { label: "Email encryption", description: "Secure email for sensitive data" },
        { label: "None / basic filtering only", description: "No advanced email security" },
      ] },
      { id: "email_threats", label: "What email threats concern you most?", type: "multi", options: [
        { label: "Phishing / credential theft", description: "Fake login pages stealing passwords" },
        { label: "Business email compromise (BEC)", description: "Impersonation and wire fraud attacks" },
        { label: "Malware attachments", description: "Ransomware, trojans, or viruses in files" },
        { label: "Malicious links/URLs", description: "Links to phishing or malware sites" },
        { label: "Spoofing / impersonation", description: "Emails pretending to be from executives or vendors" },
        { label: "Data exfiltration", description: "Sensitive data leaving via email" },
        { label: "Spam overload", description: "Too much junk mail affecting productivity" },
      ] },
      { id: "email_features", label: "Email security features needed", type: "multi", options: [
        { label: "Advanced threat detection", description: "Sandbox analysis and AI-based threat detection" },
        { label: "URL rewriting & time-of-click protection", description: "Scan links when clicked, not just when received" },
        { label: "Attachment sandboxing", description: "Detonate attachments in isolated environment" },
        { label: "DMARC enforcement", description: "Block spoofed emails from your domain" },
        { label: "Phishing simulation & training", description: "Automated phishing tests with training modules" },
        { label: "Email encryption", description: "Encrypt sensitive emails automatically or on-demand" },
        { label: "DLP for email", description: "Prevent accidental sharing of sensitive data" },
        { label: "Incident response & remediation", description: "Quickly remove malicious emails from all inboxes" },
      ] },
      { id: "budget_email", label: "Monthly budget per user", type: "select", options: ["Under $3/user", "$3-6/user", "$6-12/user", "$12-20/user", "$20+/user", "Need guidance"] },
      { id: "notes", label: "Additional context", type: "textarea", placeholder: "Recent phishing incidents, compliance needs, specific concerns..." },
    ],
    // Zero Trust & Identity questions
    fieldsZeroTrust: [
      { id: "employee_count", label: "Number of users", type: "select", options: ["1-10", "11-25", "26-50", "51-100", "101-250", "250-500", "500+"] },
      { id: "identity_platform", label: "Current identity platform", type: "select", options: ["Azure Active Directory / Entra ID", "Google Workspace", "Okta", "On-premise Active Directory only", "JumpCloud", "Mixed / multiple directories", "None / local accounts only"] },
      { id: "current_iam", label: "Current identity & access controls", type: "multi", options: [
        { label: "MFA deployed for most users", description: "Multi-factor authentication is standard" },
        { label: "MFA for admins/VPN only", description: "MFA only on privileged accounts or remote access" },
        { label: "Single sign-on (SSO)", description: "Centralized login for SaaS apps" },
        { label: "Conditional access policies", description: "Block access from risky locations or devices" },
        { label: "Privileged access management (PAM)", description: "Vault and session recording for admin accounts" },
        { label: "Password policies enforced", description: "Complexity, expiration, lockout rules" },
        { label: "None / basic passwords only", description: "No MFA or advanced identity controls" },
      ] },
      { id: "zerotrust_drivers", label: "Why are you pursuing zero trust?", type: "multi", options: [
        { label: "Remote workforce security", description: "Need to secure work-from-anywhere access" },
        { label: "Cloud migration", description: "Moving apps to cloud, need new security model" },
        { label: "Compliance requirement", description: "CMMC, FedRAMP, or other mandate" },
        { label: "Recent breach or incident", description: "Need to prevent lateral movement and limit blast radius" },
        { label: "Cyber insurance requirement", description: "Insurer requires MFA and access controls" },
        { label: "Proactive security improvement", description: "Want to modernize security architecture" },
      ] },
      { id: "zerotrust_scope", label: "What does your zero trust initiative cover?", type: "multi", options: [
        { label: "MFA everywhere", description: "Universal MFA for all users and applications" },
        { label: "Conditional access", description: "Context-aware policies (location, device, risk)" },
        { label: "Device trust / endpoint verification", description: "Only allow managed/compliant devices" },
        { label: "Least privilege access", description: "Just-in-time access and privilege minimization" },
        { label: "Network segmentation", description: "Micro-segmentation and software-defined perimeter" },
        { label: "Continuous monitoring & analytics", description: "UEBA and behavior-based threat detection" },
        { label: "Privileged access management", description: "Secure admin accounts and session monitoring" },
        { label: "SaaS security (CASB)", description: "Cloud access security broker for shadow IT" },
      ] },
      { id: "budget_zerotrust", label: "Monthly budget per user", type: "select", options: ["Under $5/user", "$5-10/user", "$10-20/user", "$20-40/user", "$40+/user", "Need guidance"] },
      { id: "notes", label: "Additional context", type: "textarea", placeholder: "Current pain points, compliance deadlines, implementation timeline..." },
    ],
  },
  {
    id: "bcdr",
    icon: "🔄",
    title: "Backup & Disaster Recovery",
    subtitle: "Business continuity, backup, failover, RTO/RPO planning",
    color: "#6366f1",
    // Base field shown first before branching
    fields: [
      { id: "bcdr_goal", label: "What type of backup/DR solution do you need?", type: "multi", options: [
        { label: "New Backup Solution", description: "No backup currently — need to implement data protection from scratch" },
        { label: "Backup Replacement", description: "Replace unreliable, slow, or outdated backup system with modern solution" },
        { label: "Disaster Recovery (DR)", description: "Add business continuity and failover capability beyond basic backups" },
        { label: "SaaS Backup (M365/Google)", description: "Protect cloud email, OneDrive, SharePoint, or Google Workspace data" },
        { label: "Compliance-Driven Backup", description: "Meet regulatory requirements for data retention and recovery (HIPAA, SOX, etc.)" },
      ] },
    ],
    // New Backup Solution questions
    fieldsNewBackup: [
      { id: "data_volume", label: "Total data to protect", type: "select", options: ["Under 500 GB", "500 GB - 2 TB", "2 TB - 10 TB", "10 TB - 50 TB", "50+ TB", "Not sure"] },
      { id: "environment", label: "What needs protecting?", type: "multi", options: [
        { label: "Physical servers", description: "On-premise physical servers or appliances" },
        { label: "Virtual machines (VMware/Hyper-V)", description: "Virtualized server infrastructure" },
        { label: "Microsoft 365", description: "Email, SharePoint, OneDrive, Teams data" },
        { label: "Google Workspace", description: "Gmail, Drive, Docs, shared files" },
        { label: "Cloud servers (AWS/Azure/GCP)", description: "Cloud-hosted VMs or instances" },
        { label: "Workstations / laptops", description: "End-user device data" },
        { label: "Databases (SQL, Oracle, etc.)", description: "Production databases requiring point-in-time recovery" },
        { label: "SaaS applications", description: "Salesforce, other cloud apps" },
        { label: "Network-attached storage (NAS)", description: "Shared file storage or NAS devices" },
      ] },
      { id: "recovery_goals", label: "Recovery requirements", type: "multi", options: [
        { label: "Fast recovery (RTO < 4 hours)", description: "Need to be back up and running within a few hours" },
        { label: "Minimal data loss (RPO < 1 hour)", description: "Can't afford to lose more than an hour of data" },
        { label: "Offsite/cloud copies", description: "Need backups stored away from primary location" },
        { label: "Ransomware protection", description: "Immutable backups that can't be encrypted by ransomware" },
        { label: "Long-term retention", description: "Keep backups for years (compliance or legal hold)" },
        { label: "Granular restore", description: "Recover individual files or emails without full restore" },
      ] },
      { id: "current_state", label: "Current backup situation", type: "select", options: ["No backup at all", "Manual backups (USB drives, etc.)", "Inconsistent backups", "Backups not tested", "Backups onsite only (no offsite)", "Not sure if backups work"] },
      { id: "urgency", label: "Implementation urgency", type: "select", options: ["Immediate (recent data loss or scare)", "Within 30 days", "1-3 months", "3-6 months", "Planning ahead"] },
      { id: "budget_backup", label: "Monthly budget", type: "select", options: ["Under $200/mo", "$200-500/mo", "$500-1,500/mo", "$1,500-3,000/mo", "$3,000-5,000/mo", "$5,000+/mo", "Need guidance"] },
      { id: "notes", label: "Additional context", type: "textarea", placeholder: "Specific systems to protect, growth plans, prior data loss..." },
    ],
    // Backup Replacement questions
    fieldsReplacement: [
      { id: "current_solution", label: "What's your current backup solution?", type: "text" as const, placeholder: "e.g. Veeam, Acronis, tape backup, Carbonite..." },
      { id: "replacement_reason", label: "Why are you replacing it?", type: "multi", options: [
        { label: "Too slow to backup/restore", description: "Backup windows too long or restores take forever" },
        { label: "Unreliable / frequent failures", description: "Backups fail often, can't trust them" },
        { label: "End-of-life / no longer supported", description: "Vendor sunset or software outdated" },
        { label: "Doesn't support new systems", description: "Can't back up cloud, M365, or modern workloads" },
        { label: "Too expensive", description: "Cost is too high for what it delivers" },
        { label: "Lacks ransomware protection", description: "No immutability or air-gap features" },
        { label: "Poor support or management", description: "Difficult to use or vendor support inadequate" },
      ] },
      { id: "data_volume", label: "Total data to protect", type: "select", options: ["Under 500 GB", "500 GB - 2 TB", "2 TB - 10 TB", "10 TB - 50 TB", "50+ TB", "Not sure"] },
      { id: "environment", label: "What needs protecting?", type: "multi", options: [
        { label: "Physical servers", description: "On-premise physical servers or appliances" },
        { label: "Virtual machines (VMware/Hyper-V)", description: "Virtualized server infrastructure" },
        { label: "Microsoft 365", description: "Email, SharePoint, OneDrive, Teams data" },
        { label: "Google Workspace", description: "Gmail, Drive, Docs, shared files" },
        { label: "Cloud servers (AWS/Azure/GCP)", description: "Cloud-hosted VMs or instances" },
        { label: "Workstations / laptops", description: "End-user device data" },
        { label: "Databases (SQL, Oracle, etc.)", description: "Production databases requiring point-in-time recovery" },
        { label: "SaaS applications", description: "Salesforce, other cloud apps" },
        { label: "Network-attached storage (NAS)", description: "Shared file storage or NAS devices" },
      ] },
      { id: "must_have_features", label: "Must-have features in new solution", type: "multi", options: [
        { label: "Fast restores", description: "Quick recovery for minimal downtime" },
        { label: "Ransomware protection", description: "Immutable or air-gapped backups" },
        { label: "Cloud backup storage", description: "Offsite cloud copies for disaster recovery" },
        { label: "Application-aware backups", description: "SQL, Exchange, Active Directory aware" },
        { label: "Easy management console", description: "Simple, intuitive UI" },
        { label: "Automated testing/validation", description: "Verify backups actually work" },
        { label: "Flexible retention policies", description: "Granular control over how long to keep data" },
      ] },
      { id: "migration_concern", label: "Migration concerns", type: "select", options: ["Need zero downtime during switch", "Want to test new solution in parallel first", "Can accept brief maintenance window", "Full cutover is fine", "Not sure / need guidance"] },
      { id: "budget_replacement", label: "Monthly budget", type: "select", options: ["Under $200/mo", "$200-500/mo", "$500-1,500/mo", "$1,500-3,000/mo", "$3,000-5,000/mo", "$5,000+/mo", "Need guidance"] },
      { id: "notes", label: "Additional context", type: "textarea", placeholder: "Current backup schedule, retention needs, pain points..." },
    ],
    // Disaster Recovery questions
    fieldsDR: [
      { id: "criticality", label: "How critical is uptime to your business?", type: "select", options: ["Mission-critical (revenue stops if we're down)", "Very important (significant business impact)", "Moderate (can tolerate some downtime)", "Low (downtime is inconvenient but manageable)"] },
      { id: "rto", label: "Recovery Time Objective (how fast must you be back up?)", type: "select", options: ["Minutes (near-zero downtime)", "1-4 hours", "4-8 hours", "Same business day", "Next business day", "Not sure / Help me decide"] },
      { id: "rpo", label: "Recovery Point Objective (how much data can you lose?)", type: "select", options: ["None (real-time replication)", "15 minutes", "1 hour", "4 hours", "24 hours", "Not sure / Help me decide"] },
      { id: "dr_scope", label: "What needs disaster recovery protection?", type: "multi", options: [
        { label: "Critical servers only", description: "Protect only mission-critical systems (e.g., ERP, database)" },
        { label: "All servers", description: "Full server environment failover" },
        { label: "Entire site/datacenter", description: "Complete site failover including network, storage, etc." },
        { label: "Specific applications", description: "Application-level DR (e.g., SQL Always On, Exchange DAG)" },
        { label: "Virtual machines", description: "VMware or Hyper-V VM replication" },
        { label: "Cloud workloads", description: "AWS, Azure, or GCP instance failover" },
      ] },
      { id: "dr_location", label: "Where should DR failover target be?", type: "select", options: ["Cloud (AWS, Azure, GCP)", "Colo / secondary datacenter", "Managed DR provider facility", "Onsite (separate hardware)", "Not sure / need recommendation"] },
      { id: "dr_testing", label: "DR testing requirements", type: "select", options: ["Monthly automated testing", "Quarterly testing", "Annual test", "Ad-hoc / as-needed", "Not sure"] },
      { id: "current_backup", label: "Do you currently have backups in place?", type: "select", options: ["Yes, reliable backup solution", "Yes, but backups are unreliable", "Basic backups only", "No backup currently"] },
      { id: "budget_dr", label: "Monthly budget for DR", type: "select", options: ["Under $1,000/mo", "$1,000-2,500/mo", "$2,500-5,000/mo", "$5,000-10,000/mo", "$10,000+/mo", "Need guidance"] },
      { id: "notes", label: "Additional context", type: "textarea", placeholder: "Prior outages, compliance requirements, runbook needs..." },
    ],
    // SaaS Backup questions
    fieldsSaaS: [
      { id: "saas_platform", label: "Which SaaS platforms need backup?", type: "multi", options: [
        { label: "Microsoft 365", description: "Exchange Online, SharePoint, OneDrive, Teams" },
        { label: "Google Workspace", description: "Gmail, Drive, Shared Drives, Calendar" },
        { label: "Salesforce", description: "CRM data, custom objects, attachments" },
        { label: "Dynamics 365", description: "Microsoft business applications" },
        { label: "Box / Dropbox", description: "Cloud file storage" },
        { label: "Slack", description: "Messages, files, conversations" },
        { label: "Other SaaS apps", description: "Specify in notes" },
      ] },
      { id: "user_count", label: "Number of users", type: "select", options: ["1-10", "11-25", "26-50", "51-100", "101-250", "250-500", "500+"] },
      { id: "saas_concern", label: "What concerns you most about SaaS data?", type: "multi", options: [
        { label: "Accidental deletion", description: "Users delete files/emails by mistake" },
        { label: "Ransomware", description: "Malicious encryption spreading to cloud data" },
        { label: "Former employee data loss", description: "User accounts deleted with all their data" },
        { label: "Compliance / eDiscovery", description: "Need long-term retention for legal/audit" },
        { label: "No confidence in vendor backup", description: "Don't trust Microsoft/Google to protect data" },
        { label: "Migration / portability", description: "Want data in independent format for migration" },
      ] },
      { id: "retention_saas", label: "How long do you need to retain SaaS backups?", type: "select", options: ["30 days", "90 days", "1 year", "3 years", "7+ years (compliance)", "Indefinite / unlimited"] },
      { id: "granular_restore", label: "Restore requirements", type: "multi", options: [
        { label: "Individual emails", description: "Restore single emails without full mailbox" },
        { label: "Individual files/folders", description: "Granular OneDrive or Drive file recovery" },
        { label: "Mailboxes", description: "Full user mailbox restore" },
        { label: "SharePoint sites", description: "Entire site or site collection recovery" },
        { label: "Point-in-time restore", description: "Restore to a specific date/time" },
        { label: "Cross-user restore", description: "Restore one user's data to another account" },
      ] },
      { id: "budget_saas", label: "Monthly budget per user", type: "select", options: ["Under $2/user", "$2-4/user", "$4-8/user", "$8-15/user", "$15+/user", "Need guidance"] },
      { id: "notes", label: "Additional context", type: "textarea", placeholder: "Compliance needs, prior data loss, retention policies..." },
    ],
    // Compliance-Driven Backup questions
    fieldsCompliance: [
      { id: "compliance_framework", label: "Which compliance frameworks apply?", type: "multi", options: [
        { label: "HIPAA", description: "Healthcare data protection" },
        { label: "SOX (Sarbanes-Oxley)", description: "Financial data retention and integrity" },
        { label: "PCI-DSS", description: "Payment card data security" },
        { label: "FINRA / SEC", description: "Financial services regulations" },
        { label: "GDPR", description: "EU data protection and privacy" },
        { label: "CMMC", description: "Defense contractor cybersecurity" },
        { label: "ISO 27001", description: "Information security management" },
        { label: "State privacy laws", description: "CCPA, CPRA, etc." },
        { label: "Industry-specific", description: "Specify in notes" },
        { label: "Not sure / Need guidance", description: "Help identify applicable regulations" },
      ] },
      { id: "retention_compliance", label: "Required retention period", type: "select", options: ["1 year", "3 years", "5 years", "7 years", "10+ years", "Indefinite", "Varies by data type"] },
      { id: "audit_frequency", label: "How often are you audited?", type: "select", options: ["Annually", "Quarterly", "Continuous monitoring", "Ad-hoc / customer audits", "Not yet audited (preparing)", "Not sure"] },
      { id: "data_types", label: "What types of data need protection?", type: "multi", options: [
        { label: "PHI (health records)", description: "Protected health information under HIPAA" },
        { label: "PII (personal data)", description: "Social security numbers, personal identifiers" },
        { label: "Financial records", description: "Transactions, accounting data" },
        { label: "Email & communications", description: "Email archives for eDiscovery" },
        { label: "Contracts & legal docs", description: "Agreements, legal holds" },
        { label: "Customer data", description: "CRM, support tickets, customer records" },
        { label: "Intellectual property", description: "Source code, trade secrets, designs" },
        { label: "All business data", description: "Comprehensive backup of everything" },
      ] },
      { id: "compliance_features", label: "Required compliance features", type: "multi", options: [
        { label: "Encryption at rest", description: "Data encrypted in backup storage" },
        { label: "Encryption in transit", description: "Secure transfer to backup location" },
        { label: "Immutable backups", description: "WORM or locked backups that can't be altered" },
        { label: "Audit logging", description: "Track all backup, restore, and access activity" },
        { label: "Role-based access control", description: "Limit who can manage or restore backups" },
        { label: "Air-gapped backups", description: "Offline copies isolated from network" },
        { label: "Legal hold capability", description: "Preserve data for litigation" },
        { label: "Chain of custody", description: "Documented backup integrity and handling" },
      ] },
      { id: "environment", label: "What needs protecting?", type: "multi", options: [
        { label: "Physical servers", description: "On-premise servers" },
        { label: "Virtual machines", description: "VMware/Hyper-V" },
        { label: "Microsoft 365", description: "Email, SharePoint, OneDrive" },
        { label: "Google Workspace", description: "Gmail, Drive" },
        { label: "Databases", description: "SQL, Oracle, etc." },
        { label: "SaaS applications", description: "Salesforce, other cloud apps" },
        { label: "File servers / NAS", description: "Shared storage" },
      ] },
      { id: "budget_compliance", label: "Monthly budget", type: "select", options: ["Under $500/mo", "$500-1,500/mo", "$1,500-3,000/mo", "$3,000-5,000/mo", "$5,000-10,000/mo", "$10,000+/mo", "Need guidance"] },
      { id: "notes", label: "Additional context", type: "textarea", placeholder: "Audit findings, specific regulations, deadlines..." },
    ],
  },
  {
    id: "custom",
    icon: "✨",
    title: "Custom Solution",
    subtitle: "Describe any IT project and get a custom solution",
    color: "#f59e0b",
    fields: []
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
  const { hasAccess, isLoading, isDesignLimitReached, isNotLoggedIn, designsCreated, designLimit } = useFeatureAccess('ai-solutions');
  const [view, setView] = useState<'home' | 'configure'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(1); // default to "Better"
  const [modificationRequest, setModificationRequest] = useState<string>('');
  const [isModifying, setIsModifying] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [savedSolutions, setSavedSolutions] = useState<any[]>([]);
  const [refreshSolutions, setRefreshSolutions] = useState<number>(0); // Trigger to refresh saved solutions
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null); // Track database design ID
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [leftWidth, setLeftWidth] = useState(280); // Saved solutions panel width
  const [rightWidth, setRightWidth] = useState(380); // Chat panel width
  const [editingDesignId, setEditingDesignId] = useState<string | null>(null);
  const [editingDesignTitle, setEditingDesignTitle] = useState<string>('');
  const [roomImages, setRoomImages] = useState<Array<{ base64: string; mediaType: string; preview: string }>>([]);
  const [roomAnalysis, setRoomAnalysis] = useState<any>(null);
  const [analyzingRoom, setAnalyzingRoom] = useState(false);
  const [showUploadChoice, setShowUploadChoice] = useState(false); // Show upload choice for collaboration
  const contentRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Mobile panel states
  const [isMobileLeftPanelOpen, setIsMobileLeftPanelOpen] = useState(false);
  const [isMobileRightPanelOpen, setIsMobileRightPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load solution from saved solutions page
  useEffect(() => {
    const loadSolution = async () => {
      const loadSolutionId = localStorage.getItem('loadSolutionId');
      if (!loadSolutionId) return;

      console.log('Loading solution from saved solutions:', loadSolutionId);

      try {
        // Fetch the specific solution
        const response = await fetch('/api/get-designs');
        if (response.ok) {
          const data = await response.json();
          const solution = data.designs?.find((d: any) => d.id === loadSolutionId);

          if (solution) {
            console.log('Found solution to load:', solution);

            // Set the category (design_type maps to category ID like 'ucaas', 'assessment', etc.)
            setSelectedCategory(solution.design_type);

            // Populate form data
            if (solution.design_data) {
              setFormData(solution.design_data);
            }

            // Set AI response if available
            if (solution.ai_response) {
              setApiResult(solution.ai_response);
              setShowResult(true);
            }

            // IMPORTANT: Set BOTH design ID and session ID to prevent creating duplicates
            // - currentDesignId prevents database duplicates
            // - currentSessionId prevents local "Auto-saved" duplicates
            setCurrentDesignId(solution.id);
            setCurrentSessionId(solution.id);

            // Also set the selected tier if available
            if (solution.design_data?.selectedTier !== undefined) {
              setSelectedTier(solution.design_data.selectedTier);
            }

            // Switch to configure view to show the loaded solution
            setView('configure');

            console.log('Solution loaded successfully, currentDesignId and currentSessionId set to:', solution.id);
          } else {
            console.error('Solution not found with ID:', loadSolutionId);
          }
        }
      } catch (error) {
        console.error('Error loading solution:', error);
      } finally {
        // Clear the localStorage item
        localStorage.removeItem('loadSolutionId');
      }
    };

    loadSolution();
  }, []);

  const category = CATEGORIES.find(c => c.id === selectedCategory);

  // For UCaaS, pick the right field track based on the first answer
  const activeFields: Field[] = (() => {
    if (!category) return [];

    // UCaaS conditional fields
    if (category.id === 'ucaas') {
      const solutionType: string[] = formData.solution_type || [];
      const isCCaaSOnly = solutionType.includes('CCaaS Only') && !solutionType.includes('UCaaS Only') && !solutionType.includes('UCaaS + CCaaS');
      const isUCaaSOnly = solutionType.includes('UCaaS Only') && !solutionType.includes('CCaaS Only') && !solutionType.includes('UCaaS + CCaaS');
      const isBoth = solutionType.includes('UCaaS + CCaaS') || (solutionType.includes('UCaaS Only') && solutionType.includes('CCaaS Only'));
      const tail = isCCaaSOnly ? (category.fieldsCCaaS ?? [])
                  : isUCaaSOnly ? (category.fieldsUCaaS ?? [])
                  : isBoth ? (category.fieldsBoth ?? [])
                  : [];
      return [...category.fields, ...tail];
    }

    // Networking conditional fields
    if (category.id === 'networking') {
      const projectType: string = formData.project_type || '';
      const tail = projectType === 'New office buildout' ? (category.fieldsNewOffice ?? [])
                  : projectType === 'Network refresh / upgrade' ? (category.fieldsRefresh ?? [])
                  : projectType === 'Adding Wi-Fi coverage' ? (category.fieldsWiFi ?? [])
                  : projectType === 'Firewall / security upgrade' ? (category.fieldsFirewall ?? [])
                  : projectType === 'SD-WAN deployment' ? (category.fieldsSDWAN ?? [])
                  : projectType === 'Guest Wi-Fi / Public Wi-Fi' ? (category.fieldsGuestWiFi ?? [])
                  : projectType === 'Network cabling / structured cabling' ? (category.fieldsCabling ?? [])
                  : projectType === 'ISP failover / redundancy' ? (category.fieldsISPFailover ?? [])
                  : projectType === 'Remote site connectivity' ? (category.fieldsRemoteSite ?? [])
                  : projectType === 'VPN for remote users' ? (category.fieldsRemoteVPN ?? [])
                  : projectType === 'Network troubleshooting / assessment' ? (category.fieldsTroubleshooting ?? [])
                  : [];
      return [...category.fields, ...tail];
    }

    // Data Center & Cloud conditional fields
    if (category.id === 'datacenter') {
      const projectScope: string = formData.project_scope || '';
      const tail = projectScope === 'Build new server room / data center' ? (category.fieldsNewDataCenter ?? [])
                  : projectScope === 'Migrate to cloud (full)' ? (category.fieldsCloudMigration ?? [])
                  : projectScope === 'Hybrid cloud setup' ? (category.fieldsHybridCloud ?? [])
                  : projectScope === 'Server refresh / upgrade' ? (category.fieldsServerRefresh ?? [])
                  : projectScope === 'Disaster recovery site' ? (category.fieldsDR ?? [])
                  : projectScope === 'Colocation evaluation' ? (category.fieldsColo ?? [])
                  : [];
      return [...category.fields, ...tail];
    }

    // Security conditional fields
    if (category.id === 'security') {
      const securityGoal: string[] = formData.security_goal || [];
      // Only show conditional fields if exactly one option is selected
      if (securityGoal.length !== 1) {
        return category.fields;
      }
      const selectedGoal = securityGoal[0];
      const tail = selectedGoal === 'Comprehensive Security Assessment' ? (category.fieldsAssessment ?? [])
                  : selectedGoal === 'Endpoint Protection' ? (category.fieldsEndpoint ?? [])
                  : selectedGoal === 'Compliance Readiness' ? (category.fieldsCompliance ?? [])
                  : selectedGoal === 'Email & Phishing Defense' ? (category.fieldsEmail ?? [])
                  : selectedGoal === 'Zero Trust & Identity' ? (category.fieldsZeroTrust ?? [])
                  : [];
      return [...category.fields, ...tail];
    }

    // BCDR conditional fields
    if (category.id === 'bcdr') {
      const bcdrGoal: string[] = formData.bcdr_goal || [];
      // Only show conditional fields if exactly one option is selected
      if (bcdrGoal.length !== 1) {
        return category.fields;
      }
      const selectedGoal = bcdrGoal[0];
      const tail = selectedGoal === 'New Backup Solution' ? (category.fieldsNewBackup ?? [])
                  : selectedGoal === 'Backup Replacement' ? (category.fieldsReplacement ?? [])
                  : selectedGoal === 'Disaster Recovery (DR)' ? (category.fieldsDR ?? [])
                  : selectedGoal === 'SaaS Backup (M365/Google)' ? (category.fieldsSaaS ?? [])
                  : selectedGoal === 'Compliance-Driven Backup' ? (category.fieldsCompliance ?? [])
                  : [];
      return [...category.fields, ...tail];
    }

    return category.fields;
  })();

  const analyzeRoom = async (images: Array<{ base64: string; mediaType: string; preview: string }>) => {
    setAnalyzingRoom(true);
    try {
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
      const parsed = JSON.parse(clean);
      setRoomAnalysis(parsed);

      // Pre-fill form from analysis
      const a = parsed.roomAssessment || {};
      const r = parsed.recommendations || {};
      const prefill: Record<string, any> = {};

      // Auto-fill dimensions
      if (a.estimatedDimensions) prefill.dimensions = a.estimatedDimensions;

      // Auto-fill existing equipment
      if (a.existingEquipment?.length) prefill.notes = `Existing equipment: ${a.existingEquipment.join(", ")}`;

      // Auto-select room type based on capacity
      const cap = parseInt(a.estimatedCapacity || "0") || 0;
      if (cap > 0) {
        if (cap <= 5) {
          prefill.room_type = "Huddle Room (2-5)";
        } else if (cap <= 12) {
          prefill.room_type = "Medium Conference Room (6-12)";
        } else if (cap <= 20) {
          prefill.room_type = "Large Conference Room (12+ people)";
        } else {
          prefill.room_type = "Training Room / All-Hands";
        }
      }

      // Auto-select display preference
      if (r.displaySize) {
        const disp = r.displaySize.toLowerCase();
        if (disp.includes("dual")) {
          prefill.display_pref = "Dual displays";
        } else if (disp.includes("video wall") || disp.includes("led")) {
          prefill.display_pref = "LED video wall";
        } else {
          prefill.display_pref = "Single large display";
        }
      }

      // Auto-select audio needs based on recommendation
      const audioNeeds: string[] = [];
      if (r.microphoneType) {
        const micType = r.microphoneType.toLowerCase();
        if (micType.includes("ceiling")) {
          audioNeeds.push("Ceiling microphones");
          audioNeeds.push("Separate speakers");
        } else if (micType.includes("table")) {
          audioNeeds.push("Table microphones");
        } else if (micType.includes("soundbar")) {
          audioNeeds.push("Soundbar");
        }
      }
      if (audioNeeds.length > 0) {
        prefill.audio_needs = audioNeeds;
      }

      // Auto-select camera needs based on room size
      const cameraNeeds: string[] = [];
      if (cap > 8) {
        cameraNeeds.push("Auto-framing / speaker tracking");
        cameraNeeds.push("Panoramic view");
      } else if (cap > 4) {
        cameraNeeds.push("Auto-framing / speaker tracking");
      } else {
        cameraNeeds.push("Basic fixed camera is fine");
      }
      if (cameraNeeds.length > 0) {
        prefill.camera_needs = cameraNeeds;
      }

      setFormData(f => ({ ...f, ...prefill }));
    } catch (err) {
      console.error("Room analysis error:", err);
      setApiError("Failed to analyze room. Please check your API key and try again.");
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

  const handleCategorySelect = (catId: string) => {
    if (!handleInteraction()) return;
    setSelectedCategory(catId);
    setCurrentStep(0);
    setFormData({});
    setShowResult(false);
    setCurrentDesignId(null); // Clear design ID when starting new design
    setCurrentSessionId(null); // Clear session ID as well
    setChatMessages([]); // Clear chat messages for new design
    // Clear image data when switching categories
    setRoomImages([]);
    setRoomAnalysis(null);

    // For custom solution, go directly to configure view (will show custom chat UI)
    if (catId === 'custom') {
      setShowUploadChoice(false);
      setView('configure');
    }
    // For collaboration, show upload choice first
    else if (catId === 'collaboration') {
      setShowUploadChoice(true);
      setView('configure');
    } else {
      setShowUploadChoice(false);
      setView('configure');
    }
  };

  const handleStartWithoutPhotos = () => {
    setShowUploadChoice(false);
  };

  const handleContinueAfterUpload = () => {
    setShowUploadChoice(false);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    if (!handleInteraction()) return;
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = async () => {
    if (!handleInteraction()) return;
    // For categories with conditional fields (UCaaS, Networking, Data Center, Security, BCDR), always advance to next step if we're on the first field (selector)
    const isFirstFieldSelector = currentStep === 0 && (category?.id === 'ucaas' || category?.id === 'networking' || category?.id === 'datacenter' || category?.id === 'security' || category?.id === 'bcdr');

    if (category && (currentStep < activeFields.length - 1 || isFirstFieldSelector)) {
      setCurrentStep(prev => prev + 1);
      if (contentRef.current) contentRef.current.scrollTop = 0;
    } else {
      setIsGenerating(true);
      setApiError(null);
      try {
        const payload: any = {
          category: category?.title,
          formData,
        };

        // Include images and room analysis for collaboration category
        if (category?.id === 'collaboration' && roomImages.length > 0) {
          payload.images = roomImages.map(img => ({ base64: img.base64, mediaType: img.mediaType }));
          if (roomAnalysis) {
            payload.roomAnalysis = roomAnalysis;
          }
        }

        const res = await fetch('/api/generate-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate solution');
        // Claude returns content array; parse the JSON text from the first content block
        const text = data.content?.[0]?.text || '';
        const parsed = JSON.parse(text);
        setApiResult(parsed);

        // Auto-save the design
        try {
          if (currentDesignId) {
            // Update existing incomplete design and mark as complete
            const updateRes = await fetch('/api/update-design', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                design_id: currentDesignId,
                design_data: { category: category?.title, formData, selectedTier, currentStep: 0, isComplete: true },
                ai_response: parsed
                // Note: title will be auto-generated by save-design API on first save
              })
            });

            if (updateRes.ok) {
              console.log('Incomplete design completed and saved');
            }
          } else {
            // Create new completed design
            const saveRes = await fetch('/api/save-design', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                design_type: category?.id || 'ai-solution',
                design_data: { category: category?.title, formData, selectedTier, currentStep: 0, isComplete: true },
                ai_response: parsed
              })
            });

            if (saveRes.ok) {
              const saveData = await saveRes.json();
              setCurrentDesignId(saveData.design.id); // Store the design ID for future updates
              console.log('Design saved:', saveData.title);
            }
          }
        } catch (saveErr) {
          console.error('Failed to auto-save design:', saveErr);
          // Don't show error to user, just log it
        }
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

  const handleModificationRequest = async () => {
    if (!modificationRequest.trim() || !apiResult) return;

    const userMessage = modificationRequest.trim();

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setModificationRequest('');
    setIsModifying(true);

    // Add assistant "thinking" message
    setChatMessages(prev => [...prev, { role: 'assistant', content: '...' }]);

    try {
      const res = await fetch('/api/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category?.title,
          formData,
          modificationRequest: userMessage,
          previousResult: apiResult,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to modify solution');
      const text = data.content?.[0]?.text || '';
      const parsed = JSON.parse(text);
      setApiResult(parsed);

      // Auto-save the updated design to database
      try {
        if (currentDesignId) {
          // Update existing design
          const updateRes = await fetch('/api/update-design', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              design_id: currentDesignId,
              design_data: { category: category?.title, formData, selectedTier },
              ai_response: parsed
            })
          });

          if (updateRes.ok) {
            console.log('Design updated successfully');
          }
        } else {
          // Create new design if none exists
          const saveRes = await fetch('/api/save-design', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              design_type: category?.id || 'ai-solution',
              design_data: { category: category?.title, formData, selectedTier },
              ai_response: parsed
            })
          });

          if (saveRes.ok) {
            const saveData = await saveRes.json();
            setCurrentDesignId(saveData.design.id); // Store the design ID for future updates
            console.log('Modified design saved:', saveData.title);
          }
        }
      } catch (saveErr) {
        console.error('Failed to auto-save modified design:', saveErr);
      }

      // Replace "thinking" message with actual response
      setChatMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: 'I\'ve updated your recommendations based on your request. The changes are now reflected in the solution above.'
        };
        return newMessages;
      });
    } catch (err: any) {
      // Replace thinking message with error
      setChatMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: 'Sorry, I encountered an error updating the solution. Please try again.'
        };
        return newMessages;
      });
    } finally {
      setIsModifying(false);
    }
  };

  // Auto-save effect - saves progress automatically when formData changes
  // Fetch saved designs from database
  useEffect(() => {
    const fetchSavedDesigns = async () => {
      try {
        // Build URL with category filter if we're in a specific category
        // Exception: for 'custom' category, show all solutions
        const url = (selectedCategory && selectedCategory !== 'custom')
          ? `/api/get-designs?design_type=${selectedCategory}`
          : '/api/get-designs';

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          let designs = data.designs || [];

          // Filter out non-AI solution designs (assessment and coterm-calc)
          designs = designs.filter((design: any) =>
            design.design_type !== 'assessment' &&
            design.design_type !== 'coterm-calc'
          );

          // Convert database designs to savedSolutions format
          const convertedDesigns = designs.map((design: any) => {
            const designData = design.design_data || {};
            return {
              id: design.id,
              category: design.title,
              categoryId: design.design_type,
              categoryIcon: CATEGORIES.find(c => c.id === design.design_type)?.icon || '💾',
              categoryColor: CATEGORIES.find(c => c.id === design.design_type)?.color || '#64748b',
              result: design.ai_response,
              formData: designData.formData || designData, // Extract formData if it exists, otherwise use whole object
              selectedTier: designData.selectedTier || 1,
              currentStep: designData.currentStep || 0,
              isComplete: designData.isComplete !== false, // Default to true for old designs
              timestamp: design.created_at,
              isFromDatabase: true
            };
          });

          setSavedSolutions(convertedDesigns);
        }
      } catch (error) {
        console.error('Error fetching saved designs:', error);
      }
    };

    fetchSavedDesigns();
  }, [selectedCategory, refreshSolutions]); // Re-fetch when category changes or refresh triggered

  useEffect(() => {
    // Don't auto-save if no category selected or formData is empty
    if (!selectedCategory || Object.keys(formData).length === 0) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounce auto-save by 1 second
    autoSaveTimeoutRef.current = setTimeout(async () => {
      const category = CATEGORIES.find(c => c.id === selectedCategory);
      if (!category) return;

      // Save to database (works for both incomplete and completed wizards)
      try {
        if (currentDesignId) {
          // Update existing design
          const updateRes = await fetch('/api/update-design', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              design_id: currentDesignId,
              design_data: { category: category.title, formData, selectedTier, currentStep, isComplete: !!apiResult },
              ai_response: apiResult
            })
          });

          if (updateRes.ok) {
            console.log('Design auto-saved to database (step:', currentStep, ')');
          }
        } else {
          // Create new design in database for incomplete wizard
          const saveRes = await fetch('/api/save-design', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              design_type: category.id || 'ai-solution',
              design_data: { category: category.title, formData, selectedTier, currentStep, isComplete: !!apiResult },
              ai_response: apiResult,
              title: `${category.title} (In Progress)`
            })
          });

          if (saveRes.ok) {
            const saveData = await saveRes.json();
            setCurrentDesignId(saveData.design.id); // Store the design ID for future updates
            console.log('Incomplete design saved to database:', saveData.title);
          }
        }
      } catch (err) {
        console.error('Failed to auto-save to database:', err);
      }

      if (currentSessionId) {
        // Update existing session
        setSavedSolutions(prev =>
          prev.map(solution =>
            solution.id === currentSessionId
              ? { ...solution, formData, result: apiResult, timestamp: new Date().toISOString() }
              : solution
          )
        );
      } else {
        // Create new auto-save session
        const newSessionId = `auto-${Date.now()}`;
        const newSolution = {
          id: newSessionId,
          category: `${category.title} (Auto-saved)`,
          categoryId: category.id,
          categoryIcon: category.icon,
          categoryColor: category.color,
          result: apiResult,
          formData,
          timestamp: new Date().toISOString(),
        };
        setSavedSolutions(prev => [newSolution, ...prev]);
        setCurrentSessionId(newSessionId);
      }
    }, 1000); // 1 second debounce

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, selectedCategory, apiResult, currentSessionId, currentDesignId, selectedTier, currentStep]);

  const handleGeneralChat = async () => {
    if (!modificationRequest.trim() || isSendingChat) return;

    const userMessage = modificationRequest.trim();

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setModificationRequest('');
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/chat-solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          messages: chatMessages
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await res.json();

      // Add assistant response to chat
      const newChatMessages = [...chatMessages, { role: 'user', content: userMessage }, { role: 'assistant', content: data.message }];
      setChatMessages(newChatMessages);

      // For custom solutions, store the latest AI response
      // but don't show result view yet - keep chat centered
      if (selectedCategory === 'custom') {
        // Always update/store the latest response
        setApiResult({
          title: chatMessages.length === 0
            ? userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : '')
            : apiResult?.title || 'Custom Solution',
          summary: data.message,
          conversation: newChatMessages
        });

        // Only update result view if already showing
        if (showResult) {
          // This handles modifications after solution is complete
        }
      }

      // Auto-save custom solution to database for logged-in users
      if (selectedCategory === 'custom' && category) {
        try {
          // Create a title from the first user message (truncate if too long)
          const title = chatMessages.length === 0
            ? userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : '')
            : chatMessages[0].content.substring(0, 100);

          const solutionData = {
            title,
            conversation: newChatMessages,
            timestamp: new Date().toISOString()
          };

          if (currentDesignId) {
            // Update existing design
            await fetch('/api/update-design', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                design_id: currentDesignId,
                design_data: {
                  category: category.title,
                  conversation: newChatMessages,
                  isComplete: true
                },
                ai_response: solutionData
              })
            });
          } else {
            // Create new design
            const saveRes = await fetch('/api/save-design', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                design_type: 'custom',
                design_data: {
                  category: category.title,
                  conversation: newChatMessages,
                  isComplete: true
                },
                ai_response: solutionData
              })
            });

            if (saveRes.ok) {
              const saveData = await saveRes.json();
              setCurrentDesignId(saveData.design.id);
              console.log('Custom solution saved:', saveData.title);

              // Reload saved solutions to show the new one
              setRefreshSolutions(prev => prev + 1);
            }
          }
        } catch (saveErr) {
          console.error('Failed to auto-save custom solution:', saveErr);
          // Don't show error to user, just log it
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleSaveSolution = () => {
    if (!apiResult || !category) return;
    const newSolution = {
      id: Date.now(),
      category: category.title,
      categoryId: category.id,
      categoryIcon: category.icon,
      categoryColor: category.color,
      result: apiResult,
      formData,
      timestamp: new Date().toISOString(),
    };
    setSavedSolutions(prev => [newSolution, ...prev]);
    // Clear current session since we manually saved
    setCurrentSessionId(null);
  };

  const handleLoadSolution = (solution: any) => {
    setSelectedCategory(solution.categoryId);
    setFormData(solution.formData);
    setApiResult(solution.result);

    // Check if this is an incomplete wizard
    const isIncomplete = solution.isComplete === false || (!solution.result && solution.formData && Object.keys(solution.formData).length > 0);

    if (isIncomplete) {
      // Restore wizard state for incomplete design
      setShowResult(false);
      setCurrentStep(solution.currentStep || 0);
      console.log('Loading incomplete wizard at step:', solution.currentStep || 0);
    } else {
      // Show results for completed design
      setShowResult(true);
      setCurrentStep(0); // Reset to beginning
    }

    if (solution.selectedTier !== undefined) {
      setSelectedTier(solution.selectedTier);
    }
    setCurrentSessionId(solution.id); // Set as current session

    // If this is a database-saved design, set currentDesignId for auto-save
    if (solution.isFromDatabase) {
      setCurrentDesignId(solution.id);
    } else {
      setCurrentDesignId(null);
    }

    setView('configure'); // Switch to configure view to show the wizard or results
  };

  const handleDeleteSolution = async (id: number | string) => {
    // Check if this is a database-saved design
    const solution = savedSolutions.find(s => s.id === id);
    if (solution?.isFromDatabase) {
      try {
        const response = await fetch('/api/get-designs', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ design_id: id })
        });

        if (!response.ok) {
          alert('Failed to delete design');
          return;
        }
      } catch (error) {
        console.error('Error deleting design:', error);
        alert('Failed to delete design');
        return;
      }
    }

    // Remove from local state
    setSavedSolutions(prev => prev.filter(s => s.id !== id));
    // If deleting current session, clear session ID
    if (id === currentSessionId) {
      setCurrentSessionId(null);
    }
  };

  const startRenameDesign = (solution: any) => {
    setEditingDesignId(solution.id);
    setEditingDesignTitle(solution.category);
  };

  const cancelRenameDesign = () => {
    setEditingDesignId(null);
    setEditingDesignTitle('');
  };

  const saveRenameDesign = async (designId: string) => {
    if (!editingDesignTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    const solution = savedSolutions.find(s => s.id === designId);

    // Only rename database-saved designs
    if (solution?.isFromDatabase) {
      try {
        const response = await fetch('/api/get-designs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ design_id: designId, title: editingDesignTitle.trim() })
        });

        if (!response.ok) {
          alert('Failed to rename design');
          return;
        }
      } catch (error) {
        console.error('Error renaming design:', error);
        alert('Failed to rename design');
        return;
      }
    }

    // Update local state
    setSavedSolutions(prev => prev.map(s =>
      s.id === designId ? { ...s, category: editingDesignTitle.trim() } : s
    ));

    setEditingDesignId(null);
    setEditingDesignTitle('');
  };

  const handleResizeLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(200, Math.min(500, startWidth + delta));
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeRight = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startX - e.clientX;
      const newWidth = Math.max(300, Math.min(600, startWidth + delta));
      setRightWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const currentField = activeFields[currentStep];
  // Only show "Generate Solution" if we're on the last step AND there are actual questions (not just the initial selector)
  const isLastStep = category && currentStep === activeFields.length - 1 && activeFields.length > 1;

  // For non-logged-in users, allow viewing but block interactions
  // For logged-in users without access, show paywall immediately
  const shouldBlockImmediately = !isLoading && !isNotLoggedIn && (!hasAccess || isDesignLimitReached);

  if (shouldBlockImmediately) {
    return (
      <>
        <SiteHeader />
        <PaywallModal
          isOpen={true}
          builderName="AI Solutions Architect"
          requiredTier="professional"
          reason={isDesignLimitReached ? 'design_limit' : 'trial_expired'}
          designsCreated={designsCreated}
          designLimit={designLimit}
        />
      </>
    );
  }

  // Handler to check access before interactions
  const handleInteraction = () => {
    if (isNotLoggedIn) {
      setShowPaywall(true);
      return false;
    }
    return true;
  };

  // HOME VIEW
  if (view === 'home') {
    return (
      <>
      <div className="bg-slate-50 dark:bg-slate-950" style={{ height: "calc(100vh - 52px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <SiteHeader />

        <div className="dark:bg-[#0c0f18] bg-slate-100 dark:text-slate-200 text-slate-900" style={{
          flex: 1,
          fontFamily: "'Outfit', sans-serif",
          display: "flex",
          overflow: "hidden",
        }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
            @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
            @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            .cat-card:hover { transform: translateY(-4px) !important; border-color: var(--accent) !important; box-shadow: 0 8px 40px var(--glow) !important; }
            .cat-card:hover .cat-arrow { transform: translateX(4px); opacity: 1; }
          `}</style>

          {/* Mobile Menu Buttons */}
          {isMobile && (
            <div style={{
              position: 'fixed',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '12px',
              zIndex: 100,
              padding: '12px',
              background: 'rgba(10, 13, 20, 0.95)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <button
                onClick={() => {
                  setIsMobileLeftPanelOpen(!isMobileLeftPanelOpen);
                  setIsMobileRightPanelOpen(false);
                }}
                style={{
                  padding: '10px 16px',
                  background: isMobileLeftPanelOpen ? 'linear-gradient(to right, rgb(16,185,129), rgb(5,150,105))' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s',
                }}
              >
                💾 Saved
              </button>
              <button
                onClick={() => {
                  setIsMobileRightPanelOpen(!isMobileRightPanelOpen);
                  setIsMobileLeftPanelOpen(false);
                }}
                style={{
                  padding: '10px 16px',
                  background: isMobileRightPanelOpen ? 'linear-gradient(to right, rgb(59,130,246), rgb(37,99,235))' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s',
                }}
              >
                💬 AI Chat
              </button>
            </div>
          )}

          {/* Left Panel - Navigation Menu */}
          <aside className="dark:bg-[#0a0d14] bg-white" style={{
            width: isMobile ? '0px' : `${leftWidth}px`,
            borderRight: isMobile ? 'none' : "1px solid rgba(255,255,255,0.06)",
            display: isMobile ? 'none' : 'flex',
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}>
            <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <h3 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                TrueITCost
              </h3>
            </div>
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              <NavMenu />
            </div>
          </aside>

          {/* Resize Handle - Left */}
          {!isMobile && (
          <div
            onMouseDown={handleResizeLeft}
            style={{
              width: "4px",
              cursor: "col-resize",
              background: "transparent",
              position: "relative",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          />
          )}

          {/* Main Content */}
          <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: isMobile ? "16px" : "20px", position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: isMobile ? "20px" : "40px", paddingBottom: isMobile ? "100px" : "20px" }}>
            {/* Ambient background */}
            {!isMobile && (
              <>
                <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-300px", left: "-200px", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
              </>
            )}

            <div style={{ width: "100%", maxWidth: "800px", position: "relative", zIndex: 1, margin: "0 auto" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: "32px", animation: "slideUp 0.8s ease" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 12px", borderRadius: "20px", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", marginBottom: "16px", fontSize: "12px", color: "#38bdf8" }}>
                <SparkIcon /> AI-Powered Solutions Architecture
              </div>
              <h1 className="dark:text-white text-slate-900" style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "12px" }}>
                Design your IT solution<br />
                <span style={{ background: "linear-gradient(135deg, #0ea5e9, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in minutes, not weeks</span>
              </h1>
              <p className="dark:text-slate-500 text-slate-600" style={{ fontSize: "15px", maxWidth: "520px", margin: "0 auto", lineHeight: 1.5 }}>
                Tell us what you need. Our AI architect will design a complete, vendor-neutral solution with real pricing — no sales calls required.
              </p>
            </div>

            {/* Category Grid */}
            <div>
              <h2 className="dark:text-slate-600 text-slate-500" style={{ fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", fontFamily: "'DM Mono', monospace", animation: "slideUp 0.8s ease 0.1s both", textAlign: "center" }}>Choose your project type</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", maxWidth: "700px", margin: "0 auto" }}>
                {CATEGORIES.map((cat, i) => (
                  <div
                    key={cat.id}
                    className="cat-card dark:bg-white/5 bg-white dark:border-white/10 border-slate-200"
                    onClick={() => handleCategorySelect(cat.id)}
                    style={{
                      // @ts-ignore
                      "--accent": cat.color,
                      "--glow": cat.color + "20",
                      padding: "24px",
                      borderRadius: "12px",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      animation: `slideUp 0.6s ease ${0.1 + i * 0.05}s both`
                    }}
                  >
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "12px",
                      background: `${cat.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "28px", flexShrink: 0
                    }}>
                      {cat.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>{cat.title}</h3>
                        <span className="cat-arrow dark:text-slate-600 text-slate-400" style={{ opacity: 0, transition: "all 0.3s" }}>
                          <ArrowRight />
                        </span>
                      </div>
                      <p className="dark:text-slate-500 text-slate-600" style={{ fontSize: "14px", lineHeight: 1.5 }}>{cat.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </main>

          {/* Resize Handle - Right */}
          {!isMobile && (
          <div
            onMouseDown={handleResizeRight}
            style={{
              width: "4px",
              cursor: "col-resize",
              background: "transparent",
              position: "relative",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          />
          )}

          {/* Right Panel - Chat */}
          <aside className="dark:bg-[#0a0d14] bg-white" style={{
            width: isMobile ? '0px' : `${rightWidth}px`,
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: isMobile ? 'none' : 'flex',
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}>
            <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <h3 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "14px", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💬</span>
                Ask AI Architect
              </h3>
            </div>
            <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {chatMessages.length === 0 ? (
                <p className="dark:text-slate-400 text-slate-600" style={{ fontSize: "13px", marginBottom: "16px", lineHeight: 1.5 }}>
                  Ask any questions about your IT infrastructure needs, or start by selecting a project type above.
                </p>
              ) : (
                <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={msg.role === 'user' ? 'dark:bg-blue-500/10 bg-blue-50 dark:border-blue-500/30 border-blue-200' : 'dark:bg-purple-500/10 bg-purple-50 dark:border-purple-500/30 border-purple-200'}
                      style={{
                        marginBottom: "12px",
                        padding: "12px",
                        borderRadius: "8px",
                        borderWidth: "1px",
                        borderStyle: "solid"
                      }}
                    >
                      <div className={msg.role === 'user' ? 'dark:text-blue-400 text-blue-600' : 'dark:text-purple-400 text-purple-600'} style={{ fontSize: "11px", marginBottom: "4px", fontWeight: "600" }}>
                        {msg.role === 'user' ? 'You' : 'AI Architect'}
                      </div>
                      <div className="dark:text-slate-200 text-slate-900" style={{ fontSize: "13px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isSendingChat && (
                    <div className="dark:text-slate-400 text-slate-600" style={{ padding: "12px", textAlign: "center", fontSize: "13px" }}>
                      Thinking...
                    </div>
                  )}
                </div>
              )}
              <div style={{ marginTop: "auto" }}>
                <textarea
                  value={modificationRequest}
                  onChange={(e) => setModificationRequest(e.target.value)}
                  placeholder="e.g., I need a complete UCaaS solution for 50 users with Microsoft Teams integration, or What's the best firewall for a small office?"
                  className="dark:bg-black/30 bg-slate-100 dark:border-white/10 border-slate-300 dark:text-slate-200 text-slate-900 dark:placeholder-slate-500 placeholder-slate-400"
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    borderRadius: "8px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    marginBottom: "12px",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleGeneralChat();
                    }
                  }}
                />
                <button
                  onClick={handleGeneralChat}
                  disabled={!modificationRequest.trim() || isSendingChat}
                  className={!modificationRequest.trim() || isSendingChat ? 'dark:bg-white/10 bg-slate-200 dark:text-slate-500 text-slate-400' : ''}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: modificationRequest.trim() && !isSendingChat ? "linear-gradient(135deg, #0ea5e9, #8b5cf6)" : undefined,
                    color: modificationRequest.trim() && !isSendingChat ? "#fff" : undefined,
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: modificationRequest.trim() && !isSendingChat ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  {isSendingChat ? 'Sending...' : 'Ask AI Architect'}
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Left Panel Overlay - Saved Solutions */}
          {isMobile && isMobileLeftPanelOpen && (
            <>
              <div
                onClick={() => setIsMobileLeftPanelOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  zIndex: 200,
                  backdropFilter: 'blur(4px)',
                }}
              />
              <aside style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '85%',
                maxWidth: '350px',
                background: '#0a0d14',
                zIndex: 201,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
                animation: 'slideInLeft 0.3s ease-out',
              }}>
                <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💾 Saved Solutions
                  </h2>
                  <button
                    onClick={() => setIsMobileLeftPanelOpen(false)}
                    style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#e2e8f0',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '20px',
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                  {savedSolutions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: '#475569' }}>
                      <p style={{ fontSize: '14px' }}>No saved solutions yet</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {savedSolutions.map((solution) => (
                        <div
                          key={solution.id}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onClick={() => {
                            handleLoadSolution(solution.id);
                            setIsMobileLeftPanelOpen(false);
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                                {solution.title}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {new Date(solution.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSolution(solution.id);
                              }}
                              style={{
                                padding: '6px',
                                background: 'transparent',
                                color: '#ef4444',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                display: 'flex',
                                transition: 'background 0.2s',
                                fontSize: '16px',
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </>
          )}

          {/* Mobile Right Panel Overlay - AI Chat */}
          {isMobile && isMobileRightPanelOpen && (
            <>
              <div
                onClick={() => setIsMobileRightPanelOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  zIndex: 200,
                  backdropFilter: 'blur(4px)',
                }}
              />
              <aside style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '85%',
                maxWidth: '350px',
                background: '#0a0d14',
                zIndex: 201,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
                animation: 'slideInRight 0.3s ease-out',
              }}>
                <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💬 AI Architect
                  </h2>
                  <button
                    onClick={() => setIsMobileRightPanelOpen(false)}
                    style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#e2e8f0',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '20px',
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ flex: 1, padding: '20px 16px', color: '#94a3b8', fontSize: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                    <p>Select a category to start chatting with the AI Architect</p>
                  </div>
                </div>
              </aside>
            </>
          )}
        </div>
      </div>

      {/* Paywall Modal for non-logged-in users on home view */}
      {showPaywall && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          builderName="AI Solutions Architect"
          requiredTier="professional"
          reason="not_logged_in"
          designsCreated={designsCreated}
          designLimit={designLimit}
        />
      )}
      </>
    );
  }

  // CONFIGURE VIEW - UPLOAD CHOICE (Collaboration only)
  if (view === 'configure' && !showResult && category && showUploadChoice && category.id === 'collaboration') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <SiteHeader />
        <div style={{
          height: "calc(100vh - 52px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}>
          <div style={{ maxWidth: "900px", width: "100%" }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              multiple
              style={{ display: "none" }}
            />

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", animation: "float 3s ease-in-out infinite" }}>
                🎥
              </div>
              <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#e2e8f0", marginBottom: "12px", letterSpacing: "-0.02em" }}>
                Design Your Collaboration Room
              </h1>
              <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.6 }}>
                Upload photos of your room for AI-powered analysis, or start the wizard directly
              </p>
            </div>

            {roomImages.length > 0 && !analyzingRoom && roomAnalysis ? (
              /* Show analysis results and continue button */
              <div>
                <div style={{ marginBottom: "32px", padding: "24px", borderRadius: "16px", border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                      ✓
                    </div>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#10b981", margin: 0, marginBottom: "4px" }}>
                        Room Analysis Complete
                      </h3>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                        {roomImages.length} photo{roomImages.length > 1 ? 's' : ''} analyzed
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px", marginBottom: "16px" }}>
                    {roomImages.map((img, idx) => (
                      <div key={idx} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", aspectRatio: "4/3" }}>
                        <img src={img.preview} alt={`Room ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", marginBottom: "8px" }}>AI Analysis Summary:</h4>
                    <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                      {roomAnalysis.summary}
                    </p>
                  </div>

                  {roomAnalysis.roomAssessment && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginTop: "16px" }}>
                      {roomAnalysis.roomAssessment.estimatedDimensions && (
                        <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Dimensions</div>
                          <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 600 }}>{roomAnalysis.roomAssessment.estimatedDimensions}</div>
                        </div>
                      )}
                      {roomAnalysis.roomAssessment.estimatedCapacity && (
                        <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Capacity</div>
                          <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 600 }}>{roomAnalysis.roomAssessment.estimatedCapacity} people</div>
                        </div>
                      )}
                      {roomAnalysis.roomAssessment.ceilingType && (
                        <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Ceiling</div>
                          <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 600 }}>{roomAnalysis.roomAssessment.ceilingType}</div>
                        </div>
                      )}
                      {roomAnalysis.roomAssessment.floorType && (
                        <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Floor</div>
                          <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 600 }}>{roomAnalysis.roomAssessment.floorType}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => {
                      setRoomImages([]);
                      setRoomAnalysis(null);
                    }}
                    style={{
                      padding: "16px 24px",
                      borderRadius: "12px",
                      border: "2px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.02)",
                      color: "#94a3b8",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    }}
                  >
                    ← Upload Different Photos
                  </button>
                  <button
                    onClick={handleContinueAfterUpload}
                    style={{
                      flex: 1,
                      padding: "16px 32px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                      color: "#fff",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: "0 4px 20px rgba(14,165,233,0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 30px rgba(14,165,233,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(14,165,233,0.3)";
                    }}
                  >
                    Continue to Wizard →
                  </button>
                </div>
                <p style={{ textAlign: "center", fontSize: "12px", color: "#64748b", marginTop: "16px" }}>
                  Some fields will be pre-filled based on the AI analysis. You can review and adjust them.
                </p>
              </div>
            ) : analyzingRoom ? (
              /* Show analyzing state */
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ width: "64px", height: "64px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#0ea5e9", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 24px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#e2e8f0", marginBottom: "8px" }}>
                  Analyzing Your Room...
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b" }}>
                  The AI is examining {roomImages.length} photo{roomImages.length > 1 ? 's' : ''} to understand your space
                </p>
              </div>
            ) : (
              /* Show upload or start options */
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Upload Photos Option */}
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    padding: "40px 32px",
                    borderRadius: "16px",
                    border: "2px solid rgba(14,165,233,0.2)",
                    background: "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(6,182,212,0.05))",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0ea5e9";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(14,165,233,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "20px" }}>📸</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#e2e8f0", marginBottom: "12px" }}>
                    Upload Room Photos
                  </h3>
                  <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.6, marginBottom: "16px" }}>
                    Let AI analyze your room to auto-detect dimensions, ceiling type, windows, and surfaces
                  </p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#0ea5e9" }}>
                    Recommended
                    <span style={{ fontSize: "16px" }}>→</span>
                  </div>
                </div>

                {/* Start Without Photos Option */}
                <div
                  onClick={handleStartWithoutPhotos}
                  style={{
                    padding: "40px 32px",
                    borderRadius: "16px",
                    border: "2px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "20px" }}>📝</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#e2e8f0", marginBottom: "12px" }}>
                    Start Without Photos
                  </h3>
                  <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.6, marginBottom: "16px" }}>
                    Answer questions manually about your room setup and requirements
                  </p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>
                    Quick start
                    <span style={{ fontSize: "16px" }}>→</span>
                  </div>
                </div>
              </div>
            )}

            {/* Back button */}
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <button
                onClick={() => {
                  setView('home');
                  setSelectedCategory(null);
                  setShowUploadChoice(false);
                  setRoomImages([]);
                  setRoomAnalysis(null);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#94a3b8"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
              >
                ← Back to Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CONFIGURE VIEW
  if (view === 'configure' && !showResult && category) {
    // Special chat interface for custom solutions with left sidebar
    if (category.id === 'custom') {
      return (
        <div className="bg-slate-50 dark:bg-slate-950" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <SiteHeader />

          <div className="dark:bg-[#0c0f18] bg-slate-100" style={{ flex: 1, display: "flex", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
            {/* Left Panel - Navigation Menu */}
            <aside className="dark:bg-[#0a0d14] bg-white" style={{
              width: `${leftWidth}px`,
              borderRight: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}>
              <div className="dark:border-white/[0.06] border-slate-200" style={{ padding: "20px 16px", borderBottom: "1px solid", flexShrink: 0 }}>
                <h3 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                  TrueITCost
                </h3>
              </div>
              <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                <NavMenu />
              </div>
            </aside>

            {/* Resize Handle - Left */}
            {!isMobile && (
            <div
              onMouseDown={handleResizeLeft}
              style={{
                width: "4px",
                cursor: "col-resize",
                background: "transparent",
                position: "relative",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            />
            )}

            {/* Main Content - Chat Area */}
            <div className="dark:text-slate-200 text-slate-900" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ marginBottom: "20px" }}>
                <h2 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "24px", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
                  <span>✨</span>
                  Custom AI Solution Builder
                </h2>
                <p className="dark:text-slate-500 text-slate-600" style={{ fontSize: "14px", marginTop: "8px" }}>
                  Describe your IT project needs and get a custom solution generated by AI
                </p>
              </div>

              {/* Chat Area */}
              <div className="dark:bg-[#0a0d14] bg-white dark:border-white/[0.06] border-slate-200" style={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: "12px", border: "1px solid", overflow: "hidden" }}>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                  {chatMessages.length === 0 && !isSendingChat ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: "16px" }}>
                      <div style={{ fontSize: "48px" }}>💬</div>
                      <p className="dark:text-slate-500 text-slate-600" style={{ fontSize: "16px", textAlign: "center", maxWidth: "500px", lineHeight: 1.6 }}>
                        Start by describing your IT project. For example:<br/>
                        "I need to set up a modern conference room for 15 people"<br/>
                        "Help me design a backup and disaster recovery solution"<br/>
                        "I want to migrate 50 users to the cloud"
                      </p>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={msg.role === 'user' ? 'dark:bg-blue-500/10 bg-blue-50 dark:border-blue-500/30 border-blue-200' : 'dark:bg-purple-500/10 bg-purple-50 dark:border-purple-500/30 border-purple-200'}
                          style={{
                            marginBottom: "16px",
                            padding: "16px",
                            borderRadius: "12px",
                            border: "1px solid",
                          }}
                        >
                          <div className="dark:text-slate-400 text-slate-600" style={{ fontSize: "12px", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase" }}>
                            {msg.role === 'user' ? 'You' : 'AI Architect'}
                          </div>
                          <div className="dark:text-slate-200 text-slate-900" style={{ fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                            {msg.content}
                          </div>
                        </div>
                      ))}

                      {/* Thinking indicator */}
                      {isSendingChat && (
                        <div
                          className="dark:bg-purple-500/10 bg-purple-50 dark:border-purple-500/30 border-purple-200"
                          style={{
                            marginBottom: "16px",
                            padding: "16px",
                            borderRadius: "12px",
                            border: "1px solid",
                          }}
                        >
                          <div className="dark:text-slate-400 text-slate-600" style={{ fontSize: "12px", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase" }}>
                            AI Architect
                          </div>
                          <div className="dark:text-slate-400 text-slate-600" style={{ fontSize: "14px", lineHeight: 1.6, display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "currentColor", animation: "pulse 1.4s ease-in-out infinite" }} />
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "currentColor", animation: "pulse 1.4s ease-in-out 0.2s infinite" }} />
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "currentColor", animation: "pulse 1.4s ease-in-out 0.4s infinite" }} />
                            </div>
                            <span>Thinking...</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Input Area */}
                <div className="dark:border-white/[0.06] border-slate-200" style={{ borderTop: "1px solid", padding: "20px" }}>
                  {/* Show "View Solution" button if there's at least one AI response */}
                  {chatMessages.length > 0 && chatMessages.some(m => m.role === 'assistant') && (
                    <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => setShowResult(true)}
                        style={{
                          padding: "12px 32px",
                          borderRadius: "8px",
                          border: "none",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>✓</span>
                        View Solution
                      </button>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "12px" }}>
                    <textarea
                      value={modificationRequest}
                      onChange={(e) => setModificationRequest(e.target.value)}
                      placeholder="Describe your IT project or ask a question..."
                      className="dark:bg-white/5 bg-white dark:border-white/10 border-slate-300 dark:text-slate-200 text-slate-900 dark:placeholder:text-slate-500 placeholder:text-slate-500"
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "1px solid",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        resize: "none",
                        minHeight: "80px",
                        outline: "none",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleGeneralChat();
                        }
                      }}
                    />
                    <button
                      onClick={handleGeneralChat}
                      disabled={!modificationRequest.trim() || isSendingChat}
                      style={{
                        padding: "12px 24px",
                        borderRadius: "8px",
                        border: "none",
                        background: isSendingChat ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: isSendingChat ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        alignSelf: "flex-end",
                      }}
                    >
                      {isSendingChat ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-50 dark:bg-slate-950" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <SiteHeader />

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

        <div style={{ flex: 1, display: "flex", background: "#0c0f18", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
          {/* Left Panel - Saved Solutions */}
          <aside style={{
            width: `${leftWidth}px`,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            background: "#0a0d14",
            overflow: "hidden",
          }}>
            <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <button onClick={() => { setView('home'); setSelectedCategory(null); }} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", marginBottom: "12px", width: "100%" }}>← Back to Categories</button>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", margin: 0, display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                <span>💾</span>
                Saved Solutions
              </h3>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px", minHeight: 0 }}>
              {savedSolutions.length === 0 ? (
                <div style={{ padding: "24px 12px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                  No saved solutions yet.<br/>Complete a wizard to save a solution.
                </div>
              ) : (
                savedSolutions.map(solution => (
                  <div
                    key={solution.id}
                    style={{
                      padding: "12px",
                      marginBottom: "8px",
                      borderRadius: "8px",
                      border: `1px solid ${solution.categoryColor}30`,
                      background: `${solution.categoryColor}08`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${solution.categoryColor}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${solution.categoryColor}08`;
                    }}
                  >
                    {/* Status Badge */}
                    {(solution.isComplete === false || (!solution.result && solution.formData && Object.keys(solution.formData).length > 0)) && (
                      <div style={{ marginBottom: "6px" }}>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "rgba(251,191,36,0.15)",
                          color: "#fbbf24",
                          fontSize: "9px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}>
                          In Progress
                        </span>
                      </div>
                    )}
                    {(solution.isComplete !== false && solution.result) && (
                      <div style={{ marginBottom: "6px" }}>
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "rgba(34,197,94,0.15)",
                          color: "#22c55e",
                          fontSize: "9px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}>
                          Complete
                        </span>
                      </div>
                    )}
                    {/* Title Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "16px" }}>{solution.categoryIcon}</span>
                      {editingDesignId === solution.id ? (
                        <>
                          <input
                            type="text"
                            value={editingDesignTitle}
                            onChange={(e) => setEditingDesignTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRenameDesign(solution.id);
                              if (e.key === 'Escape') cancelRenameDesign();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              flex: 1,
                              padding: "4px 6px",
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#e2e8f0",
                              background: "rgba(255,255,255,0.05)",
                              border: `1px solid ${solution.categoryColor}`,
                              borderRadius: "4px",
                              outline: "none",
                              fontFamily: "inherit",
                            }}
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveRenameDesign(solution.id);
                            }}
                            style={{
                              padding: "4px 6px",
                              borderRadius: "4px",
                              border: "none",
                              background: `${solution.categoryColor}20`,
                              color: solution.categoryColor,
                              fontSize: "11px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelRenameDesign();
                            }}
                            style={{
                              padding: "4px 6px",
                              borderRadius: "4px",
                              border: "none",
                              background: "rgba(148,163,184,0.1)",
                              color: "#94a3b8",
                              fontSize: "11px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", flex: 1 }}>{solution.category}</span>
                          {solution.isFromDatabase && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startRenameDesign(solution);
                              }}
                              style={{
                                padding: "4px 6px",
                                borderRadius: "4px",
                                border: "none",
                                background: "rgba(148,163,184,0.1)",
                                color: "#94a3b8",
                                fontSize: "11px",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                opacity: 0.6,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = "1";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = "0.6";
                              }}
                            >
                              ✎
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSolution(solution.id);
                            }}
                            style={{
                              padding: "4px 6px",
                              borderRadius: "4px",
                              border: "none",
                              background: "rgba(239,68,68,0.1)",
                              color: "#f87171",
                              fontSize: "11px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
                      {new Date(solution.timestamp).toLocaleDateString()} {new Date(solution.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button
                      onClick={() => handleLoadSolution(solution)}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${solution.categoryColor}40`,
                        background: `${solution.categoryColor}10`,
                        color: solution.categoryColor,
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Load Solution
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Resize Handle - Left */}
          <div
            onMouseDown={handleResizeLeft}
            style={{
              width: "4px",
              cursor: "col-resize",
              background: "transparent",
              position: "relative",
            }}
          />

          {/* Main Content - Wizard */}
          <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "40px 20px", position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            {/* Ambient background */}
            <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: `radial-gradient(circle, ${category?.color}10 0%, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ width: "100%", maxWidth: "700px", position: "relative", zIndex: 1 }}>
              {isGenerating ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: "24px", animation: "fadeIn 0.5s ease" }}>
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "50%",
                    border: `3px solid ${category?.color}20`,
                    borderTopColor: category?.color,
                    animation: "spin 1s linear infinite"
                  }} />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "18px", fontWeight: "500", marginBottom: "8px", color: "#e2e8f0" }}>Designing your solution...</p>
                    <p style={{ fontSize: "14px", color: "#64748b", animation: "pulse 2s ease infinite" }}>Analyzing requirements, comparing vendors, calculating costs</p>
                  </div>
                </div>
              ) : (
                <div ref={contentRef}>
              <ProgressBar current={currentStep + 1} total={activeFields.length} color={category?.color} />

              <div key={currentStep} style={{ animation: "slideUp 0.4s ease" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  {currentField?.label}
                </h2>
                <p style={{ fontSize: "13px", color: "#475569", marginBottom: "28px" }}>
                  Step {currentStep + 1} of {activeFields.length}
                  {category?.id === 'collaboration' && roomAnalysis && formData[currentField?.id || ''] && (
                    <span style={{ marginLeft: "8px", fontSize: "10px", padding: "2px 8px", borderRadius: "12px", background: "rgba(16,185,129,0.12)", color: "#10b981", fontWeight: 600 }}>
                      📷 Pre-filled
                    </span>
                  )}
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
                </div>
              )}
            </div>
          </main>

          {/* Resize Handle - Right */}
          <div
            onMouseDown={handleResizeRight}
            style={{
              width: "4px",
              cursor: "col-resize",
              background: "transparent",
              position: "relative",
            }}
          />

          {/* Right Panel - AI Chat */}
          <aside style={{
            width: `${rightWidth}px`,
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            background: "#0a0d14",
            overflow: "hidden",
          }}>
            <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <h3 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "14px", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💬</span>
                Ask AI Architect
              </h3>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px", lineHeight: 1.5 }}>
                Ask questions about {category?.title.toLowerCase()} or get help with your configuration.
              </p>
              <textarea
                value={modificationRequest}
                onChange={(e) => setModificationRequest(e.target.value)}
                placeholder={`e.g., What's the difference between ${category?.id === 'ucaas' ? 'UCaaS and CCaaS' : 'these options'}?`}
                style={{
                  width: "100%",
                  minHeight: "200px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0,0,0,0.3)",
                  color: "#e2e8f0",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  marginBottom: "12px",
                }}
              />
              <button
                onClick={() => {
                  alert("AI chat functionality coming soon!");
                }}
                disabled={!modificationRequest.trim()}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: modificationRequest.trim() ? `linear-gradient(135deg, ${category?.color}, ${category?.color}cc)` : "rgba(255,255,255,0.1)",
                  color: modificationRequest.trim() ? "#fff" : "#64748b",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: modificationRequest.trim() ? "pointer" : "default",
                  transition: "all 0.2s",
                  fontFamily: "inherit"
                }}
              >
                Send Question
              </button>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 0", fontSize: "11px", color: "#64748b", textAlign: "center", background: "#0c0f18" }}>
          Powered by{' '}
          <a
            href="https://www.techsolutions.cc"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#94a3b8", textDecoration: "underline", textUnderlineOffset: "2px", transition: "color 0.2s", cursor: "pointer" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#e2e8f0"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
          >
            InterPeak Technology Solutions
          </a>
        </footer>
      </div>
    );
  }

  // RESULT VIEW
  if (view === 'configure' && showResult && category) {
    // Special result view for custom solutions
    if (category.id === 'custom') {
      return (
        <div className="bg-slate-50 dark:bg-slate-950" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <SiteHeader />

          <div className="dark:bg-[#0c0f18] bg-slate-100" style={{ flex: 1, display: "flex", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
            {/* Left Panel - Saved Solutions */}
            <aside className="dark:bg-[#0a0d14] bg-white" style={{
              width: `${leftWidth}px`,
              borderRight: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}>
              <div className="dark:border-white/[0.06] border-slate-200" style={{ padding: "20px 16px", borderBottom: "1px solid", flexShrink: 0 }}>
                <button
                  onClick={() => { setView('home'); setSelectedCategory(null); setShowResult(false); setApiResult(null); setChatMessages([]); }}
                  className="dark:border-white/10 border-slate-300 dark:text-slate-400 text-slate-600 dark:hover:bg-white/5 hover:bg-slate-100"
                  style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid", background: "transparent", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", marginBottom: "12px", width: "100%" }}
                >
                  ← Back to Categories
                </button>
                <h3 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "14px", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                  <span>💾</span>
                  Saved Solutions
                </h3>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px", minHeight: 0 }}>
                {savedSolutions.length === 0 ? (
                  <div className="dark:text-slate-500 text-slate-600" style={{ padding: "24px 12px", textAlign: "center", fontSize: "13px" }}>
                    No saved solutions yet.<br/>Complete a wizard to save a solution.
                  </div>
                ) : (
                  savedSolutions.map(solution => (
                    <div
                      key={solution.id}
                      style={{
                        padding: "12px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        border: `1px solid ${solution.categoryColor}30`,
                        background: `${solution.categoryColor}08`,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${solution.categoryColor}15`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${solution.categoryColor}08`;
                      }}
                      onClick={() => loadSavedSolution(solution)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "16px" }}>{solution.categoryIcon}</span>
                        <div style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: solution.categoryColor }}>
                          {solution.category}
                        </div>
                      </div>
                      <div className="dark:text-slate-500 text-slate-600" style={{ fontSize: "11px", marginBottom: "6px" }}>
                        {solution.timestamp ? new Date(solution.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No date'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>

            {/* Resize Handle - Left */}
            {!isMobile && (
            <div
              onMouseDown={handleResizeLeft}
              style={{
                width: "4px",
                cursor: "col-resize",
                background: "transparent",
                position: "relative",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            />
            )}

            {/* Main Content - Solution Display */}
            <div className="dark:text-slate-200 text-slate-900" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px", overflow: "auto" }}>
              {/* Header */}
              <div style={{ marginBottom: "24px" }}>
                <h1 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "28px", fontWeight: 700, margin: 0, marginBottom: "8px" }}>
                  {apiResult?.title || 'Custom Solution'}
                </h1>
                <p className="dark:text-slate-500 text-slate-600" style={{ fontSize: "14px", margin: 0 }}>
                  AI-generated solution for your IT project
                </p>
              </div>

              {/* Solution Content */}
              <div className="dark:bg-[#0a0d14] bg-white dark:border-white/[0.06] border-slate-200" style={{ padding: "24px", borderRadius: "12px", border: "1px solid", marginBottom: "20px" }}>
                <div className="dark:text-slate-300 text-slate-700" style={{ fontSize: "15px", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {apiResult?.summary || ''}
                </div>
              </div>
            </div>

            {/* Resize Handle - Right */}
            {!isMobile && (
            <div
              onMouseDown={handleResizeRight}
              style={{
                width: "4px",
                cursor: "col-resize",
                background: "transparent",
                position: "relative",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            />
            )}

            {/* Right Panel - Chat for modifications */}
            <aside className="dark:bg-[#0a0d14] bg-white" style={{
              width: isMobile ? '0px' : `${rightWidth}px`,
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              display: isMobile ? 'none' : 'flex',
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}>
              <div className="dark:border-white/[0.06] border-slate-200" style={{ padding: "20px 16px", borderBottom: "1px solid", flexShrink: 0 }}>
                <h3 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "14px", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>💬</span>
                  Modify Solution
                </h3>
              </div>
              <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <p className="dark:text-slate-400 text-slate-600" style={{ fontSize: "13px", marginBottom: "16px", lineHeight: 1.5 }}>
                  Ask questions or request modifications to your solution.
                </p>

                {/* Chat messages */}
                <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
                  {chatMessages.slice(1).map((msg, idx) => (
                    <div
                      key={idx}
                      className={msg.role === 'user' ? 'dark:bg-blue-500/10 bg-blue-50 dark:border-blue-500/30 border-blue-200' : 'dark:bg-purple-500/10 bg-purple-50 dark:border-purple-500/30 border-purple-200'}
                      style={{
                        marginBottom: "12px",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid",
                      }}
                    >
                      <div className="dark:text-slate-400 text-slate-600" style={{ fontSize: "11px", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase" }}>
                        {msg.role === 'user' ? 'You' : 'AI'}
                      </div>
                      <div className="dark:text-slate-300 text-slate-800" style={{ fontSize: "13px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {/* Thinking indicator */}
                  {isSendingChat && (
                    <div
                      className="dark:bg-purple-500/10 bg-purple-50 dark:border-purple-500/30 border-purple-200"
                      style={{
                        marginBottom: "12px",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid",
                      }}
                    >
                      <div className="dark:text-slate-400 text-slate-600" style={{ fontSize: "11px", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase" }}>
                        AI
                      </div>
                      <div className="dark:text-slate-400 text-slate-600" style={{ fontSize: "13px", lineHeight: 1.5, display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", animation: "pulse 1.4s ease-in-out infinite" }} />
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", animation: "pulse 1.4s ease-in-out 0.2s infinite" }} />
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", animation: "pulse 1.4s ease-in-out 0.4s infinite" }} />
                        </div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div>
                  <textarea
                    value={modificationRequest}
                    onChange={(e) => setModificationRequest(e.target.value)}
                    placeholder="Ask a question or request changes..."
                    className="dark:bg-white/5 bg-white dark:border-white/10 border-slate-300 dark:text-slate-200 text-slate-900 dark:placeholder:text-slate-500 placeholder:text-slate-500"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      resize: "none",
                      minHeight: "80px",
                      outline: "none",
                      marginBottom: "8px",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGeneralChat();
                      }
                    }}
                  />
                  <button
                    onClick={handleGeneralChat}
                    disabled={!modificationRequest.trim() || isSendingChat}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: isSendingChat ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: isSendingChat ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {isSendingChat ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      );
    }

    const rec = apiResult;
    return (
      <div className="bg-slate-50 dark:bg-slate-950" style={{ height: "calc(100vh - 52px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <SiteHeader />

        <div style={{
          flex: 1,
          background: "#0c0f18",
          color: "#e2e8f0",
          fontFamily: "'Outfit', sans-serif",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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

          <header style={{ padding: "20px 40px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => { setView('home'); setSelectedCategory(null); }} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>← Back</button>
              <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: "20px" }}>{category?.icon}</span>
              <span style={{ fontSize: "15px", fontWeight: 500 }}>{category?.title}</span>
            </div>
          </header>

          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Left Panel - Saved Solutions */}
            <aside style={{
              width: `${leftWidth}px`,
              borderRight: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              background: "#0a0d14",
              height: "100%",
              overflow: "hidden",
            }}>
              <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>💾</span>
                  Saved Solutions
                </h3>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px", minHeight: 0 }}>
                {savedSolutions.length === 0 ? (
                  <div style={{ padding: "24px 12px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                    No saved solutions yet.<br/>Click Save to store a solution.
                  </div>
                ) : (
                  savedSolutions.map(solution => (
                    <div
                      key={solution.id}
                      style={{
                        padding: "12px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        border: `1px solid ${solution.categoryColor}30`,
                        background: `${solution.categoryColor}08`,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${solution.categoryColor}15`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${solution.categoryColor}08`;
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "16px" }}>{solution.categoryIcon}</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", flex: 1 }}>{solution.category}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSolution(solution.id);
                          }}
                          style={{
                            padding: "4px 6px",
                            borderRadius: "4px",
                            border: "none",
                            background: "rgba(239,68,68,0.1)",
                            color: "#f87171",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
                        {new Date(solution.timestamp).toLocaleDateString()} {new Date(solution.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <button
                        onClick={() => handleLoadSolution(solution)}
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: `1px solid ${solution.categoryColor}40`,
                          background: `${solution.categoryColor}10`,
                          color: solution.categoryColor,
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Load Solution
                      </button>
                    </div>
                  ))
                )}
              </div>
            </aside>

            {/* Resize Handle - Left */}
            <div
              onMouseDown={handleResizeLeft}
              style={{
                width: "4px",
                cursor: "col-resize",
                background: "transparent",
                position: "relative",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            />

            {/* Main Content */}
            <main style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "48px 40px", paddingBottom: "100px" }}>

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

                {/* TIERED VIEW (UCaaS & Network Infrastructure) */}
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
                          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px", fontFamily: "'DM Mono', monospace" }}>{section.heading}</h3>
                          {section.items?.map((item: any, ii: number) => (
                            <div key={ii} style={{ padding: "18px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", marginBottom: "8px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                                <div>
                                  <div style={{ fontSize: "17px", fontWeight: 700, color: "#e2e8f0" }}>{item.name}</div>
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
                        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "14px", fontFamily: "'DM Mono', monospace" }}>Cost Summary</h3>

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
                        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px", fontFamily: "'DM Mono', monospace" }}>{section.heading}</h3>
                        {section.items?.map((item: any, ii: number) => (
                          <div key={ii} style={{ padding: "18px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", marginBottom: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                              <div>
                                <div style={{ fontSize: "17px", fontWeight: 700, color: "#e2e8f0" }}>{item.name}</div>
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
                        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px", fontFamily: "'DM Mono', monospace" }}>Alternatives to Consider</h3>
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
                    <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px", fontFamily: "'DM Mono', monospace" }}>Questions to Ask Your Vendor</h3>
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
            </div>

            {/* Action Bar */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "16px 0", background: "linear-gradient(to top, #0c0f18 60%, transparent)", zIndex: 40, pointerEvents: "none" }}>
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
                pointerEvents: "auto",
              }}>
                <button
                  className="fab-btn fab-btn-start"
                  onClick={() => { setShowResult(false); setCurrentStep(0); setApiResult(null); setSelectedTier(1); setView('home'); setSelectedCategory(null); }}
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
                >
                  ↺ Start Over
                </button>

                <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)" }} />

                <button
                  onClick={handleSaveSolution}
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

          {/* Resize Handle - Right */}
          <div
            onMouseDown={handleResizeRight}
            style={{
              width: "4px",
              cursor: "col-resize",
              background: "transparent",
              position: "relative",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          />

          {/* Right Panel - Chat Sidebar */}
          <aside style={{
            width: `${rightWidth}px`,
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            background: "#0a0d14",
            height: "100%",
            overflow: "hidden",
          }}>
            <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💬</span>
                AI Chat
              </h3>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
              {/* Chat messages area */}
              <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <p style={{ fontSize: "13px", lineHeight: 1.6, marginBottom: "12px" }}>
                      Ask me to modify the recommendations! Try:
                    </p>
                    <p style={{ fontSize: "12px", lineHeight: 1.6, fontStyle: "italic" }}>
                      • "Use HP servers instead of Dell"<br/>
                      • "Add more storage capacity"<br/>
                      • "Show me a lower-cost option"
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        animation: "slideUp 0.3s ease"
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "85%",
                          padding: "10px 14px",
                          borderRadius: msg.role === 'user' ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: msg.role === 'user'
                            ? `linear-gradient(135deg, ${category?.color || '#0ea5e9'}, ${category?.color || '#0ea5e9'}cc)`
                            : "rgba(255,255,255,0.08)",
                          color: "#e2e8f0",
                          fontSize: "13px",
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.content === '...' ? (
                          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                            <div style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#94a3b8",
                              animation: "pulse 1.4s ease-in-out infinite"
                            }} />
                            <div style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#94a3b8",
                              animation: "pulse 1.4s ease-in-out 0.2s infinite"
                            }} />
                            <div style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#94a3b8",
                              animation: "pulse 1.4s ease-in-out 0.4s infinite"
                            }} />
                          </div>
                        ) : msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input area */}
              <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={modificationRequest}
                    onChange={(e) => setModificationRequest(e.target.value)}
                    placeholder="Ask for changes..."
                    disabled={isModifying}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "20px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(0,0,0,0.3)",
                      color: "#e2e8f0",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleModificationRequest();
                      }
                    }}
                  />
                  <button
                    onClick={handleModificationRequest}
                    disabled={!modificationRequest.trim() || isModifying}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "20px",
                      border: "none",
                      background: modificationRequest.trim() && !isModifying ? `linear-gradient(135deg, ${category?.color}, ${category?.color}cc)` : "rgba(255,255,255,0.1)",
                      color: modificationRequest.trim() && !isModifying ? "#fff" : "#64748b",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: modificationRequest.trim() && !isModifying ? "pointer" : "not-allowed",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isModifying ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
        </div>

        {/* Paywall Modal for non-logged-in users */}
        {showPaywall && (
          <PaywallModal
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            builderName="AI Solutions Architect"
            requiredTier="professional"
            reason="not_logged_in"
            designsCreated={designsCreated}
            designLimit={designLimit}
          />
        )}
      </div>
    );
  }

  return null;
}
