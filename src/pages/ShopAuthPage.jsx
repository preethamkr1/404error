import React, { useState } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../config';
import { Store, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShopAuthPage = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regUpi, setRegUpi] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isLoginView) {
        res = await axios.post(`${SERVER_URL}/api/shops/login`, { ownerEmail: email, password });
      } else {
        let coords = [17.4401, 78.3489];
        if (navigator.geolocation) {
          try {
            const pos = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            coords = [pos.coords.latitude, pos.coords.longitude];
          } catch (e) {
            console.warn("Geolocation failed, using default");
          }
        }
        res = await axios.post(`${SERVER_URL}/api/shops/register`, { 
          name: regName, address: regAddress, ownerEmail: email, password, upiId: regUpi, lat: coords[0], lng: coords[1]
        });
      }
      
      localStorage.setItem('safeprint_shop_session', JSON.stringify(res.data.shop));
      navigate('/business/dashboard');
      
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Error connecting to server. Is it running?';
      setLoginError(msg);
    }
  };

  const skipToDemo = () => {
      navigate('/business/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex flex-col items-center justify-center font-sans tracking-tight py-12 px-4 relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-200/30 blur-[80px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-200/20 blur-[80px] rounded-full pointer-events-none"></div>

      <button onClick={() => navigate('/business')} className="absolute top-8 left-8 text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-semibold transition z-20">
        <ArrowLeft className="w-5 h-5" /> Back to Business
      </button>

      <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 relative overflow-hidden z-10">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400" />
        
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center border border-indigo-200">
             <Store className="w-8 h-8 text-indigo-600" />
           </div>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">Owner Portal</h2>
        <p className="text-slate-500 text-sm text-center mb-8">Access your SafePrint Command Center</p>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8 border border-slate-200">
           <button onClick={() => setIsLoginView(true)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLoginView ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Sign In</button>
           <button onClick={() => setIsLoginView(false)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLoginView ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Register Shop</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLoginView && (
            <div className="space-y-4">
              <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition text-sm font-medium" placeholder="Official Shop Name" />
              <input type="text" required value={regAddress} onChange={e => setRegAddress(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition text-sm font-medium" placeholder="Street Address / Building" />
              <input type="text" value={regUpi} onChange={e => setRegUpi(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition text-sm font-medium" placeholder="Shop UPI Payment ID (e.g. shop@okhdfc)" />
            </div>
          )}
          
          <div className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition text-sm font-medium" placeholder="owner@safeprint.com" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition text-sm font-medium" placeholder="Password" />
          </div>

          {loginError && <p className="text-red-600 text-sm text-center font-semibold bg-red-50 p-3 rounded-lg border border-red-200">{loginError}</p>}
          
          <button type="submit" className="w-full py-4 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-500/20 transition">
            {isLoginView ? 'Access Dashboard' : 'Launch Shop Hub'}
          </button>
        </form>

        {isLoginView && (
           <div className="mt-8 text-center pt-6 border-t border-slate-200">
             <button onClick={skipToDemo} className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold underline underline-offset-4 decoration-indigo-300 hover:decoration-indigo-500 transition">
                Bypass Login (Hackathon Demo Mode)
             </button>
           </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 font-medium z-10">
        <ShieldCheck className="w-3.5 h-3.5" /> Secured by SafePrint™ AES-256 Encryption
      </div>
    </div>
  );
};

export default ShopAuthPage;
 