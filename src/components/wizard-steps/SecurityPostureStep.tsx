'use client';

import { useState } from 'react';
import { useAssessmentStore } from '@/store/assessment-store';
import { Shield, Mail, Lock, Search } from 'lucide-react';

export function SecurityPostureStep() {
  const { wizardAnswers, updateWizardAnswers, nextStep, prevStep } = useAssessmentStore();

  const [endpointProtection, setEndpointProtection] = useState(
    wizardAnswers.hasEndpointProtection || ''
  );
  const [emailSecurity, setEmailSecurity] = useState(
    wizardAnswers.hasEmailSecurity?.toString() || ''
  );
  const [requiresMFA, setRequiresMFA] = useState(
    wizardAnswers.requiresMFA?.toString() || ''
  );
  const [lastSecurityAssessment, setLastSecurityAssessment] = useState(
    wizardAnswers.lastSecurityAssessment || ''
  );

  const handleContinue = () => {
    // Save answers to store
    updateWizardAnswers({
      hasEndpointProtection: endpointProtection || null,
      hasEmailSecurity: emailSecurity === 'true' || emailSecurity === 'not-sure' ? emailSecurity : emailSecurity === 'false' ? 'no' : null,
      requiresMFA: requiresMFA === 'true' || requiresMFA === 'not-sure' ? requiresMFA : requiresMFA === 'false' ? 'no' : null,
      lastSecurityAssessment: lastSecurityAssessment || null,
    });
    nextStep();
  };

  const isValid = () => {
    return (
      endpointProtection &&
      emailSecurity &&
      requiresMFA &&
      lastSecurityAssessment
    );
  };

  const endpointOptions = ['Yes', 'Partial', 'No', 'Not sure'];
  const yesNoOptions = ['Yes', 'No', 'Not sure'];
  const assessmentOptions = ['Within 1 yr', '1-2 yrs', 'Never', 'Not sure'];

  return (
    <div className="space-y-8">
      {/* Endpoint Protection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          Do you have endpoint protection (antivirus/EDR) on all devices?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gap identification
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {endpointOptions.map((option) => (
            <button
              key={option}
              onClick={() => setEndpointProtection(option)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                endpointProtection === option
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Email Security */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          Do you have email security filtering?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Phishing risk
        </p>
        <div className="grid grid-cols-3 gap-3">
          {yesNoOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                if (option === 'Yes') setEmailSecurity('true');
                else if (option === 'No') setEmailSecurity('false');
                else setEmailSecurity('not-sure');
              }}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                (option === 'Yes' && emailSecurity === 'true') ||
                (option === 'No' && emailSecurity === 'false') ||
                (option === 'Not sure' && emailSecurity === 'not-sure')
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* MFA Requirement */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          Do you require MFA for critical systems?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Basic hygiene check
        </p>
        <div className="grid grid-cols-3 gap-3">
          {yesNoOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                if (option === 'Yes') setRequiresMFA('true');
                else if (option === 'No') setRequiresMFA('false');
                else setRequiresMFA('not-sure');
              }}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                (option === 'Yes' && requiresMFA === 'true') ||
                (option === 'No' && requiresMFA === 'false') ||
                (option === 'Not sure' && requiresMFA === 'not-sure')
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Last Security Assessment */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          When was your last security assessment?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Exposure flag
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {assessmentOptions.map((option) => (
            <button
              key={option}
              onClick={() => setLastSecurityAssessment(option)}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                lastSecurityAssessment === option
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
