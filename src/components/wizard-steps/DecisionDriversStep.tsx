'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/assessment-store';
import { Target, Clock } from 'lucide-react';

export function DecisionDriversStep() {
  const router = useRouter();
  const { wizardAnswers, updateWizardAnswers, prevStep, completeWizard } = useAssessmentStore();

  const [decisionDrivers, setDecisionDrivers] = useState<import('@/types').DecisionDriver[]>(
    wizardAnswers.decisionDrivers || []
  );
  const [timeline, setTimeline] = useState<import('@/types').Timeline | null>(
    wizardAnswers.timeline || null
  );

  const toggleDecisionDriver = (driver: import('@/types').DecisionDriver) => {
    setDecisionDrivers((prev) =>
      prev.includes(driver) ? prev.filter((d) => d !== driver) : [...prev, driver]
    );
  };

  const handleContinue = () => {
    // Save answers to store
    updateWizardAnswers({
      decisionDrivers: decisionDrivers,
      timeline: timeline,
    });

    // Mark wizard as complete and generate recommendations
    completeWizard();

    // Navigate to lead capture page
    router.push('/lead-capture');
  };

  const isValid = () => {
    // Require at least one decision driver and timeline
    return decisionDrivers.length > 0 && timeline;
  };

  const driverOptions: Array<{ label: string; value: import('@/types').DecisionDriver }> = [
    { label: 'Replace hardware', value: 'replace-hardware' },
    { label: 'Hire or outsource IT', value: 'hire-outsource' },
    { label: 'Move to cloud', value: 'move-to-cloud' },
    { label: 'Improve security', value: 'improve-security' },
    { label: 'Reduce costs', value: 'reduce-costs' },
    { label: 'Just exploring', value: 'just-exploring' },
  ];

  const timelineOptions: Array<{ label: string; value: import('@/types').Timeline }> = [
    { label: 'Urgent', value: 'urgent' },
    { label: 'This quarter', value: 'this-quarter' },
    { label: 'This year', value: 'this-year' },
    { label: 'Just planning', value: 'just-planning' },
  ];

  return (
    <div className="space-y-8">
      {/* IT Decisions (Multi-select) */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          What IT decisions are you currently facing?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Routes calculators • Select all that apply
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {driverOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleDecisionDriver(option.value)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                decisionDrivers.includes(option.value)
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {decisionDrivers.length > 0 && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            {decisionDrivers.length} decision{decisionDrivers.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          Is there a timeline or budget pressure?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Urgency signal
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {timelineOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeline(option.value)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                timeline === option.value
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
          See Results →
        </button>
      </div>
    </div>
  );
}
