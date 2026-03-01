'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { CheckCircle2, Calendar, FileText, Mail, Minus, Plus, Download, Trash2, Calculator, Edit2, Save, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface LicenseItem {
  id: string;
  serviceDescription: string;
  quantity: number;
  annualCost: number;
  additionalLicenses: number;
}

type BillingTerm = 'Monthly' | 'Annual' | 'Pre-Paid';

export default function CoTermCalcPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(380);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [showAgreementEdit, setShowAgreementEdit] = useState(false);

  // Step 1: Agreement Info
  const [agreementStartDate, setAgreementStartDate] = useState('2025-04-02');
  const [agreementTermMonths, setAgreementTermMonths] = useState(36);
  const [coTermStartDate, setCoTermStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [useCalculatedMonths, setUseCalculatedMonths] = useState(true);
  const [manualMonthsRemaining, setManualMonthsRemaining] = useState(12);
  const [addExtension, setAddExtension] = useState(false);
  const [extensionMonths, setExtensionMonths] = useState(12);

  // Step 2: Licensing
  const [numberOfLineItems, setNumberOfLineItems] = useState(1);
  const [billingTerm, setBillingTerm] = useState<BillingTerm>('Annual');
  const [licenses, setLicenses] = useState<LicenseItem[]>([
    { id: '1', serviceDescription: '', quantity: 1, annualCost: 0, additionalLicenses: 0 }
  ]);

  // Calculated values
  const calculateMonthsRemaining = () => {
    // If manual mode, use the manual months
    if (!useCalculatedMonths) {
      return addExtension ? manualMonthsRemaining + extensionMonths : manualMonthsRemaining;
    }

    // Otherwise calculate based on dates
    const start = new Date(agreementStartDate);
    const coTerm = new Date(coTermStartDate);
    const diffTime = coTerm.getTime() - start.getTime();
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);
    const baseMonthsRemaining = Math.max(0, agreementTermMonths - diffMonths);

    // Add extension months if the option is enabled
    return addExtension ? baseMonthsRemaining + extensionMonths : baseMonthsRemaining;
  };

  const monthsRemaining = calculateMonthsRemaining();

  const updateLicense = (id: string, field: keyof LicenseItem, value: any) => {
    setLicenses(licenses.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const calculateCoTermCost = (license: LicenseItem) => {
    // Convert to monthly rate based on billing term
    let monthlyRate = 0;
    if (billingTerm === 'Monthly') {
      monthlyRate = license.annualCost; // annualCost field holds monthly cost when billing is monthly
    } else if (billingTerm === 'Annual') {
      monthlyRate = license.annualCost / 12;
    } else { // Pre-Paid
      monthlyRate = license.annualCost / 12;
    }
    return monthlyRate * monthsRemaining;
  };

  const calculateResults = () => {
    // Calculate costs based on billing term
    let currentMonthlyCost = 0;
    let currentAnnualCost = 0;

    if (billingTerm === 'Monthly') {
      // For monthly billing, annualCost field holds the monthly cost
      currentMonthlyCost = licenses.reduce((sum, l) => sum + (l.annualCost * l.quantity), 0);
      currentAnnualCost = currentMonthlyCost * 12;
    } else {
      // For annual/pre-paid, annualCost field holds the annual cost
      currentAnnualCost = licenses.reduce((sum, l) => sum + (l.annualCost * l.quantity), 0);
      currentMonthlyCost = currentAnnualCost / 12;
    }

    // Calculate additional licenses cost
    let additionalMonthlyCost = 0;
    let additionalAnnualCost = 0;

    if (billingTerm === 'Monthly') {
      additionalMonthlyCost = licenses.reduce((sum, l) => sum + (l.annualCost * l.additionalLicenses), 0);
      additionalAnnualCost = additionalMonthlyCost * 12;
    } else {
      additionalAnnualCost = licenses.reduce((sum, l) => sum + (l.annualCost * l.additionalLicenses), 0);
      additionalMonthlyCost = additionalAnnualCost / 12;
    }

    // Calculate updated costs
    const updatedMonthlyCost = currentMonthlyCost + additionalMonthlyCost;
    const updatedAnnualCost = currentAnnualCost + additionalAnnualCost;

    // Calculate remaining total (cost for remaining months)
    const remainingTotal = updatedMonthlyCost * monthsRemaining;

    // Total cost of ownership
    const totalCostOfOwnership = (currentMonthlyCost * 12) + remainingTotal;

    return {
      currentMonthlyCost,
      currentAnnualCost,
      updatedMonthlyCost,
      updatedAnnualCost,
      costChange: updatedAnnualCost - currentAnnualCost, // Annual cost change
      monthlyCostChange: updatedMonthlyCost - currentMonthlyCost, // Monthly cost change
      costChangePercent: currentAnnualCost > 0 ? ((updatedAnnualCost - currentAnnualCost) / currentAnnualCost * 100) : 0,
      remainingTotal,
      coTermCost: remainingTotal, // Cost for remaining months (co-term cost)
      totalCostOfOwnership,
      totalLicenses: licenses.reduce((sum, l) => sum + l.quantity + l.additionalLicenses, 0)
    };
  };

  const results = calculateResults();

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Dynamic import with error handling
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Add logo if uploaded
      if (companyLogo) {
        try {
          doc.addImage(companyLogo, 'PNG', 15, yPos, 40, 20);
          yPos += 25;
        } catch (err) {
          console.log('Logo could not be added');
        }
      }

      // Title
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229); // Purple
      doc.text('Co-Terming Results', companyLogo ? 60 : 15, yPos);
      yPos += 10;

      // Subtitle
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`${billingTerm} Billing`, companyLogo ? 60 : 15, yPos);
      yPos += 15;

      // Agreement Information
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Agreement Information', 15, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Agreement Start Date: ${agreementStartDate}`, 15, yPos);
      yPos += 6;
      doc.text(`Agreement Term: ${agreementTermMonths} months`, 15, yPos);
      yPos += 6;
      doc.text(`Co-Term Start Date: ${coTermStartDate}`, 15, yPos);
      yPos += 6;
      doc.text(`Months Remaining: ${monthsRemaining.toFixed(2)} months`, 15, yPos);
      yPos += 12;

      // Cost Summary Boxes
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Cost Summary', 15, yPos);
      yPos += 10;

      const boxWidth = (pageWidth - 40) / 4;
      const boxHeight = 25;
      const startX = 15;

      // Current Cost Box
      doc.setFillColor(139, 92, 246); // Purple
      doc.rect(startX, yPos, boxWidth, boxHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(`Current ${billingTerm}`, startX + 2, yPos + 6);
      doc.setFontSize(12);
      const currentCost = billingTerm === 'Monthly' ? results.currentMonthlyCost : results.currentAnnualCost;
      doc.text(`$${currentCost.toFixed(2)}`, startX + 2, yPos + 15);

      // Updated Cost Box
      doc.setFillColor(34, 197, 94); // Green
      doc.rect(startX + boxWidth + 2, yPos, boxWidth, boxHeight, 'F');
      doc.text(`Updated ${billingTerm}`, startX + boxWidth + 4, yPos + 6);
      const updatedCost = billingTerm === 'Monthly' ? results.updatedMonthlyCost : results.updatedAnnualCost;
      doc.text(`$${updatedCost.toFixed(2)}`, startX + boxWidth + 4, yPos + 15);

      // Remaining Term Box
      doc.setFillColor(59, 130, 246); // Blue
      doc.rect(startX + (boxWidth + 2) * 2, yPos, boxWidth, boxHeight, 'F');
      doc.text('Remaining Term', startX + (boxWidth + 2) * 2 + 2, yPos + 6);
      doc.text(`$${results.remainingTotal.toFixed(2)}`, startX + (boxWidth + 2) * 2 + 2, yPos + 15);

      // Cost Change Box
      doc.setFillColor(249, 115, 22); // Orange
      doc.rect(startX + (boxWidth + 2) * 3, yPos, boxWidth, boxHeight, 'F');
      doc.text('Cost Change', startX + (boxWidth + 2) * 3 + 2, yPos + 6);
      doc.text(`+${results.costChangePercent.toFixed(1)}%`, startX + (boxWidth + 2) * 3 + 2, yPos + 15);

      yPos += boxHeight + 12;

      // License Details Table
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('License Details', 15, yPos);
      yPos += 8;

      const tableData = licenses.map(license => [
        license.serviceDescription || 'Unnamed',
        license.quantity.toString(),
        `$${license.annualCost.toFixed(2)}`,
        `+${license.additionalLicenses}`,
        `$${(billingTerm === 'Monthly' ? license.annualCost * license.quantity : license.annualCost * license.quantity).toFixed(2)}`,
        `$${(billingTerm === 'Monthly' ? (license.annualCost * license.quantity) + (license.annualCost * license.additionalLicenses) : (license.annualCost * license.quantity) + (license.annualCost * license.additionalLicenses)).toFixed(2)}`
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [[
          'Service',
          'Qty',
          `${billingTerm} Fee`,
          'Add. Lic.',
          `Current ${billingTerm}`,
          `Updated ${billingTerm}`
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 15, right: 15 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;

      // Cost Breakdown
      doc.setFontSize(14);
      doc.text('Cost Breakdown', 15, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.text(`Current ${billingTerm}: $${currentCost.toFixed(2)}`, 15, yPos);
      yPos += 6;
      doc.text(`New ${billingTerm}: $${updatedCost.toFixed(2)}`, 15, yPos);
      yPos += 6;
      const costDiff = billingTerm === 'Monthly' ? results.monthlyCostChange : results.costChange;
      doc.text(`Difference: +$${costDiff.toFixed(2)}`, 15, yPos);
      yPos += 6;
      doc.text(`Remaining Term Total: $${results.remainingTotal.toFixed(2)} (${monthsRemaining.toFixed(2)} months)`, 15, yPos);
      yPos += 6;
      doc.text(`Total Cost of Ownership: $${results.totalCostOfOwnership.toFixed(2)} (${agreementTermMonths} months)`, 15, yPos);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Powered by InterPeak Technology Solutions - techsolutions.cc', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

      // Save the PDF
      doc.save(`co-term-results-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateEmailContent = async () => {
    setIsGeneratingEmail(true);
    try {
      // Prepare calculator state for AI
      const calculatorState = {
        agreementStartDate,
        agreementTermMonths,
        coTermStartDate,
        billingTerm,
        licenses: licenses.map(l => ({
          id: l.id,
          serviceDescription: l.serviceDescription,
          quantity: l.quantity,
          annualCost: l.annualCost,
          additionalLicenses: l.additionalLicenses
        })),
        results: {
          currentMonthlyCost: results.currentMonthlyCost,
          currentAnnualCost: results.currentAnnualCost,
          updatedMonthlyCost: results.updatedMonthlyCost,
          updatedAnnualCost: results.updatedAnnualCost,
          monthlyCostChange: results.monthlyCostChange,
          costChange: results.costChange,
          remainingTotal: results.remainingTotal,
          totalCostOfOwnership: results.totalCostOfOwnership
        }
      };

      // Call AI to generate email
      const response = await fetch('/api/chat-coterm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Generate a professional email that explains this co-terming proposal. Include the agreement details, cost breakdown, and license details. DO NOT include a "Co-Terming Benefits" section. Format it ready to copy and paste into an email.'
            }
          ],
          calculatorState
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const data = await response.json();
      const emailContent = data.content.find((c: any) => c.type === 'text')?.text || 'Failed to generate email content.';

      // Store the generated email
      setGeneratedEmail(emailContent);
    } catch (error) {
      console.error('Error generating email:', error);
      alert('Failed to generate email. Please try again.');
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const copyEmailToClipboard = async () => {
    if (!generatedEmail) return;

    try {
      await navigator.clipboard.writeText(generatedEmail);
      alert('Email copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy email. Please try again.');
    }
  };

  const handleSaveCalculation = () => {
    // TODO: Implement saving to left panel
    alert('Calculation saved! (Feature coming soon)');
  };

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? This will clear all current data.')) {
      // Reset to Step 1
      setCurrentStep(1);

      // Reset all state
      setAgreementStartDate('2025-04-02');
      setAgreementTermMonths(36);
      const today = new Date();
      setCoTermStartDate(today.toISOString().split('T')[0]);
      setUseCalculatedMonths(true);
      setNumberOfLineItems(1);
      setBillingTerm('Annual');
      setLicenses([{
        id: '1',
        serviceDescription: '',
        quantity: 1,
        annualCost: 0,
        additionalLicenses: 0
      }]);
      setCompanyLogo(null);
      setChatMessages([]);
      setChatInput('');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsLoadingChat(true);

    // Add user message to chat
    const newMessages = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(newMessages);

    try {
      // Prepare calculator state
      const calculatorState = {
        agreementStartDate,
        agreementTermMonths,
        coTermStartDate,
        billingTerm,
        licenses,
        monthsRemaining
      };

      const response = await fetch('/api/chat-coterm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          calculatorState
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage = data.content[0].text;

      // Add assistant response to chat
      setChatMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);

      // Try to parse JSON actions from the response
      try {
        const jsonMatch = assistantMessage.match(/\{[\s\S]*"actions"[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);

          if (parsedResponse.actions && Array.isArray(parsedResponse.actions)) {
            let updatedLicenses = [...licenses];

            parsedResponse.actions.forEach((action: any) => {
              if (action.type === 'add_license' && action.data) {
                const newLicense: LicenseItem = {
                  id: Date.now().toString() + Math.random(),
                  serviceDescription: action.data.serviceDescription || '',
                  quantity: action.data.quantity || 0,
                  annualCost: action.data.annualCost || 0,
                  additionalLicenses: action.data.additionalLicenses || 0
                };
                updatedLicenses = [...updatedLicenses, newLicense];
              } else if (action.type === 'set_additional_licenses' && action.data && action.data.serviceDescription) {
                // Find matching license by service description (fuzzy match)
                const searchTerm = action.data.serviceDescription.toLowerCase().trim();
                const matchingLicense = updatedLicenses.find(l =>
                  l.serviceDescription.toLowerCase().includes(searchTerm) ||
                  searchTerm.includes(l.serviceDescription.toLowerCase())
                );

                if (matchingLicense) {
                  updatedLicenses = updatedLicenses.map(l =>
                    l.id === matchingLicense.id
                      ? { ...l, additionalLicenses: action.data.additionalLicenses || 0 }
                      : l
                  );
                }
              } else if (action.type === 'update_license' && action.data) {
                if (action.data.id) {
                  updatedLicenses = updatedLicenses.map(l =>
                    l.id === action.data.id
                      ? { ...l, ...action.data }
                      : l
                  );
                } else if (action.data.serviceDescription) {
                  const searchTerm = action.data.serviceDescription.toLowerCase().trim();
                  updatedLicenses = updatedLicenses.map(l =>
                    l.serviceDescription.toLowerCase().includes(searchTerm)
                      ? { ...l, ...action.data }
                      : l
                  );
                }
              } else if (action.type === 'remove_license' && action.data) {
                if (action.data.id) {
                  updatedLicenses = updatedLicenses.filter(l => l.id !== action.data.id);
                } else if (action.data.serviceDescription) {
                  const searchTerm = action.data.serviceDescription.toLowerCase().trim();
                  updatedLicenses = updatedLicenses.filter(l =>
                    !l.serviceDescription.toLowerCase().includes(searchTerm)
                  );
                }
              }
            });

            setLicenses(updatedLicenses);
          }
        }
      } catch (parseError) {
        // If parsing fails, just show the message without actions
        console.log('No structured actions in response');
      }

    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleResizeLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setLeftWidth(Math.max(200, Math.min(500, startWidth + delta)));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleResizeRight = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      setRightWidth(Math.max(300, Math.min(600, startWidth + delta)));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const StepIndicator = ({ step, title, status }: { step: number; title: string; status: 'complete' | 'current' | 'upcoming' }) => (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
        status === 'complete' ? 'bg-green-600 text-white' :
        status === 'current' ? 'bg-blue-600 text-white' :
        'bg-slate-700 text-slate-400'
      }`}>
        {status === 'complete' ? <CheckCircle2 className="h-5 w-5" /> : step}
      </div>
      <div>
        <div className="text-xs text-slate-400">Step {step}</div>
        <div className={`text-sm font-medium ${status === 'upcoming' ? 'text-slate-500' : 'text-slate-200'}`}>
          {title}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-950 dark:bg-slate-950" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SiteHeader />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .nav-btn { transition: all 0.2s ease; }
        .nav-btn:hover { opacity: 0.8; }
      `}</style>

      <div style={{ flex: 1, display: "flex", background: "#0c0f18", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
        {/* Left Panel - Saved Calculations */}
        <aside style={{
          width: `${leftWidth}px`,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          background: "#0a0d14",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>🧮</span>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Co-Term Calculator</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
              Saved calculations will appear here.
            </p>
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

        {/* Main Content - Wizard */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "40px 20px", position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
          {/* Ambient background */}
          <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ width: "100%", position: "relative", zIndex: 1 }}>
            {/* Header with progress */}
            <div style={{ textAlign: "center", marginBottom: "32px", animation: "slideUp 0.8s ease" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 12px", borderRadius: "20px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", marginBottom: "16px", fontSize: "12px", color: "#a855f7" }}>
                🧮 Co-Term Calculator
              </div>
              <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "700", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: "12px" }}>
                Calculate Co-Terming Costs
              </h1>
              <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "520px", margin: "0 auto", lineHeight: 1.5 }}>
                Step {currentStep} of 3
              </p>
            </div>

            {/* Step Indicators */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "32px" }}>
              {[
                { num: 1, title: "Agreement" },
                { num: 2, title: "Licensing" },
                { num: 3, title: "Results" }
              ].map(({ num, title }) => (
                <div key={num} style={{ textAlign: "center" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    margin: "0 auto 6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: currentStep >= num ? "linear-gradient(135deg, #a855f7, #9333ea)" : "rgba(255,255,255,0.05)",
                    color: currentStep >= num ? "#fff" : "#64748b",
                    border: currentStep === num ? "2px solid #a855f7" : "none"
                  }}>
                    {num}
                  </div>
                  <div style={{ fontSize: "11px", color: currentStep >= num ? "#a855f7" : "#64748b" }}>
                    {title}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ animation: "slideUp 0.4s ease" }}>
        {/* Step 1: Agreement Information */}
        {currentStep === 1 && (
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Agreement Information</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Agreement Start Date:
                </label>
                <input
                  type="date"
                  value={agreementStartDate}
                  onChange={(e) => setAgreementStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Agreement Term (Months):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={agreementTermMonths}
                    onChange={(e) => setAgreementTermMonths(parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setAgreementTermMonths(Math.max(1, agreementTermMonths - 1))}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setAgreementTermMonths(agreementTermMonths + 1)}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Co-Termed Start Date:
              </label>
              <p className="text-xs text-slate-400 mb-2">Select Co-Termed Start Date:</p>
              <input
                type="date"
                value={coTermStartDate}
                onChange={(e) => setCoTermStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-2">
                Selected Co-Termed Start Date: {coTermStartDate}
              </p>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 text-slate-300 mb-3">
                <input
                  type="checkbox"
                  checked={useCalculatedMonths}
                  onChange={(e) => setUseCalculatedMonths(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Use calculated months remaining</span>
              </label>

              {useCalculatedMonths ? (
                <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                  <p className="text-lg font-semibold text-blue-300">
                    Calculated Months Remaining: {monthsRemaining.toFixed(2)}
                  </p>
                </div>
              ) : (
                <div style={{
                  padding: "16px",
                  borderRadius: "8px",
                  background: "rgba(168,85,247,0.1)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  animation: "slideUp 0.3s ease"
                }}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Manual Co-Term Months:
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => setManualMonthsRemaining(Math.max(1, manualMonthsRemaining - 1))}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#e2e8f0",
                        fontSize: "18px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    >
                      <Minus size={16} style={{ margin: "0 auto" }} />
                    </button>
                    <input
                      type="number"
                      value={manualMonthsRemaining}
                      onChange={(e) => setManualMonthsRemaining(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      style={{
                        width: "120px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(0,0,0,0.3)",
                        color: "#e2e8f0",
                        fontSize: "14px",
                        textAlign: "center"
                      }}
                    />
                    <button
                      onClick={() => setManualMonthsRemaining(manualMonthsRemaining + 1)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#e2e8f0",
                        fontSize: "18px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    >
                      <Plus size={16} style={{ margin: "0 auto" }} />
                    </button>
                  </div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
                    Manually set to {manualMonthsRemaining} month{manualMonthsRemaining !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 text-slate-300 mb-4">
                <input
                  type="checkbox"
                  checked={addExtension}
                  onChange={(e) => setAddExtension(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Add Agreement Extension?</span>
              </label>

              {addExtension && (
                <div style={{
                  marginLeft: "24px",
                  padding: "16px",
                  borderRadius: "8px",
                  background: "rgba(168,85,247,0.1)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  animation: "slideUp 0.3s ease"
                }}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Extension Length (Months):
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => setExtensionMonths(Math.max(1, extensionMonths - 1))}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#e2e8f0",
                        fontSize: "18px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    >
                      <Minus size={16} style={{ margin: "0 auto" }} />
                    </button>
                    <input
                      type="number"
                      value={extensionMonths}
                      onChange={(e) => setExtensionMonths(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      style={{
                        width: "100px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(0,0,0,0.3)",
                        color: "#e2e8f0",
                        fontSize: "14px",
                        textAlign: "center"
                      }}
                    />
                    <button
                      onClick={() => setExtensionMonths(extensionMonths + 1)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#e2e8f0",
                        fontSize: "18px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    >
                      <Plus size={16} style={{ margin: "0 auto" }} />
                    </button>
                  </div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
                    Add {extensionMonths} month{extensionMonths !== 1 ? 's' : ''} to your co-term date
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Licensing */}
        {currentStep === 2 && (
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Service Information</h2>

            {/* Agreement Summary */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="text-blue-300 font-semibold mb-3">Agreement Information Summary</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Agreement Start Date:</div>
                  <div className="text-white font-medium">{agreementStartDate}</div>
                </div>
                <div>
                  <div className="text-slate-400">Agreement Term:</div>
                  <div className="text-white font-medium">{agreementTermMonths} months</div>
                </div>
                <div>
                  <div className="text-slate-400">Co-Term Start Date:</div>
                  <div className="text-white font-medium">{coTermStartDate}</div>
                </div>
                <div>
                  <div className="text-slate-400">Months Remaining:</div>
                  <div className="text-white font-medium">{monthsRemaining.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Manual Entry / Upload Toggle */}
            <div className="flex gap-4 mb-6">
              <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                Manual Entry
              </button>
              <button className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium">
                Upload Quote
              </button>
            </div>

            {/* Instructions */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="flex items-center gap-2 text-slate-300 font-semibold mb-3">
                  <FileText className="h-5 w-5" />
                  Important Instructions:
                </h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• Enter the number of line items based on the licenses you need to co-term.</li>
                  <li>• <strong>Billing Term</strong> must be selected to calculate costs properly.</li>
                  <li>• <strong>Unit Quantity:</strong> The number of licenses currently in use.</li>
                  <li>• <strong>Additional Licenses:</strong> New licenses being added (leave as 0 if no new licenses).</li>
                  <li className="text-yellow-400 flex items-start gap-2">
                    <span>⚠️</span>
                    <span>Make sure all fields are correctly filled before calculating costs.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-slate-300 font-semibold mb-3">For Monthly Agreements:</h4>
                <p className="text-sm text-slate-400 mb-4">**Enter the Monthly license cost in the "License Cost ($)" field.</p>

                <h4 className="text-slate-300 font-semibold mb-3">For Annual Agreements:</h4>
                <p className="text-sm text-slate-400 mb-4">**Enter the Annual license cost in the "License Cost ($)" field.</p>

                <h4 className="text-slate-300 font-semibold mb-3">For Pre-Paid Agreements:</h4>
                <p className="text-sm text-slate-400">**Enter the FULL Pre-Paid cost for each license. (Vision calculates the remaining term for the cost of the license in the BOM. You will need to find the full pre-paid cost for each license and add that to the calculator below)</p>
              </div>
            </div>

            {/* Line Items Configuration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Line Items:
              </label>
              <div className="flex gap-2 items-center max-w-xs">
                <input
                  type="number"
                  value={numberOfLineItems}
                  onChange={(e) => {
                    const num = parseInt(e.target.value) || 1;
                    setNumberOfLineItems(num);
                    // Adjust licenses array
                    if (num > licenses.length) {
                      const newLicenses = [...licenses];
                      for (let i = licenses.length; i < num; i++) {
                        newLicenses.push({
                          id: Date.now().toString() + i,
                          serviceDescription: '',
                          quantity: 1,
                          annualCost: 0,
                          additionalLicenses: 0
                        });
                      }
                      setLicenses(newLicenses);
                    } else {
                      setLicenses(licenses.slice(0, num));
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const num = Math.max(1, numberOfLineItems - 1);
                    setNumberOfLineItems(num);
                    setLicenses(licenses.slice(0, num));
                  }}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const num = numberOfLineItems + 1;
                    setNumberOfLineItems(num);
                    setLicenses([...licenses, {
                      id: Date.now().toString(),
                      serviceDescription: '',
                      quantity: 1,
                      annualCost: 0,
                      additionalLicenses: 0
                    }]);
                  }}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Billing Term
              </label>
              <select
                value={billingTerm}
                onChange={(e) => setBillingTerm(e.target.value as BillingTerm)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Annual">Annual</option>
                <option value="Monthly">Monthly</option>
                <option value="Pre-Paid">Pre-Paid</option>
              </select>
            </div>

            {/* License Items */}
            {licenses.map((license, index) => (
              <div key={license.id} className="mb-6 bg-slate-900 rounded-lg p-4 border border-slate-700">
                <h4 className="text-white font-semibold mb-4">Item {index + 1}</h4>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Service Description</label>
                    <input
                      type="text"
                      value={license.serviceDescription}
                      onChange={(e) => updateLicense(license.id, 'serviceDescription', e.target.value)}
                      placeholder="Enter service name"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Quantity</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={license.quantity}
                        onChange={(e) => updateLicense(license.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => updateLicense(license.id, 'quantity', Math.max(0, license.quantity - 1))}
                        className="px-2 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => updateLicense(license.id, 'quantity', license.quantity + 1)}
                        className="px-2 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      {billingTerm === 'Monthly' ? 'Monthly' : billingTerm === 'Annual' ? 'Annual' : 'Pre-Paid'} License Cost ($)
                    </label>
                    <input
                      type="number"
                      value={license.annualCost || ''}
                      onChange={(e) => updateLicense(license.id, 'annualCost', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder={billingTerm === 'Monthly' ? 'e.g., 100' : 'e.g., 1200'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Add. Licenses</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={license.additionalLicenses}
                        onChange={(e) => updateLicense(license.id, 'additionalLicenses', parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => updateLicense(license.id, 'additionalLicenses', Math.max(0, license.additionalLicenses - 1))}
                        className="px-2 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => updateLicense(license.id, 'additionalLicenses', license.additionalLicenses + 1)}
                        className="px-2 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Edit Agreement Section */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setShowAgreementEdit(!showAgreementEdit)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Agreement Information</h3>
                  <span className="text-sm text-slate-400">
                    {agreementStartDate} | {agreementTermMonths} months | {monthsRemaining.toFixed(2)} months remaining
                  </span>
                </div>
                {showAgreementEdit ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {showAgreementEdit && (
                <div className="p-6 border-t border-slate-700 bg-slate-900/50">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Agreement Start Date:
                      </label>
                      <input
                        type="date"
                        value={agreementStartDate}
                        onChange={(e) => setAgreementStartDate(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Agreement Term (Months):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={agreementTermMonths}
                          onChange={(e) => setAgreementTermMonths(parseInt(e.target.value) || 0)}
                          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => setAgreementTermMonths(Math.max(1, agreementTermMonths - 1))}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setAgreementTermMonths(agreementTermMonths + 1)}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Co-Termed Start Date:
                      </label>
                      <input
                        type="date"
                        value={coTermStartDate}
                        onChange={(e) => setCoTermStartDate(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-400 mt-1">Selected Co-Termed Start Date: {coTermStartDate}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Billing Term:
                      </label>
                      <select
                        value={billingTerm}
                        onChange={(e) => setBillingTerm(e.target.value as BillingTerm)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Annual">Annual</option>
                        <option value="Pre-Paid">Pre-Paid</option>
                      </select>
                    </div>
                  </div>

                  {useCalculatedMonths && (
                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-300 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Calculated Months Remaining: {monthsRemaining.toFixed(2)} months</span>
                      </div>
                      <p className="text-xs text-blue-400">
                        From {coTermStartDate} to {agreementStartDate} + {agreementTermMonths} months
                      </p>
                    </div>
                  )}

                  {/* Add Extension Checkbox */}
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="addExtension"
                        checked={addExtension}
                        onChange={(e) => setAddExtension(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="addExtension" className="text-sm font-medium text-slate-300 cursor-pointer">
                        Add Agreement Extension?
                      </label>
                    </div>

                    {addExtension && (
                      <div className="ml-7">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Extension Term (Months):
                        </label>
                        <div className="flex gap-2 max-w-xs">
                          <input
                            type="number"
                            value={extensionMonths}
                            onChange={(e) => setExtensionMonths(parseInt(e.target.value) || 0)}
                            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => setExtensionMonths(Math.max(1, extensionMonths - 1))}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setExtensionMonths(extensionMonths + 1)}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          New agreement end: {new Date(new Date(agreementStartDate).getTime() + (agreementTermMonths + extensionMonths) * 30.44 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Co-Terming Results ({billingTerm})</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">Calculations completed successfully!</span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700 rounded-lg p-4">
                  <div className="text-purple-300 text-sm mb-1">Current {billingTerm} Cost</div>
                  <div className="text-3xl font-bold text-white">
                    ${billingTerm === 'Monthly' ? results.currentMonthlyCost.toFixed(2) : results.currentAnnualCost.toFixed(2)}
                  </div>
                  <div className="text-purple-400 text-xs mt-1">
                    {licenses.reduce((sum, l) => sum + l.quantity, 0)} licenses
                    {billingTerm === 'Monthly' && <span className="ml-2">(${results.currentAnnualCost.toFixed(2)}/yr)</span>}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700 rounded-lg p-4">
                  <div className="text-green-300 text-sm mb-1">Updated {billingTerm} Cost</div>
                  <div className="text-3xl font-bold text-white">
                    ${billingTerm === 'Monthly' ? results.updatedMonthlyCost.toFixed(2) : results.updatedAnnualCost.toFixed(2)}
                  </div>
                  <div className="text-green-400 text-xs mt-1">
                    {results.totalLicenses} total licenses
                    {billingTerm === 'Monthly' && <span className="ml-2">(${results.updatedAnnualCost.toFixed(2)}/yr)</span>}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700 rounded-lg p-4">
                  <div className="text-blue-300 text-sm mb-1">
                    {billingTerm === 'Monthly' ? 'Total Cost of Remaining Term' : billingTerm === 'Pre-Paid' ? 'Total Co-Term Cost' : 'First Year Co-Term Cost'}
                  </div>
                  <div className="text-3xl font-bold text-white">${results.coTermCost.toFixed(2)}</div>
                  <div className="text-blue-400 text-xs mt-1">For {monthsRemaining.toFixed(2)} months</div>
                </div>

                <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-700 rounded-lg p-4">
                  <div className="text-orange-300 text-sm mb-1">Cost Change</div>
                  <div className="text-3xl font-bold text-white">+{results.costChangePercent.toFixed(1)}%</div>
                  <div className="text-orange-400 text-xs mt-1">
                    {billingTerm === 'Monthly'
                      ? `+$${results.monthlyCostChange.toFixed(2)}/mo`
                      : billingTerm === 'Annual'
                        ? `+$${results.costChange.toFixed(2)}/yr`
                        : `+$${results.costChange.toFixed(2)} total`}
                  </div>
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4 mb-6 flex items-start gap-3">
                <span className="text-orange-400 text-xl">ℹ️</span>
                <p className="text-orange-200 text-sm">
                  The new {billingTerm.toLowerCase()} cost represents a <strong>{results.costChangePercent.toFixed(1)}% increase</strong> from the current total cost of ownership. Additional licenses will increase your {billingTerm.toLowerCase()} spend.
                </p>
              </div>

              {/* Detailed Line Items */}
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Detailed Line Items
                  </h3>
                  <button
                    onClick={() => {
                      const newLicense: LicenseItem = {
                        id: Date.now().toString(),
                        serviceDescription: '',
                        quantity: 0,
                        annualCost: 0,
                        additionalLicenses: 0
                      };
                      setLicenses([...licenses, newLicense]);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Line Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 py-3 px-2">Service</th>
                        <th className="text-left text-slate-400 py-3 px-2">Qty</th>
                        <th className="text-left text-slate-400 py-3 px-2">{billingTerm} Fee</th>
                        <th className="text-left text-slate-400 py-3 px-2">Add. Licenses</th>
                        <th className="text-left text-slate-400 py-3 px-2">Current {billingTerm} Cost</th>
                        <th className="text-left text-slate-400 py-3 px-2">
                          {billingTerm === 'Monthly' ? 'Additional Monthly Cost' : 'Co-Term Cost'}
                        </th>
                        <th className="text-left text-slate-400 py-3 px-2">Updated {billingTerm} Cost</th>
                        <th className="text-left text-slate-400 py-3 px-2">Remaining Term Cost</th>
                        <th className="text-left text-slate-400 py-3 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {licenses.map((license) => {
                        const coTermCost = calculateCoTermCost(license);

                        // Calculate current and updated costs based on billing term
                        let currentCost, updatedCost, additionalMonthlyCost;
                        if (billingTerm === 'Monthly') {
                          currentCost = license.annualCost * license.quantity; // annualCost holds monthly cost for Monthly billing
                          updatedCost = currentCost + (license.annualCost * license.additionalLicenses);
                          additionalMonthlyCost = license.annualCost * license.additionalLicenses; // Just the additional monthly cost
                        } else {
                          currentCost = license.annualCost * license.quantity; // annualCost holds annual cost for Annual/Pre-Paid
                          updatedCost = currentCost + (license.annualCost * license.additionalLicenses);
                          additionalMonthlyCost = 0; // Not used for annual/pre-paid
                        }

                        // Calculate remaining total (always use monthly rate * months)
                        let monthlyRate = billingTerm === 'Monthly' ? license.annualCost : license.annualCost / 12;
                        const remainingTotal = (monthlyRate * (license.quantity + license.additionalLicenses)) * monthsRemaining;

                        return (
                          <tr key={license.id} className="border-b border-slate-800">
                            <td className="py-3 px-2">
                              {editingServiceId === license.id ? (
                                <input
                                  type="text"
                                  value={license.serviceDescription}
                                  onChange={(e) => {
                                    setLicenses(licenses.map(l =>
                                      l.id === license.id
                                        ? { ...l, serviceDescription: e.target.value }
                                        : l
                                    ));
                                  }}
                                  onBlur={() => setEditingServiceId(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setEditingServiceId(null);
                                    }
                                  }}
                                  autoFocus
                                  placeholder="Service name"
                                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm w-full focus:outline-none focus:border-blue-500"
                                />
                              ) : (
                                <div
                                  onClick={() => setEditingServiceId(license.id)}
                                  className="text-white cursor-pointer hover:text-blue-400 transition-colors px-2 py-1 min-h-[28px] flex items-start gap-2 group"
                                  title="Click to edit"
                                >
                                  <span className="flex-1 break-words">
                                    {license.serviceDescription || <span className="text-slate-500 italic">Click to add service name</span>}
                                  </span>
                                  <Edit2 className="h-3 w-3 text-slate-500 group-hover:text-blue-400 flex-shrink-0 mt-0.5" />
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <input
                                type="number"
                                value={license.quantity || ''}
                                onChange={(e) => {
                                  setLicenses(licenses.map(l =>
                                    l.id === license.id
                                      ? { ...l, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) }
                                      : l
                                  ));
                                }}
                                min="0"
                                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm w-20 focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-3 px-2">
                              <input
                                type="number"
                                value={license.annualCost || ''}
                                onChange={(e) => {
                                  setLicenses(licenses.map(l =>
                                    l.id === license.id
                                      ? { ...l, annualCost: e.target.value === '' ? 0 : parseFloat(e.target.value) }
                                      : l
                                  ));
                                }}
                                min="0"
                                step="0.01"
                                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm w-24 focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setLicenses(licenses.map(l =>
                                      l.id === license.id
                                        ? { ...l, additionalLicenses: Math.max(0, l.additionalLicenses - 1) }
                                        : l
                                    ));
                                  }}
                                  disabled={license.additionalLicenses === 0}
                                  className={`px-2 py-1 rounded text-white text-xs transition-colors ${
                                    license.additionalLicenses === 0
                                      ? 'bg-slate-800 cursor-not-allowed opacity-50'
                                      : 'bg-slate-700 hover:bg-slate-600'
                                  }`}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-blue-400 font-medium">+{license.additionalLicenses}</span>
                                <button
                                  onClick={() => {
                                    setLicenses(licenses.map(l =>
                                      l.id === license.id
                                        ? { ...l, additionalLicenses: l.additionalLicenses + 1 }
                                        : l
                                    ));
                                  }}
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-white">${currentCost.toFixed(2)}</td>
                            <td className="py-3 px-2 text-blue-400">
                              {billingTerm === 'Monthly'
                                ? `+$${additionalMonthlyCost.toFixed(2)}`
                                : `$${coTermCost.toFixed(2)}`}
                            </td>
                            <td className="py-3 px-2 text-white">${updatedCost.toFixed(2)}</td>
                            <td className="py-3 px-2 text-white font-semibold">${remainingTotal.toFixed(2)}</td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => {
                                  setLicenses(licenses.filter(l => l.id !== license.id));
                                }}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs transition-colors"
                                title="Delete line item"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-800 font-bold">
                        <td className="py-3 px-2 text-white">TOTAL</td>
                        <td className="py-3 px-2 text-white">{licenses.reduce((sum, l) => sum + l.quantity, 0)}</td>
                        <td className="py-3 px-2 text-white">${licenses.reduce((sum, l) => sum + l.annualCost, 0).toFixed(2)}</td>
                        <td className="py-3 px-2 text-white">{licenses.reduce((sum, l) => sum + l.additionalLicenses, 0)}</td>
                        <td className="py-3 px-2 text-white">
                          ${billingTerm === 'Monthly'
                            ? results.currentMonthlyCost.toFixed(2)
                            : results.currentAnnualCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-blue-400">
                          {billingTerm === 'Monthly'
                            ? `+$${results.monthlyCostChange.toFixed(2)}`
                            : `$${results.coTermCost.toFixed(2)}`}
                        </td>
                        <td className="py-3 px-2 text-white">
                          ${billingTerm === 'Monthly'
                            ? results.updatedMonthlyCost.toFixed(2)
                            : results.updatedAnnualCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-white">${results.remainingTotal.toFixed(2)}</td>
                        <td className="py-3 px-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* License Summary & Cost Breakdown */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="text-purple-400">👥</span>
                  License Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Current Licenses</span>
                    <span className="text-2xl font-bold text-white">{licenses.reduce((sum, l) => sum + l.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-blue-400">Additional Licenses</span>
                    <span className="text-2xl font-bold text-blue-400">+{licenses.reduce((sum, l) => sum + l.additionalLicenses, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-green-900/20 border border-green-700 rounded-lg px-4">
                    <span className="text-green-300 font-medium">Total Licenses</span>
                    <span className="text-3xl font-bold text-green-400">{results.totalLicenses}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="text-green-400">💲</span>
                  Cost Breakdown
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Current {billingTerm}</span>
                    <span className="text-xl font-bold text-white">
                      ${billingTerm === 'Monthly' ? results.currentMonthlyCost.toFixed(2) : results.currentAnnualCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">New {billingTerm}</span>
                    <span className="text-xl font-bold text-white">
                      ${billingTerm === 'Monthly' ? results.updatedMonthlyCost.toFixed(2) : results.updatedAnnualCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-orange-900/20 border border-orange-700 rounded-lg px-4">
                    <span className="text-orange-300">Difference</span>
                    <span className="text-xl font-bold text-orange-400">
                      +${billingTerm === 'Monthly' ? results.monthlyCostChange.toFixed(2) : results.costChange.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-purple-900/20 border border-purple-700 rounded-lg px-4">
                    <div>
                      <div className="text-purple-300 font-medium">Remaining Term Total</div>
                      <div className="text-purple-400 text-xs">{monthsRemaining.toFixed(2)} months remaining</div>
                    </div>
                    <span className="text-2xl font-bold text-purple-400">${results.remainingTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-blue-900/30 border border-blue-700 rounded-lg px-4">
                    <div>
                      <div className="text-blue-300 font-medium">Total Cost of Ownership (TCO)</div>
                      <div className="text-blue-400 text-xs">{agreementTermMonths} month contract</div>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">${results.totalCostOfOwnership.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Comparison Chart */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-2xl">
              <h3 className="text-white font-bold text-xl mb-8">Cost Comparison</h3>

              <div className="relative flex">
                {/* Y-Axis Scale */}
                {(() => {
                  // Calculate the maximum value for scaling
                  const maxValue = Math.max(
                    billingTerm === 'Monthly' ? results.currentMonthlyCost : results.currentAnnualCost,
                    billingTerm === 'Monthly' ? results.updatedMonthlyCost : results.updatedAnnualCost,
                    results.remainingTotal,
                    results.totalCostOfOwnership
                  );

                  // Dynamically determine appropriate scale based on value range
                  let scale = 1;
                  let suffix = '';
                  let decimals = 0;

                  if (maxValue >= 1000000) {
                    scale = 1000000;
                    suffix = 'M';
                    decimals = 1;
                  } else if (maxValue >= 10000) {
                    scale = 1000;
                    suffix = 'k';
                    decimals = 0;
                  } else if (maxValue >= 1000) {
                    scale = 100;
                    suffix = '';
                    decimals = 0;
                  } else {
                    scale = 10;
                    suffix = '';
                    decimals = 0;
                  }

                  const roundedMax = Math.ceil(maxValue / scale) * scale;
                  const scaleSteps = 5;
                  const stepValue = roundedMax / (scaleSteps - 1);

                  return (
                    <div className="flex flex-col justify-between mr-4" style={{ height: '280px', paddingBottom: '0px' }}>
                      {Array.from({ length: scaleSteps }).map((_, i) => {
                        const value = roundedMax - (i * stepValue);
                        const displayValue = suffix ? (value / (scale * (suffix === 'M' ? 1 : 1))).toFixed(decimals) : value.toFixed(decimals);
                        return (
                          <div key={i} className="text-slate-400 text-xs font-mono text-right pr-2" style={{ height: '0px' }}>
                            ${displayValue}{suffix}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                <div className="flex-1 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '280px', left: '0' }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-slate-700/50" />
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="flex items-end justify-center gap-6 px-4 relative" style={{ height: '380px', paddingBottom: '80px' }}>
                    {(() => {
                      // Calculate the maximum value for scaling
                      const maxValue = Math.max(
                        billingTerm === 'Monthly' ? results.currentMonthlyCost : results.currentAnnualCost,
                        billingTerm === 'Monthly' ? results.updatedMonthlyCost : results.updatedAnnualCost,
                        results.remainingTotal,
                        results.totalCostOfOwnership
                      );

                      // Helper function to format currency values dynamically
                      const formatCurrency = (value: number, compact: boolean = false) => {
                        if (value >= 1000000) {
                          return compact ? `$${(value / 1000000).toFixed(1)}M` : `$${(value / 1000000).toFixed(2)}M`;
                        } else if (value >= 10000) {
                          return compact ? `$${(value / 1000).toFixed(0)}k` : `$${(value / 1000).toFixed(1)}k`;
                        } else if (value >= 1000) {
                          return compact ? `$${(value / 1000).toFixed(1)}k` : `$${value.toFixed(0)}`;
                        } else {
                          return `$${value.toFixed(0)}`;
                        }
                      };

                    const bars = [
                      {
                        value: billingTerm === 'Monthly' ? results.currentMonthlyCost : results.currentAnnualCost,
                        label: `Current ${billingTerm} Cost`,
                        color: 'from-blue-600 via-blue-500 to-blue-400',
                        shadowColor: 'shadow-blue-500/50',
                        borderColor: 'border-blue-400/30'
                      },
                      {
                        value: billingTerm === 'Monthly' ? results.updatedMonthlyCost : results.updatedAnnualCost,
                        label: `Updated ${billingTerm} Cost`,
                        color: 'from-purple-600 via-purple-500 to-purple-400',
                        shadowColor: 'shadow-purple-500/50',
                        borderColor: 'border-purple-400/30'
                      },
                      {
                        value: results.remainingTotal,
                        label: 'Remaining Term Cost',
                        color: 'from-orange-600 via-orange-500 to-orange-400',
                        shadowColor: 'shadow-orange-500/50',
                        borderColor: 'border-orange-400/30'
                      },
                      {
                        value: results.totalCostOfOwnership,
                        label: `Total Cost of Ownership (${agreementTermMonths} months)`,
                        color: 'from-emerald-600 via-emerald-500 to-emerald-400',
                        shadowColor: 'shadow-emerald-500/50',
                        borderColor: 'border-emerald-400/30'
                      }
                    ];

                    return bars.map((bar, index) => {
                      const heightPercent = Math.max(15, (bar.value / maxValue) * 100);

                      return (
                        <div key={index} className="flex flex-col items-center group relative" style={{ width: '130px' }}>
                          {/* Bar container with fixed height */}
                          <div className="w-full flex flex-col justify-end items-center relative" style={{ height: '280px' }}>
                            {/* Bar */}
                            <div
                              className={`w-full bg-gradient-to-t ${bar.color} rounded-t-xl transition-all duration-700 ease-out ${bar.shadowColor} shadow-lg border-2 ${bar.borderColor} hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden`}
                              style={{ height: `${heightPercent}%` }}
                            >
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              {/* Value label on bar */}
                              <div className="absolute top-2 left-0 right-0 text-center">
                                <div className="text-white font-bold text-sm drop-shadow-lg">
                                  {formatCurrency(bar.value, true)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bottom labels - Fixed position below bars */}
                          <div className="absolute text-center" style={{ top: '290px', width: '130px' }}>
                            <div className="text-white font-bold text-base mb-1">
                              {formatCurrency(bar.value, false)}
                            </div>
                            <div className="text-slate-400 text-xs leading-tight px-1" style={{ minHeight: '32px' }}>
                              {bar.label}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Export and Email Section */}
            <div className="space-y-6">
              {/* Logo Upload Section */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm text-slate-400 mb-2">Company Logo (Optional)</label>
                <div className="flex items-center gap-3">
                  {companyLogo ? (
                    <div className="relative">
                      <img src={companyLogo} alt="Company Logo" className="h-16 w-auto border border-slate-600 rounded" />
                      <button
                        onClick={() => setCompanyLogo(null)}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white text-sm transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      Upload Logo
                    </label>
                  )}
                </div>
              </div>

              {/* PDF and Email Buttons - Same Line */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="h-5 w-5" />
                  {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
                </button>

                <button
                  onClick={generateEmailContent}
                  disabled={isGeneratingEmail}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="h-5 w-5" />
                  {isGeneratingEmail ? 'Generating Email...' : 'Generate Email'}
                </button>
              </div>

              {/* Email Preview Section */}
              {generatedEmail && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-green-400" />
                    Email Preview
                  </h3>
                  <textarea
                    value={generatedEmail}
                    onChange={(e) => setGeneratedEmail(e.target.value)}
                    className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 text-sm font-mono resize-none focus:outline-none focus:border-green-500 mb-3"
                    placeholder="Generated email will appear here..."
                  />
                  <button
                    onClick={copyEmailToClipboard}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            ← Previous
          </button>

          <div className="text-slate-400 text-sm">
            Step {currentStep} of 3
          </div>

          {currentStep === 3 ? (
            <div className="flex gap-3">
              <button
                onClick={handleSaveCalculation}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Save className="h-5 w-5" />
                Save Calculation
              </button>
              <button
                onClick={handleStartOver}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                Start Over
              </button>
            </div>
          ) : (
            <button
              onClick={nextStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 2
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {currentStep === 2 ? 'Calculate' : 'Next'} →
            </button>
          )}
        </div>
            </div>
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

        {/* Right Panel - AI Assistant */}
        <aside style={{
          width: `${rightWidth}px`,
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          background: "#0a0d14",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span>💬</span>
              Ask AI Assistant
            </h3>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column" }}>
            {chatMessages.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px", lineHeight: 1.5 }}>
                Ask questions about co-terming, licensing calculations, or request changes to your calculator. For example: "Add a new license called License 1 with monthly cost of $100 and add 2 additional licenses"
              </p>
            ) : (
              <div style={{ flex: 1, marginBottom: "16px", overflowY: "auto" }}>
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "12px",
                      padding: "12px",
                      borderRadius: "8px",
                      background: msg.role === 'user' ? "rgba(168, 85, 247, 0.1)" : "rgba(59, 130, 246, 0.1)",
                      border: `1px solid ${msg.role === 'user' ? "rgba(168, 85, 247, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px", fontWeight: "600" }}>
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div style={{ fontSize: "13px", color: "#e2e8f0", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {msg.content.replace(/\{[\s\S]*"actions"[\s\S]*\}/, '').trim() || msg.content}
                    </div>
                  </div>
                ))}
                {isLoadingChat && (
                  <div style={{ padding: "12px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                    Thinking...
                  </div>
                )}
              </div>
            )}
            <div style={{ marginTop: "auto" }}>
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="e.g., Add a license called License 1 with monthly cost $100"
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0,0,0,0.3)",
                  color: "#e2e8f0",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  marginBottom: "12px",
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isLoadingChat}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: chatInput.trim() && !isLoadingChat ? "linear-gradient(135deg, #a855f7, #9333ea)" : "rgba(255,255,255,0.1)",
                  color: chatInput.trim() && !isLoadingChat ? "#fff" : "#64748b",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: chatInput.trim() && !isLoadingChat ? "pointer" : "default",
                  transition: "all 0.2s",
                  fontFamily: "inherit"
                }}
              >
                {isLoadingChat ? 'Sending...' : 'Send Question'}
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
          style={{ color: "#94a3b8", textDecoration: "underline", textUnderlineOffset: "2px", transition: "color 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#e2e8f0"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
        >
          InterPeak Technology Solutions
        </a>
      </footer>
    </div>
  );
}
