import { create } from 'zustand';
import type { 
  WizardStep, 
  WizardAnswers, 
  CalculatorType, 
  CalculatorResult, 
  LeadInfo,
  RiskFlag 
} from '@/types';

// ===========================================
// INITIAL STATE
// ===========================================

const initialWizardAnswers: WizardAnswers = {
  // Section 1: Business Basics
  employeeCount: null,
  industry: null,
  annualRevenue: null,

  // Section 2: Current IT Support
  itManagement: null,
  itStaffCount: null,
  monthlyITSpend: null,
  itSatisfaction: null,

  // Section 3: Infrastructure
  infrastructureLocation: null,
  hasPhysicalServers: null,
  oldestHardwareAge: null,
  hardwareConcerns: null,

  // Section 4: Backup & Recovery
  backupSolution: null,
  backupRetention: null,
  testedRestoreRecently: null,
  hasDisasterRecoveryPlan: null,

  // Section 5: Security Posture
  hasEndpointProtection: null,
  hasEmailSecurity: null,
  requiresMFA: null,
  lastSecurityAssessment: null,

  // Section 6: Downtime Sensitivity
  downtimeImpact: null,
  downtimeTolerance: null,

  // Section 7: Decision Drivers
  decisionDrivers: [],
  timeline: null,
};

const WIZARD_STEPS: WizardStep[] = [
  'business-basics',
  'it-support',
  'infrastructure',
  'backup-recovery',
  'security',
  'downtime',
  'decision-drivers',
];

// ===========================================
// STORE INTERFACE
// ===========================================

interface AssessmentStore {
  // Wizard State
  currentStep: WizardStep;
  wizardAnswers: WizardAnswers;
  wizardComplete: boolean;
  
  // Calculator State
  selectedCalculators: CalculatorType[];
  calculatorResults: CalculatorResult[];
  
  // Risk Flags (generated from wizard answers)
  riskFlags: RiskFlag[];
  
  // Lead Capture
  leadInfo: LeadInfo | null;
  leadCaptured: boolean;
  
  // Results
  showResults: boolean;
  
  // Wizard Actions
  setCurrentStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateWizardAnswers: (answers: Partial<WizardAnswers>) => void;
  completeWizard: () => void;
  
  // Calculator Actions
  setSelectedCalculators: (calculators: CalculatorType[]) => void;
  addCalculatorResult: (result: CalculatorResult) => void;
  updateCalculatorResult: (type: CalculatorType, result: Partial<CalculatorResult>) => void;
  
  // Lead Actions
  setLeadInfo: (info: LeadInfo) => void;
  
  // Results Actions
  setShowResults: (show: boolean) => void;
  
  // Risk Flag Actions
  generateRiskFlags: () => void;
  
  // Computed Values
  getOverallRiskScore: () => number;
  getTotalProjectedCost: () => number;
  getRecommendedCalculators: () => CalculatorType[];
  
  // Reset
  reset: () => void;
}

// ===========================================
// STORE IMPLEMENTATION
// ===========================================

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  // Initial State
  currentStep: 'business-basics',
  wizardAnswers: initialWizardAnswers,
  wizardComplete: false,
  selectedCalculators: [],
  calculatorResults: [],
  riskFlags: [],
  leadInfo: null,
  leadCaptured: false,
  showResults: false,

  // Wizard Actions
  setCurrentStep: (step) => set({ currentStep: step }),
  
  nextStep: () => {
    const { currentStep } = get();
    const currentIndex = WIZARD_STEPS.indexOf(currentStep);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      set({ currentStep: WIZARD_STEPS[currentIndex + 1] });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    const currentIndex = WIZARD_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      set({ currentStep: WIZARD_STEPS[currentIndex - 1] });
    }
  },
  
  updateWizardAnswers: (answers) => {
    set((state) => ({
      wizardAnswers: { ...state.wizardAnswers, ...answers },
    }));
  },
  
  completeWizard: () => {
    const store = get();
    store.generateRiskFlags();
    const recommended = store.getRecommendedCalculators();
    set({ 
      wizardComplete: true,
      selectedCalculators: recommended,
    });
  },

  // Calculator Actions
  setSelectedCalculators: (calculators) => set({ selectedCalculators: calculators }),
  
  addCalculatorResult: (result) => {
    set((state) => ({
      calculatorResults: [...state.calculatorResults, result],
    }));
  },
  
  updateCalculatorResult: (type, result) => {
    set((state) => ({
      calculatorResults: state.calculatorResults.map((r) =>
        r.type === type ? { ...r, ...result } : r
      ),
    }));
  },

  // Lead Actions
  setLeadInfo: (info) => set({ leadInfo: info, leadCaptured: true }),
  
  // Results Actions
  setShowResults: (show) => set({ showResults: show }),

  // Risk Flag Generation (Based on TrueITCost Flag Reference Guide)
  generateRiskFlags: () => {
    const { wizardAnswers } = get();
    const flags: RiskFlag[] = [];

    // ========================================
    // IT MANAGEMENT FLAGS
    // ========================================
    if (wizardAnswers.itManagement === 'None') {
      flags.push({
        severity: 'critical',
        category: 'IT Management',
        message: 'No Formal IT Management - No proactive monitoring, maintenance, or planning',
        source: 'itManagement',
      });
    } else if (wizardAnswers.itManagement === 'Break-fix') {
      flags.push({
        severity: 'high',
        category: 'IT Management',
        message: 'Reactive IT Support Only - Only addresses problems after they occur',
        source: 'itManagement',
      });
    }

    if (wizardAnswers.itSatisfaction === 'No') {
      flags.push({
        severity: 'medium',
        category: 'IT Management',
        message: 'IT Support Dissatisfaction - Indicates problems with current IT',
        source: 'itSatisfaction',
      });
    }

    // ========================================
    // HARDWARE & INFRASTRUCTURE FLAGS
    // ========================================
    if (wizardAnswers.oldestHardwareAge === '7+ yrs') {
      flags.push({
        severity: 'critical',
        category: 'Hardware',
        message: 'Critical Hardware Age - Well past lifespan, high failure risk',
        source: 'oldestHardwareAge',
      });
    } else if (wizardAnswers.oldestHardwareAge === '5-7 yrs') {
      flags.push({
        severity: 'high',
        category: 'Hardware',
        message: 'Aging Hardware - Approaching end of life, warranties expired',
        source: 'oldestHardwareAge',
      });
    } else if (wizardAnswers.oldestHardwareAge === '3-5 yrs') {
      flags.push({
        severity: 'medium',
        category: 'Hardware',
        message: 'Mid-lifecycle Hardware - Still adequate, plan for replacement',
        source: 'oldestHardwareAge',
      });
    } else if (wizardAnswers.oldestHardwareAge === 'Not sure') {
      flags.push({
        severity: 'high',
        category: 'Hardware',
        message: 'Unknown Hardware Age - Lack of asset inventory',
        source: 'oldestHardwareAge',
      });
    }

    if (wizardAnswers.hardwareConcerns === true) {
      flags.push({
        severity: 'medium',
        category: 'Hardware',
        message: 'Hardware Concerns Identified - Known issues need attention',
        source: 'hardwareConcerns',
      });
    }

    if (wizardAnswers.infrastructureLocation === 'Not sure') {
      flags.push({
        severity: 'high',
        category: 'Infrastructure',
        message: 'Infrastructure Location Unknown - Governance/security risk',
        source: 'infrastructureLocation',
      });
    }

    // ========================================
    // BACKUP & RECOVERY FLAGS
    // ========================================
    if (wizardAnswers.backupSolution === 'No') {
      flags.push({
        severity: 'critical',
        category: 'Backup',
        message: 'No Backup Solution - Catastrophic data loss risk',
        source: 'backupSolution',
      });
    } else if (wizardAnswers.backupSolution === 'Not sure') {
      flags.push({
        severity: 'critical',
        category: 'Backup',
        message: 'Backup Status Unknown - Same as no backup',
        source: 'backupSolution',
      });
    } else if (wizardAnswers.backupSolution === 'Yes-self') {
      flags.push({
        severity: 'medium',
        category: 'Backup',
        message: 'Self-Managed Backup - Works if monitored, often fails silently',
        source: 'backupSolution',
      });
    }

    if (wizardAnswers.backupRetention === 'Under 30 days') {
      flags.push({
        severity: 'medium',
        category: 'Backup',
        message: 'Short Backup Retention - May not meet compliance',
        source: 'backupRetention',
      });
    }

    if (wizardAnswers.testedRestore === 'false') {
      flags.push({
        severity: 'critical',
        category: 'Backup',
        message: 'Backups Never Tested - Cannot trust unverified backups',
        source: 'testedRestore',
      });
    }

    if (wizardAnswers.hasDisasterRecoveryPlan === false) {
      flags.push({
        severity: 'high',
        category: 'Business Continuity',
        message: 'No Disaster Recovery Plan - Confusion during crisis extends downtime',
        source: 'hasDisasterRecoveryPlan',
      });
    }

    // ========================================
    // SECURITY FLAGS
    // ========================================
    if (wizardAnswers.hasEndpointProtection === 'No') {
      flags.push({
        severity: 'critical',
        category: 'Security',
        message: 'No Endpoint Protection - Vulnerable to malware/ransomware',
        source: 'hasEndpointProtection',
      });
    } else if (wizardAnswers.hasEndpointProtection === 'Partial') {
      flags.push({
        severity: 'high',
        category: 'Security',
        message: 'Incomplete Endpoint Protection - Unprotected devices are entry points',
        source: 'hasEndpointProtection',
      });
    }

    if (wizardAnswers.hasEmailSecurity === 'false' || wizardAnswers.hasEmailSecurity === 'no') {
      flags.push({
        severity: 'high',
        category: 'Security',
        message: 'No Email Security Filtering - #1 attack vector unprotected',
        source: 'hasEmailSecurity',
      });
    }

    if (wizardAnswers.requiresMFA === 'false' || wizardAnswers.requiresMFA === 'no') {
      flags.push({
        severity: 'critical',
        category: 'Security',
        message: 'No Multi-Factor Authentication - Single password = full access',
        source: 'requiresMFA',
      });
    }

    if (wizardAnswers.lastSecurityAssessment === 'Never') {
      flags.push({
        severity: 'high',
        category: 'Security',
        message: 'No Security Assessment Conducted - Unknown vulnerabilities',
        source: 'lastSecurityAssessment',
      });
    } else if (wizardAnswers.lastSecurityAssessment === '1-2 yrs') {
      flags.push({
        severity: 'medium',
        category: 'Security',
        message: 'Security Assessment Outdated - New vulnerabilities may exist',
        source: 'lastSecurityAssessment',
      });
    }

    // ========================================
    // COMPOUND RISK FLAGS
    // ========================================
    // High Downtime Exposure
    const hasBackupRisk = wizardAnswers.backupSolution === 'No' || wizardAnswers.backupSolution === 'Not sure' || wizardAnswers.testedRestore === 'false';
    const hasHardwareRisk = wizardAnswers.oldestHardwareAge === '7+ yrs' || wizardAnswers.oldestHardwareAge === '5-7 yrs';
    const hasITRisk = wizardAnswers.itManagement === 'None' || wizardAnswers.itManagement === 'Break-fix';

    if (
      wizardAnswers.downtimeImpact === 'Business stops' &&
      wizardAnswers.downtimeTolerance === 'Zero' &&
      (hasBackupRisk || hasHardwareRisk || hasITRisk)
    ) {
      flags.push({
        severity: 'critical',
        category: 'Business Continuity',
        message: 'High Downtime Exposure - Zero tolerance but multiple risk factors present',
        source: 'compound',
      });
    }

    // ========================================
    // INDUSTRY-SPECIFIC COMPLIANCE FLAGS
    // ========================================
    // Healthcare (HIPAA)
    if (wizardAnswers.industry === 'Healthcare') {
      const hasComplianceRisk =
        wizardAnswers.hasEndpointProtection !== 'Yes' ||
        wizardAnswers.requiresMFA === 'false' || wizardAnswers.requiresMFA === 'no' ||
        wizardAnswers.backupSolution === 'No' || wizardAnswers.backupSolution === 'Not sure';

      if (hasComplianceRisk) {
        flags.push({
          severity: 'critical',
          category: 'Compliance',
          message: 'HIPAA Compliance Risk - Healthcare requires full EDR, MFA, and backups',
          source: 'industry',
        });
      }
    }

    // Legal / Finance
    if (wizardAnswers.industry === 'Legal' || wizardAnswers.industry === 'Finance') {
      const hasConfidentialityRisk =
        wizardAnswers.hasEndpointProtection !== 'Yes' ||
        wizardAnswers.requiresMFA === 'false' || wizardAnswers.requiresMFA === 'no' ||
        wizardAnswers.hasEmailSecurity === 'false' || wizardAnswers.hasEmailSecurity === 'no';

      if (hasConfidentialityRisk) {
        flags.push({
          severity: 'high',
          category: 'Compliance',
          message: 'Client Confidentiality Risk - Legal/Finance requires full EDR, MFA, and email security',
          source: 'industry',
        });
      }
    }

    set({ riskFlags: flags });
  },

  // Computed Values
  getOverallRiskScore: () => {
    const { riskFlags } = get();
    if (riskFlags.length === 0) return 0;
    
    const severityScores = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 2,
    };
    
    const totalScore = riskFlags.reduce(
      (sum, flag) => sum + severityScores[flag.severity],
      0
    );
    
    // Normalize to 1-10 scale, capped at 10
    return Math.min(10, Math.round(totalScore / riskFlags.length));
  },
  
  getTotalProjectedCost: () => {
    const { calculatorResults } = get();
    return calculatorResults.reduce((sum, result) => sum + result.totalCost, 0);
  },
  
  getRecommendedCalculators: () => {
    const { wizardAnswers } = get();
    const recommended: CalculatorType[] = [];

    // Always include downtime impact as a baseline
    recommended.push('downtime-impact');

    // Hardware Lifecycle
    if (
      wizardAnswers.oldestHardwareAge === '5-7' ||
      wizardAnswers.oldestHardwareAge === '7-plus' ||
      wizardAnswers.hardwareConcerns ||
      wizardAnswers.decisionDrivers.includes('replace-hardware')
    ) {
      recommended.push('hardware-lifecycle');
    }

    // In-house vs MSP
    if (
      wizardAnswers.decisionDrivers.includes('hire-outsource') ||
      wizardAnswers.itManagement === 'none' ||
      wizardAnswers.itManagement === 'break-fix' ||
      wizardAnswers.itSatisfaction === 'no'
    ) {
      recommended.push('inhouse-vs-msp');
    }

    // Cloud vs On-Prem
    if (
      wizardAnswers.decisionDrivers.includes('move-to-cloud') ||
      wizardAnswers.infrastructureLocation === 'on-prem' ||
      wizardAnswers.hasPhysicalServers === 'yes'
    ) {
      recommended.push('cloud-vs-onprem');
    }

    // Security Delay
    if (
      wizardAnswers.decisionDrivers.includes('improve-security') ||
      wizardAnswers.hasEndpointProtection !== 'yes' ||
      wizardAnswers.requiresMFA === 'no' ||
      wizardAnswers.lastSecurityAssessment === 'never' ||
      wizardAnswers.lastSecurityAssessment === '1-2-years'
    ) {
      recommended.push('security-delay');
    }

    return [...new Set(recommended)]; // Remove duplicates
  },

  // Reset
  reset: () => set({
    currentStep: 'business-basics',
    wizardAnswers: initialWizardAnswers,
    wizardComplete: false,
    selectedCalculators: [],
    calculatorResults: [],
    riskFlags: [],
    leadInfo: null,
    leadCaptured: false,
    showResults: false,
  }),
}));

// Export step list for navigation
export { WIZARD_STEPS };
