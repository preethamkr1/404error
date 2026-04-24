import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Shield, Printer, School, Gavel, Lock, ChevronRight, CheckCircle, Zap, EyeOff, Upload, QrCode, Smartphone, ScanLine, Trash2, FileCheck, ArrowDown, Download, User, Store, MapPin, LayoutDashboard } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WorkflowSection from './components/WorkflowSection';

/* ============================================================
   FLOATING PARTICLES BACKGROUND
   ============================================================ */
const FloatingParticles = () => {
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(99,102,241,${p.opacity}) 0%, transparent 70%)`,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.sin(p.id) * 40, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/* ============================================================
   3D SECURE PRINTER ANIMATION
   ============================================================ */
const SecurePrinter3D = () => {
  return (
    <div className="relative w-full h-[420px] md:h-[480px] flex items-center justify-center"
         style={{ perspective: '1200px' }}>

      {/* Ambient glow behind the printer */}
      <div className="absolute w-[350px] h-[350px] rounded-full opacity-30 blur-[80px]"
           style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(129,140,248,0.15) 50%, transparent 70%)' }} />

      {/* Main 3D printer group */}
      <motion.div
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: [-8, 8, -8], rotateX: [2, -2, 2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* === PRINTER BODY === */}
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>

          {/* Printer — Top face */}
          <motion.div
            className="relative w-[260px] h-[160px] rounded-2xl border border-slate-600/50 overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
              transform: 'translateZ(40px)',
            }}
          >
            {/* Top panel details */}
            <div className="absolute top-3 left-4 right-4 h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366f1, #818cf8, #6366f1)' }}
                animate={{ width: ['20%', '80%', '20%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Status LEDs */}
            <div className="absolute top-3 right-4 flex gap-1.5">
              <motion.div className="w-2 h-2 rounded-full bg-indigo-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }} />
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              <div className="w-2 h-2 rounded-full bg-slate-600" />
            </div>

            {/* Paper input slot (top dark slit) */}
            <div className="absolute top-10 left-6 right-6 h-[3px] bg-slate-50 rounded-full shadow-inner" />

            {/* Display screen */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[100px] h-[40px] rounded-lg border border-slate-600/40 overflow-hidden"
                 style={{ background: 'linear-gradient(180deg, #020617 0%, #0a1628 100%)' }}>
              {/* Screen content */}
              <div className="p-1.5 h-full flex flex-col justify-center items-center">
                <motion.div
                  className="flex items-center gap-1"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Shield size={10} className="text-indigo-600" />
                  <span className="text-[7px] font-mono text-indigo-600 font-bold">SECURED</span>
                </motion.div>
                <motion.div
                  className="text-[6px] font-mono text-indigo-600/60 mt-0.5"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                >
                  AES-256 ACTIVE
                </motion.div>
              </div>
              {/* Screen glow */}
              <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
            </div>

            {/* Control buttons row */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-5 h-5 rounded-full border border-slate-600/50"
                  style={{ background: 'linear-gradient(145deg, #334155, #1e293b)' }}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Printer — Front face / Paper output */}
          <div className="relative w-[260px] h-[60px] mt-[-1px] rounded-b-2xl border border-t-0 border-slate-600/30 overflow-visible"
               style={{
                 background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                 boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
               }}>
            {/* Paper output slot */}
            <div className="absolute top-0 left-8 right-8 h-[3px] bg-slate-50 rounded-full" />

            {/* === ANIMATED PAPER coming out === */}
            <motion.div
              className="absolute top-[-2px] left-1/2 -translate-x-1/2 w-[180px] origin-top"
              animate={{ height: [0, 110, 110, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.7, 1] }}
            >
              <div className="w-full h-full rounded-b-md relative overflow-hidden"
                   style={{
                     background: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 30%, #f8fafc 100%)',
                     boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                   }}>
                {/* Paper content — fake text lines */}
                <div className="p-3 space-y-1.5">
                  <div className="h-[2px] w-[70%] bg-slate-300 rounded-full" />
                  <div className="h-[2px] w-[90%] bg-slate-300 rounded-full" />
                  <div className="h-[2px] w-[50%] bg-slate-300 rounded-full" />
                  <div className="h-[2px] w-[80%] bg-slate-300 rounded-full" />
                  <div className="h-[2px] w-[60%] bg-slate-300 rounded-full" />
                </div>

                {/* "CLASSIFIED" stamp on paper */}
                <motion.div
                  className="absolute top-6 right-2 rotate-[-15deg]"
                  animate={{ opacity: [0, 0, 1, 1, 0] }}
                  transition={{ duration: 5, repeat: Infinity, times: [0, 0.25, 0.35, 0.65, 0.75] }}
                >
                  <div className="border-2 border-red-500/70 px-2 py-0.5 rounded">
                    <span className="text-[7px] font-bold text-red-500/70 tracking-widest font-mono">SECURE</span>
                  </div>
                </motion.div>

                {/* Self-destruct redaction animation */}
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(16,185,129,0.15) 50%, transparent 100%)' }}
                  animate={{ y: [-50, 120] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </motion.div>

            {/* Side vents */}
            <div className="absolute top-3 left-2 space-y-1">
              {[0,1,2].map(i => <div key={i} className="w-4 h-[2px] bg-slate-700 rounded-full" />)}
            </div>
            <div className="absolute top-3 right-2 space-y-1">
              {[0,1,2].map(i => <div key={i} className="w-4 h-[2px] bg-slate-700 rounded-full" />)}
            </div>
          </div>

          {/* Printer — Base / Shadow platform */}
          <div className="relative w-[280px] h-[8px] mx-auto mt-0 rounded-full"
               style={{
                 background: 'linear-gradient(180deg, #1e293b, #0f172a)',
                 boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
               }} />
        </div>

        {/* === ORBITING SHIELD === */}
        <motion.div
          className="absolute"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          {/* Shield orbit ring */}
          <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full border border-indigo-500/10"
               style={{ transform: 'rotateX(70deg)' }} />
        </motion.div>

        {/* Floating Shield Icon — orbiting */}
        <motion.div
          className="absolute"
          animate={{
            x: [130, 0, -130, 0, 130],
            y: [-30, -80, -30, 20, -30],
            z: [0, 50, 0, -50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center border border-indigo-500/30"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(129,140,248,0.1))',
              boxShadow: '0 0 30px rgba(99,102,241,0.3), 0 0 60px rgba(99,102,241,0.1)',
              backdropFilter: 'blur(10px)',
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <Shield size={20} className="text-indigo-600" />
          </motion.div>
        </motion.div>

        {/* Floating Lock Icon — second orbit */}
        <motion.div
          className="absolute"
          animate={{
            x: [-100, 0, 100, 0, -100],
            y: [20, -50, 20, 70, 20],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          <motion.div
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-indigo-500/20"
            style={{
              background: 'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(168,85,247,0.1))',
              boxShadow: '0 0 20px rgba(129,140,248,0.2)',
              backdropFilter: 'blur(8px)',
            }}
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          >
            <Lock size={14} className="text-indigo-600" />
          </motion.div>
        </motion.div>

        {/* === SCANNING LASER LINE === */}
        <motion.div
          className="absolute left-[-20px] right-[-20px] h-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(129,140,248,0.6), transparent)',
            boxShadow: '0 0 15px rgba(99,102,241,0.4), 0 0 30px rgba(99,102,241,0.2)',
          }}
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        />

        {/* === ENCRYPTION PARTICLES around printer === */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-indigo-400/60"
            style={{ left: '50%', top: '50%' }}
            animate={{
              x: [0, Math.cos((i * Math.PI * 2) / 8) * 160],
              y: [0, Math.sin((i * Math.PI * 2) / 8) * 100],
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeOut',
              delay: i * 0.35,
            }}
          />
        ))}

        {/* Binary text particles */}
        {['01', '10', '11', '00', '01'].map((binary, i) => (
          <motion.span
            key={`bin-${i}`}
            className="absolute text-[8px] font-mono text-indigo-500/30 pointer-events-none select-none"
            style={{ left: '50%', top: '50%' }}
            animate={{
              x: [0, (Math.random() - 0.5) * 200],
              y: [0, -120 - Math.random() * 80],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeOut',
              delay: i * 0.8 + 0.5,
            }}
          >
            {binary}
          </motion.span>
        ))}
      </motion.div>

      {/* Ground reflection */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[200px] h-[60px] rounded-full opacity-20 blur-[20px]"
           style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.4), transparent)' }} />
    </div>
  );
};

/* ============================================================
   3D TILT CARD — Follows mouse for depth effect
   ============================================================ */
const TiltCard = ({ children, className = '', glowColor = 'rgba(99,102,241,0.15)' }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 20;
    const rotateY = (x - 0.5) * 20;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`);
    setGlowPos({ x: x * 100, y: y * 100 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
    setGlowPos({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
};

/* ============================================================
   SCROLL-TRIGGERED SECTION WRAPPER
   ============================================================ */
const ScrollSection = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80, rotateX: 8 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
      style={{ perspective: '1200px' }}
    >
      {children}
    </motion.div>
  );
};

/* ============================================================
   ANIMATED COUNTER
   ============================================================ */
const AnimatedCounter = ({ target, suffix = '', label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame;
    const duration = 2000;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
        {count}{suffix}
      </div>
      <div className="text-slate-600 text-sm font-medium">{label}</div>
    </div>
  );
};

/* ============================================================
   MAIN LANDING PAGE
   ============================================================ */
const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [workflowRole, setWorkflowRole] = useState('user');

  const { scrollYProgress } = useScroll({ target: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 30 });

  // Parallax transforms
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -150]);
  const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.92]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const bgRotateX = useTransform(smoothProgress, [0, 0.5], [0, 5]);

  // Scroll progress bar
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500/30 overflow-x-hidden">

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-400 via-indigo-400 to-indigo-400 z-[100] origin-left"
        style={{ scaleX }}
      />

      <FloatingParticles />

      {/* ===== NAVBAR ===== */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-xl border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div
              className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Shield className="text-indigo-600" size={22} />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              SafePrint<span className="text-indigo-500">.</span>
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            {['Solutions', 'How It Works', 'Security', 'Stats'].map((item, i) => (
              <motion.a
                key={item}
                href={`#${['features', 'workflow', 'security', 'stats'][i]}`}
                className="hover:text-slate-900 transition-colors relative group"
                whileHover={{ y: -1 }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>
          <motion.div
            className="px-6 py-2.5 rounded-full font-bold text-sm border border-indigo-500/30 bg-indigo-500/5 text-indigo-600 cursor-default relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
          >
            <span className="relative z-10">Coming Soon</span>
            <motion.div
              className="absolute inset-0 bg-indigo-500/10"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
      </motion.nav>

      {/* ===== HERO SECTION — Full Viewport ===== */}
      <motion.section
        className="min-h-screen flex items-center px-6 max-w-7xl mx-auto relative"
        style={{
          y: heroY,
          scale: heroScale,
          opacity: heroOpacity,
          rotateX: bgRotateX,
          perspective: '1200px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-500/8 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute top-60 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] -z-10" />

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left — Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: 5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center lg:text-left"
          >
            {/* Status Badge */}
            <motion.div
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-indigo-100 border border-indigo-500/20 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
              </span>
              Live System Status: Operational
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-7 leading-[1.05]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
            >
              Share Once.{' '}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-400 bg-[length:200%_auto] animate-gradient-shift">
                Gone Forever.
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              The ephemeral file-transfer protocol for high-stakes environments.
              Upload files that automatically self-destruct after a single print.
              <span className="block mt-3 text-indigo-600/80 font-semibold tracking-wide">
                No Logs. No Accounts. No Trace.
              </span>
            </motion.p>

            <motion.div
              className="flex flex-col lg:flex-row items-stretch justify-center lg:justify-start gap-3 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <motion.button
                onClick={() => navigate('/upload')}
                className="lg:min-w-[260px] bg-gradient-to-r from-indigo-500 to-indigo-400 hover:from-indigo-400 hover:to-indigo-400 text-slate-950 px-8 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2.5 shadow-2xl shadow-indigo-500/25 group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                Start Secure Transfer
                <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
              
              <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:flex-none">
                <motion.button
                  onClick={() => navigate('/nearby')}
                  className="flex-1 lg:px-6 py-4 rounded-2xl font-bold text-sm text-slate-900 border border-slate-300/80 bg-white/5 hover:bg-white/10 hover:border-indigo-500 transition-all backdrop-blur-sm flex items-center justify-center gap-2 whitespace-nowrap"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MapPin size={18} className="text-indigo-600" />
                  Find Local Shops
                </motion.button>
                <motion.button
                  onClick={() => navigate('/business')}
                  className="flex-1 lg:px-6 py-4 rounded-2xl font-bold text-sm text-slate-700 border border-slate-300/80 bg-white/5 hover:bg-white/10 hover:border-indigo-500 transition-all backdrop-blur-sm flex items-center justify-center gap-2 whitespace-nowrap"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Store size={18} className="text-indigo-600" />
                  For Business Owners
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — 3D Secure Printer */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="-mt-10 md:-mt-20"
          >
            <SecurePrinter3D />
          </motion.div>
        </div>
      </motion.section>

      {/* ===== HOW IT WORKS — Vertical Timeline ===== */}
      <WorkflowSection />

      {/* ===== TARGET SECTORS — 3D Tilt Cards ===== */}
      <section id="features" className="py-16 bg-white/20 border-y border-slate-200 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/3 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollSection>
            <div className="text-center mb-20">
              <motion.span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-5">
                Use Cases
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5">Real-World Solutions</h2>
              <p className="text-slate-600 text-lg max-w-xl mx-auto">
                Solving the privacy gaps in our daily digital interactions.
              </p>
            </div>
          </ScrollSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
            {[
              {
                icon: <Printer className="text-indigo-600" size={30} />,
                title: 'Xerox & Print Shops',
                badge: 'WhatsApp Bridge',
                desc: 'Stop logging into WhatsApp Web on public PCs. Securely print sensitive IDs and seamlessly unlock password-protected files like Aadhaar.',
                borderColor: 'border-indigo-500/20 hover:border-indigo-500/60',
                glowColor: 'rgba(99,102,241,0.12)',
                iconBg: 'bg-indigo-500/10',
              },
              {
                icon: <School className="text-blue-400" size={30} />,
                title: 'Campus Shop',
                badge: '24/7 Private',
                desc: 'A printer shop that never sleeps and never peeks. Fully automated 24/7 printing with zero privacy leaks.',
                borderColor: 'border-blue-500/20 hover:border-blue-500/60',
                glowColor: 'rgba(96,165,250,0.12)',
                iconBg: 'bg-blue-500/10',
              },
              {
                icon: <Gavel className="text-amber-400" size={30} />,
                title: 'Legal & Finance',
                badge: 'Client Vault',
                desc: 'A secure drop-zone for clients. Collect tax returns and legal proofs via a one-time link that expires immediately.',
                borderColor: 'border-amber-500/20 hover:border-amber-500/60',
                glowColor: 'rgba(251,191,36,0.12)',
                iconBg: 'bg-amber-500/10',
              },
              {
                icon: <Shield className="text-purple-400" size={30} />,
                title: 'Enterprise',
                badge: 'Self-Hosted',
                desc: 'Deploy SafePrint as a Docker container within your firewall to keep proprietary code and memos strictly internal.',
                borderColor: 'border-purple-500/20 hover:border-purple-500/60',
                glowColor: 'rgba(168,85,247,0.12)',
                iconBg: 'bg-purple-500/10',
              },
            ].map((card, i) => (
              <ScrollSection key={i} delay={i * 0.12}>
                <TiltCard
                  glowColor={card.glowColor}
                  className={`relative bg-white/60 backdrop-blur-md p-7 rounded-2xl border ${card.borderColor} transition-all duration-500 group cursor-default h-full`}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className={`p-3 ${card.iconBg} rounded-xl border border-slate-200 group-hover:scale-110 transition-transform duration-300`}>
                      {card.icon}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-slate-700 border border-slate-200 uppercase tracking-wider">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-200 pt-4">
                    {card.desc}
                  </p>
                </TiltCard>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section id="stats" className="py-20 pt-28 -mt-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6">
          <ScrollSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <AnimatedCounter target={256} suffix="-bit" label="AES Encryption" />
              <AnimatedCounter target={0} suffix="s" label="Data Retention" />
              <AnimatedCounter target={100} suffix="%" label="File Destruction" />
              <AnimatedCounter target={100} suffix="%" label="Privacy Guaranteed" />
            </div>
          </ScrollSection>
        </div>
      </section>

      {/* ===== SECURITY PROTOCOL — 3D Split ===== */}
      <section id="security" className="py-16 max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <ScrollSection>
            <div>
              <motion.div
                className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-300/50 mb-8 shadow-lg"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <Lock className="text-indigo-600" size={30} />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-7 leading-tight">
                The{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  "Burn-After-Reading"
                </span>{' '}
                Protocol
              </h2>
              <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                Traditional cloud storage keeps your files forever. SafePrint is designed to destroy them.
                Our architecture ensures data cannot be recovered once the transaction is complete.
              </p>

              <div className="space-y-7">
                {[
                  { title: 'RAM-Only Buffer', desc: 'Files are streamed through memory, minimizing disk writes.', icon: <Zap size={18} /> },
                  { title: 'Cryptographic Randomization', desc: 'Filenames are obfuscated with 256-bit entropy.', icon: <EyeOff size={18} /> },
                  { title: 'Instant Purge (fs.unlink)', desc: 'Server triggers physical deletion immediately after the byte stream closes.', icon: <CheckCircle size={18} /> },
                ].map((feature, i) => (
                  <ScrollSection key={i} delay={i * 0.15}>
                    <motion.div
                      className="flex gap-5 p-4 rounded-xl hover:bg-white/50 transition-colors duration-300 group cursor-default"
                      whileHover={{ x: 5 }}
                    >
                      <div className="mt-0.5 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-600 group-hover:scale-110 transition-transform flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-bold text-lg mb-1">{feature.title}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                    </motion.div>
                  </ScrollSection>
                ))}
              </div>
            </div>
          </ScrollSection>

          {/* Code Block */}
          <ScrollSection delay={0.2}>
            <TiltCard
              glowColor="rgba(99,102,241,0.08)"
              className="relative bg-white border border-slate-300/60 rounded-3xl p-8 overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />

              <div className="font-mono text-sm relative z-10">
                <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-3 text-xs text-slate-600 font-sans">server/handler.js</span>
                </div>

                <div className="space-y-2.5 text-slate-600">
                  {[
                    { content: <><span className="text-purple-400">const</span> <span className="text-blue-400">handleDownload</span> = <span className="text-yellow-400">async</span> (req, res) =&gt; {'{'}</>, delay: 0 },
                    { content: <span className="pl-5 text-slate-600">{'// 1. Stream file to client'}</span>, delay: 0.1 },
                    { content: <span className="pl-5"><span className="text-blue-400">await</span> streamFile(res, filePath);</span>, delay: 0.2 },
                    { content: <span className="pl-5 text-slate-600">{'// 2. Trigger immediate destruction'}</span>, delay: 0.3 },
                    { content: <span className="pl-5 text-red-400 font-semibold">fs.unlinkSync(filePath);</span>, delay: 0.4 },
                    { content: <span className="pl-5 text-indigo-600">console.log(<span className="text-indigo-300">"EVIDENCE_DESTROYED"</span>);</span>, delay: 0.5 },
                    { content: <span>{'}'}</span>, delay: 0.6 },
                  ].map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: line.delay + 0.3, duration: 0.5 }}
                    >
                      <span className="text-slate-700 mr-4 select-none text-xs">{String(i + 1).padStart(2, '0')}</span>
                      {line.content}
                    </motion.p>
                  ))}
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />

              <motion.div
                className="absolute bottom-10 left-[72px] w-2 h-5 bg-indigo-400/80"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </TiltCard>
          </ScrollSection>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />
        <ScrollSection>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              whileInView={{ rotateX: [5, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              style={{ perspective: '1000px' }}
            >
              <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
                Ready to go{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-400">
                  ghost mode
                </span>
                ?
              </h2>
              <p className="text-slate-600 text-lg mb-10 max-w-xl mx-auto">
                Start transferring files with military-grade ephemeral security.
                Zero registration. Zero traces.
              </p>
              <motion.button
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-indigo-500 to-indigo-500 text-slate-950 px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-indigo-500/30 group inline-flex items-center gap-3"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <Zap size={22} />
                Start Uploading Files
                <ChevronRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
        </ScrollSection>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200 py-14 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
              <Shield className="text-indigo-600" size={18} />
            </div>
            <span className="text-sm text-slate-500">
              © 2026 SafePrint Technologies.
            </span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            {['Privacy Policy', 'Terms of Destruction', 'GitHub'].map((link) => (
              <a key={link} href="#" className="hover:text-indigo-600 transition-colors duration-300">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ===== CUSTOM KEYFRAME ANIMATIONS ===== */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        .animate-gradient-shift {
          animation: gradient-shift 4s ease-in-out infinite;
        }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default LandingPage; 