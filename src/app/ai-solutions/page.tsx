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
      { id: "project_type", label: "What type of project?", type: "select", options: ["New office buildout", "Network refresh / upgrade", "Adding Wi-Fi coverage", "Firewall / security upgrade", "SD-WAN deployment", "Guest Wi-Fi / Public Wi-Fi", "Network cabling / structured cabling", "ISP failover / redundancy", "Remote site connectivity", "VPN for remote users", "Network troubleshooting / assessment"] },
    ],
    // New office buildout - needs full assessment
    fieldsNewOffice: [
      { id: "existing_infrastructure", label: "Current network infrastructure at other sites", type: "textarea", placeholder: "Describe existing equipment at other locations: e.g., 'Ubiquiti UDM Pro at main office with 3x UniFi switches' or 'Cisco WLC at datacenter managing 15 APs across 3 sites via P2P VPN' or 'This is our first office'" },
      { id: "office_size", label: "Office square footage", type: "text", placeholder: "e.g. 5000 sq ft" },
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
      { id: "coverage_area", label: "Area needing Wi-Fi coverage", type: "text", placeholder: "e.g. 3000 sq ft warehouse, outdoor courtyard, etc." },
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
      { id: "coverage_area", label: "Coverage area size", type: "text", placeholder: "e.g. 5000 sq ft retail space, 50-room hotel, etc." },
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
      { id: "office_size", label: "Office/facility size", type: "text", placeholder: "e.g. 10,000 sq ft across 2 floors" },
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
  const [modificationRequest, setModificationRequest] = useState<string>('');
  const [isModifying, setIsModifying] = useState<boolean>(false);
  const [showModificationChat, setShowModificationChat] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

    return category.fields;
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
    // For categories with conditional fields (UCaaS, Networking, Data Center), always advance to next step if we're on the first field (selector)
    const isFirstFieldSelector = currentStep === 0 && (category?.id === 'ucaas' || category?.id === 'networking' || category?.id === 'datacenter');

    if (category && (currentStep < activeFields.length - 1 || isFirstFieldSelector)) {
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

  const handleModificationRequest = async () => {
    if (!modificationRequest.trim() || !apiResult) return;

    setIsModifying(true);
    try {
      const res = await fetch('/api/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category?.title,
          formData,
          modificationRequest: modificationRequest.trim(),
          previousResult: apiResult,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to modify solution');
      const text = data.content?.[0]?.text || '';
      const parsed = JSON.parse(text);
      setApiResult(parsed);
      setModificationRequest('');
      setShowModificationChat(false);
    } catch (err: any) {
      alert(err.message || 'Failed to modify solution');
    } finally {
      setIsModifying(false);
    }
  };

  const currentField = activeFields[currentStep];
  // Only show "Generate Solution" if we're on the last step AND there are actual questions (not just the initial selector)
  const isLastStep = category && currentStep === activeFields.length - 1 && activeFields.length > 1;

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

            {/* Modification Chat Bubble */}
            <div style={{ marginBottom: "24px", animation: "slideUp 0.6s ease 0.8s both" }}>
              {!showModificationChat ? (
                <button
                  onClick={() => setShowModificationChat(true)}
                  style={{
                    padding: "14px 20px",
                    borderRadius: "12px",
                    border: `2px solid ${category?.color}40`,
                    background: `${category?.color}10`,
                    color: category?.color,
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    margin: "0 auto",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${category?.color}20`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${category?.color}10`;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span style={{ fontSize: "18px" }}>💬</span>
                  Need Changes? Click to Modify Recommendations
                </button>
              ) : (
                <div style={{
                  padding: "20px",
                  borderRadius: "12px",
                  border: `2px solid ${category?.color}40`,
                  background: `${category?.color}08`,
                  maxWidth: "700px",
                  margin: "0 auto",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "20px" }}>💬</span>
                    <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>Modify Recommendations</h4>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px", lineHeight: 1.5 }}>
                    Ask for changes like "use HP servers instead of Dell", "add more storage", or "show me a lower-cost option"
                  </p>
                  <textarea
                    value={modificationRequest}
                    onChange={(e) => setModificationRequest(e.target.value)}
                    placeholder="e.g., Can you replace Dell with HP servers? or Show me Fortinet instead of Cisco"
                    style={{
                      width: "100%",
                      minHeight: "80px",
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleModificationRequest();
                      }
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => { setShowModificationChat(false); setModificationRequest(''); }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "transparent",
                        color: "#94a3b8",
                        fontSize: "13px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleModificationRequest}
                      disabled={!modificationRequest.trim() || isModifying}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "8px",
                        border: "none",
                        background: modificationRequest.trim() && !isModifying ? `linear-gradient(135deg, ${category?.color}, ${category?.color}cc)` : "rgba(255,255,255,0.1)",
                        color: modificationRequest.trim() && !isModifying ? "#fff" : "#64748b",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: modificationRequest.trim() && !isModifying ? "pointer" : "not-allowed",
                        fontFamily: "inherit",
                      }}
                    >
                      {isModifying ? "Updating..." : "Update Recommendations"}
                    </button>
                  </div>
                </div>
              )}
            </div>

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
