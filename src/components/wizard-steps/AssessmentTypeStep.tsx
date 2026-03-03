'use client';

import { useAssessmentStore } from '@/store/assessment-store';
import { ASSESSMENT_TYPE_OPTIONS } from '@/data/wizard-options';
import type { AssessmentType } from '@/types';

export function AssessmentTypeStep() {
  const { wizardAnswers, updateWizardAnswers, nextStep } = useAssessmentStore();
  const currentIndex = 0; // First step
  const isFirstStep = true;
  const isLastStep = false;

  const handleSelect = (value: AssessmentType) => {
    updateWizardAnswers({ assessmentType: value });
  };

  const handleContinue = () => {
    if (wizardAnswers.assessmentType) {
      nextStep();
    }
  };

  return (
    <div className="space-y-8">
      {/* Assessment Type Selection Cards */}
      <div className="grid gap-4">
        {ASSESSMENT_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
              wizardAnswers.assessmentType === option.value
                ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-slate-900/50'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Radio indicator */}
              <div className="mt-1 flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    wizardAnswers.assessmentType === option.value
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {wizardAnswers.assessmentType === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {option.label}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {option.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
        <div>
          {/* No back button on first step */}
        </div>
        <button
          onClick={handleContinue}
          disabled={!wizardAnswers.assessmentType}
          className={`px-8 py-3 rounded-xl font-semibold transition-all transform ${
            wizardAnswers.assessmentType
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
