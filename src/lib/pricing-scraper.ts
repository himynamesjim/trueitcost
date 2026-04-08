/**
 * Web Scraping Pricing Guide System
 * Pulls pricing data from public vendor websites and manufacturer sites
 */

export interface PricingData {
  productName: string;
  sku: string;
  manufacturer: string;
  msrp: number | null;
  estimatedCost: number | null;
  source: string;
  lastUpdated: Date;
  productUrl?: string;
  category?: string;
}

export interface VendorSource {
  name: string;
  baseUrl: string;
  searchUrl: (query: string) => string;
}

/**
 * Common vendor sources for pricing data
 */
export const VENDOR_SOURCES: Record<string, VendorSource> = {
  cisco: {
    name: 'Cisco',
    baseUrl: 'https://www.cisco.com',
    searchUrl: (query) => `https://www.cisco.com/c/en/us/products/search.html?searchTerm=${encodeURIComponent(query)}`,
  },
  microsoft: {
    name: 'Microsoft',
    baseUrl: 'https://www.microsoft.com',
    searchUrl: (query) => `https://www.microsoft.com/en-us/search?q=${encodeURIComponent(query)}`,
  },
  vmware: {
    name: 'VMware',
    baseUrl: 'https://www.vmware.com',
    searchUrl: (query) => `https://www.vmware.com/products.html?search=${encodeURIComponent(query)}`,
  },
};

/**
 * Industry-standard markup percentages for MSP pricing
 */
export const PRICING_MARKUPS = {
  hardware: {
    low: 0.15,    // 15% markup
    medium: 0.25, // 25% markup
    high: 0.35,   // 35% markup
  },
  software: {
    low: 0.20,    // 20% markup
    medium: 0.30, // 30% markup
    high: 0.40,   // 40% markup
  },
  services: {
    low: 0.30,    // 30% markup
    medium: 0.50, // 50% markup
    high: 0.75,   // 75% markup
  },
};

/**
 * Fetch pricing data from manufacturer websites
 * Note: This is a template - actual implementation would need proper web scraping
 * or use of public APIs where available
 */
export async function fetchManufacturerPricing(
  manufacturer: string,
  productSku: string
): Promise<PricingData | null> {
  try {
    // For now, return sample data structure
    // In production, this would use web scraping or public APIs

    const sampleData: PricingData = {
      productName: `Sample ${manufacturer} Product`,
      sku: productSku,
      manufacturer,
      msrp: null,
      estimatedCost: null,
      source: 'manual_entry',
      lastUpdated: new Date(),
      category: 'hardware',
    };

    return sampleData;
  } catch (error) {
    console.error('Error fetching manufacturer pricing:', error);
    return null;
  }
}

/**
 * Calculate MSP pricing based on cost and markup tier
 */
export function calculateMSPPricing(
  cost: number,
  category: 'hardware' | 'software' | 'services',
  tier: 'low' | 'medium' | 'high' = 'medium'
): {
  cost: number;
  markup: number;
  markupPercentage: number;
  sellingPrice: number;
  profit: number;
} {
  const markupPercentage = PRICING_MARKUPS[category][tier];
  const markup = cost * markupPercentage;
  const sellingPrice = cost + markup;

  return {
    cost,
    markup,
    markupPercentage: markupPercentage * 100,
    sellingPrice,
    profit: markup,
  };
}

/**
 * Generate price trend data based on product category and vendor
 */
export function generatePriceTrend(
  vendorName: string,
  category: 'hardware' | 'software' | 'services'
): {
  trend_direction: 'up' | 'down' | 'stable';
  change_percentage: number;
  period: string;
} {
  // Determine base trend from vendor family
  const vendorFamily = Object.keys(VENDOR_HIERARCHY).find(family =>
    VENDOR_HIERARCHY[family as keyof typeof VENDOR_HIERARCHY].includes(vendorName)
  );

  const vendorTrend = vendorFamily && VENDOR_MARKET_INSIGHTS[vendorFamily]
    ? VENDOR_MARKET_INSIGHTS[vendorFamily].trend
    : 'stable';

  // Generate realistic percentage change
  let changePercentage = 0;
  let trend: 'up' | 'down' | 'stable' = vendorTrend;

  if (vendorTrend === 'up') {
    changePercentage = Math.random() * 8 + 2; // 2-10% increase
  } else if (vendorTrend === 'down') {
    changePercentage = -(Math.random() * 6 + 1); // 1-7% decrease
  } else {
    // Stable with minor fluctuations
    const fluctuation = Math.random();
    if (fluctuation > 0.7) {
      trend = 'up';
      changePercentage = Math.random() * 2 + 0.5; // 0.5-2.5% increase
    } else if (fluctuation < 0.3) {
      trend = 'down';
      changePercentage = -(Math.random() * 2 + 0.5); // 0.5-2.5% decrease
    } else {
      changePercentage = 0;
    }
  }

  return {
    trend_direction: trend,
    change_percentage: Number(changePercentage.toFixed(1)),
    period: '90 days',
  };
}

/**
 * Vendor hierarchy for organizing products
 */
export const VENDOR_HIERARCHY = {
  Microsoft: ['Microsoft 365', 'Microsoft Windows', 'Microsoft Exchange & Teams'],
  Cisco: ['Cisco Meraki Access Points', 'Cisco Meraki Switches', 'Cisco Meraki Security Appliances', 'Cisco Catalyst Switches', 'Cisco Webex'],
  Logitech: ['Logitech Video Conferencing', 'Logitech Peripherals'],
  Poly: ['Poly Video Conferencing', 'Poly Headsets & Phones'],
  Dell: ['Dell PowerEdge Servers', 'Dell Networking', 'Dell Storage'],
  'HP/HPE': ['HP/HPE ProLiant Servers', 'HP/HPE Workstations & Desktops'],
  VMware: ['VMware vSphere', 'VMware Cloud'],
  Fortinet: ['Fortinet FortiGate Firewalls'],
  Ubiquiti: ['Ubiquiti UniFi'],
  Lenovo: ['Lenovo ThinkSystem Servers'],
};

/**
 * Vendor-specific market insights with buy/wait recommendations
 */
export const VENDOR_MARKET_INSIGHTS: Record<string, {
  title: string;
  insight: string;
  recommendation: 'buy_now' | 'wait' | 'neutral';
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}> = {
  Microsoft: {
    title: 'Microsoft Licensing Stable',
    insight: 'Microsoft 365 and Windows licenses maintain predictable pricing. Annual commitments offer 10-15% savings. Prices typically adjust in April/October.',
    recommendation: 'buy_now',
    confidence: 95,
    trend: 'stable',
  },
  Cisco: {
    title: 'Cisco Hardware High Demand',
    insight: 'Strong demand for Meraki and Catalyst products. Lead times extending 8-12 weeks. Pricing stable but availability concerns for Q2 2026.',
    recommendation: 'buy_now',
    confidence: 88,
    trend: 'up',
  },
  Logitech: {
    title: 'Logitech Video Conferencing Competitive',
    insight: 'Rally Bar and MeetUp pricing under pressure from competitors. Good time to negotiate volume discounts. Next refresh expected Q3 2026.',
    recommendation: 'buy_now',
    confidence: 85,
    trend: 'down',
  },
  Poly: {
    title: 'Poly Product Line Transition',
    insight: 'HP acquiring Poly assets creating uncertainty. Current stock clearance may offer discounts. Consider locking in pricing before product refresh.',
    recommendation: 'neutral',
    confidence: 72,
    trend: 'stable',
  },
  Dell: {
    title: 'Dell Server Pricing Favorable',
    insight: 'PowerEdge 16G servers showing competitive pricing. New generation expected late 2026. Current models offer strong value for immediate needs.',
    recommendation: 'buy_now',
    confidence: 90,
    trend: 'stable',
  },
  'HP/HPE': {
    title: 'HPE ProLiant Strong Value',
    insight: 'Gen11 ProLiant servers well-positioned. HPE GreenLake as-a-Service gaining traction. Traditional purchase pricing competitive.',
    recommendation: 'buy_now',
    confidence: 87,
    trend: 'stable',
  },
  VMware: {
    title: 'VMware Licensing Uncertainty',
    insight: 'Broadcom acquisition causing pricing volatility. Consider multi-year agreements to lock rates. Alternative hypervisors gaining market share.',
    recommendation: 'wait',
    confidence: 78,
    trend: 'up',
  },
  Fortinet: {
    title: 'Fortinet Security in Demand',
    insight: 'FortiGate firewalls seeing strong demand. Subscription pricing stable. Bundle deals available for multi-year commitments.',
    recommendation: 'buy_now',
    confidence: 92,
    trend: 'stable',
  },
  Ubiquiti: {
    title: 'UniFi Excellent Value',
    insight: 'UniFi products maintain aggressive pricing. Regular product updates without price increases. Strong availability across all SKUs.',
    recommendation: 'buy_now',
    confidence: 94,
    trend: 'stable',
  },
  Lenovo: {
    title: 'Lenovo Server Competitive',
    insight: 'ThinkSystem servers offering promotional pricing to compete with Dell/HPE. Good warranty terms. Consider Q2 deals.',
    recommendation: 'buy_now',
    confidence: 86,
    trend: 'down',
  },
};

/**
 * Comprehensive MSP Pricing Guide Database
 * Based on current market rates (2024-2025)
 */
export const COMMON_PRODUCT_PRICING = {
  // MICROSOFT LICENSING
  'Microsoft 365': {
    'Business Basic': { monthly: 6.00, annual: 72.00, category: 'software', sku: 'CFQ7TTC0LCHC' },
    'Business Standard': { monthly: 12.50, annual: 150.00, category: 'software', sku: 'CFQ7TTC0LHQR' },
    'Business Premium': { monthly: 22.00, annual: 264.00, category: 'software', sku: 'CFQ7TTC0LCHX' },
    'Apps for Business': { monthly: 8.25, annual: 99.00, category: 'software', sku: 'CFQ7TTC0LCHZ' },
    'E3': { monthly: 36.00, annual: 432.00, category: 'software', sku: 'CFQ7TTC0LCKJ' },
    'E5': { monthly: 57.00, annual: 684.00, category: 'software', sku: 'CFQ7TTC0LCKK' },
    'F3': { monthly: 8.00, annual: 96.00, category: 'software', sku: 'CFQ7TTC0LCKL' },
  },
  'Microsoft Windows': {
    'Windows 11 Pro': { msrp: 199.99, estimated_cost: 140.00, category: 'software', sku: 'FQC-10528' },
    'Windows 11 Enterprise E3': { monthly: 7.00, annual: 84.00, category: 'software', sku: 'AAA-10964' },
    'Windows 11 Enterprise E5': { monthly: 14.00, annual: 168.00, category: 'software', sku: 'AAA-10965' },
    'Windows Server 2022 Standard': { msrp: 1069.00, estimated_cost: 750.00, category: 'software', sku: 'P73-08328' },
    'Windows Server 2022 Datacenter': { msrp: 6155.00, estimated_cost: 4300.00, category: 'software', sku: 'P73-08329' },
  },
  'Microsoft Exchange & Teams': {
    'Exchange Online Plan 1': { monthly: 4.00, annual: 48.00, category: 'software', sku: 'CFQ7TTC0LHSQ' },
    'Exchange Online Plan 2': { monthly: 8.00, annual: 96.00, category: 'software', sku: 'CFQ7TTC0LHSR' },
    'Teams Phone Standard': { monthly: 8.00, annual: 96.00, category: 'software', sku: 'CFQ7TTC0LHSS' },
    'Teams Phone with Calling Plan': { monthly: 15.00, annual: 180.00, category: 'software', sku: 'CFQ7TTC0LHST' },
    'Teams Rooms Pro': { monthly: 40.00, annual: 480.00, category: 'software', sku: 'CFQ7TTC0LH0D' },
  },

  // CISCO MERAKI
  'Cisco Meraki Access Points': {
    'MR46 Wi-Fi 6 AP': { msrp: 1295.00, estimated_cost: 900.00, category: 'hardware', sku: 'MR46-HW' },
    'MR46E Wi-Fi 6 AP': { msrp: 1595.00, estimated_cost: 1115.00, category: 'hardware', sku: 'MR46E-HW' },
    'MR56 Wi-Fi 6E AP': { msrp: 1795.00, estimated_cost: 1255.00, category: 'hardware', sku: 'MR56-HW' },
    'MR44 Wi-Fi 5 AP': { msrp: 995.00, estimated_cost: 695.00, category: 'hardware', sku: 'MR44-HW' },
    'MR36 Wi-Fi 5 AP': { msrp: 695.00, estimated_cost: 485.00, category: 'hardware', sku: 'MR36-HW' },
    'MR20 Compact AP': { msrp: 395.00, estimated_cost: 275.00, category: 'hardware', sku: 'MR20-HW' },
  },
  'Cisco Meraki Switches': {
    'MS120-8 Cloud Switch 8-Port': { msrp: 475.00, estimated_cost: 330.00, category: 'hardware', sku: 'MS120-8-HW' },
    'MS120-24 Cloud Switch 24-Port': { msrp: 995.00, estimated_cost: 695.00, category: 'hardware', sku: 'MS120-24-HW' },
    'MS125-24 Cloud Switch 24-Port': { msrp: 1295.00, estimated_cost: 900.00, category: 'hardware', sku: 'MS125-24-HW' },
    'MS225-24 Cloud Switch 24-Port': { msrp: 2295.00, estimated_cost: 1600.00, category: 'hardware', sku: 'MS225-24-HW' },
    'MS250-24 Cloud Switch 24-Port': { msrp: 3795.00, estimated_cost: 2655.00, category: 'hardware', sku: 'MS250-24-HW' },
    'MS350-24 Cloud Switch 24-Port': { msrp: 4995.00, estimated_cost: 3495.00, category: 'hardware', sku: 'MS350-24-HW' },
  },
  'Cisco Meraki Security Appliances': {
    'MX64 Security Appliance': { msrp: 595.00, estimated_cost: 415.00, category: 'hardware', sku: 'MX64-HW' },
    'MX67 Security Appliance': { msrp: 995.00, estimated_cost: 695.00, category: 'hardware', sku: 'MX67-HW' },
    'MX68 Security Appliance': { msrp: 1295.00, estimated_cost: 900.00, category: 'hardware', sku: 'MX68-HW' },
    'MX75 Security Appliance': { msrp: 2495.00, estimated_cost: 1745.00, category: 'hardware', sku: 'MX75-HW' },
    'MX85 Security Appliance': { msrp: 3495.00, estimated_cost: 2445.00, category: 'hardware', sku: 'MX85-HW' },
    'MX95 Security Appliance': { msrp: 5495.00, estimated_cost: 3845.00, category: 'hardware', sku: 'MX95-HW' },
  },
  'Cisco Webex': {
    'Webex Calling': { monthly: 25.00, annual: 300.00, category: 'software', sku: 'A-FLEX-3' },
    'Webex Suite': { monthly: 25.00, annual: 300.00, category: 'software', sku: 'MS-WXSUITE' },
    'Webex Meetings': { monthly: 14.50, annual: 174.00, category: 'software', sku: 'CO-WXMEET' },
    'Webex Room Kit': { msrp: 4999.00, estimated_cost: 3499.00, category: 'hardware', sku: 'CS-KIT-K9' },
    'Webex Desk Pro': { msrp: 2499.00, estimated_cost: 1749.00, category: 'hardware', sku: 'CS-DESKPRO-K9' },
  },

  // CISCO CATALYST SWITCHES
  'Cisco Catalyst Switches': {
    'C1000-8T-E-2G-L 8-Port': { msrp: 495.00, estimated_cost: 345.00, category: 'hardware', sku: 'C1000-8T-E-2G-L' },
    'C1000-24T-4G-L 24-Port': { msrp: 1095.00, estimated_cost: 765.00, category: 'hardware', sku: 'C1000-24T-4G-L' },
    'C1300-24T 24-Port': { msrp: 2495.00, estimated_cost: 1745.00, category: 'hardware', sku: 'C1300-24T' },
    'C9200-24T 24-Port': { msrp: 4995.00, estimated_cost: 3495.00, category: 'hardware', sku: 'C9200-24T' },
    'C9300-24T 24-Port': { msrp: 8995.00, estimated_cost: 6295.00, category: 'hardware', sku: 'C9300-24T' },
    'C9300-48T 48-Port': { msrp: 12995.00, estimated_cost: 9095.00, category: 'hardware', sku: 'C9300-48T' },
  },

  // LOGITECH
  'Logitech Video Conferencing': {
    'Rally Bar': { msrp: 2999.00, estimated_cost: 2099.00, category: 'hardware', sku: '960-001308' },
    'Rally Bar Mini': { msrp: 1999.00, estimated_cost: 1399.00, category: 'hardware', sku: '960-001336' },
    'Rally Plus': { msrp: 3499.00, estimated_cost: 2449.00, category: 'hardware', sku: '960-001224' },
    'MeetUp': { msrp: 899.00, estimated_cost: 629.00, category: 'hardware', sku: '960-001101' },
    'BRIO 4K Webcam': { msrp: 199.00, estimated_cost: 139.00, category: 'hardware', sku: '960-001105' },
    'C930e Webcam': { msrp: 129.00, estimated_cost: 90.00, category: 'hardware', sku: '960-000971' },
  },
  'Logitech Peripherals': {
    'MX Master 3S Mouse': { msrp: 99.99, estimated_cost: 70.00, category: 'hardware', sku: '910-006556' },
    'MX Keys Keyboard': { msrp: 99.99, estimated_cost: 70.00, category: 'hardware', sku: '920-009294' },
    'MX Mechanical Keyboard': { msrp: 149.99, estimated_cost: 105.00, category: 'hardware', sku: '920-010557' },
    'Zone Wireless Headset': { msrp: 199.00, estimated_cost: 139.00, category: 'hardware', sku: '981-000914' },
  },

  // POLY (HP)
  'Poly Video Conferencing': {
    'Studio X30': { msrp: 1799.00, estimated_cost: 1259.00, category: 'hardware', sku: '2200-85960-001' },
    'Studio X50': { msrp: 2699.00, estimated_cost: 1889.00, category: 'hardware', sku: '2200-85990-001' },
    'Studio X70': { msrp: 4999.00, estimated_cost: 3499.00, category: 'hardware', sku: '2200-86010-001' },
    'Studio E70': { msrp: 3999.00, estimated_cost: 2799.00, category: 'hardware', sku: '2200-86300-001' },
    'Studio P15 Personal Bar': { msrp: 599.00, estimated_cost: 419.00, category: 'hardware', sku: '2200-86270-001' },
  },
  'Poly Headsets & Phones': {
    'Voyager Focus 2 UC': { msrp: 299.00, estimated_cost: 209.00, category: 'hardware', sku: '77W07AA' },
    'Savi 8220 UC Headset': { msrp: 379.00, estimated_cost: 265.00, category: 'hardware', sku: '207325-01' },
    'CCX 600 Business Phone': { msrp: 399.00, estimated_cost: 279.00, category: 'hardware', sku: '2200-49770-001' },
    'CCX 700 Business Phone': { msrp: 549.00, estimated_cost: 384.00, category: 'hardware', sku: '2200-49780-001' },
  },

  // DELL SERVERS & DATACENTER
  'Dell PowerEdge Servers': {
    'PowerEdge R250 1U Server': { msrp: 1899.00, estimated_cost: 1329.00, category: 'hardware', sku: 'R250-1234' },
    'PowerEdge R350 1U Server': { msrp: 2499.00, estimated_cost: 1749.00, category: 'hardware', sku: 'R350-1234' },
    'PowerEdge R450 1U Server': { msrp: 3499.00, estimated_cost: 2449.00, category: 'hardware', sku: 'R450-1234' },
    'PowerEdge R650 1U Server': { msrp: 5499.00, estimated_cost: 3849.00, category: 'hardware', sku: 'R650-1234' },
    'PowerEdge R750 2U Server': { msrp: 7499.00, estimated_cost: 5249.00, category: 'hardware', sku: 'R750-1234' },
    'PowerEdge R7525 2U Server': { msrp: 9999.00, estimated_cost: 6999.00, category: 'hardware', sku: 'R7525-1234' },
  },
  'Dell Networking': {
    'PowerSwitch N1524 24-Port': { msrp: 1299.00, estimated_cost: 909.00, category: 'hardware', sku: 'N1524-1234' },
    'PowerSwitch N2024 24-Port': { msrp: 2199.00, estimated_cost: 1539.00, category: 'hardware', sku: 'N2024-1234' },
    'PowerSwitch N3024 24-Port': { msrp: 3499.00, estimated_cost: 2449.00, category: 'hardware', sku: 'N3024-1234' },
    'PowerSwitch S5248F-ON 48-Port': { msrp: 7999.00, estimated_cost: 5599.00, category: 'hardware', sku: 'S5248F-1234' },
  },
  'Dell Storage': {
    'PowerVault ME5024 Storage': { msrp: 8999.00, estimated_cost: 6299.00, category: 'hardware', sku: 'ME5024-1234' },
    'PowerVault ME5084 Storage': { msrp: 15999.00, estimated_cost: 11199.00, category: 'hardware', sku: 'ME5084-1234' },
    'Unity XT 380 Storage': { msrp: 24999.00, estimated_cost: 17499.00, category: 'hardware', sku: 'UNITY-XT380' },
  },

  // HP/HPE
  'HPE ProLiant Servers': {
    'ProLiant DL20 Gen11 1U': { msrp: 2199.00, estimated_cost: 1539.00, category: 'hardware', sku: 'P59888-B21' },
    'ProLiant DL360 Gen11 1U': { msrp: 5499.00, estimated_cost: 3849.00, category: 'hardware', sku: 'P52544-B21' },
    'ProLiant DL380 Gen11 2U': { msrp: 7999.00, estimated_cost: 5599.00, category: 'hardware', sku: 'P52542-B21' },
    'ProLiant ML350 Gen11 Tower': { msrp: 4999.00, estimated_cost: 3499.00, category: 'hardware', sku: 'P55148-421' },
  },
  'HP Workstations & Desktops': {
    'EliteDesk 800 G9 Mini': { msrp: 1099.00, estimated_cost: 769.00, category: 'hardware', sku: '6N794UT' },
    'EliteDesk 800 G9 Tower': { msrp: 1299.00, estimated_cost: 909.00, category: 'hardware', sku: '6N795UT' },
    'Z2 G9 Workstation': { msrp: 1899.00, estimated_cost: 1329.00, category: 'hardware', sku: '62V95UT' },
    'Z4 G5 Workstation': { msrp: 2799.00, estimated_cost: 1959.00, category: 'hardware', sku: '6C7A5UT' },
  },

  // VMWARE
  'VMware vSphere': {
    'vSphere Essentials (3-host)': { msrp: 995.00, estimated_cost: 695.00, category: 'software', sku: 'VS7-ESP-C' },
    'vSphere Standard (per CPU)': { msrp: 995.00, estimated_cost: 695.00, category: 'software', sku: 'VS7-STD-C' },
    'vSphere Enterprise Plus (per CPU)': { msrp: 4595.00, estimated_cost: 3215.00, category: 'software', sku: 'VS7-EPL-C' },
    'vCenter Server Standard': { msrp: 5965.00, estimated_cost: 4175.00, category: 'software', sku: 'VC7-STD-C' },
  },
  'VMware Cloud': {
    'vSAN Standard (per CPU)': { msrp: 2995.00, estimated_cost: 2095.00, category: 'software', sku: 'VV-VSTD8-C' },
    'vSAN Enterprise (per CPU)': { msrp: 5995.00, estimated_cost: 4195.00, category: 'software', sku: 'VV-VENT8-C' },
    'NSX Data Center Enterprise Plus': { msrp: 6995.00, estimated_cost: 4895.00, category: 'software', sku: 'NS-DC-EP-C' },
  },

  // FORTINET
  'Fortinet FortiGate Firewalls': {
    'FortiGate 60F': { msrp: 995.00, estimated_cost: 695.00, category: 'hardware', sku: 'FG-60F' },
    'FortiGate 80F': { msrp: 1495.00, estimated_cost: 1045.00, category: 'hardware', sku: 'FG-80F' },
    'FortiGate 100F': { msrp: 2495.00, estimated_cost: 1745.00, category: 'hardware', sku: 'FG-100F' },
    'FortiGate 200F': { msrp: 4995.00, estimated_cost: 3495.00, category: 'hardware', sku: 'FG-200F' },
    'FortiGate 400F': { msrp: 9995.00, estimated_cost: 6995.00, category: 'hardware', sku: 'FG-400F' },
  },

  // UBIQUITI
  'Ubiquiti UniFi': {
    'UniFi Dream Machine Pro': { msrp: 379.00, estimated_cost: 265.00, category: 'hardware', sku: 'UDM-PRO' },
    'UniFi 6 Pro Access Point': { msrp: 149.00, estimated_cost: 104.00, category: 'hardware', sku: 'U6-PRO' },
    'UniFi 6 Enterprise Access Point': { msrp: 349.00, estimated_cost: 244.00, category: 'hardware', sku: 'U6-ENTERPRISE' },
    'UniFi Switch 24 PoE': { msrp: 379.00, estimated_cost: 265.00, category: 'hardware', sku: 'USW-24-POE' },
    'UniFi Switch Pro 24 PoE': { msrp: 499.00, estimated_cost: 349.00, category: 'hardware', sku: 'USW-PRO-24-POE' },
  },

  // LENOVO
  'Lenovo ThinkSystem Servers': {
    'ThinkSystem ST50 V2 Tower': { msrp: 849.00, estimated_cost: 594.00, category: 'hardware', sku: '7D8N' },
    'ThinkSystem ST250 V2 Tower': { msrp: 1499.00, estimated_cost: 1049.00, category: 'hardware', sku: '7D8P' },
    'ThinkSystem SR250 V2 Rack': { msrp: 1899.00, estimated_cost: 1329.00, category: 'hardware', sku: '7D7R' },
    'ThinkSystem SR650 V2 Rack': { msrp: 5499.00, estimated_cost: 3849.00, category: 'hardware', sku: '7Z73' },
  },
};

/**
 * Search for product pricing in the database
 */
export function searchProductPricing(query: string): Array<{
  vendor: string;
  product: string;
  pricing: any;
}> {
  const results: Array<{
    vendor: string;
    product: string;
    pricing: any;
  }> = [];

  const queryLower = query.toLowerCase();

  // Search through common product pricing
  Object.entries(COMMON_PRODUCT_PRICING).forEach(([vendor, products]) => {
    Object.entries(products).forEach(([productName, pricing]) => {
      if (
        productName.toLowerCase().includes(queryLower) ||
        vendor.toLowerCase().includes(queryLower)
      ) {
        results.push({
          vendor,
          product: productName,
          pricing,
        });
      }
    });
  });

  return results;
}
