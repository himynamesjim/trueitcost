'use client';

import { useState } from 'react';
import { useAssessmentStore } from '@/store/assessment-store';
import { Server, HardDrive, Clock, AlertTriangle } from 'lucide-react';

export function InfrastructureStep() {
  const { wizardAnswers, updateWizardAnswers, nextStep, prevStep } = useAssessmentStore();

  const [infrastructureLocation, setInfrastructureLocation] = useState(
    wizardAnswers.infrastructureLocation || ''
  );
  const [hasPhysicalServers, setHasPhysicalServers] = useState(
    wizardAnswers.hasPhysicalServers?.toString() || ''
  );
  const [oldestHardwareAge, setOldestHardwareAge] = useState(
    wizardAnswers.oldestHardwareAge || ''
  );
  const [hardwareConcerns, setHardwareConcerns] = useState(
    wizardAnswers.hardwareConcerns?.toString() || ''
  );
  const [concernedHardwareTypes, setConcernedHardwareTypes] = useState<string[]>(
    wizardAnswers.concernedHardwareTypes || []
  );

  const toggleHardwareType = (type: string) => {
    setConcernedHardwareTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleContinue = () => {
    // Save answers to store
    updateWizardAnswers({
      infrastructureLocation: infrastructureLocation || null,
      hasPhysicalServers: hasPhysicalServers === 'true',
      oldestHardwareAge: oldestHardwareAge || null,
      hardwareConcerns: hardwareConcerns === 'true',
      concernedHardwareTypes: hardwareConcerns === 'true' ? concernedHardwareTypes : [],
    });
    nextStep();
  };

  const isValid = () => {
    const baseValid =
      infrastructureLocation &&
      hasPhysicalServers &&
      oldestHardwareAge &&
      hardwareConcerns;

    // If they have hardware concerns, they must select at least one type
    if (hardwareConcerns === 'true') {
      return baseValid && concernedHardwareTypes.length > 0;
    }

    return baseValid;
  };

  const locationOptions = ['On-prem', 'Cloud', 'Hybrid', 'Not sure'];
  const yesNoOptions = ['Yes', 'No'];
  const hardwareAgeOptions = ['Under 3 yrs', '3-5 yrs', '5-7 yrs', '7+ yrs', 'Not sure'];
  const hardwareTypeOptions = [
    'Servers',
    'Switches',
    'Routers',
    'Wireless Hardware',
    'Computers',
    'Mobile Devices',
    'Other',
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
              key={option}
              onClick={() => setInfrastructureLocation(option)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                infrastructureLocation === option
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option}
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
        <div className="grid grid-cols-2 gap-3">
          {yesNoOptions.map((option) => (
            <button
              key={option}
              onClick={() => setHasPhysicalServers(option === 'Yes' ? 'true' : 'false')}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                hasPhysicalServers === (option === 'Yes' ? 'true' : 'false')
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option}
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
              key={option}
              onClick={() => setOldestHardwareAge(option)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                oldestHardwareAge === option
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option}
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
          {yesNoOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                setHardwareConcerns(option === 'Yes' ? 'true' : 'false');
                // Clear hardware types if they select "No"
                if (option === 'No') {
                  setConcernedHardwareTypes([]);
                }
              }}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                hardwareConcerns === (option === 'Yes' ? 'true' : 'false')
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional: Hardware Types (if they have concerns) */}
      {hardwareConcerns === 'true' && (
        <div className="space-y-3 animate-fadeIn">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Which types of hardware are you concerned about?
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select all that apply
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {hardwareTypeOptions.map((type) => (
              <button
                key={type}
                onClick={() => toggleHardwareType(type)}
                className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                  concernedHardwareTypes.includes(type)
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {concernedHardwareTypes.length > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              {concernedHardwareTypes.length} type{concernedHardwareTypes.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

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
