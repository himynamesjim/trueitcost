'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { CheckCircle2, Calendar, FileText, Mail, Minus, Plus, Download } from 'lucide-react';

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

  // Step 1: Agreement Info
  const [agreementStartDate, setAgreementStartDate] = useState('2025-04-02');
  const [agreementTermMonths, setAgreementTermMonths] = useState(36);
  const [coTermStartDate, setCoTermStartDate] = useState('2025-10-02');
  const [useCalculatedMonths, setUseCalculatedMonths] = useState(true);
  const [addExtension, setAddExtension] = useState(false);

  // Step 2: Licensing
  const [numberOfLineItems, setNumberOfLineItems] = useState(1);
  const [billingTerm, setBillingTerm] = useState<BillingTerm>('Annual');
  const [licenses, setLicenses] = useState<LicenseItem[]>([
    { id: '1', serviceDescription: '', quantity: 1, annualCost: 0, additionalLicenses: 0 }
  ]);

  // Calculated values
  const calculateMonthsRemaining = () => {
    const start = new Date(agreementStartDate);
    const coTerm = new Date(coTermStartDate);
    const diffTime = coTerm.getTime() - start.getTime();
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);
    return Math.max(0, agreementTermMonths - diffMonths);
  };

  const monthsRemaining = calculateMonthsRemaining();

  const updateLicense = (id: string, field: keyof LicenseItem, value: any) => {
    setLicenses(licenses.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const calculateCoTermCost = (license: LicenseItem) => {
    const monthlyRate = license.annualCost / 12;
    return monthlyRate * monthsRemaining;
  };

  const calculateResults = () => {
    const currentAnnualCost = licenses.reduce((sum, l) => sum + (l.annualCost * l.quantity), 0);
    const coTermCost = licenses.reduce((sum, l) => sum + calculateCoTermCost(l), 0);
    const additionalLicensesCost = licenses.reduce((sum, l) => sum + (l.annualCost * l.additionalLicenses), 0);
    const updatedAnnualCost = currentAnnualCost + additionalLicensesCost;
    const remainingTotal = updatedAnnualCost * (monthsRemaining / 12);
    const totalCostOfOwnership = currentAnnualCost + remainingTotal;

    return {
      currentAnnualCost,
      coTermCost,
      updatedAnnualCost,
      costChange: updatedAnnualCost - currentAnnualCost,
      costChangePercent: currentAnnualCost > 0 ? ((updatedAnnualCost - currentAnnualCost) / currentAnnualCost * 100) : 0,
      remainingTotal,
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
    <div className="min-h-screen bg-slate-900">
      <SiteHeader />

      <div className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white text-center mb-8">Co-Terming Cost Calculator</h1>

          {/* Step Indicators */}
          <div className="grid grid-cols-4 gap-4">
            <StepIndicator
              step={1}
              title="Agreement Info"
              status={currentStep > 1 ? 'complete' : currentStep === 1 ? 'current' : 'upcoming'}
            />
            <StepIndicator
              step={2}
              title="Licensing"
              status={currentStep > 2 ? 'complete' : currentStep === 2 ? 'current' : 'upcoming'}
            />
            <StepIndicator
              step={3}
              title="Results"
              status={currentStep > 3 ? 'complete' : currentStep === 3 ? 'current' : 'upcoming'}
            />
            <StepIndicator
              step={4}
              title="Email Template"
              status={currentStep === 4 ? 'current' : 'upcoming'}
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
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

              {useCalculatedMonths && (
                <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                  <p className="text-lg font-semibold text-blue-300">
                    Calculated Months Remaining: {monthsRemaining.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={addExtension}
                  onChange={(e) => setAddExtension(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Add Agreement Extension?</span>
              </label>
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
                    <label className="block text-sm text-slate-400 mb-2">Annual License Cost ($)</label>
                    <input
                      type="number"
                      value={license.annualCost}
                      onChange={(e) => updateLicense(license.id, 'annualCost', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
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
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Co-Terming Results</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">Calculations completed successfully!</span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700 rounded-lg p-4">
                  <div className="text-blue-300 text-sm mb-1">First Year Co-Term Cost</div>
                  <div className="text-3xl font-bold text-white">${results.coTermCost.toFixed(2)}</div>
                  <div className="text-blue-400 text-xs mt-1">For {monthsRemaining.toFixed(2)} months</div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700 rounded-lg p-4">
                  <div className="text-purple-300 text-sm mb-1">Current Annual Cost</div>
                  <div className="text-3xl font-bold text-white">${results.currentAnnualCost.toFixed(2)}</div>
                  <div className="text-purple-400 text-xs mt-1">{licenses.reduce((sum, l) => sum + l.quantity, 0)} licenses</div>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700 rounded-lg p-4">
                  <div className="text-green-300 text-sm mb-1">Updated Annual Cost</div>
                  <div className="text-3xl font-bold text-white">${results.updatedAnnualCost.toFixed(2)}</div>
                  <div className="text-green-400 text-xs mt-1">{results.totalLicenses} total licenses</div>
                </div>

                <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-700 rounded-lg p-4">
                  <div className="text-orange-300 text-sm mb-1">Cost Change</div>
                  <div className="text-3xl font-bold text-white">+{results.costChangePercent.toFixed(1)}%</div>
                  <div className="text-orange-400 text-xs mt-1">${results.costChange.toFixed(2)}</div>
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4 mb-6 flex items-start gap-3">
                <span className="text-orange-400 text-xl">ℹ️</span>
                <p className="text-orange-200 text-sm">
                  The new annual cost represents a <strong>{results.costChangePercent.toFixed(1)}% increase</strong> from the current total cost of ownership. Additional licenses will increase your annual spend.
                </p>
              </div>

              {/* Detailed Line Items */}
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Detailed Line Items
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 py-3 px-2">Service</th>
                        <th className="text-left text-slate-400 py-3 px-2">Qty</th>
                        <th className="text-left text-slate-400 py-3 px-2">Annual Fee</th>
                        <th className="text-left text-slate-400 py-3 px-2">Add. Licenses</th>
                        <th className="text-left text-slate-400 py-3 px-2">Co-Term Cost</th>
                        <th className="text-left text-slate-400 py-3 px-2">Current Annual Cost</th>
                        <th className="text-left text-slate-400 py-3 px-2">Updated Annual Cost</th>
                        <th className="text-left text-slate-400 py-3 px-2">Remaining Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {licenses.map((license) => {
                        const coTermCost = calculateCoTermCost(license);
                        const currentAnnual = license.annualCost * license.quantity;
                        const updatedAnnual = currentAnnual + (license.annualCost * license.additionalLicenses);
                        const remainingTotal = updatedAnnual * (monthsRemaining / 12);

                        return (
                          <tr key={license.id} className="border-b border-slate-800">
                            <td className="py-3 px-2 text-white">{license.serviceDescription || 'Unnamed'}</td>
                            <td className="py-3 px-2 text-white">{license.quantity}</td>
                            <td className="py-3 px-2 text-white">${license.annualCost.toFixed(2)}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <button className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs">
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-blue-400 font-medium">+{license.additionalLicenses}</span>
                                <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs">
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-blue-400">${coTermCost.toFixed(2)}</td>
                            <td className="py-3 px-2 text-white">${currentAnnual.toFixed(2)}</td>
                            <td className="py-3 px-2 text-white">${updatedAnnual.toFixed(2)}</td>
                            <td className="py-3 px-2 text-white font-semibold">${remainingTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-800 font-bold">
                        <td className="py-3 px-2 text-white">TOTAL</td>
                        <td className="py-3 px-2 text-white">{licenses.reduce((sum, l) => sum + l.quantity, 0)}</td>
                        <td className="py-3 px-2 text-white">-</td>
                        <td className="py-3 px-2 text-white">{licenses.reduce((sum, l) => sum + l.additionalLicenses, 0)}</td>
                        <td className="py-3 px-2 text-blue-400">${results.coTermCost.toFixed(2)}</td>
                        <td className="py-3 px-2 text-white">${results.currentAnnualCost.toFixed(2)}</td>
                        <td className="py-3 px-2 text-white">${results.updatedAnnualCost.toFixed(2)}</td>
                        <td className="py-3 px-2 text-white">${results.remainingTotal.toFixed(2)}</td>
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
                    <span className="text-slate-400">Current Annual</span>
                    <span className="text-xl font-bold text-white">${results.currentAnnualCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">New Annual</span>
                    <span className="text-xl font-bold text-white">${results.updatedAnnualCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-orange-900/20 border border-orange-700 rounded-lg px-4">
                    <span className="text-orange-300">Difference</span>
                    <span className="text-xl font-bold text-orange-400">${results.costChange.toFixed(2)}</span>
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
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-6">Cost Comparison</h3>

              <div className="h-64 flex items-end justify-around gap-4">
                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(5, (results.coTermCost / results.remainingTotal) * 100)}%` }}
                  />
                  <div className="text-green-400 font-bold mt-2">${results.coTermCost.toFixed(2)}</div>
                  <div className="text-slate-400 text-xs text-center mt-1">First Year Co-Term Cost</div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(5, (results.currentAnnualCost / results.remainingTotal) * 100)}%` }}
                  />
                  <div className="text-purple-400 font-bold mt-2">${results.currentAnnualCost.toFixed(2)}</div>
                  <div className="text-slate-400 text-xs text-center mt-1">Current Annual Cost</div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(5, (results.updatedAnnualCost / results.remainingTotal) * 100)}%` }}
                  />
                  <div className="text-orange-400 font-bold mt-2">${results.updatedAnnualCost.toFixed(2)}</div>
                  <div className="text-slate-400 text-xs text-center mt-1">Updated Annual Cost</div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all duration-500"
                    style={{ height: '100%' }}
                  />
                  <div className="text-red-400 font-bold mt-2">${results.remainingTotal.toFixed(2)}</div>
                  <div className="text-slate-400 text-xs text-center mt-1">Remaining Total Subscription Cost</div>
                </div>
              </div>
            </div>

            {/* Export Section */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Export Results
                  </h3>
                  <p className="text-slate-400 text-sm">Download a comprehensive PDF report with all calculations</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  <Download className="h-5 w-5" />
                  Download PDF Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Email Template */}
        {currentStep === 4 && (
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Email Template
            </h2>

            <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-300 mb-4">Email template generation coming soon...</p>
              <p className="text-slate-400 text-sm">This section will include a pre-formatted email template with all the co-terming calculations and details to send to your vendor or finance team.</p>
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
            Step {currentStep} of 4
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === 4}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 4
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : currentStep === 2
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {currentStep === 2 ? 'Calculate' : 'Next'} →
          </button>
        </div>
      </main>
    </div>
  );
}
