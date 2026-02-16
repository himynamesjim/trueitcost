'use client';

import { useState } from 'react';
import { useAssessmentStore } from '@/store/assessment-store';
import { AlertCircle, Timer } from 'lucide-react';

export function DowntimeSensitivityStep() {
  const { wizardAnswers, updateWizardAnswers, nextStep, prevStep } = useAssessmentStore();

  const [downtimeImpact, setDowntimeImpact] = useState(
    wizardAnswers.downtimeImpact || ''
  );
  const [downtimeTolerance, setDowntimeTolerance] = useState(
    wizardAnswers.downtimeTolerance || ''
  );

  const handleContinue = () => {
    // Save answers to store
    updateWizardAnswers({
      downtimeImpact: downtimeImpact || null,
      downtimeTolerance: downtimeTolerance || null,
    });
    nextStep();
  };

  const isValid = () => {
    return downtimeImpact && downtimeTolerance;
  };

  const impactOptions = ['Business stops', 'Major disruption', 'Moderate', 'Minimal'];
  const toleranceOptions = ['Zero', 'A few hours', 'A day', 'Flexible'];

  return (
    <div className="space-y-8">
      {/* Downtime Impact */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <AlertCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          If all systems went down for a full business day, what happens?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calculates hourly cost
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {impactOptions.map((option) => (
            <button
              key={option}
              onClick={() => setDowntimeImpact(option)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                downtimeImpact === option
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Downtime Tolerance */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Timer className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          What&apos;s your tolerance for unplanned downtime?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Risk appetite
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {toleranceOptions.map((option) => (
            <button
              key={option}
              onClick={() => setDowntimeTolerance(option)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                downtimeTolerance === option
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option}
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
