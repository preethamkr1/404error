import React from 'react';
import { ShieldCheck, TrendingUp, Zap, Clock, Store, ArrowRight, Printer, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessLandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-50 font-sans text-slate-800 overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 w-full z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Store className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 text-2xl tracking-tight">Safe<span className="text-indigo-600">Print</span> <span className="text-slate-400 font-medium text-base">Business</span></span>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => navigate('/business/auth')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition">Sign In</button>
            <button onClick={() => navigate('/business/auth')} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-md shadow-indigo-500/20 transition">
              Open a Shop Hub
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/50 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8">
          <SparkleIcon /> Powered by SafePrint AI
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight max-w-4xl">
          Transform your print shop into a <span className="text-indigo-600">smart local hub.</span>
        </h1>
        
        <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed">
          Get discovered by thousands of students and professionals nearby. Automate your pricing, forecast your peak hours, and accept securely encrypted print jobs. No new hardware required.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <button onClick={() => navigate('/business/auth')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={() => navigate('/nearby')} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-8 rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 shadow-sm">
            View Live Map
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white border-y border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4">Enterprise tools for local shops.</h2>
            <p className="text-slate-500 max-w-xl mx-auto">We bring the power of machine learning and military-grade encryption directly to your local printing business.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<TrendingUp className="w-7 h-7 text-indigo-600" />}
              title="AI Traffic Forecasting"
              desc="Our ML models analyze local request data to predict when your shop will be busy, helping you manage stock and avoid queues."
            />
            <FeatureCard 
              icon={<Zap className="w-7 h-7 text-amber-500" />}
              title="Automated Surge Pricing"
              desc="When demand spikes, the AI automatically adjusts your rates to maximize your shop's revenue during rush hours."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-7 h-7 text-emerald-600" />}
              title="AES-256 Security"
              desc="Establish trust with corporate clients. Documents remain heavily encrypted until the exact moment you hit 'Print'."
            />
            <FeatureCard 
              icon={<MapPin className="w-7 h-7 text-rose-500" />}
              title="Live Discovery Map"
              desc="App users instantly see your shop's live status (Free, Moderate, Busy) on our interactive local area map."
            />
            <FeatureCard 
              icon={<Clock className="w-7 h-7 text-blue-500" />}
              title="10-Minute Auto-Purge"
              desc="Zero liability. All customer documents and metadata are completely wiped from the servers 10 minutes after printing."
            />
            <FeatureCard 
              icon={<Printer className="w-7 h-7 text-slate-600" />}
              title="Point of Sale Integration"
              desc="Built-in dynamic UPI QR codes. Simply click 'Print' and a precise payment QR appears on screen for the customer."
            />
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="py-32 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Ready to upgrade your shop?</h2>
        <p className="text-slate-500 mb-10 text-lg">Join the network of secure, ultra-efficient SafePrint partner shops today. Setup takes exactly 60 seconds.</p>
        <button onClick={() => navigate('/business/auth')} className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold py-4 px-12 rounded-xl shadow-lg shadow-indigo-500/20 transition">
          Create Your Business Hub
        </button>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 group">
    <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default BusinessLandingPage;
 