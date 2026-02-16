'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const FIELDS = [
  { id: 'room_type', label: 'What type of space are you outfitting?', type: 'select', options: ['Large Conference Room (12+ people)', 'Medium Conference Room (6-12)', 'Huddle Room (2-5)', 'Executive Office', 'Training Room / All-Hands', 'Open Collaboration Area'] },
  { id: 'dimensions', label: 'Room dimensions (L × W in feet)', type: 'text', placeholder: 'e.g. 20x15' },
  { id: 'capacity', label: 'How many people will typically use this room?', type: 'select', options: ['2-4 people', '5-8 people', '9-12 people', '13-20 people', '20+ people'] },
  { id: 'platform', label: 'Which video conferencing platform?', type: 'select', options: ['Microsoft Teams', 'Zoom', 'Google Meet', 'Cisco Webex', 'Not sure / Open to recommendations', 'Multiple platforms'] },
  { id: 'display_pref', label: 'Display preference', type: 'select', options: ['Single large display', 'Dual displays', 'Interactive touchscreen / whiteboard', 'LED video wall', 'No preference / Recommend for me'] },
  { id: 'audio_needs', label: 'Audio requirements', type: 'multi', options: ['Ceiling microphones', 'Table microphones', 'Soundbar (all-in-one)', 'Separate speakers', 'Not sure — recommend for me'] },
  { id: 'camera_needs', label: 'Camera features needed', type: 'multi', options: ['Auto-framing / speaker tracking', 'Panoramic view', 'Whiteboard capture', 'Content camera', 'Basic fixed camera is fine'] },
  { id: 'existing_equipment', label: 'Existing equipment to keep?', type: 'textarea', placeholder: 'e.g. We have a 65 inch TV, a Logitech webcam...' },
  { id: 'room_features', label: 'Room characteristics', type: 'multi', options: ['Glass walls', 'Hard floors', 'High ceilings (12ft+)', 'Drop/acoustic tile ceiling', 'Windows behind display wall', 'Carpeted floors', 'Standard drywall'] },
  { id: 'budget', label: 'Budget range (equipment only)', type: 'select', options: ['Under $3,000', '$3,000 - $6,000', '$6,000 - $12,000', '$12,000 - $25,000', '$25,000 - $50,000', '$50,000+', 'Not sure yet'] },
  { id: 'notes', label: 'Anything else?', type: 'textarea', placeholder: 'Timeline, challenges, brand preferences...' }
];

interface FormData {
  [key: string]: string | string[];
}

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}

function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected.includes(opt)
              ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-300'
              : 'bg-slate-700/30 border-2 border-slate-600/50 text-slate-400 hover:border-slate-500'
          }`}
        >
          {selected.includes(opt) && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function CollaborationPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [showResults, setShowResults] = useState(false);

  const field = FIELDS[step];
  const progress = ((step + 1) / FIELDS.length) * 100;

  const updateField = (id: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const nextStep = () => {
    if (step < FIELDS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <SiteHeader />

        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link
            href="/ai-solutions"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to AI Solutions
          </Link>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Your Collaboration Room Design
              </h1>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Coming Soon: AI-Powered Recommendations</h2>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This tool will analyze your requirements and generate a complete conference room design with specific product recommendations, pricing, and installation guidance.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Your Specifications:</h3>
              {Object.entries(formData).map(([key, value]) => {
                const fieldInfo = FIELDS.find(f => f.id === key);
                return (
                  <div key={key} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {fieldInfo?.label}
                    </div>
                    <div className="text-slate-900 dark:text-white">
                      {Array.isArray(value) ? value.join(', ') : value || 'Not specified'}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => { setShowResults(false); setStep(0); setFormData({}); }}
              className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/ai-solutions"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to AI Solutions
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            🎥 Collaboration & Video Room Design
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Design the perfect conference room with AI-powered recommendations
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Step {step + 1} of {FIELDS.length}
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
            {field.label}
          </h2>

          {field.type === 'select' && (
            <div className="space-y-3">
              {field.options?.map(option => (
                <button
                  key={option}
                  onClick={() => updateField(field.id, option)}
                  className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                    formData[field.id] === option
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <span className="text-slate-900 dark:text-white font-medium">{option}</span>
                </button>
              ))}
            </div>
          )}

          {field.type === 'multi' && field.options && (
            <MultiSelect
              options={field.options}
              selected={(formData[field.id] as string[]) || []}
              onChange={(value) => updateField(field.id, value)}
            />
          )}

          {field.type === 'text' && (
            <input
              type="text"
              value={(formData[field.id] as string) || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-6 py-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              value={(formData[field.id] as string) || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="w-full px-6 py-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none"
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                step === 0
                  ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
            >
              {step === FIELDS.length - 1 ? (
                <>
                  <Sparkles className="inline h-4 w-4 mr-2" />
                  Generate Design
                </>
              ) : (
                'Next →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
