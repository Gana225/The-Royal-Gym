import React from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: "Standard",
    price: "2000",
    features: ["Access to Gym Floor", "Locker Room Access", "1 Free Personal Session", "Hydration Station"],
    recommended: false
  },
  {
    name: "Premium",
    price: "3500",
    features: ["All Standard Features", "Group Classes", "Sauna & Steam Room", "Nutritional Guide"],
    recommended: true
  },
  {
    name: "Elite",
    price: "5000",
    features: ["All Premium Features", "Unlimited Personal Training", "Massage Therapy", "Private Locker"],
    recommended: false
  }
];

const Pricing = () => {
  return (
    <section id="membership" className="section-padding bg-gradient-to-b from-royal-900 to-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold font-sans text-center mb-16">Membership <span className="text-gradient-gold">Plans</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-2xl border transition-transform duration-300 hover:scale-105 ${plan.recommended ? 'bg-white/5 border-royal-gold shadow-[0_0_30px_rgba(212,175,55,0.15)]' : 'bg-transparent border-white/10 hover:border-white/30'}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2  bg-black text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Best Value
                </div>
              )}
              
              <h3 className="text-xl font-medium text-gray-300 mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">₹</span>
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={16} className="text-royal-gold" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-3 rounded-lg font-bold transition-all ${plan.recommended ? 'bg-white/10 text-white hover:bg-yellow-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;