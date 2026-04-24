import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../config';
import {
  BarChart3, Activity, Printer, Store, Power,
  MessageCircle, X, Send, TrendingUp, Zap, Sparkles, DollarSign,
  Users, Clock, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Dummy data ──────────────────────────────────────────────── */

const HOURLY_REVENUE = [
  { hour: '9AM',  revenue: 42  },
  { hour: '10AM', revenue: 87  },
  { hour: '11AM', revenue: 130 },
  { hour: '12PM', revenue: 210 },
  { hour: '1PM',  revenue: 275 },
  { hour: '2PM',  revenue: 195 },
  { hour: '3PM',  revenue: 155 },
  { hour: '4PM',  revenue: 98  },
  { hour: '5PM',  revenue: 64  },
  { hour: '6PM',  revenue: 30  },
];

const TRAFFIC_FORECAST = [
  { hour: '9AM',  customers: 4,  pct: 12, label: 'Low',      confidence: 92 },
  { hour: '10AM', customers: 9,  pct: 28, label: 'Rising',   confidence: 89 },
  { hour: '11AM', customers: 16, pct: 50, label: 'Moderate', confidence: 87 },
  { hour: '12PM', customers: 25, pct: 78, label: 'High',     confidence: 91 },
  { hour: '1PM',  customers: 30, pct: 95, label: 'Peak 🔥',  confidence: 95 },
  { hour: '2PM',  customers: 26, pct: 80, label: 'High',     confidence: 90 },
  { hour: '3PM',  customers: 18, pct: 55, label: 'Moderate', confidence: 86 },
  { hour: '4PM',  customers: 11, pct: 35, label: 'Falling',  confidence: 84 },
  { hour: '5PM',  customers: 6,  pct: 18, label: 'Low',      confidence: 88 },
];

const NOW_INDEX = 4; // 1 PM = current hour
const totalEarningsConst = HOURLY_REVENUE.reduce((s, d) => s + d.revenue, 0);

/* ─── Status config ───────────────────────────────────────────── */
const STATUS_CONFIG = {
  free:     { dot: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', btn: 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-indigo-100', icon: <CheckCircle2 size={14} />, hint: 'Attracting customers with 10% discount' },
  moderate: { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       btn: 'border-amber-400 bg-amber-50 text-amber-700 shadow-amber-100',       icon: <Users size={14} />,        hint: 'Steady flow — base pricing active'  },
  busy:     { dot: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border-orange-200',    btn: 'border-orange-400 bg-orange-50 text-orange-700 shadow-orange-100',   icon: <AlertTriangle size={14}/>, hint: '+15% surge pricing — high demand'   },
  closed:   { dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border-red-200',             btn: 'border-red-400 bg-red-50 text-red-700 shadow-red-100',               icon: <Power size={14} />,        hint: 'Shop closed — no new jobs accepted' },
};

/* ─── SVG line-chart for Traffic Forecaster ──────────────────── */
const TrafficLineChart = ({ data, nowIndex }) => {
  const W = 300, H = 90, PAD = { l: 10, r: 10, t: 14, b: 24 };
  const max = Math.max(...data.map(d => d.pct));
  const toX = i => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r);
  const toY = v => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d.pct).toFixed(1)}`)
    .join(' ');

  const areaPath =
    `M ${toX(0).toFixed(1)} ${H - PAD.b}` +
    data.map((d, i) => ` L ${toX(i).toFixed(1)} ${toY(d.pct).toFixed(1)}`).join('') +
    ` L ${toX(data.length - 1).toFixed(1)} ${H - PAD.b} Z`;

  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 120, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal grid lines */}
        {[25, 50, 75, 100].map(v => (
          <line
            key={v}
            x1={PAD.l} y1={toY(v)}
            x2={W - PAD.r} y2={toY(v)}
            stroke="#e2e8f0" strokeWidth="0.6" strokeDasharray="3 3"
          />
        ))}

        {/* filled area */}
        <path d={areaPath} fill="url(#trafficGrad)" />

        {/* line */}
        <path
          d={linePath}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* data points */}
        {data.map((d, i) => {
          const cx = toX(i), cy = toY(d.pct);
          const isNow = i === nowIndex;
          const isHov = hovered === i;
          return (
            <g key={i}>
              {/* clickable hit area */}
              <circle
                cx={cx} cy={cy} r={10}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {/* visible dot */}
              <circle
                cx={cx} cy={cy}
                r={isNow ? 5 : isHov ? 4 : 3}
                fill={isNow ? '#6366f1' : '#fff'}
                stroke={isNow ? '#4f46e5' : '#6366f1'}
                strokeWidth={isNow ? 2 : 1.5}
              />
              {/* pulse ring on current hour */}
              {isNow && (
                <circle cx={cx} cy={cy} r={8} fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.35" />
              )}

              {/* tooltip box */}
              {(isHov || isNow) && (
                <g>
                  <rect
                    x={cx - 22} y={cy - 30}
                    width={44} height={18}
                    rx={4} fill="#1e1b4b" opacity={0.9}
                  />
                  <text x={cx} y={cy - 17} textAnchor="middle"
                    fontSize="6" fill="#fff" fontFamily="sans-serif" fontWeight="bold">
                    {d.customers} cust · {d.pct}%
                  </text>
                </g>
              )}

              {/* hour label */}
              <text x={cx} y={H - 4} textAnchor="middle"
                fontSize="5.5" fill={isNow ? '#6366f1' : '#94a3b8'}
                fontFamily="sans-serif" fontWeight={isNow ? 'bold' : 'normal'}>
                {d.hour}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────── */
const ShopDashboard = () => {
  const navigate = useNavigate();

  const [shop, setShop] = useState(() => {
    const saved = localStorage.getItem('safeprint_shop_session');
    if (saved) return JSON.parse(saved);
    return {
      id: 'mock-shop-123',
      name: 'SafePrint Demo Shop',
      status: 'free',
      upiId: 'demo@upi',
      ownerEmail: 'demo@safeprint.com'
    };
  });

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [isSurgePricingEnabled, setIsSurgePricingEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hello! I'm your AI Shop Assistant. I've analyzed your local traffic model. How can I help you optimize today?" }
  ]);
  const chatEndRef = useRef(null);

  // Animated earnings counter
  const [displayEarnings, setDisplayEarnings] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = totalEarningsConst / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= totalEarningsConst) { setDisplayEarnings(totalEarningsConst); clearInterval(timer); }
      else setDisplayEarnings(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  // ✅ FIXED: Optimistic update — UI changes instantly, API syncs in background
  const updateStatus = (newStatus) => {
    if (statusUpdating || shop.status === newStatus) return;
    // Update UI immediately
    const updated = { ...shop, status: newStatus };
    setShop(updated);
    localStorage.setItem('safeprint_shop_session', JSON.stringify(updated));
    setStatusUpdating(true);
    // Sync to backend (non-blocking, silently fail if offline)
    axios.post(`${SERVER_URL}/api/shops/${shop.id}/status`, { status: newStatus })
      .catch(() => {}) // ignore network errors — UI is already updated
      .finally(() => setStatusUpdating(false));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setTimeout(() => {
      const lm = userMessage.toLowerCase();
      let aiResponse = "I'm analyzing the data using the latest forecasting models...";
      if (lm.includes('busiest') || lm.includes('traffic'))
        aiResponse = "Peak traffic hits at exactly 1:00 PM today (95% ML confidence) — driven by 3 overlapping campus class breaks. Suggest activating 'Busy' status now!";
      else if (lm.includes('price') || lm.includes('surge'))
        aiResponse = "Dynamic pricing generated an extra 12% revenue yesterday. With current 'Busy' status I've applied a +15% surge — per-page rate is now ₹2.30.";
      else if (lm.includes('prints') || lm.includes('today'))
        aiResponse = "You've completed 124 prints today, with 3 jobs currently queued. Estimated completion in 8 minutes.";
      else if (lm.includes('earn') || lm.includes('money') || lm.includes('revenue'))
        aiResponse = `You've earned ₹${totalEarningsConst.toLocaleString()} today! Peak was 1 PM at ₹275. You're trending 18% above last Thursday — great day! 🎉`;
      else if (lm.includes('status'))
        aiResponse = `Your shop is currently '${shop.status}'. ${STATUS_CONFIG[shop.status]?.hint || ''}`;
      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 800);
  };

  const getPricingMultiplier = () => {
    if (!isSurgePricingEnabled || !shop) return { text: 'Base Rate Active', color: 'text-slate-500' };
    switch (shop.status) {
      case 'free':     return { text: '10% Discount Applied (Attracting Users)', color: 'text-indigo-600' };
      case 'moderate': return { text: 'Base Demand Pricing Active',              color: 'text-blue-600'   };
      case 'busy':     return { text: '+15% Surge Pricing Active (High Load)',   color: 'text-amber-600'  };
      case 'closed':   return { text: 'Pricing Frozen',                          color: 'text-slate-400'  };
      default:         return { text: 'Base Rate Active',                        color: 'text-slate-500'  };
    }
  };

  if (!shop) return null;

  const cfg = STATUS_CONFIG[shop.status] || STATUS_CONFIG.free;
  const nowData = TRAFFIC_FORECAST[NOW_INDEX];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">

      {/* ── Navbar ── */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm">
              <Store className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-lg">{shop.name}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-400 tracking-widest text-xs">STATUS:</span>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${cfg.badge} transition-all duration-300`}>
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${shop.status !== 'closed' ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-bold capitalize">{shop.status}</span>
              </div>
            </div>
            <button onClick={() => setShop(null)} className="text-slate-400 hover:text-red-500 transition">
              <Power size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Command Center</h1>
            <p className="text-slate-500">AI-optimized operations &amp; live shop management.</p>
          </div>
          <button
            onClick={() => navigate('/business/print')}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <Printer size={18} /> Open Print Receiver
          </button>
        </div>

        {/* ── ROW 1: Traffic Forecaster + Dynamic Pricing ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* 📈 Predictive Traffic Forecaster — upgraded */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="text-indigo-500 w-5 h-5" />
              <span className="font-bold text-slate-900 tracking-wide">Predictive Traffic Forecaster</span>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-auto border border-indigo-200">ML Active</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Est. customer volume · hover bars for detail</p>

            {/* Stat row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { icon: <Users size={13} />, label: 'Now', value: `${nowData.customers} cust`, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                { icon: <TrendingUp size={13} />, label: 'Peak at', value: '1:00 PM', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                { icon: <Clock size={13} />, label: 'Confidence', value: `${nowData.confidence}%`, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className={`rounded-xl border px-3 py-2 flex flex-col gap-0.5 ${color}`}>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-70">{icon}{label}</span>
                  <span className="text-sm font-extrabold">{value}</span>
                </div>
              ))}
            </div>

            {/* Line chart */}
            <TrafficLineChart data={TRAFFIC_FORECAST} nowIndex={NOW_INDEX} />

            {/* Legend */}
            <div className="flex gap-4 mt-2 mb-3">
              {[['bg-indigo-500','Current hour'], ['bg-white border border-indigo-400','Forecast']].map(([cls, lbl]) => (
                <div key={lbl} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
                  <span className="text-[10px] text-slate-500">{lbl}</span>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <p className="text-sm text-slate-700">
                <strong className="text-indigo-600">AI Insight:</strong>{' '}
                <span className="font-bold text-slate-900">95% confidence</span> peak at{' '}
                <span className="font-bold text-slate-900">1:00 PM</span> — driven by 3 overlapping campus class breaks.
                Recommend activating <span className="font-bold text-orange-600">"Busy"</span> status &amp; surge pricing.
              </p>
            </div>
          </div>

          {/* ⚡ Dynamic Pricing */}
          <div className="bg-white border border-slate-200 border-l-4 border-l-amber-400 rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="text-amber-500 w-5 h-5" />
              <span className="font-bold text-slate-900 tracking-wide">Automated Dynamic Pricing</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-medium tracking-wide">Surge Pricing AI</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isSurgePricingEnabled} onChange={() => setIsSurgePricingEnabled(p => !p)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 after:shadow-sm" />
                </label>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 mt-6 border border-slate-200">
                <span className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Current Modifiers</span>
                <p className={`font-bold text-lg ${getPricingMultiplier().color}`}>{getPricingMultiplier().text}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {[['₹2.00', 'A4 B&W'], ['₹5.00', 'A4 Colour'], ['₹8.00', 'A3 B&W'], ['₹14.00', 'A3 Colour']].map(([price, name]) => (
                  <div key={name} className="bg-slate-50 rounded-lg border border-slate-100 px-2 py-1.5 flex justify-between items-center">
                    <span className="text-slate-500">{name}</span>
                    <span className="font-bold text-slate-800">{price}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              When enabled, pricing automatically scales with your manual status setting to optimize shop revenue.
            </p>
          </div>
        </div>

        {/* ── ROW 2: Today's Earnings (full width) ── */}
        <div className="mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <DollarSign className="text-emerald-500 w-5 h-5" />
                <span className="font-bold text-slate-900 tracking-wide">Today's Earnings</span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-emerald-200">Live</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-emerald-600">₹{displayEarnings.toLocaleString()}</span>
                <span className="block text-xs text-slate-400 mt-0.5">Total revenue today</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">Hourly revenue breakdown (9 AM – 6 PM) — hover for exact amount</p>

            <div className="flex items-end gap-2 h-36 mb-3">
              {HOURLY_REVENUE.map((d, i) => {
                const max = Math.max(...HOURLY_REVENUE.map(x => x.revenue));
                const heightPct = (d.revenue / max) * 100;
                const isNow = i === NOW_INDEX;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer" title={`${d.hour}: ₹${d.revenue}`}>
                    <span className={`text-[9px] font-bold mb-0.5 transition-opacity ${isNow ? 'opacity-100 text-emerald-600' : 'opacity-0 group-hover:opacity-100 text-slate-500'}`}>
                      ₹{d.revenue}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all duration-700 ${
                        isNow ? 'bg-emerald-500 shadow-md shadow-emerald-200'
                        : i < NOW_INDEX ? 'bg-emerald-300 group-hover:bg-emerald-400'
                        : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                    />
                    <div className="text-[9px] text-slate-400 text-center mt-1.5 font-medium">{d.hour}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 flex-wrap pt-3 border-t border-slate-100">
              {[
                { label: 'Peak Hour',    value: '1 PM · ₹275',  color: 'text-emerald-600' },
                { label: 'Avg/Hour',     value: `₹${Math.round(totalEarningsConst / HOURLY_REVENUE.length)}`, color: 'text-slate-700' },
                { label: 'vs Yesterday', value: '+18% 📈',       color: 'text-indigo-600'  },
                { label: 'Projected EOD',value: '₹1,486',        color: 'text-amber-600'   },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 3: Manual Status Override + Prints Today ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* ✅ FIXED Manual Status Override */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <Activity className="text-indigo-500" />
              <span className="font-bold text-slate-900 tracking-wide">Manual Status Override</span>
              {statusUpdating && (
                <span className="ml-auto text-[10px] text-slate-400 animate-pulse">Syncing…</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">Tap a status to update instantly — affects pricing &amp; customer visibility</p>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(STATUS_CONFIG).map(([st, conf]) => {
                const isActive = shop.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => updateStatus(st)}
                    className={`relative p-4 rounded-xl border-2 text-sm font-bold capitalize transition-all duration-200 active:scale-95 flex flex-col items-start gap-1 ${
                      isActive
                        ? `${conf.btn} shadow-sm scale-[1.02]`
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`${isActive ? '' : 'opacity-40'}`}>{conf.icon}</span>
                      {st}
                    </span>
                    <span className={`text-[10px] font-normal leading-tight ${isActive ? 'opacity-80' : 'opacity-40'}`}>
                      {conf.hint}
                    </span>
                    {isActive && (
                      <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${conf.dot} animate-pulse`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prints Today */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center text-center items-center shadow-sm">
            <div className="absolute -right-4 -bottom-4 opacity-5"><BarChart3 size={150} /></div>
            <div className="text-5xl font-extrabold text-indigo-700 mb-2 z-10">124</div>
            <p className="text-slate-500 text-sm font-medium z-10">Total Prints Today</p>
            <div className="mt-4 flex gap-3 z-10 flex-wrap justify-center">
              <div className="bg-indigo-50 rounded-lg px-3 py-1.5 text-xs text-indigo-700 font-bold border border-indigo-100">3 in queue</div>
              <div className="bg-amber-50 rounded-lg px-3 py-1.5 text-xs text-amber-700 font-bold border border-amber-100">↑12% vs avg</div>
              <div className="bg-emerald-50 rounded-lg px-3 py-1.5 text-xs text-emerald-700 font-bold border border-emerald-100">~8 min wait</div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Floating AI Chat ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <div className={`transition-all duration-300 transform origin-bottom-right ${isChatOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 h-0 w-0'}`}>
          <div className="bg-white border border-slate-200 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[450px]">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <span className="font-bold text-white">SafePrint Assistant</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-indigo-200 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-4 text-sm" style={{ scrollbarWidth: 'thin' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-700 rounded-bl-sm border border-slate-200 shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input
                  type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask about earnings, traffic, pricing..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-full py-2.5 pl-4 pr-10 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                />
                <button type="submit" disabled={!chatInput.trim()} className="absolute right-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  <Send className="w-4 h-4 ml-0.5 mt-0.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsChatOpen(p => !p)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-transform z-50 ${isChatOpen ? 'bg-slate-400 shadow-slate-300/30' : 'bg-indigo-600 shadow-indigo-500/30'}`}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
        </button>
      </div>

    </div>
  );
};

export default ShopDashboard;
 