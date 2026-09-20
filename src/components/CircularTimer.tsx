import React from 'react';
import { motion } from 'motion/react';
import { Timer } from 'lucide-react';

interface CircularTimerProps {
  timeLeft: number; // in seconds (can have decimals or integers)
  totalTime?: number; // default 14
  isRunning: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  timeLeft,
  totalTime = 14,
  isRunning
}) => {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timeLeft / totalTime));
  const strokeDashoffset = circumference - progress * circumference;

  // Color gradient based on urgency
  let strokeColor = 'stroke-emerald-500';
  let textColor = 'text-emerald-400';
  let glowColor = 'rgba(16, 185, 129, 0.2)';

  if (timeLeft <= 4) {
    strokeColor = 'stroke-rose-500';
    textColor = 'text-rose-400';
    glowColor = 'rgba(244, 63, 94, 0.35)';
  } else if (timeLeft <= 7) {
    strokeColor = 'stroke-amber-400';
    textColor = 'text-amber-400';
    glowColor = 'rgba(251, 191, 36, 0.25)';
  }

  const isLowTime = timeLeft <= 4 && isRunning;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <motion.div 
        className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-full"
        animate={isLowTime ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ repeat: isLowTime ? Infinity : 0, duration: 0.6 }}
        style={{
          boxShadow: `0 0 20px ${glowColor}`
        }}
      >
        {/* SVG Progress Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          {/* Background track */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-slate-800/80"
            strokeWidth="5"
            fill="transparent"
          />
          {/* Animated countdown stroke */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className={`${strokeColor} transition-all duration-150 ease-linear`}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center gap-0.5 text-xs text-slate-400 font-mono">
            <Timer className="w-3 h-3" />
            <span>SEC</span>
          </div>
          <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${textColor}`}>
            {timeLeft.toFixed(timeLeft < 5 ? 1 : 0)}
          </span>
          <span className="text-[10px] uppercase font-medium text-slate-400">
            / {totalTime}s
          </span>
        </div>
      </motion.div>
    </div>
  );
};
