import React, { useEffect } from 'react';
import { motion } from 'motion/react';

export const IntroAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      {/* Trading Grid Background */}
      <div className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: 'linear-gradient(#262626 1px, transparent 1px), linear-gradient(90deg, #262626 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Floating Candles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: [0, 0.4, 0], 
              y: -200,
              x: Math.sin(i) * 100 
            }}
            transition={{ 
              duration: 4 + Math.random() * 2, 
              repeat: Infinity, 
              delay: i * 0.3,
              ease: "linear"
            }}
            className="absolute"
            style={{ 
              left: `${(i * 10) + 5}%`,
              bottom: '-50px'
            }}
          >
            <div className="flex flex-col items-center">
              <div className={`w-[1px] h-12 ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className={`w-3 h-8 rounded-sm ${i % 2 === 0 ? 'bg-emerald-500/40' : 'bg-red-500/40'} border ${i % 2 === 0 ? 'border-emerald-500' : 'border-red-500'}`} />
              <div className={`w-[1px] h-8 ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fibonacci Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute inset-0 flex flex-col justify-around px-10 pointer-events-none"
      >
        {[0, 23.6, 38.2, 50, 61.8, 78.6, 100].map((level) => (
          <div key={level} className="w-full border-t border-dashed border-white/40 relative">
            <span className="absolute -top-3 right-0 text-[8px] font-mono text-white/40">{level}%</span>
          </div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center z-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 45 }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="w-24 h-24 mb-10 relative"
        >
          {/* Premium Logo */}
          <div className="absolute inset-0 bg-white/10 rounded-2xl blur-2xl animate-pulse" />
          <div className="absolute inset-0 border border-white/20 rounded-2xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center shadow-2xl">
            <motion.div
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: -45, opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-white font-black text-2xl tracking-tighter"
            >
              z<span className="text-emerald-500">ZIA</span>
            </motion.div>
          </div>
          
          {/* Animated Chart Line around logo */}
          <svg className="absolute -inset-4 w-32 h-32 rotate-[-45deg]" viewBox="0 0 100 100">
            <motion.path
              d="M 10 80 Q 30 20 50 50 T 90 20"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2">
            z<span className="text-emerald-500">ZIA</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <motion.span 
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="h-[1px] bg-zinc-700"
            />
            <span className="text-xs font-mono tracking-[0.5em] text-zinc-500 uppercase">Institutional Grade</span>
            <motion.span 
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="h-[1px] bg-zinc-700"
            />
          </div>
        </motion.div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />
    </motion.div>
  );
};
