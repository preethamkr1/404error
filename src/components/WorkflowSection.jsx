import React, { useRef, useState } from 'react';
import { Shield, Printer, Lock, CheckCircle, Upload, QrCode, Smartphone, ScanLine, Trash2, FileCheck, User, Store } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* Scroll-triggered wrapper */
const ScrollReveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ============================================================
   WORKFLOW DATA
   ============================================================ */
const userSteps = [
  {
    icon: Upload,
    title: 'Select Your File',
    desc: 'Pick any document — Aadhaar, PAN card, assignment, resume. Drag & drop or browse from your phone.',
    detail: 'Supports PDF, images & docs up to 100MB',
    color: 'indigo',
  },
  {
    icon: Lock,
    title: 'Upload & Encrypt',
    desc: 'Your file is encrypted and uploaded to our secure server. No account needed — completely anonymous.',
    detail: 'AES-256 encryption + randomized filename',
    color: 'violet',
  },
  {
    icon: QrCode,
    title: 'Get QR Code & Unique Code',
    desc: 'Instantly receive a one-time QR code and a short alphanumeric code. This is your file\'s only key.',
    detail: 'Code expires after single use',
    color: 'blue',
  },
  {
    icon: Smartphone,
    title: 'Share with Print Shop',
    desc: 'Show the QR on your phone or share the code verbally. No WhatsApp login, no email needed.',
    detail: 'Zero digital trail on shop\'s device',
    color: 'indigo',
  },
];

const ownerSteps = [
  {
    icon: ScanLine,
    title: 'Scan QR or Enter Code',
    desc: 'Customer shows a QR code or tells you a short code. Enter it into the SafePrint dashboard — takes 2 seconds.',
    detail: 'Works in any browser, no app install',
    color: 'indigo',
  },
  {
    icon: FileCheck,
    title: 'Preview the Document',
    desc: 'See a secure preview of the document right in the browser. Verify the correct file before printing.',
    detail: 'Preview rendered in isolated sandbox',
    color: 'violet',
  },
  {
    icon: Printer,
    title: 'Print Securely',
    desc: 'Hit "Print" and the document goes straight to your connected printer. No file is saved to disk.',
    detail: 'Direct memory-to-printer pipeline',
    color: 'blue',
  },
  {
    icon: Trash2,
    title: 'Auto-Destruct',
    desc: 'The moment the print job completes, the file is permanently purged from the server. Gone forever.',
    detail: 'fs.unlink — irrecoverable deletion',
    color: 'indigo',
  },
];

const colorMap = {
  indigo: {
    icon: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    badge: 'bg-indigo-600 text-white',
    tag: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    card: 'border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-100/80',
    line: '#6366f1',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-600 border-violet-200',
    badge: 'bg-violet-600 text-white',
    tag: 'bg-violet-50 text-violet-600 border-violet-200',
    card: 'border-violet-100 hover:border-violet-300 hover:shadow-violet-100/80',
    line: '#7c3aed',
  },
  blue: {
    icon: 'bg-blue-100 text-blue-600 border-blue-200',
    badge: 'bg-blue-600 text-white',
    tag: 'bg-blue-50 text-blue-600 border-blue-200',
    card: 'border-blue-100 hover:border-blue-300 hover:shadow-blue-100/80',
    line: '#3b82f6',
  },
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const WorkflowSection = () => {
  const [role, setRole] = useState('user');
  const isUser = role === 'user';
  const steps = isUser ? userSteps : ownerSteps;

  return (
    <section id="workflow" className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* subtle background orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] -z-10 opacity-60" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-50 rounded-full blur-[100px] -z-10 opacity-50" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-5">
              Workflow
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">How It Works</h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
              Two simple roles. One seamless, secure flow.
            </p>

            {/* Role Toggle */}
            <div className="inline-flex items-center bg-slate-100 rounded-2xl p-1.5 border border-slate-200 shadow-sm">
              <motion.button
                onClick={() => setRole('user')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <User size={16} />
                I'm a User
              </motion.button>
              <motion.button
                onClick={() => setRole('owner')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  !isUser
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <Store size={16} />
                I'm a Shop Owner
              </motion.button>
            </div>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            {/* Vertical connector line */}
            <div className="absolute left-6 md:left-1/2 md:-translate-x-[1px] top-0 bottom-0 w-[2px]">
              <motion.div
                className="w-full h-full rounded-full bg-gradient-to-b from-indigo-200 via-violet-300 to-blue-200"
                style={{ transformOrigin: 'top' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1.2, delay: 0.15 }}
              />
            </div>

            {/* Steps */}
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLeft = i % 2 === 0;
              const c = colorMap[step.color];

              return (
                <ScrollReveal key={`${role}-${i}`} delay={i * 0.1}>
                  <div
                    className={`relative flex items-start gap-6 mb-10 last:mb-0 ${
                      isLeft ? 'md:flex-row md:text-left' : 'md:flex-row-reverse md:text-right'
                    }`}
                  >
                    {/* Icon dot on the line */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${c.icon}`}
                        whileInView={{ scale: [0.5, 1.15, 1] }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Icon size={20} />
                      </motion.div>
                      {/* Number badge */}
                      <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${c.badge}`}>
                        {i + 1}
                      </div>
                    </div>

                    {/* Content card */}
                    <div
                      className={`ml-20 md:ml-0 md:w-[calc(50%-40px)] ${
                        isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                      }`}
                    >
                      <motion.div
                        className={`p-6 rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${c.card}`}
                        whileHover={{ scale: 1.01 }}
                      >
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">{step.desc}</p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium border ${c.tag}`}
                        >
                          <CheckCircle size={10} />
                          {step.detail}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}

            {/* Result badge */}
            <ScrollReveal delay={0.55}>
              <div className="flex justify-center mt-8">
                <motion.div
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Shield size={18} />
                  <span className="font-semibold text-sm">
                    {isUser
                      ? 'File printed securely — zero trace left behind'
                      : 'Document printed & auto-destroyed from server'}
                  </span>
                </motion.div>
              </div>
            </ScrollReveal>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default WorkflowSection;
 