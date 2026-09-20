import React from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Flame, 
  Trophy, 
  Layers,
  GraduationCap,
  BrainCircuit
} from 'lucide-react';
import { MathCategory, DifficultyLevel } from '../types';

interface HeaderProps {
  category: MathCategory | 'All Categories';
  onCategoryChange: (cat: MathCategory | 'All Categories') => void;
  difficulty: DifficultyLevel;
  onDifficultyChange: (diff: DifficultyLevel) => void;
  score: number;
  totalAnswered: number;
  currentStreak: number;
  questionNumber: number;
  totalQuestions: number;
  isMuted: boolean;
  onToggleMute: () => void;
  isGameOver: boolean;
  aiSource?: string;
}

const CATEGORIES: (MathCategory | 'All Categories')[] = [
  'All Categories',
  'Percentages',
  'Fractions',
  'Exponents/Powers',
  'Decimals',
  'Basic Arithmetic',
  'BODMAS'
];

const DIFFICULTIES: DifficultyLevel[] = ['Basic', 'Intermediate', 'Advanced'];

export const Header: React.FC<HeaderProps> = ({
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  score,
  totalAnswered,
  currentStreak,
  questionNumber,
  totalQuestions,
  isMuted,
  onToggleMute,
  isGameOver,
  aiSource
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto pt-4 pb-2 px-4 select-none">
      {/* Brand & Main Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Bubble Math
              </h1>
              <span className="text-[10px] font-bold font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                PST Assessment
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sort expressions from <span className="text-indigo-400 font-semibold">lowest to highest</span> value within 14s
            </p>
          </div>
        </div>

        {/* Real-time stats during game */}
        <div className="flex items-center gap-3">
          {!isGameOver && (
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/80 border border-slate-700/60 px-3.5 py-1.5 rounded-2xl backdrop-blur-md">
              {/* Score */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Score:</span>
                <span className="font-bold text-white">{score}</span>
                <span className="text-slate-500">/ {questionNumber - 1}</span>
              </div>

              <div className="w-px h-4 bg-slate-700/80" />

              {/* Streak */}
              <div className="flex items-center gap-1 text-xs font-mono">
                <Flame className={`w-3.5 h-3.5 ${currentStreak > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                <span className={`font-bold ${currentStreak > 0 ? 'text-rose-300' : 'text-slate-400'}`}>
                  {currentStreak}
                </span>
              </div>

              <div className="w-px h-4 bg-slate-700/80" />

              {/* Progress counter */}
              <div className="text-xs font-mono text-slate-400">
                Q <strong className="text-indigo-300">{questionNumber}</strong>/{totalQuestions}
              </div>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* 10-Question Progress Indicator Segment Bar */}
      {!isGameOver && (
        <div className="mt-3 flex items-center gap-1.5 w-full">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const stepNum = i + 1;
            const isCurrent = stepNum === questionNumber;
            const isPassed = stepNum < questionNumber;

            return (
              <div
                key={stepNum}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                    : isPassed
                      ? 'bg-indigo-700/60'
                      : 'bg-slate-800'
                }`}
                title={`Question ${stepNum} of ${totalQuestions}`}
              />
            );
          })}
        </div>
      )}

      {/* Category Pills & Difficulty Selector */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span className="hidden md:inline">Topic:</span>
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Difficulty Pill */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg">
          <span className="text-[10px] text-slate-400 font-mono px-1.5 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Level:</span>
          </span>
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => onDifficultyChange(diff)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                difficulty === diff
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
