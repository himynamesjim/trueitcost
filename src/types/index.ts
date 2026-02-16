// ===========================================
// WIZARD TYPES
// ===========================================

export type Industry = 
  | 'healthcare'
  | 'legal'
  | 'finance'
  | 'manufacturing'
  | 'retail'
  | 'professional-services'
  | 'nonprofit'
  | 'other';

export type ITManagement = 
  | 'in-house'
  | 'outsourced'
  | 'both'
  | 'break-fix'
  | 'none';

export type InfrastructureLocation = 
  | 'on-prem'
  | 'cloud'
  | 'hybrid'
  | 'not-sure';

export type HardwareAge = 
  | 'under-3'
  | '3-5'
  | '5-7'
  | '7-plus'
  | 'not-sure';

export type BackupSolution = 
  | 'yes-managed'
  | 'yes-self'
  | 'not-sure'
  | 'no';

export type RetentionPeriod = 
  | 'under-30'
  | '30-90'
  | '90-plus'
  | 'not-sure';

export type DowntimeImpact = 
  | 'business-stops'
  | 'major-disruption'
  | 'moderate'
  | 'minimal';

export type DowntimeTolerance = 
  | 'zero'
  | 'few-hours'
  | 'a-day'
  | 'flexible';

export type DecisionDriver = 
  | 'replace-hardware'
  | 'hire-outsource'
  | 'move-to-cloud'
  | 'improve-security'
  | 'reduce-costs'
  | 'just-exploring';

export type Timeline = 
  | 'urgent'
  | 'this-quarter'
  | 'this-year'
  | 'just-planning';

export type YesNoNotSure = 'yes' | 'no' | 'not-sure';
export type YesPartialNoNotSure = 'yes' | 'partial' | 'no' | 'not-sure';
export type Satisfaction = 'yes' | 'somewhat' | 'no';
export type SecurityAssessmentTiming = 'within-1-year' | '1-2-years' | 'never' | 'not-sure';

// ===========================================
// WIZARD ANSWERS
// ===========================================

export interface WizardAnswers {
  // Section 1: Business Basics
  employeeCount: number | null;
  industry: Industry | null;
  annualRevenue: number | null; // optional

  // Section 2: Current IT Support
  itManagement: ITManagement | null;
  itStaffCount: number | null; // if in-house
  monthlyITSpend: number | null; // if outsourced
  itSatisfaction: Satisfaction | null;

  // Section 3: Infrastructure
  infrastructureLocation: InfrastructureLocation | null;
  hasPhysicalServers: YesNoNotSure | null;
  oldestHardwareAge: HardwareAge | null;
  hardwareConcerns: boolean | null;

  // Section 4: Backup & Recovery
  backupSolution: BackupSolution | null;
  backupRetention: RetentionPeriod | null;
  testedRestoreRecently: YesNoNotSure | null;
  hasDisasterRecoveryPlan: YesNoNotSure | null;

  // Section 5: Security Posture
  hasEndpointProtection: YesPartialNoNotSure | null;
  hasEmailSecurity: YesNoNotSure | null;
  requiresMFA: YesNoNotSure | null;
  lastSecurityAssessment: SecurityAssessmentTiming | null;

  // Section 6: Downtime Sensitivity
  downtimeImpact: DowntimeImpact | null;
  downtimeTolerance: DowntimeTolerance | null;

  // Section 7: Decision Drivers
  decisionDrivers: DecisionDriver[];
  timeline: Timeline | null;
}

// ===========================================
// CALCULATOR TYPES
// ===========================================

export type CalculatorType = 
  | 'hardware-lifecycle'
  | 'inhouse-vs-msp'
  | 'cloud-vs-onprem'
  | 'security-delay'
  | 'downtime-impact';

export interface CalculatorResult {
  type: CalculatorType;
  title: string;
  summary: string;
  totalCost: number;
  timeframeYears: number;
  breakdown: CostBreakdownItem[];
  riskScore: number; // 1-10
  riskFactors: string[];
  recommendation: string;
}

export interface CostBreakdownItem {
  label: string;
  amount: number;
  isRisk?: boolean; // true if this is a risk cost vs. hard cost
  note?: string;
}

// ===========================================
// COMBINED ASSESSMENT
// ===========================================

export interface AssessmentResult {
  wizardAnswers: WizardAnswers;
  calculatorResults: CalculatorResult[];
  overallRiskScore: number;
  totalProjectedCost: number;
  prioritizedRecommendations: string[];
  riskFlags: RiskFlag[];
  createdAt: Date;
}

export interface RiskFlag {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  source: string; // which wizard question triggered this
}

// ===========================================
// LEAD CAPTURE
// ===========================================

export interface LeadInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
}

// ===========================================
// APP STATE
// ===========================================

export type WizardStep = 
  | 'business-basics'
  | 'it-support'
  | 'infrastructure'
  | 'backup-recovery'
  | 'security'
  | 'downtime'
  | 'decision-drivers';

export interface AppState {
  currentStep: WizardStep;
  wizardAnswers: WizardAnswers;
  selectedCalculators: CalculatorType[];
  calculatorResults: CalculatorResult[];
  leadInfo: LeadInfo | null;
  isComplete: boolean;
}
