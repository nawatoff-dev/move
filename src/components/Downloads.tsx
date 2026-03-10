import React from 'react';
import { motion } from 'motion/react';
import { Download, Monitor, Smartphone, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const Downloads: React.FC = () => {
  const downloadOptions = [
    {
      id: 'windows',
      title: 'Windows',
      description: 'Desktop application for professional trading.',
      icon: Monitor,
      link: '/downloads/zZIA-setup.exe',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      id: 'android',
      title: 'Android',
      description: 'Take your trading journal anywhere.',
      icon: Smartphone,
      link: '/downloads/zZIA.apk',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-6"
        >
          <Zap size={14} className="text-brand-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Install zZIA</span>
        </motion.div>
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">
          Download <span className="text-brand-primary">zZIA</span>
        </h1>
        <p className="text-text-muted max-w-xl mx-auto font-medium">
          Install zZIA on your devices for better performance, offline access, and a more integrated trading experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {downloadOptions.map((option, idx) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`group relative p-10 rounded-[3rem] border ${option.border} bg-brand-surface/40 hover:bg-brand-surface transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-primary/5`}
          >
            <div className="flex items-start justify-between mb-10">
              <div className={`p-6 rounded-[2rem] ${option.bg} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <option.icon className={option.color} size={48} />
              </div>
              <a
                href={option.link}
                download
                className="p-4 rounded-2xl bg-brand-primary text-text-inverse hover:scale-110 transition-all shadow-lg shadow-brand-primary/20"
              >
                <Download size={24} />
              </a>
            </div>

            <h3 className="text-3xl font-black uppercase tracking-tight mb-3 text-text-main group-hover:text-brand-primary transition-colors">
              {option.title}
            </h3>
            <p className="text-text-muted font-medium leading-relaxed mb-8">
              {option.description}
            </p>

            <a
              href={option.link}
              download
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-surface border border-brand-border rounded-2xl font-black text-xs uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all"
            >
              Download for {option.title}
              <ArrowRight size={14} />
            </a>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-brand-surface/30 border border-brand-border rounded-[2.5rem] p-10 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center">
            <ShieldCheck className="text-brand-primary" size={32} />
          </div>
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight mb-4">PWA Installation</h3>
        <p className="text-text-muted text-sm max-w-lg mx-auto leading-relaxed mb-8">
          You can also install zZIA directly from your browser as a Progressive Web App. Look for the "Install" icon in your browser's address bar or menu.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted">
            Works Offline
          </div>
          <div className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted">
            Fast Loading
          </div>
          <div className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted">
            No Store Required
          </div>
        </div>
      </motion.div>
    </div>
  );
};
