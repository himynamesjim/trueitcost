'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Calculator, ArrowLeft, AlertTriangle, CheckCircle, XCircle, AlertCircle as WarningIcon, TrendingUp, Shield, Database, Clock, Target, Edit, Info, Zap, DollarSign, Users, Briefcase, Menu, X, MessageSquare, ChevronRight } from 'lucide-react';
import { useAssessmentStore } from '@/store/assessment-store';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ResultsPage() {
  const router = useRouter();
  const { leadInfo, wizardAnswers, riskFlags, getOverallRiskScore } = useAssessmentStore();

  // Interactive IT Cost Calculator State
  const [engineerCount, setEngineerCount] = useState(wizardAnswers.itStaffCount || 1);
  const [avgEngineerSalary, setAvgEngineerSalary] = useState(85000);
  const [mspPricePerUser, setMspPricePerUser] = useState(125);
  const [keepEngineers, setKeepEngineers] = useState(false);

  // Navigation State
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [prevActiveSection, setPrevActiveSection] = useState('overview');

  // Scroll spy for active section
  useEffect(() => {
    const handleScroll = () => {
      // All sections in order, including subsections
      const sections = [
        'overview',
        'risk-score',
        'financial-impact',
        'downtime',
        'it-costs',
        'productivity',
        'total-impact',
        'risk-flags',
        'msp-benefits'
      ];

      // Use top third of viewport for section detection
      const triggerPoint = window.scrollY + (window.innerHeight / 3);

      // Find which section is currently in the trigger zone
      let closestSection = 'overview';
      let closestDistance = Infinity;

      const debugInfo: any[] = [];

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;

          debugInfo.push({
            section,
            elementTop,
            triggerPoint,
            passed: triggerPoint >= elementTop,
            distance: triggerPoint - elementTop
          });

          // If this section's top is above the trigger point (we've scrolled past it)
          if (triggerPoint >= elementTop) {
            const distance = triggerPoint - elementTop;
            // Find the section with the smallest distance (most recently passed)
            if (distance < closestDistance) {
              closestDistance = distance;
              closestSection = section;
            }
          }
        }
      }

      // Debug log when section changes
      if (closestSection !== prevActiveSection) {
        console.log('🔍 Section Changed:', {
          from: prevActiveSection,
          to: closestSection,
          triggerPoint,
          scrollY: window.scrollY,
          sections: debugInfo
        });
        setPrevActiveSection(closestSection);
      }

      setActiveSection(closestSection);
    };

    // Run on mount to set initial section
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
      setMobileNavOpen(false);
    }
  };

  // Calculate risk score (1-10 scale)
  const riskScore = getOverallRiskScore();

  // Determine MSP recommendation
  const getMSPRecommendation = () => {
    const criticalCount = riskFlags.filter(f => f.severity === 'critical').length;
    const highCount = riskFlags.filter(f => f.severity === 'high').length;
    const totalFlags = riskFlags.length;

    if (criticalCount >= 2 || (criticalCount >= 1 && highCount >= 2)) {
      return {
        recommendation: 'Strongly Recommended',
        urgency: 'urgent',
        color: 'red',
        message: 'Your organization has critical IT gaps that require immediate professional attention. An MSP can help prevent potential disasters and ensure business continuity.'
      };
    } else if (totalFlags >= 3 || highCount >= 2) {
      return {
        recommendation: 'Recommended',
        urgency: 'high',
        color: 'orange',
        message: 'Multiple risk areas indicate that professional IT management would significantly improve your security posture and operational efficiency.'
      };
    } else if (totalFlags >= 1) {
      return {
        recommendation: 'Consider',
        urgency: 'moderate',
        color: 'yellow',
        message: 'While you have some IT coverage, there are areas where an MSP could add value and reduce risk exposure.'
      };
    } else {
      return {
        recommendation: 'Optional',
        urgency: 'low',
        color: 'green',
        message: 'Your IT infrastructure appears well-managed. An MSP could still provide value through optimization and proactive monitoring.'
      };
    }
  };

  const mspRec = getMSPRecommendation();

  // Categorize risk flags
  const categorizedRisks = {
    Security: riskFlags.filter(f => f.category === 'Security'),
    Backup: riskFlags.filter(f => f.category === 'Backup' || f.category === 'Business Continuity'),
    Hardware: riskFlags.filter(f => f.category === 'Hardware'),
    'IT Management': riskFlags.filter(f => f.category === 'IT Management'),
  };

  // Calculate category scores (0-100)
  const categoryScores = {
    security: calculateSecurityScore(),
    backup: calculateBackupScore(),
    infrastructure: calculateInfrastructureScore(),
    management: calculateManagementScore(),
  };

  function calculateSecurityScore() {
    let score = 100;
    if (wizardAnswers.hasEndpointProtection === 'No') score -= 30;
    else if (wizardAnswers.hasEndpointProtection === 'Partial') score -= 15;
    if (wizardAnswers.hasEmailSecurity === 'false') score -= 20;
    if (wizardAnswers.requiresMFA === 'false') score -= 25;
    if (wizardAnswers.lastSecurityAssessment === 'Never') score -= 25;
    else if (wizardAnswers.lastSecurityAssessment === '1-2 yrs') score -= 10;
    return Math.max(0, score);
  }

  function calculateBackupScore() {
    let score = 100;
    if (wizardAnswers.backupSolution === 'No') score -= 50;
    else if (wizardAnswers.backupSolution === 'Not sure') score -= 30;
    if (wizardAnswers.testedRestore === 'false') score -= 30;
    if (wizardAnswers.hasDisasterRecoveryPlan === false) score -= 20;
    return Math.max(0, score);
  }

  function calculateInfrastructureScore() {
    let score = 100;
    if (wizardAnswers.oldestHardwareAge === '7+ yrs') score -= 40;
    else if (wizardAnswers.oldestHardwareAge === '5-7 yrs') score -= 25;
    if (wizardAnswers.hardwareConcerns === true) score -= 20;
    if (wizardAnswers.infrastructureLocation === 'Not sure') score -= 15;
    return Math.max(0, score);
  }

  function calculateManagementScore() {
    let score = 100;
    if (wizardAnswers.itManagement === 'None') score -= 50;
    else if (wizardAnswers.itManagement === 'Break-fix') score -= 30;
    if (wizardAnswers.itSatisfaction === 'No') score -= 30;
    else if (wizardAnswers.itSatisfaction === 'Somewhat') score -= 15;
    return Math.max(0, score);
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // ========================================
  // COST ANALYSIS CALCULATIONS
  // ========================================

  // 1. Enhanced Downtime Cost Calculator
  function calculateDowntimeCost() {
    const revenue = wizardAnswers.annualRevenue || 0;
    if (revenue === 0) return null;

    // Base calculations
    const businessDaysPerYear = 260; // 52 weeks × 5 days
    const hoursPerBusinessDay = 8;
    const totalBusinessHours = businessDaysPerYear * hoursPerBusinessDay; // 2,080 hours
    const hourlyRevenue = revenue / totalBusinessHours;
    const dailyRevenue = revenue / businessDaysPerYear;

    // Impact severity multipliers (affects what percentage of revenue is lost)
    const impactMultipliers = {
      'Business stops': 1.0,      // 100% revenue loss + recovery costs (total shutdown)
      'Major disruption': 0.75,   // 75% revenue loss (most operations halted)
      'Moderate': 0.40,           // 40% revenue loss (significant slowdown)
      'Minimal': 0.15,            // 15% revenue loss (minor inconvenience)
    };

    // Recovery cost multipliers (additional costs beyond lost revenue)
    const recoveryCostMultipliers = {
      'Business stops': 0.5,      // 50% additional cost for emergency recovery
      'Major disruption': 0.3,    // 30% additional cost
      'Moderate': 0.15,           // 15% additional cost
      'Minimal': 0.05,            // 5% additional cost
    };

    const impactMultiplier = impactMultipliers[wizardAnswers.downtimeImpact as keyof typeof impactMultipliers] || 0.4;
    const recoveryMultiplier = recoveryCostMultipliers[wizardAnswers.downtimeImpact as keyof typeof recoveryCostMultipliers] || 0.15;

    // Calculate cost per hour including recovery
    const revenueLossPerHour = hourlyRevenue * impactMultiplier;
    const recoveryCostPerHour = hourlyRevenue * recoveryMultiplier;
    const totalCostPerHour = revenueLossPerHour + recoveryCostPerHour;

    // Tolerance risk multiplier (how prepared are they for downtime?)
    const toleranceRiskMultipliers = {
      'Zero': 2.5,        // Can't handle any downtime = massive impact when it happens
      'A few hours': 1.5, // Limited tolerance = significant impact
      'A day': 1.0,       // Moderate tolerance = standard impact
      'Flexible': 0.6,    // High tolerance = reduced impact
    };

    const toleranceMultiplier = toleranceRiskMultipliers[wizardAnswers.downtimeTolerance as keyof typeof toleranceRiskMultipliers] || 1.0;

    // Calculate estimated annual downtime hours based on multiple factors
    let estimatedDowntimeHours = 4; // Base: 4 hours/year (half a business day)

    // Risk score factor (higher risk = more downtime)
    if (riskScore >= 8) estimatedDowntimeHours = 40;      // 5 business days
    else if (riskScore >= 7) estimatedDowntimeHours = 32; // 4 business days
    else if (riskScore >= 6) estimatedDowntimeHours = 24; // 3 business days
    else if (riskScore >= 5) estimatedDowntimeHours = 16; // 2 business days
    else if (riskScore >= 4) estimatedDowntimeHours = 12; // 1.5 business days
    else if (riskScore >= 3) estimatedDowntimeHours = 8;  // 1 business day

    // Additional downtime from specific risks
    if (wizardAnswers.backupSolution === 'No' || wizardAnswers.backupSolution === 'Not sure') {
      estimatedDowntimeHours += 16; // +2 days for no backup
    }
    if (wizardAnswers.testedRestore === 'false') {
      estimatedDowntimeHours += 8; // +1 day for untested backups
    }
    if (wizardAnswers.oldestHardwareAge === '7+ yrs') {
      estimatedDowntimeHours += 12; // +1.5 days for critical hardware age
    } else if (wizardAnswers.oldestHardwareAge === '5-7 yrs') {
      estimatedDowntimeHours += 6; // +0.75 days for aging hardware
    }
    if (wizardAnswers.itManagement === 'None') {
      estimatedDowntimeHours += 10; // +1.25 days for no IT management
    } else if (wizardAnswers.itManagement === 'Break-fix') {
      estimatedDowntimeHours += 6; // +0.75 days for reactive-only support
    }
    if (wizardAnswers.hasEndpointProtection === 'No') {
      estimatedDowntimeHours += 16; // +2 days for no EDR (ransomware risk)
    }

    // Apply tolerance multiplier to final cost (not hours)
    const estimatedAnnualCost = Math.round(totalCostPerHour * estimatedDowntimeHours * toleranceMultiplier);
    const estimatedDays = estimatedDowntimeHours / hoursPerBusinessDay;

    // Calculate worst-case scenario (single major incident)
    const worstCaseDays = wizardAnswers.downtimeImpact === 'Business stops' ? 5 :
                          wizardAnswers.downtimeImpact === 'Major disruption' ? 3 :
                          wizardAnswers.downtimeImpact === 'Moderate' ? 2 : 1;
    const worstCaseHours = worstCaseDays * hoursPerBusinessDay;
    const worstCaseCost = Math.round(totalCostPerHour * worstCaseHours * toleranceMultiplier);

    // Break down cost components
    const totalRevenueLoss = Math.round(revenueLossPerHour * estimatedDowntimeHours * toleranceMultiplier);
    const totalRecoveryCost = Math.round(recoveryCostPerHour * estimatedDowntimeHours * toleranceMultiplier);

    return {
      hourlyRevenue: Math.round(hourlyRevenue),
      dailyRevenue: Math.round(dailyRevenue),
      costPerHour: Math.round(totalCostPerHour),
      costPerDay: Math.round(totalCostPerHour * hoursPerBusinessDay),
      estimatedAnnualDowntimeHours: estimatedDowntimeHours,
      estimatedAnnualDowntimeDays: parseFloat(estimatedDays.toFixed(1)),
      annualDowntimeCost: estimatedAnnualCost,
      revenueLoss: totalRevenueLoss,
      recoveryCost: totalRecoveryCost,
      worstCase: {
        days: worstCaseDays,
        hours: worstCaseHours,
        cost: worstCaseCost,
      },
      impactLevel: wizardAnswers.downtimeImpact,
      toleranceLevel: wizardAnswers.downtimeTolerance,
    };
  }

  // 2. Interactive In-House IT vs MSP Cost Comparison
  function calculateInteractiveITCostComparison() {
    const employeeCount = wizardAnswers.employeeCount || 0;
    if (employeeCount === 0) return null;

    // Industry average salaries for IT roles (2024)
    const INDUSTRY_SALARIES = {
      networkEngineer: 85000,
      systemsEngineer: 90000,
      securityEngineer: 110000,
      helpDesk: 55000,
      itManager: 105000,
    };

    // Benefits and overhead calculations
    const benefitsRate = 0.30; // 30% for health, dental, 401k, etc.
    const payrollTaxRate = 0.0765; // FICA + Medicare
    const overheadRate = 0.20; // Office space, equipment, software licenses, training
    const totalLoadedCostMultiplier = 1 + benefitsRate + payrollTaxRate + overheadRate; // ~1.58x

    // Current in-house IT costs
    const engineerBaseSalary = avgEngineerSalary;
    const engineerFullyLoadedCost = engineerBaseSalary * totalLoadedCostMultiplier;
    const totalInHouseCost = engineerCount * engineerFullyLoadedCost;

    // MSP pricing
    const employeesPerEngineer = Math.ceil(employeeCount / engineerCount);
    const mspAnnualCost = employeeCount * mspPricePerUser * 12;

    // Scenario 1: Full MSP (outsource everything)
    const fullOutsourceSavings = totalInHouseCost - mspAnnualCost;

    // Scenario 2: Hybrid (keep engineers + MSP)
    const hybridMSPCost = mspAnnualCost * 0.5; // MSP handles half the workload
    const hybridEngineerCost = keepEngineers ? totalInHouseCost : 0;
    const hybridTotalCost = hybridEngineerCost + hybridMSPCost;
    const hybridSavings = totalInHouseCost - hybridTotalCost;

    // Additional costs avoided with MSP
    const avoidedCosts = {
      hardwareRefresh: wizardAnswers.oldestHardwareAge === '7+ yrs' || wizardAnswers.oldestHardwareAge === '5-7 yrs' ? employeeCount * 1200 : 0,
      securityIncident: riskScore >= 7 ? 50000 : riskScore >= 5 ? 25000 : 0,
      downtime: calculateDowntimeCost()?.annualDowntimeCost || 0,
      recruitment: engineerCount * 15000, // Cost to recruit/replace IT staff (avoided with MSP)
    };

    const totalAvoidedCosts = Object.values(avoidedCosts).reduce((a, b) => a + b, 0);

    return {
      inHouse: {
        baseSalary: engineerBaseSalary,
        benefits: Math.round(engineerBaseSalary * benefitsRate),
        payrollTax: Math.round(engineerBaseSalary * payrollTaxRate),
        overhead: Math.round(engineerBaseSalary * overheadRate),
        fullyLoadedPerEngineer: Math.round(engineerFullyLoadedCost),
        totalAnnualCost: Math.round(totalInHouseCost),
        engineerCount: engineerCount,
        employeesPerEngineer: employeesPerEngineer,
      },
      msp: {
        pricePerUser: mspPricePerUser,
        totalAnnualCost: Math.round(mspAnnualCost),
        monthlyPerUser: mspPricePerUser,
        totalMonthly: Math.round(mspAnnualCost / 12),
      },
      fullOutsource: {
        totalCost: Math.round(mspAnnualCost),
        savings: Math.round(fullOutsourceSavings),
        savingsWithAvoided: Math.round(fullOutsourceSavings + totalAvoidedCosts),
      },
      hybrid: {
        mspCost: Math.round(hybridMSPCost),
        engineerCost: Math.round(hybridEngineerCost),
        totalCost: Math.round(hybridTotalCost),
        savings: Math.round(hybridSavings),
      },
      avoidedCosts: {
        hardware: avoidedCosts.hardwareRefresh,
        security: avoidedCosts.securityIncident,
        downtime: avoidedCosts.downtime,
        recruitment: avoidedCosts.recruitment,
        total: totalAvoidedCosts,
      },
      industrySalaries: INDUSTRY_SALARIES,
    };
  }

  // 3. Productivity/Opportunity Cost
  function calculateOpportunityCost() {
    const employeeCount = wizardAnswers.employeeCount || 0;
    if (employeeCount === 0) return null;

    // Hours spent on IT issues per employee per year
    const itIssueHours = wizardAnswers.itManagement === 'None' ? 20 :
                        wizardAnswers.itManagement === 'Break-fix' ? 15 :
                        wizardAnswers.itSatisfaction === 'No' ? 12 : 8;

    // Average employee hourly cost (conservative)
    const avgEmployeeHourlyCost = 50;

    // IT staff time spent on reactive tasks vs proactive
    const itStaffReactiveHours = (wizardAnswers.itStaffCount || 0) * (wizardAnswers.itManagement === 'In-house' ? 800 : 0);

    const totalProductivityLoss = (employeeCount * itIssueHours * avgEmployeeHourlyCost) + (itStaffReactiveHours * 75);

    // With MSP: 75% reduction in IT-related productivity loss
    const productivityReclaimed = totalProductivityLoss * 0.75;

    return {
      currentProductivityLoss: Math.round(totalProductivityLoss),
      reclaimedProductivity: Math.round(productivityReclaimed),
      reclaimedHours: Math.round((employeeCount * itIssueHours + itStaffReactiveHours) * 0.75),
    };
  }

  const downtimeCost = calculateDowntimeCost();
  const itCostComparison = calculateInteractiveITCostComparison();
  const opportunityCost = calculateOpportunityCost();

  // Determine risk profile and comparison
  function getRiskProfile() {
    const annualCost = downtimeCost?.annualDowntimeCost || 0;
    const revenue = wizardAnswers.annualRevenue || 1;
    const costAsPercentOfRevenue = (annualCost / revenue) * 100;

    if (riskScore >= 8 || costAsPercentOfRevenue >= 5) {
      return {
        level: 'Critical',
        color: 'red',
        badge: 'bg-red-600 text-white',
        message: 'Your downtime risk is in the top 10% highest - immediate action needed',
        comparison: 'Companies with critical risk profiles experience 5-10x more downtime than industry average',
      };
    } else if (riskScore >= 6 || costAsPercentOfRevenue >= 2) {
      return {
        level: 'High',
        color: 'orange',
        badge: 'bg-orange-600 text-white',
        message: 'Your downtime risk is above industry average',
        comparison: 'High-risk companies typically experience 3-5 business days of downtime annually',
      };
    } else if (riskScore >= 4 || costAsPercentOfRevenue >= 0.5) {
      return {
        level: 'Moderate',
        color: 'yellow',
        badge: 'bg-yellow-600 text-white',
        message: 'Your downtime risk is within industry average',
        comparison: 'Most companies experience 1-2 business days of downtime per year',
      };
    } else {
      return {
        level: 'Low',
        color: 'green',
        badge: 'bg-emerald-600 text-white',
        message: 'Your downtime risk is well below industry average - excellent!',
        comparison: 'Well-managed companies like yours typically experience less than 1 day of downtime annually',
      };
    }
  }

  const riskProfile = getRiskProfile();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm dark:shadow-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              <span className="font-bold text-slate-900 dark:text-white">TrueITCost</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Your MSP Assessment Results
          </h1>
          {leadInfo && (
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {leadInfo.name} • {leadInfo.company || leadInfo.email}
            </p>
          )}
        </div>

        {/* MSP Recommendation Card */}
        <div id="overview" className={`mb-8 rounded-2xl p-6 md:p-8 shadow-lg ${
          mspRec.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800' :
          mspRec.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800' :
          mspRec.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800' :
          'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center ${
              mspRec.color === 'red' ? 'bg-red-100 dark:bg-red-900/40' :
              mspRec.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/40' :
              mspRec.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40' :
              'bg-emerald-100 dark:bg-emerald-900/40'
            }`}>
              {mspRec.color === 'green' ? (
                <CheckCircle className={`h-6 w-6 md:h-8 md:w-8 ${mspRec.color === 'red' ? 'text-red-600' : mspRec.color === 'orange' ? 'text-orange-600' : mspRec.color === 'yellow' ? 'text-yellow-600' : 'text-emerald-600'}`} />
              ) : (
                <AlertTriangle className={`h-6 w-6 md:h-8 md:w-8 ${mspRec.color === 'red' ? 'text-red-600' : mspRec.color === 'orange' ? 'text-orange-600' : 'text-yellow-600'}`} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className={`text-2xl md:text-3xl font-bold ${
                  mspRec.color === 'red' ? 'text-red-700 dark:text-red-400' :
                  mspRec.color === 'orange' ? 'text-orange-700 dark:text-orange-400' :
                  mspRec.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                  'text-emerald-700 dark:text-emerald-400'
                }`}>
                  MSP: {mspRec.recommendation}
                </h2>
                {mspRec.urgency === 'urgent' && (
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase">
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                {mspRec.message}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Overview */}
        <div id="risk-score" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Overall Risk Score */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Overall Risk Score
            </h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(riskScore / 10) * 351.86} 351.86`}
                    className={
                      riskScore >= 7 ? 'text-red-500' :
                      riskScore >= 5 ? 'text-orange-500' :
                      riskScore >= 3 ? 'text-yellow-500' :
                      'text-emerald-500'
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${
                    riskScore >= 7 ? 'text-red-600 dark:text-red-400' :
                    riskScore >= 5 ? 'text-orange-600 dark:text-orange-400' :
                    riskScore >= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {riskScore}/10
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              {riskScore >= 7 ? 'High Risk - Immediate action needed' :
               riskScore >= 5 ? 'Moderate Risk - Address soon' :
               riskScore >= 3 ? 'Low Risk - Some improvements recommended' :
               'Minimal Risk - Well managed'}
            </p>
          </div>

          {/* Risk Flags Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Risk Flags Identified
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <span className="text-sm font-medium text-red-700 dark:text-red-400">Critical</span>
                <span className="text-xl font-bold text-red-600 dark:text-red-400">
                  {riskFlags.filter(f => f.severity === 'critical').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <span className="text-sm font-medium text-orange-700 dark:text-orange-400">High</span>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {riskFlags.filter(f => f.severity === 'high').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Medium</span>
                <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {riskFlags.filter(f => f.severity === 'medium').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              IT Health by Category
            </h3>
            <button
              onClick={() => router.push('/assessment')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Answers
            </button>
          </div>

          <div className="space-y-6">
            {/* Security */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-white">Security</span>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(categoryScores.security)}`}>
                  {categoryScores.security}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getScoreBarColor(categoryScores.security)} transition-all duration-500`}
                  style={{ width: `${categoryScores.security}%` }}
                />
              </div>
            </div>

            {/* Backup & Recovery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-white">Backup & Recovery</span>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(categoryScores.backup)}`}>
                  {categoryScores.backup}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getScoreBarColor(categoryScores.backup)} transition-all duration-500`}
                  style={{ width: `${categoryScores.backup}%` }}
                />
              </div>
            </div>

            {/* Infrastructure */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-white">Infrastructure</span>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(categoryScores.infrastructure)}`}>
                  {categoryScores.infrastructure}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getScoreBarColor(categoryScores.infrastructure)} transition-all duration-500`}
                  style={{ width: `${categoryScores.infrastructure}%` }}
                />
              </div>
            </div>

            {/* IT Management */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-white">IT Management</span>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(categoryScores.management)}`}>
                  {categoryScores.management}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getScoreBarColor(categoryScores.management)} transition-all duration-500`}
                  style={{ width: `${categoryScores.management}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cost Analysis Section */}
        {(downtimeCost || itCostComparison || opportunityCost) && (
          <div id="financial-impact" className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              Financial Impact Analysis
            </h3>

            <div className="space-y-6">
              {/* Downtime Cost Analysis */}
              {downtimeCost && (
                <div id="downtime" className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/10">
                  {/* Header with title and risk badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                          Downtime Cost Exposure
                        </h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Potential financial impact from IT outages & system failures
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${riskProfile.badge} shadow-lg`}>
                      {riskProfile.level} Risk
                    </span>
                  </div>

                  {/* Alert Banner */}
                  <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                    riskProfile.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 border-red-600' :
                    riskProfile.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-600' :
                    riskProfile.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-600' :
                    'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-600'
                  }`}>
                    <p className={`text-sm font-semibold ${
                      riskProfile.color === 'red' ? 'text-red-900 dark:text-red-200' :
                      riskProfile.color === 'orange' ? 'text-orange-900 dark:text-orange-200' :
                      riskProfile.color === 'yellow' ? 'text-yellow-900 dark:text-yellow-200' :
                      'text-emerald-900 dark:text-emerald-200'
                    }`}>
                      {riskProfile.message}
                    </p>
                  </div>

                  {/* Main Metrics - Large Visual Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Annual Exposure - Primary metric */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 rounded-xl p-6 text-white shadow-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-6 w-6" />
                          <p className="text-sm font-semibold uppercase opacity-90">Annual Exposure</p>
                        </div>
                        <div className="group relative">
                          <Info className="h-5 w-5 opacity-70 hover:opacity-100 cursor-help transition-opacity" />
                          <div className="absolute right-0 top-8 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                            Estimated total cost of unplanned downtime based on your risk factors, including revenue loss and recovery expenses.
                          </div>
                        </div>
                      </div>
                      <p className="text-5xl font-bold mb-2">
                        ${downtimeCost.annualDowntimeCost.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-4 text-sm opacity-90">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{downtimeCost.estimatedAnnualDowntimeDays} days/year</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{downtimeCost.impactLevel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Worst-Case Scenario */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-orange-300 dark:border-orange-700 shadow-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">Worst-Case</p>
                        </div>
                        <div className="group relative">
                          <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help transition-colors" />
                          <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                            Cost of a major incident requiring {downtimeCost.worstCase.days} day{downtimeCost.worstCase.days > 1 ? 's' : ''} to recover.
                          </div>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                        ${downtimeCost.worstCase.cost.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {downtimeCost.worstCase.days} day major outage
                      </p>
                    </div>
                  </div>

                  {/* Cost Breakdown - Compact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Cost per Hour</p>
                        <div className="group relative">
                          <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help transition-colors" />
                          <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                            Revenue loss + recovery costs per hour of downtime based on your business impact level.
                          </div>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ${downtimeCost.costPerHour.toLocaleString()}<span className="text-sm text-slate-500">/hr</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        ${downtimeCost.costPerDay.toLocaleString()}/day
                      </p>
                    </div>

                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Cost Components</p>
                        <div className="group relative">
                          <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help transition-colors" />
                          <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                            Breakdown of direct revenue loss vs emergency recovery and restoration costs.
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600 dark:text-slate-400">Revenue Loss</span>
                          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                            ${downtimeCost.revenueLoss.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600 dark:text-slate-400">Recovery Costs</span>
                          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            ${downtimeCost.recoveryCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Industry Comparison - Simplified */}
                  <div className={`p-4 rounded-lg border-2 ${
                    riskProfile.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' :
                    riskProfile.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' :
                    riskProfile.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' :
                    'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        riskProfile.color === 'red' ? 'bg-red-200 dark:bg-red-800' :
                        riskProfile.color === 'orange' ? 'bg-orange-200 dark:bg-orange-800' :
                        riskProfile.color === 'yellow' ? 'bg-yellow-200 dark:bg-yellow-800' :
                        'bg-emerald-200 dark:bg-emerald-800'
                      }`}>
                        <TrendingUp className={`h-4 w-4 ${
                          riskProfile.color === 'red' ? 'text-red-700 dark:text-red-300' :
                          riskProfile.color === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                          riskProfile.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-emerald-700 dark:text-emerald-300'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold uppercase mb-1 ${
                          riskProfile.color === 'red' ? 'text-red-700 dark:text-red-400' :
                          riskProfile.color === 'orange' ? 'text-orange-700 dark:text-orange-400' :
                          riskProfile.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                          'text-emerald-700 dark:text-emerald-400'
                        }`}>
                          Industry Benchmark
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                          {riskProfile.comparison}
                        </p>
                        {riskProfile.level === 'Low' && (
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Top 25% of businesses
                          </p>
                        )}
                        {riskProfile.level === 'Critical' && (
                          <p className="text-xs text-red-700 dark:text-red-400 mt-2 font-medium flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            MSP can reduce downtime by 70-90%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive IT Cost Comparison */}
              {itCostComparison && (
                <div id="it-costs" className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                          In-House IT vs MSP Cost Analysis
                        </h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Compare fully-loaded engineer costs vs outsourcing to an MSP
                      </p>
                    </div>
                  </div>

                  {/* Interactive Controls */}
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-5 mb-6 border border-slate-300 dark:border-slate-600">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Adjust Your Scenario
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Engineer Count */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Number of IT Engineers
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={engineerCount}
                          onChange={(e) => setEngineerCount(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Supporting {itCostComparison.inHouse.employeesPerEngineer} employees each
                        </p>
                      </div>

                      {/* Average Salary */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          Avg Engineer Salary
                          <div className="group relative">
                            <Info className="h-3 w-3 text-slate-400 hover:text-slate-600 cursor-help" />
                            <div className="absolute left-0 top-5 w-56 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                              <p className="font-bold mb-1">Industry Averages (2024):</p>
                              <p>Network Engineer: $85k</p>
                              <p>Systems Engineer: $90k</p>
                              <p>Security Engineer: $110k</p>
                              <p>Help Desk: $55k</p>
                              <p>IT Manager: $105k</p>
                            </div>
                          </div>
                        </label>
                        <input
                          type="number"
                          min="40000"
                          max="200000"
                          step="5000"
                          value={avgEngineerSalary}
                          onChange={(e) => setAvgEngineerSalary(parseInt(e.target.value) || 85000)}
                          className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Base salary only
                        </p>
                      </div>

                      {/* MSP Price Per User */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                          MSP Price/User/Month
                          <div className="group relative">
                            <Info className="h-3 w-3 text-slate-400 hover:text-slate-600 cursor-help" />
                            <div className="absolute left-0 top-5 w-48 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                              Industry standard: $100-$150/user/month for comprehensive managed services.
                            </div>
                          </div>
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="300"
                          step="25"
                          value={mspPricePerUser}
                          onChange={(e) => setMspPricePerUser(parseInt(e.target.value) || 125)}
                          className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Typical: $100-$150
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* In-House Cost Breakdown */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-5 mb-6 border-2 border-slate-300 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        In-House Engineer Costs (Fully Loaded)
                      </h5>
                      <div className="group relative">
                        <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help transition-colors" />
                        <div className="absolute right-0 top-6 w-72 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                          "Fully loaded" cost includes base salary plus all employer costs: benefits (30%), payroll taxes (7.65%), and overhead (20%) for equipment, office space, software licenses, and training.
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Base Salary ({engineerCount} engineer{engineerCount > 1 ? 's' : ''})</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          ${(itCostComparison.inHouse.baseSalary * engineerCount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Benefits (30%)</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          ${(itCostComparison.inHouse.benefits * engineerCount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Payroll Taxes (7.65%)</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          ${(itCostComparison.inHouse.payrollTax * engineerCount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Overhead (20%)</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          ${(itCostComparison.inHouse.overhead * engineerCount).toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-3 mt-3 border-t-2 border-slate-300 dark:border-slate-600 flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">Total Annual Cost</span>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          ${itCostComparison.inHouse.totalAnnualCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MSP Cost */}
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 rounded-lg p-5 mb-6 text-white shadow-xl">
                    <h5 className="font-semibold mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Full MSP Outsourcing
                    </h5>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Total Annual MSP Cost</p>
                        <p className="text-4xl font-bold">
                          ${itCostComparison.msp.totalAnnualCost.toLocaleString()}
                        </p>
                        <p className="text-sm opacity-75 mt-1">
                          ${itCostComparison.msp.totalMonthly.toLocaleString()}/month • ${itCostComparison.msp.pricePerUser}/user/month
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-90 mb-1">Annual Savings</p>
                        <p className={`text-3xl font-bold ${itCostComparison.fullOutsource.savings > 0 ? 'text-white' : 'text-red-200'}`}>
                          {itCostComparison.fullOutsource.savings > 0 ? '+' : ''}${itCostComparison.fullOutsource.savings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Avoided Costs */}
                  {itCostComparison.avoidedCosts.total > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-5 border-2 border-emerald-300 dark:border-emerald-700">
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Additional Costs Avoided with MSP
                      </p>
                      <div className="space-y-2 text-sm">
                        {itCostComparison.avoidedCosts.downtime > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700 dark:text-slate-300">Downtime Reduction</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              ${itCostComparison.avoidedCosts.downtime.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {itCostComparison.avoidedCosts.recruitment > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700 dark:text-slate-300">Recruitment & Turnover Costs</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              ${itCostComparison.avoidedCosts.recruitment.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {itCostComparison.avoidedCosts.hardware > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700 dark:text-slate-300">Hardware Planning & Refresh</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              ${itCostComparison.avoidedCosts.hardware.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {itCostComparison.avoidedCosts.security > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700 dark:text-slate-300">Security Incident Prevention</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              ${itCostComparison.avoidedCosts.security.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="pt-3 mt-3 border-t-2 border-emerald-300 dark:border-emerald-700 flex justify-between items-center">
                          <span className="font-bold text-emerald-900 dark:text-emerald-300">Total Avoided Costs</span>
                          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                            ${itCostComparison.avoidedCosts.total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Grand Total Savings */}
                      <div className="mt-4 pt-4 border-t-2 border-emerald-400 dark:border-emerald-600">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                            Total Savings (MSP + Avoided Costs)
                          </span>
                          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                            +${itCostComparison.fullOutsource.savingsWithAvoided.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-1 text-right">
                          ${Math.round(itCostComparison.fullOutsource.savingsWithAvoided / 12).toLocaleString()}/month
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Productivity/Opportunity Cost */}
              {opportunityCost && opportunityCost.currentProductivityLoss > 0 && (
                <div id="productivity" className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                          Productivity & Focus Opportunity
                        </h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Hidden costs of employees dealing with IT issues instead of core business
                      </p>
                    </div>
                  </div>

                  {/* Info Box - What is this? */}
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 mb-6 border-l-4 border-blue-600">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                          What is Productivity Loss?
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                          This is the <strong>hidden cost</strong> of your employees spending time troubleshooting IT problems, waiting for tech support, or dealing with technology issues instead of doing their actual jobs. Most businesses don't track this, but it's real money leaving the table every day.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Current Loss */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-orange-300 dark:border-orange-700 shadow-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">Current Productivity Loss</p>
                        </div>
                        <div className="group relative">
                          <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help transition-colors" />
                          <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                            Annual cost of employee time lost to IT issues, calculated at $50/hour (conservative estimate including benefits and overhead).
                          </div>
                        </div>
                      </div>
                      <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                        ${opportunityCost.currentProductivityLoss.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Annual cost of IT-related disruptions
                      </p>
                    </div>

                    {/* Reclaimable */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 rounded-xl p-5 text-white shadow-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          <p className="text-xs font-semibold uppercase opacity-90">Reclaimable with MSP</p>
                        </div>
                        <div className="group relative">
                          <Info className="h-4 w-4 opacity-70 hover:opacity-100 cursor-help transition-opacity" />
                          <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                            MSPs reduce IT-related interruptions by 75% through proactive monitoring, faster resolution, and preventing issues before they impact users.
                          </div>
                        </div>
                      </div>
                      <p className="text-4xl font-bold mb-2">
                        ${opportunityCost.reclaimedProductivity.toLocaleString()}
                      </p>
                      <p className="text-sm opacity-90">
                        <strong>{opportunityCost.reclaimedHours.toLocaleString()} hours/year</strong> back to business
                      </p>
                    </div>
                  </div>

                  {/* How to Read This Section */}
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-5 border border-slate-300 dark:border-slate-600 mb-6">
                    <h5 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      How to Read This Analysis
                    </h5>
                    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                          1
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white mb-1">Current State (Orange Box)</p>
                          <p className="leading-relaxed">
                            This shows what your employees' time costs when they're dealing with IT problems instead of their actual work. Based on your assessment, we estimate your team loses <strong>{opportunityCost.reclaimedHours.toLocaleString()} hours annually</strong> to IT issues.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                          2
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white mb-1">MSP Benefit (Green Box)</p>
                          <p className="leading-relaxed">
                            An MSP can reclaim <strong>75% of this time</strong> by handling IT issues proactively, resolving problems faster, and preventing disruptions before they impact your team. This puts <strong>${opportunityCost.reclaimedProductivity.toLocaleString()}</strong> worth of productivity back into your business.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                          3
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white mb-1">The Bottom Line</p>
                          <p className="leading-relaxed">
                            This isn't about eliminating all IT issues (impossible) - it's about your staff spending 75% less time dealing with them. That means more time on revenue-generating activities, customer service, and strategic initiatives.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-World Examples */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-5 border-2 border-indigo-200 dark:border-indigo-800">
                    <h5 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      What Does This Look Like in Practice?
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* Time Wasters */}
                      <div>
                        <p className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          Time Currently Wasted On:
                        </p>
                        <ul className="space-y-1.5 text-indigo-800 dark:text-indigo-300">
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                            <span>Rebooting computers and troubleshooting slowness</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                            <span>Fixing printer and network connectivity issues</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                            <span>Calling break-fix vendors and waiting on hold</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                            <span>Password resets and access issues</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                            <span>Software crashes and "this worked yesterday" problems</span>
                          </li>
                        </ul>
                      </div>

                      {/* Time Reclaimed */}
                      <div>
                        <p className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Time Reclaimed For:
                        </p>
                        <ul className="space-y-1.5 text-indigo-800 dark:text-indigo-300">
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                            <span>Serving customers and generating revenue</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                            <span>Strategic planning and business development</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                            <span>Product/service development and innovation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                            <span>Team training and employee development</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                            <span>Actually doing the work you hired them for</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Key Insight */}
                    <div className="mt-4 pt-4 border-t-2 border-indigo-200 dark:border-indigo-800">
                      <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium">
                        💡 <strong>Key Insight:</strong> This {opportunityCost.reclaimedHours.toLocaleString()} hours represents nearly <strong>{Math.round(opportunityCost.reclaimedHours / 2080)} full-time employee equivalents</strong> (based on 2,080 work hours/year). You're essentially getting that capacity back without hiring anyone.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TOTAL BUSINESS IMPACT SUMMARY */}
              {(downtimeCost || itCostComparison || opportunityCost) && (
                <div id="total-impact" className="border-4 border-emerald-500 dark:border-emerald-600 rounded-xl p-8 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 dark:from-emerald-900/30 dark:via-blue-900/20 dark:to-indigo-900/20 shadow-2xl">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 dark:bg-emerald-700 mb-4">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      Total Business Impact
                    </h4>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                      Complete financial summary of moving to an MSP
                    </p>
                  </div>

                  {/* Grand Total Savings */}
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 rounded-2xl p-8 mb-8 text-white shadow-2xl">
                    <div className="text-center">
                      <p className="text-sm uppercase font-bold tracking-wide mb-2 opacity-90">
                        Total Annual Financial Impact
                      </p>
                      <p className="text-6xl font-bold mb-4">
                        ${(() => {
                          const downtimeReduction = downtimeCost?.annualDowntimeCost || 0;
                          const itSavings = itCostComparison?.fullOutsource.savingsWithAvoided || 0;
                          const productivityGain = opportunityCost?.reclaimedProductivity || 0;
                          const total = downtimeReduction + itSavings + productivityGain;
                          return Math.round(total).toLocaleString();
                        })()}
                      </p>
                      <p className="text-lg opacity-90">
                        Annual value generated by partnering with an MSP
                      </p>
                      <div className="mt-4 pt-4 border-t border-emerald-500">
                        <p className="text-2xl font-semibold">
                          ${(() => {
                            const downtimeReduction = downtimeCost?.annualDowntimeCost || 0;
                            const itSavings = itCostComparison?.fullOutsource.savingsWithAvoided || 0;
                            const productivityGain = opportunityCost?.reclaimedProductivity || 0;
                            const total = downtimeReduction + itSavings + productivityGain;
                            return Math.round(total / 12).toLocaleString();
                          })()}/month
                        </p>
                        <p className="text-sm opacity-75 mt-1">Average monthly impact</p>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown of Impact */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Downtime Reduction */}
                    {downtimeCost && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-red-200 dark:border-red-800 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                              Downtime Avoided
                            </p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                              ${downtimeCost.annualDowntimeCost.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          MSPs reduce downtime by 70-90% through proactive monitoring and rapid response
                        </p>
                      </div>
                    )}

                    {/* IT Cost Savings */}
                    {itCostComparison && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                              IT Cost Savings
                            </p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              ${itCostComparison.fullOutsource.savingsWithAvoided.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          Direct savings from predictable MSP costs vs in-house overhead and avoided risks
                        </p>
                      </div>
                    )}

                    {/* Productivity Gained */}
                    {opportunityCost && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                              Productivity Gained
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              ${opportunityCost.reclaimedProductivity.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          Value of {opportunityCost.reclaimedHours.toLocaleString()} hours/year returned to revenue-generating activities
                        </p>
                      </div>
                    )}
                  </div>

                  {/* How This Benefits Your Business */}
                  <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-300 dark:border-slate-600 mb-6">
                    <h5 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      How This Benefits Your Business
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Financial Benefits */}
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          Financial Benefits
                        </p>
                        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Predictable IT budgeting</strong> - No more surprise break-fix bills or emergency costs</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Lower total cost of ownership</strong> - MSP economies of scale reduce your per-user costs</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Avoid capital expenses</strong> - MSPs handle hardware refresh planning and budgeting</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Risk mitigation</strong> - Avoid costly security incidents and data loss scenarios</span>
                          </li>
                        </ul>
                      </div>

                      {/* Operational Benefits */}
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          Operational Benefits
                        </p>
                        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <span><strong>More uptime</strong> - Proactive monitoring prevents issues before they cause outages</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Staff focus on core business</strong> - Team spends time on revenue, not rebooting computers</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Access to expertise</strong> - Get a whole IT team instead of relying on one person</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <span><strong>Strategic IT planning</strong> - Proactive technology roadmap aligned with business goals</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* ROI Perspective */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-300 dark:border-indigo-700">
                    <h5 className="font-bold text-lg text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      Return on Investment (ROI) Perspective
                    </h5>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          1
                        </div>
                        <div>
                          <p className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
                            Year 1 Break-Even
                          </p>
                          <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                            Based on these savings, your MSP investment typically pays for itself within the first year through reduced downtime, avoided costs, and productivity gains.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          2
                        </div>
                        <div>
                          <p className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
                            Compounding Value
                          </p>
                          <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                            Unlike one-time cost savings, these benefits compound year over year. Better uptime leads to happier customers, more productivity drives more revenue, and freed-up staff time enables business growth.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          3
                        </div>
                        <div>
                          <p className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
                            Risk Reduction = Business Insurance
                          </p>
                          <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                            The avoided costs from security incidents, data loss, and extended outages represent disasters that never happen. This alone can save your business from catastrophic financial impact.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Line */}
                    <div className="mt-6 pt-6 border-t-2 border-indigo-300 dark:border-indigo-700">
                      <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4">
                        <p className="text-center text-base font-bold text-indigo-900 dark:text-indigo-200">
                          💡 Bottom Line: An MSP investment of ${itCostComparison?.msp.totalAnnualCost.toLocaleString() || 'X'}/year generates ${(() => {
                            const downtimeReduction = downtimeCost?.annualDowntimeCost || 0;
                            const itSavings = itCostComparison?.fullOutsource.savingsWithAvoided || 0;
                            const productivityGain = opportunityCost?.reclaimedProductivity || 0;
                            const total = downtimeReduction + itSavings + productivityGain;
                            return Math.round(total).toLocaleString();
                          })()} in annual value - a {(() => {
                            const downtimeReduction = downtimeCost?.annualDowntimeCost || 0;
                            const itSavings = itCostComparison?.fullOutsource.savingsWithAvoided || 0;
                            const productivityGain = opportunityCost?.reclaimedProductivity || 0;
                            const total = downtimeReduction + itSavings + productivityGain;
                            const mspCost = itCostComparison?.msp.totalAnnualCost || 1;
                            const roi = Math.round((total / mspCost) * 100);
                            return roi;
                          })()}% return on investment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Risk Flags */}
        {riskFlags.length > 0 && (
          <div id="risk-flags" className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              Issues Identified
            </h3>
            <div className="space-y-3">
              {riskFlags.map((flag, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    flag.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                    flag.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
                    flag.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {flag.severity === 'critical' ? (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <WarningIcon className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                          flag.severity === 'critical' ? 'bg-red-600 text-white' :
                          flag.severity === 'high' ? 'bg-orange-600 text-white' :
                          flag.severity === 'medium' ? 'bg-yellow-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {flag.severity}
                        </span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {flag.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {flag.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why You Need an MSP Summary */}
        <div id="msp-benefits" className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-xl shadow-md border border-emerald-200 dark:border-emerald-800 p-6 md:p-8 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Why Consider an MSP?
          </h3>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Based on your assessment, here's how a Managed Service Provider (MSP) could benefit your organization:
            </p>
            <ul className="space-y-3 text-slate-700 dark:text-slate-300">
              {categoryScores.security < 70 && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Enhanced Security:</strong> Implement enterprise-grade security measures including EDR, email filtering, and multi-factor authentication to protect against modern threats.</span>
                </li>
              )}
              {categoryScores.backup < 70 && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Reliable Backup & Recovery:</strong> Ensure business continuity with managed cloud backups, regular testing, and documented disaster recovery procedures.</span>
                </li>
              )}
              {categoryScores.infrastructure < 70 && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Modern Infrastructure:</strong> Plan and execute hardware refresh cycles, migrate to cloud solutions, and optimize your IT infrastructure for performance and cost.</span>
                </li>
              )}
              {categoryScores.management < 70 && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Proactive Management:</strong> Move from reactive break-fix to proactive monitoring and maintenance, preventing issues before they impact your business.</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Cost Predictability:</strong> Fixed monthly costs instead of unpredictable break-fix expenses, making IT budgeting easier.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Expert Support:</strong> Access to a team of IT professionals with diverse expertise, rather than relying on a single person or vendor.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Focus on Your Business:</strong> Free up your time and resources to focus on core business activities instead of IT troubleshooting.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 md:p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Ready to Take the Next Step?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
            Our IT specialists can provide a detailed consultation based on your assessment results and help you create a customized IT strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/assessment')}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modify Your Answers
            </button>
            <a
              href="mailto:contact@trueitcost.com"
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              Schedule a Consultation
            </a>
          </div>
        </div>
      </main>

      {/* Sticky Navigation Menu - Desktop */}
      <nav className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 max-w-xs">
          <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-3 px-2">
            Quick Navigation
          </p>
          <div className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: Calculator, indent: false },
              { id: 'risk-score', label: 'Risk Score', icon: Shield, indent: false },
              ...(downtimeCost || itCostComparison || opportunityCost ? [
                { id: 'financial-impact', label: 'Financial Impact', icon: DollarSign, indent: false },
              ] : []),
              ...(downtimeCost ? [{ id: 'downtime', label: 'Downtime Cost', icon: Zap, indent: true }] : []),
              ...(itCostComparison ? [{ id: 'it-costs', label: 'IT Cost Analysis', icon: Users, indent: true }] : []),
              ...(opportunityCost ? [{ id: 'productivity', label: 'Productivity', icon: Target, indent: true }] : []),
              ...(downtimeCost || itCostComparison || opportunityCost ? [
                { id: 'total-impact', label: 'Total Impact', icon: TrendingUp, indent: true },
              ] : []),
              ...(riskFlags.length > 0 ? [{ id: 'risk-flags', label: 'Issues Found', icon: AlertTriangle, indent: false }] : []),
              { id: 'msp-benefits', label: 'Why MSP?', icon: CheckCircle, indent: false },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    item.indent ? 'ml-4' : ''
                  } ${
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Toggle */}
      <button
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        className="lg:hidden fixed bottom-24 right-4 z-50 w-14 h-14 bg-slate-900 dark:bg-slate-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
      >
        {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Navigation Menu */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-bold text-slate-900 dark:text-white">Navigation</p>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: Calculator, indent: false },
                { id: 'risk-score', label: 'Risk Score', icon: Shield, indent: false },
                ...(downtimeCost || itCostComparison || opportunityCost ? [
                  { id: 'financial-impact', label: 'Financial Impact', icon: DollarSign, indent: false },
                ] : []),
                ...(downtimeCost ? [{ id: 'downtime', label: 'Downtime Cost', icon: Zap, indent: true }] : []),
                ...(itCostComparison ? [{ id: 'it-costs', label: 'IT Cost Analysis', icon: Users, indent: true }] : []),
                ...(opportunityCost ? [{ id: 'productivity', label: 'Productivity', icon: Target, indent: true }] : []),
                ...(downtimeCost || itCostComparison || opportunityCost ? [
                  { id: 'total-impact', label: 'Total Impact', icon: TrendingUp, indent: true },
                ] : []),
                ...(riskFlags.length > 0 ? [{ id: 'risk-flags', label: 'Issues Found', icon: AlertTriangle, indent: false }] : []),
                { id: 'msp-benefits', label: 'Why Consider an MSP?', icon: CheckCircle, indent: false },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all flex items-center gap-3 ${
                      item.indent ? 'ml-6' : ''
                    } ${
                      isActive
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Contact CTA - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-30">
        <a
          href="mailto:contact@trueitcost.com?subject=MSP Consultation Request"
          className="group bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105 flex items-center gap-3 max-w-sm"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight">Schedule Consultation</p>
            <p className="text-xs opacity-90">Get expert MSP guidance</p>
          </div>
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}
