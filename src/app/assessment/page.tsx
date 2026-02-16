'use client';

import Link from 'next/link';
import { Calculator, ArrowLeft } from 'lucide-react';
import { useAssessmentStore, WIZARD_STEPS } from '@/store/assessment-store';
import { STEP_INFO } from '@/data/wizard-options';
import { SiteHeader } from '@/components/site-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { BusinessBasicsStep } from '@/components/wizard-steps/BusinessBasicsStep';
import { ITSupportStep } from '@/components/wizard-steps/ITSupportStep';
import { InfrastructureStep } from '@/components/wizard-steps/InfrastructureStep';
import { BackupRecoveryStep } from '@/components/wizard-steps/BackupRecoveryStep';
import { SecurityPostureStep } from '@/components/wizard-steps/SecurityPostureStep';
import { DowntimeSensitivityStep } from '@/components/wizard-steps/DowntimeSensitivityStep';
import { DecisionDriversStep } from '@/components/wizard-steps/DecisionDriversStep';

export default function AssessmentPage() {
  const { currentStep, wizardComplete } = useAssessmentStore();

  const currentStepIndex = WIZARD_STEPS.indexOf(currentStep);
  const currentStepInfo = STEP_INFO.find(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Main Site Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <SiteHeader />
      </div>

      {/* Assessment Progress Header - Fixed below main header */}
      <header className="fixed top-[89px] left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-40 shadow-sm dark:shadow-slate-950/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              <span className="font-bold text-slate-900 dark:text-white">MSP Assessment</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                <span className="hidden sm:inline">Step </span>{currentStepIndex + 1}/{WIZARD_STEPS.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Add padding-top to account for both fixed headers */}
      <main className="max-w-3xl mx-auto px-4 py-12 pt-56">
        {/* Step Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-4">
            <span className="text-2xl font-bold">{currentStepIndex + 1}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {currentStepInfo?.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {currentStepInfo?.description}
          </p>
        </div>

        {/* Wizard Step Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700 p-6 md:p-10">
          <WizardStepContent step={currentStep} />
        </div>

        {/* Step Navigation Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStepIndex
                  ? 'w-8 bg-emerald-500 dark:bg-emerald-400'
                  : index < currentStepIndex
                    ? 'w-2 bg-emerald-300 dark:bg-emerald-600'
                    : 'w-2 bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

// Wizard step content component
function WizardStepContent({ step }: { step: string }) {
  // Render appropriate step component based on current step
  switch (step) {
    case 'business-basics':
      return <BusinessBasicsStep />;
    case 'it-support':
      return <ITSupportStep />;
    case 'infrastructure':
      return <InfrastructureStep />;
    case 'backup-recovery':
      return <BackupRecoveryStep />;
    case 'security':
      return <SecurityPostureStep />;
    case 'downtime':
      return <DowntimeSensitivityStep />;
    case 'decision-drivers':
      return <DecisionDriversStep />;
    default:
      return <PlaceholderStep step={step} />;
  }
}

// Placeholder for steps not yet built
function PlaceholderStep({ step }: { step: string }) {
  const { nextStep, prevStep } = useAssessmentStore();
  const currentStepIndex = WIZARD_STEPS.indexOf(step as typeof WIZARD_STEPS[number]);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

  return (
    <div className="space-y-8">
      <div className="text-center py-16 text-slate-500 dark:text-slate-400">
        <div className="inline-block bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border-2 border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mb-3">Current Step</p>
          <code className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-base font-mono text-slate-700 dark:text-slate-300 inline-block">{step}</code>
          <p className="mt-6 text-sm text-slate-400 dark:text-slate-500">Step component will be built next</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={prevStep}
          disabled={isFirstStep}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            isFirstStep
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-sm'
          }`}
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 dark:hover:shadow-emerald-900/50 transition-all transform hover:scale-105"
        >
          {isLastStep ? 'See Results →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
