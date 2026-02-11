import React, { useState, useMemo } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { useSiteData } from "../context/SiteDataContext";

const Pricing = () => {
  const { siteData } = useSiteData();
  const [selectedPlan, setSelectedPlan] = useState(null); // Track which plan's modal is open

  // Transform backend object data to UI array format
  const plans = useMemo(() => {
    if (!siteData || !siteData.membershi_plan) return [];

    let rawData = siteData.membershi_plan;

    // Safety check: parse if string
    if (typeof rawData === 'string') {
      try {
        rawData = JSON.parse(rawData);
      } catch (e) {
        console.error("Error parsing plans:", e);
        return [];
      }
    }

    return Object.values(rawData).map((plan) => {
      // Normalize Features logic
      let featuresList = [];
      if (Array.isArray(plan.features) && plan.features.length > 0) {
        featuresList = plan.features.filter(f => f && f.trim() !== '');
      } else {
        // Fallback for old data structure
        for (let i = 1; i <= 10; i++) {
          const key = `feature${i}`;
          if (plan[key] && plan[key].trim() !== '') {
            featuresList.push(plan[key]);
          }
        }
      }

      return {
        name: plan.plane_name,
        price: plan.plan_amount,
        duration: plan.duration || 'month',
        features: featuresList,
        recommended: plan.recommended || false
      };
    });
  }, [siteData]);

  if (!siteData) {
    return (
        <div className="section-padding bg-black flex justify-center items-center h-96">
            <Loader2 className="w-10 h-10 text-royal-gold animate-spin" />
        </div>
    );
  }

  return (
    <section id="membership" className="section-padding bg-gradient-to-b from-royal-900 to-black relative">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold font-sans text-center mb-16">
            Membership <span className="text-gradient-gold">Plans</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            // Determine features to show initially (First 4)
            const visibleFeatures = plan.features.slice(0, 4);
            const hasMore = plan.features.length > 4;

            return (
              <div 
                key={index}
                className={`relative p-8 rounded-2xl border transition-transform duration-300 hover:scale-105 flex flex-col h-full ${
                  plan.recommended 
                    ? 'bg-white/5 border-royal-gold shadow-[0_0_30px_rgba(212,175,55,0.15)]' 
                    : 'bg-transparent border-white/10 hover:border-white/30'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    Best Value
                  </div>
                )}
                
                <h3 className="text-xl font-medium text-gray-300 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-royal-gold">₹</span>
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.duration}</span>
                </div>
                
                <ul className="space-y-4 mb-4 flex-grow">
                  {visibleFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                      <Check size={16} className="text-royal-gold mt-1 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* View More Button */}
                {hasMore && (
                  <div className="mb-8 text-center">
                    <button 
                        onClick={() => setSelectedPlan(plan)}
                        className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors border-b border-dashed border-blue-400/50 hover:border-blue-300 pb-0.5"
                    >
                        View all {plan.features.length} features
                    </button>
                  </div>
                )}
                
                <button className={`w-full py-3 rounded-lg font-bold transition-all mt-auto ${
                  plan.recommended 
                      ? 'bg-royal-gold text-white hover:bg-yellow-400 hover:text-black' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                  Choose Plan
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Popup Modal */}
      {selectedPlan && (
        <FeatureModal 
            plan={selectedPlan} 
            onClose={() => setSelectedPlan(null)} 
        />
      )}
    </section>
  );
};

// --- Helper Component: The Popup Modal ---
const FeatureModal = ({ plan, onClose }) => {
    // Close on background click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        <p className="text-royal-gold text-sm font-medium mt-1">Full Feature List</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all transform hover:rotate-90 duration-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <ul className="space-y-4">
                        {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-300">
                                <div className="mt-1 p-1 bg-royal-gold/10 rounded-full">
                                    <Check size={14} className="text-royal-gold" />
                                </div>
                                <span className="text-sm leading-relaxed">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer (Optional) */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pricing;