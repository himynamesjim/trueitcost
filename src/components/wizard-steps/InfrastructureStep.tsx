'use client';

import { useState } from 'react';
import { useAssessmentStore } from '@/store/assessment-store';
import { Server, HardDrive, Clock, AlertTriangle } from 'lucide-react';

export function InfrastructureStep() {
  const { wizardAnswers, updateWizardAnswers, nextStep, prevStep } = useAssessmentStore();

  const [infrastructureLocation, setInfrastructureLocation] = useState<import('@/types').InfrastructureLocation | null>(
    wizardAnswers.infrastructureLocation || null
  );
  const [hasPhysicalServers, setHasPhysicalServers] = useState<import('@/types').YesNoNotSure | null>(
    wizardAnswers.hasPhysicalServers || null
  );
  const [oldestHardwareAge, setOldestHardwareAge] = useState<import('@/types').HardwareAge | null>(
    wizardAnswers.oldestHardwareAge || null
  );
  const [hardwareConcerns, setHardwareConcerns] = useState<boolean | null>(
    wizardAnswers.hardwareConcerns
  );

  const handleContinue = () => {
    // Save answers to store
    updateWizardAnswers({
      infrastructureLocation: infrastructureLocation,
      hasPhysicalServers: hasPhysicalServers,
      oldestHardwareAge: oldestHardwareAge,
      hardwareConcerns: hardwareConcerns,
    });
    nextStep();
  };

  const isValid = () => {
    return (
      infrastructureLocation &&
      hasPhysicalServers &&
      oldestHardwareAge &&
      hardwareConcerns !== null
    );
  };

  const locationOptions: Array<{ label: string; value: import('@/types').InfrastructureLocation }> = [
    { label: 'On-prem', value: 'on-prem' },
    { label: 'Cloud', value: 'cloud' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Not sure', value: 'not-sure' },
  ];
  const yesNoOptions: Array<{ label: string; value: import('@/types').YesNoNotSure }> = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
    { label: 'Not sure', value: 'not-sure' },
  ];
  const hardwareAgeOptions: Array<{ label: string; value: import('@/types').HardwareAge }> = [
    { label: 'Under 3 yrs', value: 'under-3' },
    { label: '3-5 yrs', value: '3-5' },
    { label: '5-7 yrs', value: '5-7' },
    { label: '7+ yrs', value: '7-plus' },
    { label: 'Not sure', value: 'not-sure' },
  ];
  const hardwareConcernOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  return (
    <div className="space-y-8">
      {/* Infrastructure Location */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Server className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          Where do your critical systems live?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Routes to cloud calculator
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {locationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setInfrastructureLocation(option.value)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                infrastructureLocation === option.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Physical Servers */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <HardDrive className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          Do you have physical servers in your office or data center?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Hardware lifecycle trigger
        </p>
        <div className="grid grid-cols-3 gap-3">
          {yesNoOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setHasPhysicalServers(option.value)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                hasPhysicalServers === option.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hardware Age */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          How old is your oldest critical hardware?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Risk multiplier
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {hardwareAgeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setOldestHardwareAge(option.value)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                oldestHardwareAge === option.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hardware Concerns */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <AlertTriangle className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          Any hardware you&apos;re currently worried about?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pain point flag
        </p>
        <div className="grid grid-cols-2 gap-3">
          {hardwareConcernOptions.map((option) => (
            <button
              key={option.value.toString()}
              onClick={() => setHardwareConcerns(option.value)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                hardwareConcerns === option.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>


      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={prevStep}
          className="px-6 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-sm transition-all"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!isValid()}
          className={`px-8 py-3 rounded-xl font-semibold transition-all transform ${
            isValid()
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 dark:hover:shadow-emerald-900/50 hover:scale-105'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
