import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lightbulb, 
  ArrowRight, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Question, MathExpression } from '../types';

interface SolutionPanelProps {
  question: Question;
  userSelection: string[]; // array of expression IDs in chosen order
  isCorrect: boolean;
  timedOut: boolean;
  onNext: () => void;
}

export const SolutionPanel: React.FC<SolutionPanelProps> = ({
  question,
  userSelection,
  isCorrect,
  timedOut,
  onNext
}) => {
  // Sorted expressions in strictly ascending order of numeric value
  const sortedExpressions: MathExpression[] = [...question.expressions].sort(
    (a, b) => a.value - b.value
  );

  // Keyboard shortcut listener: Space or Enter to proceed to next question
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="w-full max-w-4xl mx-auto mt-6 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-2xl p-4 sm:p-6 overflow-hidden relative"
      id="solution-reveal-panel"
    >
      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : timedOut ? (
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-6 h-6" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-lg sm:text-xl font-bold ${isCorrect ? 'text-emerald-400' : timedOut ? 'text-amber-400' : 'text-rose-400'}`}>
                {isCorrect ? 'Perfect Sorting!' : timedOut ? 'Time Ran Out!' : 'Incorrect Order'}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {question.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isCorrect 
                ? 'Great speed and mental arithmetic precision.'
                : timedOut 
                  ? 'Time ended before sorting all 3. Read the trick below.'
                  : 'Review the correct values and speed arithmetic trick below.'}
            </p>
          </div>
        </div>

        {/* Action Controls - User-driven manual next */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            Take your time to review
          </span>

          <button
            type="button"
            id="btn-next-question"
            onClick={onNext}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer ring-1 ring-white/15"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-indigo-900/80 rounded border border-indigo-400/40 text-indigo-200">
              Space
            </kbd>
          </button>
        </div>
      </div>

      {/* Correct Ascending Order Breakdown */}
      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Correct Ascending Sequence (Lowest to Highest)</span>
          <span className="text-[11px] text-slate-400 lowercase">
            values evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sortedExpressions.map((exp, index) => {
            const rankTitle = index === 0 ? '1st • Lowest' : index === 1 ? '2nd • Middle' : '3rd • Highest';
            const userPickId = userSelection[index];
            const wasUserCorrectAtThisPosition = userPickId === exp.id;

            return (
              <div 
                key={exp.id}
                className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/70 relative"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold font-mono text-indigo-400">
                    {rankTitle}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    wasUserCorrectAtThisPosition 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {wasUserCorrectAtThisPosition ? 'You Picked ✓' : 'Mismatch'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 mt-1">
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    {exp.expression}
                  </span>
                  <span className="text-sm font-extrabold font-mono text-amber-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                    = {Number.isInteger(exp.value) ? exp.value : exp.value.toFixed(2).replace(/\.00$/, '')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mental Math Trick / Solution Box */}
      <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-500/30 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Speed Trick & Mental Shortcut</span>
            </h4>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {question.trick}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
