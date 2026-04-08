'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import NavMenu from '@/components/nav-menu';

interface SavedSolution {
  id: string;
  design_type: string;
  title: string;
  created_at: string;
  updated_at: string;
  design_data: any;
  ai_response: any;
}

export default function SavedSolutionsPage() {
  const router = useRouter();
  const [solutions, setSolutions] = useState<SavedSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      const response = await fetch('/api/get-designs');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched solutions:', data.designs);
        setSolutions(data.designs || []);
      }
    } catch (error) {
      console.error('Error fetching solutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (e: React.MouseEvent, solution: SavedSolution) => {
    e.stopPropagation();
    setEditingId(solution.id);
    setEditingTitle(solution.title);
  };

  const handleEditSave = async (e: React.MouseEvent, solutionId: string) => {
    e.stopPropagation();
    if (!editingTitle.trim()) return;

    try {
      const response = await fetch('/api/get-designs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: solutionId, title: editingTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        setSolutions(prev => prev.map(s =>
          s.id === solutionId ? { ...s, title: editingTitle, updated_at: data.design.updated_at } : s
        ));
        setEditingId(null);
        setEditingTitle('');
      }
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDelete = async (e: React.MouseEvent, solutionId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this solution?')) return;

    try {
      const response = await fetch('/api/get-designs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: solutionId }),
      });

      if (response.ok) {
        setSolutions(prev => prev.filter(s => s.id !== solutionId));
      }
    } catch (error) {
      console.error('Error deleting solution:', error);
    }
  };

  const getCategoryInfo = (designType: string) => {
    const categories: Record<string, { icon: string; color: string; name: string }> = {
      'ai-solution': { icon: '🤖', color: '#8b5cf6', name: 'AI Solution' },
      'custom': { icon: '✨', color: '#f59e0b', name: 'Custom Solution' },
      'ucaas': { icon: '☎️', color: '#3b82f6', name: 'UCaaS & Voice' },
      'collaboration': { icon: '🎥', color: '#ec4899', name: 'Collaboration' },
      'networking': { icon: '🌐', color: '#10b981', name: 'Networking' },
      'datacenter': { icon: '🖥️', color: '#6366f1', name: 'Data Center' },
      'security': { icon: '🔒', color: '#ef4444', name: 'Security' },
      'bcdr': { icon: '☁️', color: '#06b6d4', name: 'BCDR' },
      'assessment': { icon: '🎯', color: '#f97316', name: 'MSP Assessment' },
      'coterm-calc': { icon: '📊', color: '#14b8a6', name: 'Co-Term Calculator' },
    };
    return categories[designType] || { icon: '📄', color: '#6b7280', name: designType };
  };

  const filteredSolutions = filter === 'all'
    ? solutions
    : solutions.filter(s => s.design_type === filter);

  const categories = ['all', ...new Set(solutions.map(s => s.design_type))];

  const openSolution = (solution: SavedSolution) => {
    // Store the solution ID in localStorage to load it on the destination page
    localStorage.setItem('loadSolutionId', solution.id);

    // Route to the appropriate page based on design type
    if (solution.design_type === 'assessment') {
      router.push('/assessment');
    } else if (solution.design_type === 'coterm-calc') {
      router.push('/coterm-calc');
    } else {
      router.push('/ai-solutions');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <SiteHeader />
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
          {/* Left Panel - Navigation Menu */}
          <aside className="dark:bg-[#0a0d14] bg-white" style={{
            width: '280px',
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: 'flex',
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}>
            <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <h3 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                TrueITCost
              </h3>
            </div>
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              <NavMenu />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading your solutions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />

      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Left Panel - Navigation Menu */}
        <aside className="dark:bg-[#0a0d14] bg-white" style={{
          width: '280px',
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: 'flex',
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <h3 className="dark:text-slate-200 text-slate-900" style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
              TrueITCost
            </h3>
          </div>
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            <NavMenu />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Saved Solutions
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                All your IT solutions and assessments in one place
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map(cat => {
                const info = cat === 'all' ? { icon: '📁', name: 'All Solutions' } : getCategoryInfo(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${filter === cat
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <span className="mr-2">{info.icon}</span>
                    {info.name}
                  </button>
                );
              })}
            </div>

            {/* Solutions Grid */}
            {filteredSolutions.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No solutions found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {filter === 'all'
                    ? 'Start creating solutions to see them here'
                    : 'No solutions in this category yet'
                  }
                </p>
                <button
                  onClick={() => router.push('/ai-solutions')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create New Solution
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSolutions.map(solution => {
                  const info = getCategoryInfo(solution.design_type);

                  // Extract additional details from design_data and ai_response
                  const designData = solution.design_data || {};
                  const aiResponse = solution.ai_response || {};

                  // Log for debugging
                  console.log('Solution:', solution.title);
                  console.log('Design data:', designData);
                  console.log('AI response:', aiResponse);

                  // Extract key details based on solution type
                  let details = [];
                  let costInfo = null;

                  if (solution.design_type === 'assessment') {
                    if (designData.company_name) details.push({ icon: '🏢', label: designData.company_name });
                    if (designData.employee_count) details.push({ icon: '👥', label: `${designData.employee_count} employees` });
                    if (designData.current_stack) details.push({ icon: '⚙️', label: designData.current_stack });

                    // Extract assessment costs
                    if (aiResponse.total_monthly_cost || designData.total_monthly_cost) {
                      const monthlyCost = aiResponse.total_monthly_cost || designData.total_monthly_cost;
                      const annualCost = monthlyCost * 12;
                      costInfo = {
                        monthly: monthlyCost,
                        annual: annualCost,
                        label: 'Total MSP Cost'
                      };
                    }
                  } else if (solution.design_type === 'coterm-calc') {
                    if (designData.contract_count) details.push({ icon: '📄', label: `${designData.contract_count} contracts` });

                    // Extract co-term costs from various possible locations
                    const totalCost = designData.total_cost || designData.totalCost ||
                                     designData.alignedTotal || aiResponse.total_cost;
                    const monthlyCost = designData.monthly_cost || designData.monthlyCost ||
                                       designData.monthlyTotal || aiResponse.monthly_cost;

                    if (totalCost) {
                      costInfo = {
                        total: totalCost,
                        label: 'Total Contract Cost'
                      };
                    } else if (monthlyCost) {
                      costInfo = {
                        monthly: monthlyCost,
                        annual: monthlyCost * 12,
                        label: 'Total Contract Cost'
                      };
                    }
                  } else {
                    // AI Solution details
                    if (designData.company_size) details.push({ icon: '👥', label: designData.company_size });
                    if (designData.industry) details.push({ icon: '🏭', label: designData.industry });
                    if (designData.solution_type) details.push({ icon: '✨', label: designData.solution_type });

                    // Extract AI solution costs from tiers array or other locations
                    let monthlyCost = aiResponse.monthly_cost || aiResponse.monthlyCost ||
                                     designData.monthly_cost || aiResponse.totalMonthlyCost ||
                                     aiResponse.total_monthly_cost;

                    console.log('🔍 Cost extraction for:', solution.title);
                    console.log('📊 AI Response structure:', aiResponse);
                    console.log('💰 Initial monthlyCost:', monthlyCost);

                    // Check if tiers array exists and extract cost from selected tier
                    if (!monthlyCost && aiResponse.tiers && Array.isArray(aiResponse.tiers)) {
                      console.log('🎯 Found tiers array:', aiResponse.tiers);
                      const selectedTierIndex = designData.selectedTier || aiResponse.selectedTier || 1;
                      console.log('📍 Selected tier index:', selectedTierIndex);
                      const selectedTier = aiResponse.tiers[selectedTierIndex];
                      console.log('🎪 Selected tier object:', selectedTier);

                      if (selectedTier) {
                        // Check for numeric costs first
                        let tierCost = selectedTier.monthlyCost || selectedTier.monthly_cost;

                        // If not found, check sections array for cost information
                        if (!tierCost && selectedTier.sections && Array.isArray(selectedTier.sections)) {
                          console.log('🔍 Checking sections for cost:', selectedTier.sections);
                          for (let i = 0; i < selectedTier.sections.length; i++) {
                            const section = selectedTier.sections[i];
                            console.log(`  📦 Section ${i}:`, section);

                            // Look for cost in section items
                            if (section.items && Array.isArray(section.items)) {
                              console.log(`    📋 Section ${i} has ${section.items.length} items:`, section.items);
                              for (let j = 0; j < section.items.length; j++) {
                                const item = section.items[j];
                                console.log(`      🔸 Item ${j}:`, item, `(type: ${typeof item})`);

                                // Check if item contains cost-like text
                                if (typeof item === 'string' && item.includes('$') && (item.includes('-') || item.includes('/'))) {
                                  tierCost = item;
                                  console.log('💰 Found cost in section item:', tierCost);
                                  break;
                                }

                                // Also check if item is an object with a cost field
                                if (typeof item === 'object' && item !== null) {
                                  const costField = item.cost || item.price || item.estimate || item.totalEstimate;
                                  if (costField && typeof costField === 'string' && costField.includes('$')) {
                                    tierCost = costField;
                                    console.log('💰 Found cost in item object:', tierCost);
                                    break;
                                  }
                                }
                              }
                            }
                            if (tierCost) break;
                          }
                        }

                        // If not found, check for totalEstimate string (e.g., "$500 - $1,000")
                        if (!tierCost && selectedTier.totalEstimate && selectedTier.totalEstimate.includes('$')) {
                          tierCost = selectedTier.totalEstimate;
                        }

                        monthlyCost = tierCost;
                        console.log('💵 Monthly cost from selected tier:', monthlyCost);
                      }

                      // If no tier selected or no cost found, show info from all tiers
                      if (!monthlyCost && aiResponse.tiers.length > 0) {
                        console.log('📈 No selected tier cost, checking all tiers...');

                        // Get the selected tier or middle tier
                        const displayTierIndex = selectedTierIndex < aiResponse.tiers.length ? selectedTierIndex : Math.floor(aiResponse.tiers.length / 2);
                        const displayTier = aiResponse.tiers[displayTierIndex];

                        if (displayTier) {
                          let tierEstimate = displayTier.monthlyCost || displayTier.monthly_cost;

                          // Check sections for cost
                          if (!tierEstimate && displayTier.sections && Array.isArray(displayTier.sections)) {
                            for (const section of displayTier.sections) {
                              if (section.items && Array.isArray(section.items)) {
                                for (const item of section.items) {
                                  if (typeof item === 'string' && item.includes('$') && (item.includes('-') || item.includes('/'))) {
                                    tierEstimate = item;
                                    break;
                                  }
                                }
                              }
                              if (tierEstimate) break;
                            }
                          }

                          // Check totalEstimate only if it has $ sign
                          if (!tierEstimate && displayTier.totalEstimate && displayTier.totalEstimate.includes('$')) {
                            tierEstimate = displayTier.totalEstimate;
                          }

                          if (tierEstimate) {
                            costInfo = {
                              monthly: tierEstimate,
                              label: `${displayTier.tierName || 'Solution'} Cost`
                            };
                            console.log('✅ Set cost from tier:', costInfo);
                          }
                        }
                      }
                    }

                    if (monthlyCost && !costInfo) {
                      costInfo = {
                        monthly: monthlyCost,
                        annual: typeof monthlyCost === 'number' ? monthlyCost * 12 : null,
                        label: 'Solution Cost'
                      };
                      console.log('✅ Set cost from monthlyCost:', costInfo);
                    }

                    console.log('🎯 Final costInfo before hardware check:', costInfo);

                    // Check for hardware costs
                    let hardwareCost = aiResponse.hardware_cost || aiResponse.hardwareCost ||
                                      designData.hardware_cost || aiResponse.totalHardwareCost;

                    // Also check tiers for hardware cost
                    if (!hardwareCost && aiResponse.tiers && Array.isArray(aiResponse.tiers)) {
                      const selectedTierIndex = designData.selectedTier || aiResponse.selectedTier || 1;
                      const selectedTier = aiResponse.tiers[selectedTierIndex];

                      if (selectedTier) {
                        hardwareCost = selectedTier.hardwareCost || selectedTier.hardware_cost;
                      }
                    }

                    if (hardwareCost) {
                      if (costInfo) {
                        costInfo.hardware = hardwareCost;
                      } else {
                        costInfo = {
                          hardware: hardwareCost,
                          label: 'Hardware Cost'
                        };
                      }
                    }
                  }

                  // Extract description or summary
                  const description = aiResponse.summary || aiResponse.description || designData.description || designData.notes;

                  const isEditing = editingId === solution.id;

                  return (
                    <div
                      key={solution.id}
                      onClick={() => !isEditing && openSolution(solution)}
                      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all cursor-pointer group"
                      style={{ borderTopColor: info.color, borderTopWidth: '3px' }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ background: `${info.color}15` }}
                          >
                            {info.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                              {info.name}
                            </div>
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(e as any, solution.id);
                                    if (e.key === 'Escape') handleEditCancel(e as any);
                                  }}
                                  className="flex-1 text-lg font-semibold text-slate-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none"
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {solution.title}
                                  </h3>
                                  <button
                                    onClick={(e) => handleEditStart(e, solution)}
                                    className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    title="Edit name"
                                  >
                                    ✏️
                                  </button>
                                </>
                              )}
                              {isEditing && (
                                <div className="flex gap-1 flex-shrink-0">
                                  <button
                                    onClick={(e) => handleEditSave(e, solution.id)}
                                    className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                    title="Save"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={handleEditCancel}
                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    title="Cancel"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cost Information */}
                      {costInfo && (
                        <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                          <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
                            {costInfo.label}
                          </div>
                          <div className="flex items-baseline gap-3 flex-wrap">
                            {costInfo.monthly && (
                              <div>
                                {typeof costInfo.monthly === 'number' ? (
                                  <>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                      ${costInfo.monthly.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">/mo</span>
                                  </>
                                ) : (
                                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {costInfo.monthly}
                                  </span>
                                )}
                              </div>
                            )}
                            {costInfo.annual && (
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                ${typeof costInfo.annual === 'number' ? costInfo.annual.toLocaleString() : costInfo.annual}/yr
                              </div>
                            )}
                            {costInfo.total && (
                              <div>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                  ${typeof costInfo.total === 'number' ? costInfo.total.toLocaleString() : costInfo.total}
                                </span>
                                <span className="text-sm text-slate-600 dark:text-slate-400"> total</span>
                              </div>
                            )}
                          </div>
                          {costInfo.hardware && (
                            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                              + ${typeof costInfo.hardware === 'number' ? costInfo.hardware.toLocaleString() : costInfo.hardware} hardware
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {description && (
                        <div className="mb-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {description}
                          </p>
                        </div>
                      )}

                      {/* Details */}
                      {details.length > 0 && (
                        <div className="mb-4 space-y-1.5">
                          {details.slice(0, 3).map((detail, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <span className="text-base">{detail.icon}</span>
                              <span className="truncate">{detail.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-500 mb-4">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>Created {new Date(solution.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🔄</span>
                          <span>Updated {new Date(solution.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                          Open Solution →
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, solution.id)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
