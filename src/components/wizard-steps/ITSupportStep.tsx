'use client';

import { useState } from 'react';
import { useAssessmentStore } from '@/store/assessment-store';
import { Headphones, Users, DollarSign, ThumbsUp } from 'lucide-react';

export function ITSupportStep() {
  const { wizardAnswers, updateWizardAnswers, nextStep, prevStep } = useAssessmentStore();

  const [itManagement, setItManagement] = useState<import('@/types').ITManagement | null>(wizardAnswers.itManagement || null);
  const [itStaffCount, setItStaffCount] = useState(wizardAnswers.itStaffCount?.toString() || '');
  const [monthlyITSpend, setMonthlyITSpend] = useState(wizardAnswers.monthlyITSpend?.toString() || '');
  const [itSatisfaction, setItSatisfaction] = useState<import('@/types').Satisfaction | null>(wizardAnswers.itSatisfaction || null);

  const handleContinue = () => {
    // Save answers to store
    updateWizardAnswers({
      itManagement: itManagement,
      itStaffCount: itStaffCount ? parseInt(itStaffCount) : null,
      monthlyITSpend: monthlyITSpend ? parseFloat(monthlyITSpend) : null,
      itSatisfaction: itSatisfaction,
    });
    nextStep();
  };

  // Validation logic
  const isValid = () => {
    if (!itManagement) return false;
    if (!itSatisfaction) return false;

    // If in-house or both, IT staff count is required
    if ((itManagement === 'in-house' || itManagement === 'both') && !itStaffCount) {
      return false;
    }

    // If outsourced or both, monthly spend is required
    if ((itManagement === 'outsourced' || itManagement === 'both') && !monthlyITSpend) {
      return false;
    }

    return true;
  };

  const managementOptions: Array<{ label: string; value: import('@/types').ITManagement }> = [
    { label: 'In-house', value: 'in-house' },
    { label: 'Outsourced', value: 'outsourced' },
    { label: 'Both', value: 'both' },
    { label: 'Break-fix', value: 'break-fix' },
    { label: 'None', value: 'none' },
  ];
  const satisfactionOptions: Array<{ label: string; value: import('@/types').Satisfaction }> = [
    { label: 'Yes', value: 'yes' },
    { label: 'Somewhat', value: 'somewhat' },
    { label: 'No', value: 'no' },
  ];

  const showStaffCount = itManagement === 'in-house' || itManagement === 'both';
  const showMonthlySpend = itManagement === 'outsourced' || itManagement === 'both';

  return (
    <div className="space-y-8">
      {/* IT Management Type */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Headphones className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          How is your IT currently managed?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Routes to staffing calculator
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {managementOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setItManagement(option.value);
                // Reset conditional fields when changing management type
                if (option.value !== 'in-house' && option.value !== 'both') {
                  setItStaffCount('');
                }
                if (option.value !== 'outsourced' && option.value !== 'both') {
                  setMonthlyITSpend('');
                }
              }}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                itManagement === option.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional: IT Staff Count (if in-house or both) */}
      {showStaffCount && (
        <div className="space-y-3 animate-fadeIn">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            How many IT staff?
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cost baseline
          </p>
          <input
            type="number"
            min="0"
            value={itStaffCount}
            onChange={(e) => setItStaffCount(e.target.value)}
            placeholder="e.g., 2"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/50 outline-none transition-all"
          />
        </div>
      )}

      {/* Conditional: Monthly IT Spend (if outsourced or both) */}
      {showMonthlySpend && (
        <div className="space-y-3 animate-fadeIn">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            Approximate monthly spend?
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cost baseline
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
            <input
              type="number"
              min="0"
              step="100"
              value={monthlyITSpend}
              onChange={(e) => setMonthlyITSpend(e.target.value)}
              placeholder="e.g., 3500"
              className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/50 outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* IT Satisfaction */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <ThumbsUp className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          Are you satisfied with your current IT support?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Flags pain, opens recommendation
        </p>
        <div className="grid grid-cols-3 gap-3">
          {satisfactionOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setItSatisfaction(option.value)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                itSatisfaction === option.value
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
