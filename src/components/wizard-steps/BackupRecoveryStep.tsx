'use client';

import { useState } from 'react';
import { useAssessmentStore } from '@/store/assessment-store';
import { Database, Clock, RefreshCw, FileText } from 'lucide-react';

export function BackupRecoveryStep() {
  const { wizardAnswers, updateWizardAnswers, nextStep, prevStep } = useAssessmentStore();

  const [backupSolution, setBackupSolution] = useState<import('@/types').BackupSolution | null>(
    wizardAnswers.backupSolution || null
  );
  const [backupRetention, setBackupRetention] = useState<import('@/types').RetentionPeriod | null>(
    wizardAnswers.backupRetention || null
  );
  const [testedRestore, setTestedRestore] = useState<import('@/types').YesNoNotSure | null>(
    wizardAnswers.testedRestoreRecently || null
  );
  const [hasDisasterRecoveryPlan, setHasDisasterRecoveryPlan] = useState<import('@/types').YesNoNotSure | null>(
    wizardAnswers.hasDisasterRecoveryPlan || null
  );

  const hasBackups = backupSolution === 'yes-managed' || backupSolution === 'yes-self';

  const handleContinue = () => {
    // Save answers to store
    updateWizardAnswers({
      backupSolution: backupSolution,
      backupRetention: hasBackups ? backupRetention : null,
      testedRestoreRecently: hasBackups ? testedRestore : null,
      hasDisasterRecoveryPlan: hasBackups ? hasDisasterRecoveryPlan : null,
    });
    nextStep();
  };

  const isValid = () => {
    // Always require backup solution selection
    if (!backupSolution) return false;

    // If they have backups, require the follow-up questions
    if (hasBackups) {
      return backupRetention && testedRestore && hasDisasterRecoveryPlan;
    }

    // If they don't have backups (No or Not sure), they can proceed
    return true;
  };

  const backupSolutionOptions: Array<{ label: string; value: import('@/types').BackupSolution }> = [
    { label: 'Yes-managed', value: 'yes-managed' },
    { label: 'Yes-self', value: 'yes-self' },
    { label: 'Not sure', value: 'not-sure' },
    { label: 'No', value: 'no' },
  ];
  const retentionOptions: Array<{ label: string; value: import('@/types').RetentionPeriod }> = [
    { label: 'Under 30 days', value: 'under-30' },
    { label: '30-90', value: '30-90' },
    { label: '90+', value: '90-plus' },
    { label: 'Not sure', value: 'not-sure' },
  ];
  const yesNoOptions: Array<{ label: string; value: import('@/types').YesNoNotSure }> = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
    { label: 'Not sure', value: 'not-sure' },
  ];
  const yesNoOnlyOptions: Array<{ label: string; value: import('@/types').YesNoNotSure }> = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];

  return (
    <div className="space-y-8">
      {/* Backup Solution */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          Do you have a backup solution in place?
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Risk flag
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {backupSolutionOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setBackupSolution(option.value);
                // Clear follow-up answers if they switch to No or Not sure
                if (option.value === 'no' || option.value === 'not-sure') {
                  setBackupRetention(null);
                  setTestedRestore(null);
                  setHasDisasterRecoveryPlan(null);
                }
              }}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                backupSolution === option.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional: Backup Follow-up Questions (only if they have backups) */}
      {hasBackups && (
        <>
          {/* Backup Retention */}
          <div className="space-y-3 animate-fadeIn">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Do you know your backup retention period?
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Compliance + recovery risk
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {retentionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBackupRetention(option.value)}
                  className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                    backupRetention === option.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tested Restore */}
          <div className="space-y-3 animate-fadeIn">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Have you tested a restore in the last 12 months?
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Huge risk indicator
            </p>
            <div className="grid grid-cols-3 gap-3">
              {yesNoOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTestedRestore(option.value)}
                  className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                    testedRestore === option.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Disaster Recovery Plan */}
          <div className="space-y-3 animate-fadeIn">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Do you have a documented disaster recovery plan?
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Maturity signal
            </p>
            <div className="grid grid-cols-2 gap-3">
              {yesNoOnlyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setHasDisasterRecoveryPlan(option.value)}
                  className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                    hasDisasterRecoveryPlan === option.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
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
