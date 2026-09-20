import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Flame, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Award,
  BarChart3,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { QuestionResult } from '../types';

interface ResultDashboardProps {
  results: QuestionResult[];
  onRestart: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  results,
  onRestart
}) => {
  const total = results.length;
  const correctCount = results.filter(r => r.isCorrect).length;
  const accuracy = Math.round((correctCount / total) * 100);

  // Average time
  const totalTime = results.reduce((acc, r) => acc + r.timeSpentSeconds, 0);
  const avgTime = (totalTime / total).toFixed(1);

  // Max streak
  let maxStreak = 0;
  let currentStreak = 0;
  results.forEach(r => {
    if (r.isCorrect) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  });

  // Assessment tier determination
  let tierTitle = 'Targeted Drills Advised';
  let tierBadge = 'Needs Practice';
  let tierColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  let tierDescription = 'Practice mental estimation techniques like rounding, benchmark percentages, and factor cancellation to boost speed.';

  if (accuracy >= 90) {
    tierTitle = 'Elite Quantitative Agility';
    tierBadge = 'Top 1% Assessment Ready';
    tierColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    tierDescription = 'Exceptional mental speed and numerical intuition under pressure. Highly competitive for Tier 1 Strategy Consulting (McKinsey/Bain/BCG) and Trading firms.';
  } else if (accuracy >= 70) {
    tierTitle = 'Strong Quantitative Performance';
    tierBadge = 'Assessment Pass Ready';
    tierColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    tierDescription = 'Solid numerical fluency within the 14-second benchmark. Meets corporate assessment thresholds with reliable mental calculation.';
  } else if (accuracy >= 50) {
    tierTitle = 'Proficient Foundation';
    tierBadge = 'Speed Optimization Needed';
    tierColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    tierDescription = 'Good conceptual grasp, but time pressure led to rushed selections. Focus on eliminating calculation steps via benchmarks.';
  }

  // Confetti on good score
  useEffect(() => {
    if (accuracy >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [accuracy]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto space-y-6 select-none"
      id="result-dashboard"
    >
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-700/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10 text-center sm:text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border bg-slate-800/80 border-slate-700 text-slate-300">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Assessment Completed • 10 Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Performance Summary
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-lg">
              Detailed breakdown of your mental sorting speed, accuracy, and assessment readiness.
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            id="btn-restart-assessment"
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New 10-Question Set</span>
          </button>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Score</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {correctCount} <span className="text-base text-slate-400 font-normal">/ {total}</span>
            </div>
            <div className="text-xs font-semibold text-indigo-400 mt-1">
              {accuracy}% Accuracy
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Avg Speed</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {avgTime}s
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Target: &lt; 8.0s
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Best Streak</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {maxStreak} <span className="text-sm font-normal text-rose-400">🔥</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Consecutive wins
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pace Rating</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-white truncate">
              {accuracy >= 80 ? 'Lightning' : accuracy >= 60 ? 'Standard' : 'Paced'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              14s Max Limit
            </div>
          </div>
        </div>

        {/* Corporate Assessment Benchmark Box */}
        <div className={`mt-6 p-4 rounded-2xl border ${tierColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/10">
                {tierBadge}
              </span>
              <h4 className="text-base font-bold text-white">
                {tierTitle}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {tierDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Question Review Accordion / List */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
          <span>Question-by-Question Audit</span>
          <span className="text-xs font-normal text-slate-400">
            Review expressions and speed shortcuts
          </span>
        </h3>

        <div className="space-y-3">
          {results.map((res) => {
            const sorted = [...res.question.expressions].sort((a, b) => a.value - b.value);

            return (
              <div
                key={res.questionNumber}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700/40">
                  <div className="flex items-center gap-2.5">
                    {res.isCorrect ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <XCircle className="w-4 h-4" />
                      </span>
                    )}
                    <span className="text-sm font-bold text-white font-mono">
                      Q{res.questionNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {res.question.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Time: <strong className="text-white">{res.timeSpentSeconds.toFixed(1)}s</strong></span>
                    <span className={`font-semibold ${res.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {res.isCorrect ? '+1 Pt' : res.timedOut ? 'Timed Out' : '0 Pts'}
                    </span>
                  </div>
                </div>

                {/* Expressions in correct ascending order */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-2.5">
                  {sorted.map((exp, idx) => (
                    <div 
                      key={exp.id}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/50 text-xs font-mono"
                    >
                      <span className="text-slate-400">
                        {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'}: <strong className="text-white">{exp.expression}</strong>
                      </span>
                      <span className="font-bold text-amber-300">
                        = {Number.isInteger(exp.value) ? exp.value : exp.value.toFixed(2).replace(/\.00$/, '')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mental Shortcut */}
                <div className="flex items-start gap-2 text-xs text-slate-300 mt-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Trick:</strong> {res.question.trick}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
