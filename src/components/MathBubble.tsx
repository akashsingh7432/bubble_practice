import React from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { MathExpression } from '../types';

interface MathBubbleProps {
  expression: MathExpression;
  selectionIndex: number | null; // 0 for 1st, 1 for 2nd, 2 for 3rd, or null if unselected
  isLocked: boolean;
  isEvaluated: boolean;
  isCorrectOrder?: boolean;
  trueRank?: number; // 1, 2, or 3
  onClick: () => void;
  positionLabel: 'top' | 'bottom-left' | 'bottom-right';
}

export const MathBubble: React.FC<MathBubbleProps> = ({
  expression,
  selectionIndex,
  isLocked,
  isEvaluated,
  isCorrectOrder,
  trueRank,
  onClick,
  positionLabel
}) => {
  const isSelected = selectionIndex !== null;

  // Rank labels for user selection
  const rankLabels = ['1st (Lowest)', '2nd (Middle)', '3rd (Highest)'];
  const rankShort = ['1st', '2nd', '3rd'];

  // Bubble border and background style logic
  let borderClass = 'border-slate-700/60 hover:border-indigo-400/70 hover:shadow-indigo-500/20';
  let bgClass = 'bg-slate-900/75 backdrop-blur-xl';
  let glowClass = '';

  if (isEvaluated) {
    if (isCorrectOrder) {
      borderClass = 'border-emerald-500 shadow-emerald-500/30';
      bgClass = 'bg-emerald-950/40 backdrop-blur-xl';
      glowClass = 'shadow-[0_0_25px_rgba(16,185,129,0.35)]';
    } else {
      borderClass = 'border-rose-500 shadow-rose-500/30';
      bgClass = 'bg-rose-950/40 backdrop-blur-xl';
      glowClass = 'shadow-[0_0_25px_rgba(244,63,94,0.35)]';
    }
  } else if (isSelected) {
    borderClass = 'border-indigo-400 shadow-indigo-500/30 ring-2 ring-indigo-400/40';
    bgClass = 'bg-indigo-950/50 backdrop-blur-xl';
    glowClass = 'shadow-[0_0_25px_rgba(99,102,241,0.3)]';
  }

  return (
    <motion.button
      type="button"
      id={`bubble-${expression.id.toLowerCase()}`}
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.05, y: -4 } : {}}
      whileTap={!isLocked ? { scale: 0.96 } : {}}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      aria-label={`Expression: ${expression.expression}`}
      className={`
        relative group flex flex-col items-center justify-center text-center
        w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full
        border-2 cursor-pointer transition-all duration-300
        p-3 sm:p-4 select-none focus:outline-none focus:ring-4 focus:ring-indigo-500/30
        ${borderClass} ${bgClass} ${glowClass}
        ${isLocked ? 'cursor-default' : 'active:scale-95 cursor-pointer'}
      `}
    >
      {/* Subtle glossy glass reflection overlay */}
      <div 
        aria-hidden="true" 
        className="absolute inset-1.5 sm:inset-2 rounded-full bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none opacity-60" 
      />

      {/* Expression ID Badge at top rim */}
      <div className="absolute top-2 sm:top-2.5 flex items-center gap-1.5 z-10">
        <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
          Option {expression.id}
        </span>
      </div>

      {/* Main Math Expression */}
      <div className="my-auto px-1.5 sm:px-2 flex flex-col items-center justify-center z-10">
        <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-wide font-mono drop-shadow-sm group-hover:text-indigo-200 transition-colors">
          {expression.expression}
        </span>

        {/* Revealed numerical value upon evaluation */}
        {isEvaluated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-0.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-700"
          >
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">Value:</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-amber-300">
              {Number.isInteger(expression.value) 
                ? expression.value 
                : expression.value.toFixed(2).replace(/\.00$/, '')}
            </span>
          </motion.div>
        )}
      </div>

      {/* Selection / Status Footer Badge */}
      <div className="absolute bottom-2 sm:bottom-2.5 z-10">
        {isEvaluated ? (
          <div className="flex items-center gap-1">
            {isCorrectOrder ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-semibold">
                <Check className="w-3 h-3" />
                <span>{trueRank ? rankShort[trueRank - 1] : 'Correct'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] sm:text-xs font-semibold">
                <X className="w-3 h-3" />
                <span>Actual: {trueRank ? rankShort[trueRank - 1] : ''}</span>
              </span>
            )}
          </div>
        ) : isSelected ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-indigo-600 text-white font-bold text-[10px] sm:text-xs shadow-lg shadow-indigo-600/40"
          >
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] sm:text-[10px] font-mono">
              {selectionIndex + 1}
            </span>
            <span>{rankLabels[selectionIndex]}</span>
          </motion.div>
        ) : (
          <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-800/40 border border-slate-700/40 group-hover:border-slate-500 transition-colors">
            Click to select
          </div>
        )}
      </div>
    </motion.button>
  );
};
