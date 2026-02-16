import type { 
  Industry, 
  ITManagement, 
  InfrastructureLocation, 
  HardwareAge,
  BackupSolution,
  RetentionPeriod,
  DowntimeImpact,
  DowntimeTolerance,
  DecisionDriver,
  Timeline,
  YesNoNotSure,
  YesPartialNoNotSure,
  Satisfaction,
  SecurityAssessmentTiming,
  WizardStep
} from '@/types';

// ===========================================
// STEP METADATA
// ===========================================

export interface StepInfo {
  id: WizardStep;
  title: string;
  description: string;
  icon: string;
}

export const STEP_INFO: StepInfo[] = [
  {
    id: 'business-basics',
    title: 'Business Basics',
    description: 'Tell us about your company',
    icon: 'Building2',
  },
  {
    id: 'it-support',
    title: 'IT Support',
    description: 'How is your IT currently managed?',
    icon: 'Headphones',
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    description: 'Where do your systems live?',
    icon: 'Server',
  },
  {
    id: 'backup-recovery',
    title: 'Backup & Recovery',
    description: 'How protected is your data?',
    icon: 'HardDrive',
  },
  {
    id: 'security',
    title: 'Security',
    description: 'What\'s your security posture?',
    icon: 'Shield',
  },
  {
    id: 'downtime',
    title: 'Downtime Impact',
    description: 'What happens when systems go down?',
    icon: 'AlertTriangle',
  },
  {
    id: 'decision-drivers',
    title: 'Your Goals',
    description: 'What IT decisions are you facing?',
    icon: 'Target',
  },
];

// ===========================================
// OPTION DEFINITIONS
// ===========================================

export interface Option<T> {
  value: T;
  label: string;
  description?: string;
}

export const INDUSTRY_OPTIONS: Option<Industry>[] = [
  { value: 'healthcare', label: 'Healthcare', description: 'Medical, dental, clinics' },
  { value: 'legal', label: 'Legal', description: 'Law firms, legal services' },
  { value: 'finance', label: 'Finance', description: 'Accounting, financial services' },
  { value: 'manufacturing', label: 'Manufacturing', description: 'Production, industrial' },
  { value: 'retail', label: 'Retail', description: 'Stores, ecommerce' },
  { value: 'professional-services', label: 'Professional Services', description: 'Consulting, agencies' },
  { value: 'nonprofit', label: 'Nonprofit', description: 'Charities, foundations' },
  { value: 'other', label: 'Other', description: 'Other industries' },
];

export const IT_MANAGEMENT_OPTIONS: Option<ITManagement>[] = [
  { value: 'in-house', label: 'In-house IT staff', description: 'We have dedicated IT employees' },
  { value: 'outsourced', label: 'Outsourced to MSP', description: 'We use a managed service provider' },
  { value: 'both', label: 'Both', description: 'Mix of in-house and outsourced' },
  { value: 'break-fix', label: 'Break-fix only', description: 'We call someone when things break' },
  { value: 'none', label: 'No formal IT', description: 'We handle it ourselves as needed' },
];

export const INFRASTRUCTURE_OPTIONS: Option<InfrastructureLocation>[] = [
  { value: 'on-prem', label: 'On-premises', description: 'Servers in our office/data center' },
  { value: 'cloud', label: 'Cloud', description: 'AWS, Azure, Google Cloud, etc.' },
  { value: 'hybrid', label: 'Hybrid', description: 'Mix of on-prem and cloud' },
  { value: 'not-sure', label: 'Not sure', description: 'I don\'t know where our systems are' },
];

export const HARDWARE_AGE_OPTIONS: Option<HardwareAge>[] = [
  { value: 'under-3', label: 'Under 3 years', description: 'Relatively new' },
  { value: '3-5', label: '3-5 years', description: 'Middle of lifecycle' },
  { value: '5-7', label: '5-7 years', description: 'Approaching end of life' },
  { value: '7-plus', label: '7+ years', description: 'Past recommended lifespan' },
  { value: 'not-sure', label: 'Not sure', description: 'I don\'t know' },
];

export const BACKUP_SOLUTION_OPTIONS: Option<BackupSolution>[] = [
  { value: 'yes-managed', label: 'Yes, managed by IT/MSP', description: 'Professionally monitored' },
  { value: 'yes-self', label: 'Yes, we manage it ourselves', description: 'Internal backup solution' },
  { value: 'not-sure', label: 'Not sure', description: 'I don\'t know our backup situation' },
  { value: 'no', label: 'No backup solution', description: 'We don\'t have formal backups' },
];

export const RETENTION_OPTIONS: Option<RetentionPeriod>[] = [
  { value: 'under-30', label: 'Under 30 days', description: 'Short-term retention' },
  { value: '30-90', label: '30-90 days', description: 'Medium retention' },
  { value: '90-plus', label: '90+ days', description: 'Long-term retention' },
  { value: 'not-sure', label: 'Not sure', description: 'I don\'t know' },
];

export const YES_NO_OPTIONS: Option<YesNoNotSure>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not-sure', label: 'Not sure' },
];

export const YES_PARTIAL_OPTIONS: Option<YesPartialNoNotSure>[] = [
  { value: 'yes', label: 'Yes, all devices' },
  { value: 'partial', label: 'Partial coverage' },
  { value: 'no', label: 'No' },
  { value: 'not-sure', label: 'Not sure' },
];

export const SATISFACTION_OPTIONS: Option<Satisfaction>[] = [
  { value: 'yes', label: 'Yes, satisfied' },
  { value: 'somewhat', label: 'Somewhat' },
  { value: 'no', label: 'No, not satisfied' },
];

export const SECURITY_ASSESSMENT_OPTIONS: Option<SecurityAssessmentTiming>[] = [
  { value: 'within-1-year', label: 'Within the last year' },
  { value: '1-2-years', label: '1-2 years ago' },
  { value: 'never', label: 'Never' },
  { value: 'not-sure', label: 'Not sure' },
];

export const DOWNTIME_IMPACT_OPTIONS: Option<DowntimeImpact>[] = [
  { value: 'business-stops', label: 'Business stops completely', description: 'No work gets done' },
  { value: 'major-disruption', label: 'Major disruption', description: 'Most work stops' },
  { value: 'moderate', label: 'Moderate impact', description: 'Some work continues' },
  { value: 'minimal', label: 'Minimal impact', description: 'Most work continues' },
];

export const DOWNTIME_TOLERANCE_OPTIONS: Option<DowntimeTolerance>[] = [
  { value: 'zero', label: 'Zero tolerance', description: 'Every minute costs us' },
  { value: 'few-hours', label: 'A few hours', description: 'Short outages are manageable' },
  { value: 'a-day', label: 'Up to a day', description: 'We can survive a day offline' },
  { value: 'flexible', label: 'Flexible', description: 'Downtime isn\'t critical' },
];

export const DECISION_DRIVER_OPTIONS: Option<DecisionDriver>[] = [
  { value: 'replace-hardware', label: 'Replace aging hardware', description: 'Servers, workstations, network' },
  { value: 'hire-outsource', label: 'Hire IT or outsource', description: 'Staffing decisions' },
  { value: 'move-to-cloud', label: 'Move to the cloud', description: 'Cloud migration planning' },
  { value: 'improve-security', label: 'Improve security', description: 'Cybersecurity investments' },
  { value: 'reduce-costs', label: 'Reduce IT costs', description: 'Cost optimization' },
  { value: 'just-exploring', label: 'Just exploring', description: 'General planning' },
];

export const TIMELINE_OPTIONS: Option<Timeline>[] = [
  { value: 'urgent', label: 'Urgent', description: 'Need to decide now' },
  { value: 'this-quarter', label: 'This quarter', description: 'Within 3 months' },
  { value: 'this-year', label: 'This year', description: 'Within 12 months' },
  { value: 'just-planning', label: 'Just planning', description: 'No immediate pressure' },
];

// ===========================================
// EMPLOYEE COUNT RANGES (for display)
// ===========================================

export const EMPLOYEE_RANGES = [
  { min: 1, max: 10, label: '1-10' },
  { min: 11, max: 25, label: '11-25' },
  { min: 26, max: 50, label: '26-50' },
  { min: 51, max: 100, label: '51-100' },
  { min: 101, max: 250, label: '101-250' },
  { min: 251, max: 500, label: '251-500' },
];

// ===========================================
// REVENUE RANGES (for display, optional field)
// ===========================================

export const REVENUE_RANGES = [
  { min: 0, max: 1000000, label: 'Under $1M' },
  { min: 1000000, max: 5000000, label: '$1M - $5M' },
  { min: 5000000, max: 10000000, label: '$5M - $10M' },
  { min: 10000000, max: 25000000, label: '$10M - $25M' },
  { min: 25000000, max: 50000000, label: '$25M - $50M' },
  { min: 50000000, max: null, label: '$50M+' },
];
