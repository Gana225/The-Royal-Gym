import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { 
  Save, 
  ImageIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Loader2,
  FileText,
  Info,
  Plus,
  Trash2,
  X,
  Star, // Added Star icon for recommended visual
  CheckCircle // Added CheckCircle for the UI
} from 'lucide-react';

const EditSiteInfo = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Default structure for a new plan
  const defaultPlan = {
    plane_name: '', 
    plan_amount: '', 
    duration: 'month', 
    features: [''],
    recommended: false // --- NEW: Default to false ---
  };

  const [plans, setPlans] = useState([defaultPlan]);

  const [formData, setFormData] = useState({
    main_bg_image: null,
    phone1: '',
    phone2: '',
    email: '',
    gym_address: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    footer_description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        
        const response = await axios.get('http://localhost:8000/api/edit/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = response.data;
        
        // --- 1. Parse Membership Plans ---
        let parsedPlans = [];
        
        if (data.membershi_plan) {
            let rawPlansObj = {};
            
            if (typeof data.membershi_plan === 'string') {
                try {
                    rawPlansObj = JSON.parse(data.membershi_plan);
                } catch (e) {
                    console.error("Failed to parse plan JSON", e);
                }
            } else if (typeof data.membershi_plan === 'object') {
                rawPlansObj = data.membershi_plan;
            }

            const rawPlansArray = Object.values(rawPlansObj);

            // --- DATA MIGRATION ---
            parsedPlans = rawPlansArray.map(plan => {
                // Handle Features
                let features = [];
                if (Array.isArray(plan.features)) {
                    features = plan.features;
                } else {
                    Object.keys(plan).forEach(key => {
                        if (key.startsWith('feature') && plan[key]) {
                            features.push(plan[key]);
                        }
                    });
                }
                if (features.length === 0) features.push('');

                return { 
                    ...plan, 
                    features,
                    // --- NEW: Ensure recommended property exists ---
                    recommended: plan.recommended || false 
                };
            });
        }

        if (parsedPlans.length === 0) parsedPlans = [defaultPlan];
        setPlans(parsedPlans);

        // --- 2. Handle Standard Data ---
        setFormData({
            ...data,
            main_bg_image: null 
        });

        if (data.main_bg_image) setImagePreview(data.main_bg_image);

      } catch (error) {
        console.error("Error fetching site info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, main_bg_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- Plan Logic ---

  const handlePlanChange = (index, field, value) => {
    const updatedPlans = [...plans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    setPlans(updatedPlans);
  };

  const addPlan = () => {
    setPlans([...plans, defaultPlan]);
  };

  const removePlan = (index) => {
    if (plans.length > 1) {
        const updatedPlans = plans.filter((_, i) => i !== index);
        setPlans(updatedPlans);
    }
  };

  // --- Feature Logic ---

  const handleFeatureChange = (planIndex, featureIndex, value) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features[featureIndex] = value;
    setPlans(updatedPlans);
  };

  const addFeature = (planIndex) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features.push(''); 
    setPlans(updatedPlans);
  };

  const removeFeature = (planIndex, featureIndex) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features = updatedPlans[planIndex].features.filter((_, i) => i !== featureIndex);
    setPlans(updatedPlans);
  };

  // --- Submit Logic ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const dataToSend = new FormData();
    
    // 1. Standard Fields
    Object.keys(formData).forEach(key => {
        if (key === 'main_bg_image' || key === 'membershi_plan' || key === 'membership_plan') return;
        if (formData[key] !== null && formData[key] !== '') {
            dataToSend.append(key, formData[key]);
        }
    });

    // 2. Image
    if (formData.main_bg_image instanceof File) {
        dataToSend.append('main_bg_image', formData.main_bg_image);
    }

    // 3. Plans JSON
    const plansObject = {};
    plans.forEach((plan, index) => {
        const cleanFeatures = plan.features.filter(f => f.trim() !== '');
        
        plansObject[`plan${index + 1}`] = {
            ...plan,
            features: cleanFeatures
            // 'recommended' is already inside 'plan' object from state
        };
    });

    dataToSend.append('membershi_plan', JSON.stringify(plansObject));

    try {
      const token = localStorage.getItem("authToken");
      await axios.put('http://localhost:8000/api/edit/', dataToSend, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Site settings updated successfully!');
    } catch (error) {
      console.error("Error updating settings:", error);
      if (error.response && error.response.data) {
          console.log("Validation Details:", error.response.data);
          alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
          alert('Failed to update settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 border-b border-slate-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Site Configuration</h1>
            <p className="text-slate-400 text-lg">Manage your gym's digital presence and global settings.</p>
          </div>
          <div className="hidden md:block">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">ADMIN ACCESS</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Visuals Section */}
          <section className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-500" /> Visual Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-400 mb-2">Main Background Image</label>
                <div className="relative group w-full aspect-video rounded-xl overflow-hidden bg-slate-800 border-2 border-dashed border-slate-700 hover:border-emerald-500 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Hero Background" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50"/>
                        <span className="text-xs">No image set</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium text-sm">Click to Change</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Footer Description</label>
                    <textarea name="footer_description" value={formData.footer_description || ''} onChange={handleChange} rows="3" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all resize-none" />
                 </div>
              </div>
            </div>
          </section>

           {/* Membership Plans Section */}
           <section className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" /> Membership Plans
                </h2>
                <button type="button" onClick={addPlan} className="flex items-center gap-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                    <Plus className="w-3 h-3" /> Add Plan
                </button>
            </div>
            
            <div className="space-y-6">
                {plans.map((plan, planIndex) => (
                    <div 
                        key={planIndex} 
                        className={`bg-slate-950 border rounded-xl p-6 relative group transition-colors ${plan.recommended ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-slate-800'}`}
                    >
                        
                        {/* Plan Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan #{planIndex + 1}</span>
                                {plan.recommended && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                                        <Star className="w-3 h-3 fill-slate-950" /> RECOMMENDED
                                    </span>
                                )}
                            </div>
                            <button type="button" onClick={() => removePlan(planIndex)} disabled={plans.length === 1} className={`p-1.5 rounded-lg transition-colors ${plans.length === 1 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-red-400 hover:bg-red-400/10'}`}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Plan Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 border-b border-slate-800/50 pb-6">
                            <div className="lg:col-span-2">
                                <label className="block text-xs text-slate-400 mb-1">Plan Name</label>
                                <input type="text" value={plan.plane_name || ''} onChange={(e) => handlePlanChange(planIndex, 'plane_name', e.target.value)} placeholder="e.g. Premium" className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Amount</label>
                                <input type="number" value={plan.plan_amount || ''} onChange={(e) => handlePlanChange(planIndex, 'plan_amount', e.target.value)} placeholder="2000" className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Duration</label>
                                <select value={plan.duration || 'month'} onChange={(e) => handlePlanChange(planIndex, 'duration', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none">
                                    <option value="month">Monthly</option>
                                    <option value="2 months">2 Months</option>
                                    <option value="3 months">3 Months</option>
                                    <option value="6 months">6 Months</option>
                                    <option value="year">Yearly</option>
                                    <option value="2 years">2 Years</option>
                                </select>
                            </div>
                        </div>

                        {/* Dynamic Features List */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Features</label>
                                <button type="button" onClick={() => addFeature(planIndex)} className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                                    <Plus className="w-3 h-3" /> Add Feature
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {plan.features && plan.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(planIndex, featureIndex, e.target.value)}
                                            placeholder={`Feature ${featureIndex + 1}`}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeFeature(planIndex, featureIndex)}
                                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                                            title="Remove Feature"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {(!plan.features || plan.features.length === 0) && (
                                    <p className="text-xs text-slate-600 italic col-span-2">No features added yet.</p>
                                )}
                            </div>
                        </div>


                        {/* Recommended Checkbox */}
                        <div className="mt-6 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 flex items-start gap-3">
                            <div className="pt-0.5">
                                <input 
                                    type="checkbox" 
                                    id={`rec-${planIndex}`}
                                    checked={plan.recommended || false} 
                                    onChange={(e) => handlePlanChange(planIndex, 'recommended', e.target.checked)}
                                    className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-slate-800 border-slate-700 cursor-pointer"
                                />
                            </div>
                            <div>
                                <label htmlFor={`rec-${planIndex}`} className="text-sm font-medium text-slate-200 cursor-pointer select-none flex items-center gap-2">
                                    Mark as Best Plan
                                </label>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    This plan will be highlighted as the "Best Value" choice to users.
                                </p>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
          </section>

          {/* Contact Details */}
          <section className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Primary Phone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input type="text" name="phone1" value={formData.phone1 || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Secondary Phone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input type="text" name="phone2" value={formData.phone2 || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Official Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Gym Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <textarea name="gym_address" value={formData.gym_address || ''} onChange={handleChange} rows="2" className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                    </div>
                </div>
            </div>
          </section>

          {/* Social Media */}
          <section className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" /> Social Media Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SocialInput icon={Instagram} name="instagram" value={formData.instagram} onChange={handleChange} label="Instagram" color="text-pink-500" />
                <SocialInput icon={Facebook} name="facebook" value={formData.facebook} onChange={handleChange} label="Facebook" color="text-blue-500" />
                <SocialInput icon={Twitter} name="twitter" value={formData.twitter} onChange={handleChange} label="Twitter (X)" color="text-sky-400" />
                <SocialInput icon={Youtube} name="youtube" value={formData.youtube} onChange={handleChange} label="YouTube" color="text-red-500" />
            </div>
          </section>

          <div className="flex justify-end pt-4 pb-20">
            <button type="submit" disabled={saving} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-slate-900 transition-all transform hover:-translate-y-1 ${saving ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]'}`}>
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Configuration</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SocialInput = ({ icon: Icon, name, value, onChange, label, color }) => (
    <div className="relative group">
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon className={`w-5 h-5 ${color} opacity-70 group-focus-within:opacity-100 transition-opacity`} />
            </div>
            <input type="url" name={name} value={value || ''} onChange={onChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all" />
        </div>
    </div>
);

export default EditSiteInfo;