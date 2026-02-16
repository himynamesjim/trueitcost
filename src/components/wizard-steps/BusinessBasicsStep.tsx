'use client';

import { useState } from 'react';
import { useAssessmentStore } from '@/store/assessment-store';
import { Building2, Users, DollarSign } from 'lucide-react';

export function BusinessBasicsStep() {
  const { wizardAnswers, updateWizardAnswers, nextStep, prevStep } = useAssessmentStore();

  const [employeeCount, setEmployeeCount] = useState(wizardAnswers.employeeCount?.toString() || '');
  const [industry, setIndustry] = useState(wizardAnswers.industry || '');
  const [annualRevenue, setAnnualRevenue] = useState(wizardAnswers.annualRevenue?.toString() || '');

  const handleContinue = () => {
    // Save answers to store
    updateWizardAnswers({
      employeeCount: employeeCount ? parseInt(employeeCount) : null,
      industry: industry || null,
      annualRevenue: annualRevenue ? parseFloat(annualRevenue) : null,
    });
    nextStep();
  };

  const isValid = employeeCount.trim() !== '' && industry.trim() !== '';

  const industries = [
    'Professional Services',
    'Healthcare',
    'Financial Services',
    'Manufacturing',
    'Retail',
    'Technology',
    'Education',
    'Non-Profit',
    'Real Estate',
    'Legal',
    'Other',
  ];

  return (
    <div className="space-y-8">
      {/* Employee Count */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          How many employees do you have?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Scales IT costs, productivity loss
        </p>
        <input
          type="number"
          min="1"
          value={employeeCount}
          onChange={(e) => setEmployeeCount(e.target.value)}
          placeholder="e.g., 25"
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/50 outline-none transition-all"
        />
      </div>

      {/* Industry */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          What industry are you in?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Affects compliance needs, downtime severity
        </p>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/50 outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="">Select your industry...</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {/* Annual Revenue (Optional) */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          Approximate annual revenue? <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calculates true downtime cost
        </p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
          <input
            type="number"
            min="0"
            step="100000"
            value={annualRevenue}
            onChange={(e) => setAnnualRevenue(e.target.value)}
            placeholder="e.g., 2500000"
            className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/50 outline-none transition-all"
          />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          This helps us calculate the true cost of downtime based on your revenue
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={prevStep}
          disabled
          className="px-6 py-3 rounded-xl font-medium text-slate-300 dark:text-slate-600 cursor-not-allowed transition-all"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`px-8 py-3 rounded-xl font-semibold transition-all transform ${
            isValid
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
