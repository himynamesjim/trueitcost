'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, Trash2, MessageSquare, Send, ArrowRight, Sparkles, Check } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { PaywallModal } from '@/components/paywall-modal';
import { useFeatureAccess } from '@/hooks/use-feature-access';

interface SavedAssessment {
  id: string;
  title: string;
  date: string;
  formData: any;
}

// Assessment wizard fields configuration
const ASSESSMENT_FIELDS = {
  // Step 0: Assessment Type
  assessmentType: [
    {
      id: 'assessment_type',
      label: 'What brings you here today?',
      type: 'card-select',
      options: [
        { label: 'Evaluate My Current MSP', description: 'I currently have an MSP and want to assess their performance, pricing, and value' },
        { label: 'Explore if an MSP is Right for Me', description: 'I\'m considering whether partnering with an MSP would benefit my business' },
        { label: 'Compare MSP Quotes', description: 'I have quotes from multiple MSPs and need help comparing them to choose the best option' }
      ]
    }
  ],
  // Questions for evaluating current MSP
  evaluateCurrent: [
    { id: 'company_size', label: 'How many employees?', type: 'select', options: ['1-10', '11-25', '26-50', '51-100', '101-250', '250+'] },
    { id: 'current_msp_name', label: 'Who is your current MSP?', type: 'text', placeholder: 'MSP company name' },
    { id: 'time_with_msp', label: 'How long with current MSP?', type: 'select', options: ['Less than 6 months', '6-12 months', '1-2 years', '2-3 years', '3-5 years', '5+ years'] },
    { id: 'monthly_cost', label: 'Approximate monthly MSP cost?', type: 'select', options: ['Under $2,000', '$2,000-$5,000', '$5,000-$10,000', '$10,000-$20,000', '$20,000+', 'Not sure'] },
    { id: 'satisfaction', label: 'Overall satisfaction with current MSP?', type: 'select', options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'] },
    { id: 'pain_points', label: 'Main pain points with current MSP?', type: 'multi', options: [
      { label: 'Slow response times', description: 'Takes too long to respond to tickets' },
      { label: 'Poor communication', description: 'Hard to reach or unresponsive' },
      { label: 'High costs', description: 'Expensive for the value provided' },
      { label: 'Lack of expertise', description: 'Doesn\'t understand our needs' },
      { label: 'Frequent issues', description: 'Systems down or problems recurring' },
      { label: 'No strategic guidance', description: 'Reactive only, no planning' },
      { label: 'Contract inflexibility', description: 'Locked in with no options' }
    ] },
    { id: 'services_included', label: 'What services are included?', type: 'multi', options: [
      { label: 'Help desk support', description: 'User support and troubleshooting' },
      { label: 'Monitoring & maintenance', description: 'Proactive system monitoring' },
      { label: 'Backup & disaster recovery', description: 'Data backup and recovery' },
      { label: 'Cybersecurity', description: 'Security tools and monitoring' },
      { label: 'Cloud management', description: 'M365, AWS, Azure management' },
      { label: 'Hardware procurement', description: 'IT equipment purchasing' },
      { label: 'Strategic IT planning', description: 'vCIO or technology roadmap' }
    ] },
    { id: 'evaluation_reason', label: 'Why evaluate your MSP now?', type: 'select', options: ['Contract renewal coming up', 'Recent poor experience', 'Ongoing frustrations', 'Business growth/changes', 'Cost concerns', 'Just doing due diligence'] }
  ],
  // Questions for exploring MSP
  exploreMSP: [
    { id: 'company_size', label: 'How many employees?', type: 'select', options: ['1-10', '11-25', '26-50', '51-100', '101-250', '250+'] },
    { id: 'current_it_situation', label: 'How is IT managed today?', type: 'select', options: ['In-house IT staff', 'Break-fix/reactive support', 'Mix of internal and contractors', 'No formal IT support', 'Not sure'] },
    { id: 'it_budget', label: 'Approximate annual IT spend?', type: 'select', options: ['Under $25k', '$25k-$50k', '$50k-$100k', '$100k-$250k', '$250k+', 'Not sure'] },
    { id: 'main_challenges', label: 'Current IT challenges?', type: 'multi', options: [
      { label: 'No dedicated IT person', description: 'IT falls on non-IT staff' },
      { label: 'Downtime & outages', description: 'Systems go down frequently' },
      { label: 'Security concerns', description: 'Worried about cyberattacks' },
      { label: 'Outdated technology', description: 'Old equipment and software' },
      { label: 'Slow response to issues', description: 'Problems take too long to fix' },
      { label: 'No IT strategy', description: 'No roadmap or planning' },
      { label: 'Cost unpredictability', description: 'Can\'t budget IT expenses' }
    ] },
    { id: 'why_considering_msp', label: 'Why consider an MSP?', type: 'select', options: ['Growing too fast for current IT', 'IT person leaving/retiring', 'Too expensive to hire full-time IT', 'Want better security & reliability', 'Need strategic IT guidance', 'Just exploring options'] },
    { id: 'desired_services', label: 'What services interest you?', type: 'multi', options: [
      { label: '24/7 help desk', description: 'Round-the-clock user support' },
      { label: 'Proactive monitoring', description: 'Prevent issues before they happen' },
      { label: 'Cybersecurity', description: 'Protection from threats and attacks' },
      { label: 'Backup & disaster recovery', description: 'Data protection and recovery' },
      { label: 'Cloud services', description: 'M365, Google, AWS management' },
      { label: 'Strategic IT planning', description: 'vCIO and technology roadmap' },
      { label: 'Compliance support', description: 'HIPAA, PCI-DSS, SOC 2' }
    ] },
    { id: 'timeline', label: 'When do you need to decide?', type: 'select', options: ['Urgent (within 30 days)', 'This quarter', 'This year', 'Just researching / no rush'] }
  ],
  // Questions for comparing quotes
  compareQuotes: [
    { id: 'quote_upload', label: 'Upload your MSP quotes for analysis', type: 'file', placeholder: 'Drag and drop your quotes here or click to upload', accept: '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg', multiple: true, description: 'Upload one or more MSP quotes to compare pricing, services, and value. We\'ll analyze them and help you understand which option is best for your business.' },
    { id: 'num_quotes', label: 'How many quotes are you comparing?', type: 'select', options: ['1', '2', '3', '4', '5+'] },
    { id: 'company_size', label: 'How many employees?', type: 'select', options: ['1-10', '11-25', '26-50', '51-100', '101-250', '250+'] },
    { id: 'primary_concern', label: 'What matters most to you?', type: 'select', options: ['Lowest price', 'Best value for money', 'Most comprehensive coverage', 'Reputation and reviews', 'Service level guarantees', 'Not sure / help me decide'] },
    { id: 'must_have_services', label: 'Must-have services?', type: 'multi', options: [
      { label: '24/7 help desk', description: 'Round-the-clock support' },
      { label: 'Proactive monitoring', description: 'System monitoring and alerts' },
      { label: 'Cybersecurity', description: 'Security tools and monitoring' },
      { label: 'Backup & disaster recovery', description: 'Data protection' },
      { label: 'Cloud management', description: 'M365, AWS, Azure' },
      { label: 'vCIO services', description: 'Strategic IT planning' },
      { label: 'Compliance support', description: 'HIPAA, PCI-DSS, etc.' }
    ] },
    { id: 'current_it_issues', label: 'Current IT challenges?', type: 'multi', options: [
      { label: 'Frequent downtime', description: 'Systems go down often' },
      { label: 'Security concerns', description: 'Worried about breaches' },
      { label: 'Slow support response', description: 'Issues take too long to fix' },
      { label: 'Lack of IT expertise', description: 'Need strategic guidance' },
      { label: 'Budget constraints', description: 'Need to control costs' },
      { label: 'Scaling challenges', description: 'Growing fast, need flexibility' }
    ] },
    { id: 'decision_timeline', label: 'When do you need to decide?', type: 'select', options: ['Within 2 weeks', 'Within 30 days', 'Within 60 days', 'Within 90 days', 'Just gathering information'] }
  ]
};

// Icons
const SparkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18M19 5l-7 7-7-7M19 19l-7-7-7 7"/></svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

// Multi-select component
function MultiSelect({ options, selected, onChange }: any) {
  const toggle = (optVal: string) => {
    const newSel = selected.includes(optVal)
      ? selected.filter((v: string) => v !== optVal)
      : [...selected, optVal];
    onChange(newSel);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {options.map((opt: any) => {
        const isString = typeof opt === 'string';
        const label = isString ? opt : opt.label;
        const desc = isString ? null : opt.description;
        const isSelected = selected.includes(label);

        return (
          <button
            key={label}
            onClick={() => toggle(label)}
            style={{
              padding: desc ? "14px 18px" : "14px 18px",
              borderRadius: "10px",
              border: isSelected ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.06)",
              background: isSelected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.02)",
              color: isSelected ? "#e2e8f0" : "#94a3b8",
              fontSize: "14px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              fontFamily: "inherit",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px"
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "500", marginBottom: desc ? "4px" : 0 }}>{label}</div>
              {desc && <div style={{ fontSize: "12px", opacity: 0.7, lineHeight: 1.4 }}>{desc}</div>}
            </div>
            {isSelected && <CheckIcon />}
          </button>
        );
      })}
    </div>
  );
}

export default function AssessmentPage() {
  const { hasAccess, isLoading, isDesignLimitReached, isNotLoggedIn, designsCreated, designLimit } = useFeatureAccess('assessment');
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Auto-save state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Resizable panels
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(320);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  // Determine which field set to use based on assessment type
  const assessmentType = formData.assessment_type;
  let activeFields: any[] = [];

  if (currentStep === 0) {
    activeFields = ASSESSMENT_FIELDS.assessmentType;
  } else if (assessmentType === 'Evaluate My Current MSP') {
    activeFields = [...ASSESSMENT_FIELDS.assessmentType, ...ASSESSMENT_FIELDS.evaluateCurrent];
  } else if (assessmentType === 'Explore if an MSP is Right for Me') {
    activeFields = [...ASSESSMENT_FIELDS.assessmentType, ...ASSESSMENT_FIELDS.exploreMSP];
  } else if (assessmentType === 'Compare MSP Quotes') {
    activeFields = [...ASSESSMENT_FIELDS.assessmentType, ...ASSESSMENT_FIELDS.compareQuotes];
  }

  const currentField = activeFields[currentStep];

  // Debug logging
  console.log('Current step:', currentStep);
  console.log('Assessment type:', assessmentType);
  console.log('Active fields count:', activeFields.length);
  console.log('Current field:', currentField?.label);

  // Calculate total steps based on selected path
  let totalSteps = 1; // Default to just the assessment type question
  if (assessmentType === 'Evaluate My Current MSP') {
    totalSteps = 1 + ASSESSMENT_FIELDS.evaluateCurrent.length;
  } else if (assessmentType === 'Explore if an MSP is Right for Me') {
    totalSteps = 1 + ASSESSMENT_FIELDS.exploreMSP.length;
  } else if (assessmentType === 'Compare MSP Quotes') {
    totalSteps = 1 + ASSESSMENT_FIELDS.compareQuotes.length;
  }

  // For progress calculation, use activeFields.length when we haven't selected a path yet
  const effectiveTotalSteps = activeFields.length > 1 ? totalSteps : 1;

  // isLastStep should only be true if we're actually at the end of a full path
  // NOT on step 0 before a path is selected
  const isLastStep = currentStep > 0 && currentStep === activeFields.length - 1;
  const progress = ((currentStep + 1) / effectiveTotalSteps) * 100;

  // Handlers
  const handleFieldChange = (fieldId: string, value: any) => {
    if (!handleInteraction()) return;
    setFormData({ ...formData, [fieldId]: value });
  };

  const handleNext = () => {
    if (!handleInteraction()) return;
    // Recalculate activeFields based on current formData
    let nextActiveFields: any[] = [];
    const currentAssessmentType = formData.assessment_type;

    if (!currentAssessmentType) {
      // Don't advance if no assessment type selected
      return;
    } else if (currentAssessmentType === 'Evaluate My Current MSP') {
      nextActiveFields = [...ASSESSMENT_FIELDS.assessmentType, ...ASSESSMENT_FIELDS.evaluateCurrent];
    } else if (currentAssessmentType === 'Explore if an MSP is Right for Me') {
      nextActiveFields = [...ASSESSMENT_FIELDS.assessmentType, ...ASSESSMENT_FIELDS.exploreMSP];
    } else if (currentAssessmentType === 'Compare MSP Quotes') {
      nextActiveFields = [...ASSESSMENT_FIELDS.assessmentType, ...ASSESSMENT_FIELDS.compareQuotes];
    }

    const nextStep = currentStep + 1;

    if (nextStep < nextActiveFields.length) {
      setCurrentStep(nextStep);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          assessmentType: formData.assessment_type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate assessment');
      }

      const data = await response.json();

      // Extract the JSON from Claude's response
      const textContent = data.content.find((c: any) => c.type === 'text')?.text || '{}';
      const assessmentData = JSON.parse(textContent);

      setApiResult(assessmentData);
      setShowResult(true);

      // Auto-save the assessment
      try {
        const saveRes = await fetch('/api/save-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            design_type: 'assessment',
            design_data: { assessmentType: formData.assessment_type, formData },
            ai_response: assessmentData
          })
        });

        if (saveRes.ok) {
          const saveData = await saveRes.json();
          console.log('Assessment saved:', saveData.title);
        }
      } catch (saveErr) {
        console.error('Failed to auto-save assessment:', saveErr);
      }
    } catch (error) {
      console.error('Error generating assessment:', error);
      // Fallback to placeholder
      setApiResult({
        assessmentType: formData.assessment_type,
        headline: 'Assessment generated',
        summary: 'Based on your responses, we\'ve analyzed your situation...',
        recommendations: []
      });
      setShowResult(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-save effect - saves progress automatically when formData changes
  useEffect(() => {
    // Don't auto-save if formData is empty
    if (Object.keys(formData).length === 0) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounce auto-save by 1 second
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (currentSessionId) {
        // Update existing session
        setSavedAssessments(prev =>
          prev.map(assessment =>
            assessment.id === currentSessionId
              ? { ...assessment, formData, date: new Date().toISOString() }
              : assessment
          )
        );
      } else {
        // Create new auto-save session
        const newSessionId = `auto-${Date.now()}`;
        const assessment: SavedAssessment = {
          id: newSessionId,
          title: `Assessment (Auto-saved)`,
          date: new Date().toISOString(),
          formData: formData,
        };
        setSavedAssessments(prev => [assessment, ...prev]);
        setCurrentSessionId(newSessionId);
      }
    }, 1000); // 1 second debounce

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, currentSessionId]);

  const handleSaveAssessment = () => {
    const assessment: SavedAssessment = {
      id: Date.now().toString(),
      title: `Assessment ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      formData: formData,
    };
    setSavedAssessments([assessment, ...savedAssessments]);
    // Clear current session since we manually saved
    setCurrentSessionId(null);
  };

  const handleLoadAssessment = (assessment: SavedAssessment) => {
    setFormData(assessment.formData);
    setCurrentStep(0);
    setShowResult(false);
    setCurrentSessionId(assessment.id); // Set as current session
  };

  const handleDeleteAssessment = (id: string) => {
    setSavedAssessments(savedAssessments.filter(a => a.id !== id));
    // If deleting current session, clear session ID
    if (id === currentSessionId) {
      setCurrentSessionId(null);
    }
  };

  const handleStartOver = () => {
    setFormData({});
    setCurrentStep(0);
    setShowResult(false);
    setApiResult(null);
    setCurrentSessionId(null); // Clear current session
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }];
    setChatMessages(newMessages);
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/chat-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          formData,
          assessmentResult: apiResult
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage = data.content.find((c: any) => c.type === 'text')?.text || 'Sorry, I could not generate a response.';

      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant' as const,
          content: assistantMessage
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant' as const,
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Resize handlers
  const handleMouseMoveLeft = (e: MouseEvent) => {
    if (!isDraggingLeft.current) return;
    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 400) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseMoveRight = (e: MouseEvent) => {
    if (!isDraggingRight.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 280 && newWidth <= 500) {
      setRightWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isDraggingLeft.current = false;
    isDraggingRight.current = false;
    document.removeEventListener('mousemove', handleMouseMoveLeft as any);
    document.removeEventListener('mousemove', handleMouseMoveRight as any);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleResizeLeft = () => {
    isDraggingLeft.current = true;
    document.addEventListener('mousemove', handleMouseMoveLeft as any);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeRight = () => {
    isDraggingRight.current = true;
    document.addEventListener('mousemove', handleMouseMoveRight as any);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // For non-logged-in users, allow viewing but block interactions
  // For logged-in users without access, show paywall immediately
  const shouldBlockImmediately = !isLoading && !isNotLoggedIn && (!hasAccess || isDesignLimitReached);

  if (shouldBlockImmediately) {
    return (
      <>
        <SiteHeader />
        <PaywallModal
          isOpen={true}
          builderName="MSP Assessment"
          requiredTier="all_in"
          reason={isDesignLimitReached ? 'design_limit' : 'trial_expired'}
          designsCreated={designsCreated}
          designLimit={designLimit}
        />
      </>
    );
  }

  // Handler to check access before interactions
  const handleInteraction = () => {
    if (isNotLoggedIn) {
      setShowPaywall(true);
      return false;
    }
    return true;
  };

  return (
    <div className="bg-slate-950 dark:bg-slate-950" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SiteHeader />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .opt-btn:hover { background: rgba(16,185,129,0.08) !important; border-color: rgba(16,185,129,0.3) !important; }
        .nav-btn { transition: all 0.2s ease; }
        .nav-btn:hover { opacity: 0.8; }
      `}</style>

      <div style={{
        flex: 1,
        background: "#0c0f18",
        color: "#e2e8f0",
        fontFamily: "'Outfit', sans-serif",
        display: "flex",
        overflow: "hidden",
      }}>
        {/* Left Panel - Saved Assessments */}
        <aside style={{
          width: `${leftWidth}px`,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          background: "#0a0d14",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "12px" }}>
              Saved Assessments
            </h2>
            <button
              onClick={handleSaveAssessment}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'linear-gradient(to right, rgb(16,185,129), rgb(5,150,105))',
                color: 'white',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: "500",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <Save size={14} />
              Save Current
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {savedAssessments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#475569' }}>
                <p style={{ fontSize: '13px' }}>No saved assessments yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.06)',
                      position: 'relative',
                    }}
                    onClick={() => handleLoadAssessment(assessment)}
                  >
                    <div style={{ fontSize: '13px', fontWeight: "500", color: '#e2e8f0', marginBottom: '4px' }}>
                      {assessment.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {new Date(assessment.date).toLocaleDateString()}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAssessment(assessment.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Resize Handle - Left */}
        <div
          onMouseDown={handleResizeLeft}
          style={{
            width: "4px",
            cursor: "col-resize",
            background: "transparent",
            position: "relative",
          }}
        />

        {/* Main Content - Assessment Wizard */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "40px 20px", position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
          {/* Ambient background */}
          <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ width: "100%", maxWidth: "700px", position: "relative", zIndex: 1 }}>
            {isGenerating ? (
              /* Generation Loading */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: "24px", animation: "fadeIn 0.5s ease" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  border: "3px solid rgba(16,185,129,0.2)",
                  borderTopColor: "#10b981",
                  animation: "spin 1s linear infinite"
                }} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "18px", fontWeight: "500", marginBottom: "8px", color: "#e2e8f0" }}>Analyzing your MSP needs...</p>
                  <p style={{ fontSize: "14px", color: "#64748b", animation: "pulse 2s ease infinite" }}>
                    Evaluating requirements, comparing options, calculating ROI
                  </p>
                </div>
              </div>
            ) : !showResult ? (
              <>
                {/* Hero */}
                <div style={{ textAlign: "center", marginBottom: "32px", animation: "slideUp 0.8s ease" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 12px", borderRadius: "20px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", marginBottom: "16px", fontSize: "12px", color: "#10b981" }}>
                    <SparkIcon /> MSP Assessment
                  </div>
                  <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "700", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "12px" }}>
                    Find the right MSP fit<br />
                    <span style={{ background: "linear-gradient(135deg, #10b981, #059669)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in minutes, not weeks</span>
                  </h1>
                  <p style={{ fontSize: "15px", color: "#64748b", maxWidth: "520px", margin: "0 auto", lineHeight: 1.5 }}>
                    Answer a few quick questions and get a personalized assessment of your MSP needs.
                  </p>
                </div>

                {/* Progress Bar - Only show after first question */}
                {currentStep > 0 && (
                  <div style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <p style={{ fontSize: "12px", color: "#64748b" }}>
                        Question {currentStep + 1} of {effectiveTotalSteps}
                      </p>
                      <p style={{ fontSize: "12px", color: "#10b981", fontWeight: "500" }}>
                        {Math.round(progress)}% Complete
                      </p>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "linear-gradient(90deg, #10b981, #059669)", width: `${progress}%`, transition: "width 0.3s ease", borderRadius: "10px" }} />
                    </div>
                  </div>
                )}

                {/* Question Card */}
                {currentField && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px", marginBottom: "24px", animation: "slideUp 0.5s ease" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: currentField.description ? "12px" : "24px", color: "#e2e8f0" }}>
                      {currentField.label}
                    </h2>
                    {currentField.description && (
                      <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px", lineHeight: "1.6" }}>
                        {currentField.description}
                      </p>
                    )}

                    {currentField.type === 'card-select' && currentField.options && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                        {(currentField.options as any[]).map((opt: any) => {
                          const label = typeof opt === 'string' ? opt : opt.label;
                          const description = typeof opt === 'string' ? undefined : opt.description;
                          const isSelected = formData[currentField.id] === label;
                          return (
                            <button
                              key={label}
                              className="opt-btn"
                              onClick={() => {
                                handleFieldChange(currentField.id, label);
                                // Always auto-advance except when we know it's truly the last step
                                // On step 0, always advance since we need to select more questions
                                if (currentStep === 0 || currentStep < activeFields.length - 1) {
                                  setTimeout(handleNext, 300);
                                }
                              }}
                              style={{
                                padding: "20px 24px",
                                borderRadius: "12px",
                                border: isSelected ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.06)",
                                background: isSelected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.02)",
                                color: isSelected ? "#e2e8f0" : "#94a3b8",
                                fontSize: "15px",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.2s",
                                fontFamily: "inherit",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "8px"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", fontSize: "16px", color: isSelected ? "#e2e8f0" : "#e2e8f0" }}>
                                {isSelected && <CheckIcon />}
                                {label}
                              </div>
                              {description && (
                                <div style={{ fontSize: "14px", color: isSelected ? "rgba(226,232,240,0.8)" : "#94a3b8", lineHeight: "1.5" }}>
                                  {description}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {currentField.type === 'select' && currentField.options && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(currentField.options as string[]).map(opt => (
                          <button
                            key={opt}
                            className="opt-btn"
                            onClick={() => {
                              handleFieldChange(currentField.id, opt);
                              // Always auto-advance except when we know it's truly the last step
                              // On step 0, always advance since we need to select more questions
                              if (currentStep === 0 || currentStep < activeFields.length - 1) {
                                setTimeout(handleNext, 300);
                              }
                            }}
                            style={{
                              padding: "14px 18px",
                              borderRadius: "10px",
                              border: formData[currentField.id] === opt ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.06)",
                              background: formData[currentField.id] === opt ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.02)",
                              color: formData[currentField.id] === opt ? "#e2e8f0" : "#94a3b8",
                              fontSize: "14px",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.2s",
                              fontFamily: "inherit",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}
                          >
                            {opt}
                            {formData[currentField.id] === opt && <CheckIcon />}
                          </button>
                        ))}
                      </div>
                    )}

                    {currentField.type === 'multi' && currentField.options && (
                      <div>
                        <MultiSelect
                          options={currentField.options}
                          selected={formData[currentField.id] || []}
                          onChange={(val: any) => handleFieldChange(currentField.id, val)}
                        />
                        <p style={{ fontSize: "12px", color: "#475569", marginTop: "12px" }}>Select all that apply</p>
                      </div>
                    )}

                    {currentField.type === 'text' && (
                      <input
                        type="text"
                        value={formData[currentField.id] || ""}
                        onChange={(e) => handleFieldChange(currentField.id, e.target.value)}
                        placeholder={currentField.placeholder}
                        style={{
                          width: "100%", padding: "14px 18px", borderRadius: "10px",
                          border: "2px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
                          color: "#e2e8f0", fontSize: "15px", outline: "none", fontFamily: "inherit",
                          transition: "border-color 0.2s"
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = "#10b981"}
                        onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"}
                      />
                    )}

                    {currentField.type === 'file' && (
                      <div>
                        <label
                          htmlFor={`file-${currentField.id}`}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "48px 24px",
                            borderRadius: "10px",
                            border: "2px dashed rgba(16,185,129,0.3)",
                            background: "rgba(16,185,129,0.05)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            minHeight: "200px"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
                            e.currentTarget.style.background = "rgba(16,185,129,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)";
                            e.currentTarget.style.background = "rgba(16,185,129,0.05)";
                          }}
                        >
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px" }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          <p style={{ fontSize: "15px", color: "#e2e8f0", marginBottom: "4px", fontWeight: "500" }}>
                            {currentField.placeholder || 'Click to upload or drag and drop'}
                          </p>
                          <p style={{ fontSize: "13px", color: "#64748b" }}>
                            PDF, DOC, DOCX, TXT, PNG, JPG (max 10MB each)
                          </p>
                          {formData[currentField.id] && formData[currentField.id].length > 0 && (
                            <div style={{ marginTop: "16px", fontSize: "13px", color: "#10b981" }}>
                              {formData[currentField.id].length} file(s) selected
                            </div>
                          )}
                        </label>
                        <input
                          id={`file-${currentField.id}`}
                          type="file"
                          multiple={currentField.multiple}
                          accept={currentField.accept}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            handleFieldChange(currentField.id, files);
                          }}
                          style={{ display: "none" }}
                        />
                        {formData[currentField.id] && formData[currentField.id].length > 0 && (
                          <div style={{ marginTop: "16px" }}>
                            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>Uploaded files:</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {formData[currentField.id].map((file: File, idx: number) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.06)"
                                  }}
                                >
                                  <span style={{ fontSize: "13px", color: "#94a3b8" }}>{file.name}</span>
                                  <button
                                    onClick={() => {
                                      const newFiles = formData[currentField.id].filter((_: File, i: number) => i !== idx);
                                      handleFieldChange(currentField.id, newFiles);
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#ef4444",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                      padding: "4px 8px"
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="nav-btn"
                    style={{
                      padding: "10px 20px", borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent", color: currentStep === 0 ? "#334155" : "#94a3b8",
                      cursor: currentStep === 0 ? "default" : "pointer",
                      fontSize: "14px", fontFamily: "inherit"
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isGenerating}
                    className="nav-btn"
                    style={{
                      padding: "10px 24px", borderRadius: "8px", border: "none",
                      background: isLastStep ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.06)",
                      color: isLastStep ? "#fff" : "#94a3b8",
                      cursor: "pointer", fontSize: "14px", fontWeight: "500", fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: "8px"
                    }}
                  >
                    {isLastStep ? (
                      isGenerating ? (
                        <>Generating...</>
                      ) : (
                        <><Sparkles size={16} /> Generate Assessment</>
                      )
                    ) : (
                      <>Next <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Results View */
              <div style={{ animation: "slideUp 0.8s ease" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 12px", borderRadius: "20px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", marginBottom: "16px", fontSize: "12px", color: "#10b981" }}>
                    <Check size={14} /> Assessment Complete
                  </div>
                  <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "12px" }}>
                    Your MSP Assessment Results
                  </h1>
                  {apiResult?.headline && (
                    <p style={{ fontSize: "16px", color: "#10b981", fontWeight: "500" }}>
                      {apiResult.headline}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#10b981" }}>Executive Summary</h3>
                  <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#94a3b8", whiteSpace: "pre-wrap" }}>
                    {apiResult?.summary}
                  </p>
                </div>

                {/* Key Findings */}
                {apiResult?.keyFindings && apiResult.keyFindings.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#10b981" }}>Key Findings</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {apiResult.keyFindings.map((finding: any, idx: number) => (
                        <div key={idx} style={{ padding: "16px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: `1px solid ${finding.impact === 'positive' ? 'rgba(16,185,129,0.3)' : finding.impact === 'negative' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            {finding.impact === 'positive' && <span style={{ color: "#10b981" }}>✓</span>}
                            {finding.impact === 'negative' && <span style={{ color: "#ef4444" }}>⚠</span>}
                            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", margin: 0 }}>{finding.title}</h4>
                          </div>
                          <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#94a3b8", margin: 0 }}>{finding.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cost Analysis */}
                {apiResult?.costAnalysis && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#10b981" }}>Cost Analysis</h3>
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Current Situation</p>
                          <p style={{ fontSize: "18px", fontWeight: "600", color: "#e2e8f0" }}>{apiResult.costAnalysis.currentSituation}</p>
                        </div>
                        <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Estimated MSP Cost</p>
                          <p style={{ fontSize: "18px", fontWeight: "600", color: "#10b981" }}>{apiResult.costAnalysis.estimatedMSPCost}</p>
                        </div>
                      </div>
                      {apiResult.costAnalysis.roi && (
                        <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "16px", lineHeight: 1.6 }}>
                          <strong style={{ color: "#e2e8f0" }}>ROI:</strong> {apiResult.costAnalysis.roi}
                        </p>
                      )}
                      {apiResult.costAnalysis.breakdown && apiResult.costAnalysis.breakdown.length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "12px" }}>Cost Breakdown</h4>
                          {apiResult.costAnalysis.breakdown.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                              <div>
                                <p style={{ fontSize: "14px", color: "#e2e8f0", marginBottom: "2px" }}>{item.item}</p>
                                {item.notes && <p style={{ fontSize: "12px", color: "#64748b" }}>{item.notes}</p>}
                              </div>
                              <p style={{ fontSize: "14px", fontWeight: "600", color: "#10b981" }}>{item.cost}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Comparison Table */}
                {apiResult?.comparisonTable && apiResult.comparisonTable.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#10b981" }}>MSP Comparison</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {apiResult.comparisonTable.map((msp: any, idx: number) => (
                        <div key={idx} style={{ padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                            <div>
                              <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "4px" }}>{msp.mspName}</h4>
                              <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#64748b" }}>
                                <span>Monthly: <strong style={{ color: "#10b981" }}>{msp.monthlyPrice}</strong></span>
                                <span>Setup: <strong style={{ color: "#e2e8f0" }}>{msp.setupCost}</strong></span>
                              </div>
                            </div>
                            <div style={{ padding: "4px 12px", borderRadius: "12px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", fontSize: "13px", fontWeight: "600", color: "#10b981" }}>
                              Score: {msp.score}/10
                            </div>
                          </div>
                          <div style={{ marginBottom: "12px" }}>
                            <p style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>Services Included:</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {msp.servicesIncluded?.map((service: string, sidx: number) => (
                                <span key={sidx} style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#10b981", marginBottom: "6px" }}>Pros</p>
                              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "#94a3b8" }}>
                                {msp.pros?.map((pro: string, pidx: number) => (
                                  <li key={pidx}>{pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#ef4444", marginBottom: "6px" }}>Cons</p>
                              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "#94a3b8" }}>
                                {msp.cons?.map((con: string, cidx: number) => (
                                  <li key={cidx}>{con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          {msp.recommendation && (
                            <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(16,185,129,0.08)", borderLeft: "3px solid #10b981" }}>
                              <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
                                <strong style={{ color: "#10b981" }}>Recommendation:</strong> {msp.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {apiResult?.recommendations && apiResult.recommendations.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#10b981" }}>Recommendations</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {apiResult.recommendations.map((rec: any, idx: number) => (
                        <div key={idx} style={{ padding: "16px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${rec.priority === 'high' ? '#10b981' : rec.priority === 'medium' ? '#f59e0b' : '#64748b'}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: rec.priority === 'high' ? 'rgba(16,185,129,0.2)' : rec.priority === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.2)', color: rec.priority === 'high' ? '#10b981' : rec.priority === 'medium' ? '#f59e0b' : '#94a3b8', textTransform: "uppercase", fontWeight: "600" }}>
                              {rec.priority}
                            </span>
                            <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", margin: 0 }}>{rec.title}</h4>
                          </div>
                          <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px", lineHeight: 1.6 }}>{rec.description}</p>
                          {rec.action && (
                            <p style={{ fontSize: "13px", color: "#10b981", margin: 0 }}>
                              <strong>Next Step:</strong> {rec.action}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions to Ask */}
                {apiResult?.questionsToAsk && apiResult.questionsToAsk.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#10b981" }}>Questions to Ask MSP Vendors</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {apiResult.questionsToAsk.map((category: any, idx: number) => (
                        <div key={idx}>
                          <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "12px" }}>{category.category}</h4>
                          <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            {category.questions.map((question: string, qidx: number) => (
                              <li key={qidx} style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.6 }}>{question}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                {apiResult?.redFlags && apiResult.redFlags.length > 0 && (
                  <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#ef4444" }}>⚠ Red Flags Identified</h3>
                    <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {apiResult.redFlags.map((flag: string, idx: number) => (
                        <li key={idx} style={{ fontSize: "14px", color: "#fca5a5", lineHeight: 1.6 }}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {apiResult?.nextSteps && apiResult.nextSteps.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#10b981" }}>Next Steps</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {apiResult.nextSteps.map((step: any, idx: number) => (
                        <div key={idx} style={{ display: "flex", gap: "12px", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                          <div style={{ minWidth: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600" }}>
                            {idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "4px" }}>{step.step}</p>
                            <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#64748b" }}>
                              <span>Timeline: {step.timeline}</span>
                              <span style={{ color: step.priority === 'immediate' ? '#ef4444' : step.priority === 'short-term' ? '#f59e0b' : '#64748b' }}>
                                Priority: {step.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleStartOver}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "#94a3b8",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    Start New Assessment
                  </button>
                  <button
                    onClick={handleSaveAssessment}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <Save size={16} /> Save Assessment
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Resize Handle - Right */}
        <div
          onMouseDown={handleResizeRight}
          style={{
            width: "4px",
            cursor: "col-resize",
            background: "transparent",
            position: "relative",
          }}
        />

        {/* Right Panel - Chat */}
        <aside style={{
          width: `${rightWidth}px`,
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          background: "#0a0d14",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: '#10b981' }} />
              <h2 style={{ fontSize: '14px', fontWeight: "600", color: '#e2e8f0' }}>AI Assistant</h2>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatMessages.length === 0 ? (
              <div style={{ padding: '16px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.5, color: '#10b981' }} />
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>AI MSP Assistant</p>
                  <p style={{ fontSize: '12px', color: '#475569' }}>Ask me anything about MSPs</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Suggested Questions:</p>
                  {[
                    'What does an MSP provide me that I don\'t have now?',
                    'What should I look for in an MSP contract?',
                    'How much should I budget for MSP services?',
                    'What are red flags when evaluating MSP quotes?'
                  ].map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatInput(question);
                        setTimeout(() => handleSendChat(), 100);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.02)',
                        color: '#94a3b8',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(16,185,129,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)';
                        e.currentTarget.style.color = '#10b981';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.color = '#94a3b8';
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: msg.role === 'user' ? 'rgba(255,255,255,0.02)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.06)' : 'rgba(16,185,129,0.3)'}`,
                    fontSize: '13px',
                    color: msg.role === 'user' ? '#e2e8f0' : '#e2e8f0',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '11px', color: msg.role === 'user' ? '#64748b' : '#10b981', fontWeight: "600", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  {msg.content}
                </div>
              ))
            )}
            {isSendingChat && (
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', fontSize: '13px', color: '#64748b' }}>
                Thinking...
              </div>
            )}
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask a question..."
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim() || isSendingChat}
                style={{
                  padding: '10px 16px',
                  background: chatInput.trim() && !isSendingChat ? 'linear-gradient(to right, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: chatInput.trim() && !isSendingChat ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 0", fontSize: "11px", color: "#64748b", textAlign: "center", background: "#0c0f18" }}>
        Powered by{' '}
        <a
          href="https://www.techsolutions.cc"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#94a3b8", textDecoration: "underline", textUnderlineOffset: "2px", transition: "color 0.2s", cursor: "pointer" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#e2e8f0"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
        >
          InterPeak Technology Solutions
        </a>
      </footer>

      {/* Paywall Modal for non-logged-in users */}
      {showPaywall && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          builderName="MSP Assessment"
          requiredTier="all_in"
          reason="not_logged_in"
          designsCreated={designsCreated}
          designLimit={designLimit}
        />
      )}
    </div>
  );
}
