import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { 
  MathCategory, 
  DifficultyLevel, 
  Question, 
  QuestionResult, 
  MathExpression 
} from './types';
import { fallbackQuestions, getQuestionsPool, ensureDistinctValues } from './data/mockQuestions';
import { CircularTimer } from './components/CircularTimer';
import { MathBubble } from './components/MathBubble';
import { SolutionPanel } from './components/SolutionPanel';
import { ResultDashboard } from './components/ResultDashboard';
import { Header } from './components/Header';
import { sound } from './utils/audio';

const TOTAL_QUESTIONS = 10;
const QUESTION_TIME_LIMIT = 14; // seconds

export default function App() {
  // Config state
  const [category, setCategory] = useState<MathCategory | 'All Categories'>('All Categories');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [isMuted, setIsMuted] = useState(false);

  // Questions queue
  const [questions, setQuestions] = useState<Question[]>(() => getQuestionsPool('All Categories', 'Intermediate', TOTAL_QUESTIONS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSource, setAiSource] = useState<string>('gemini');

  // Active question game state
  const [userSelection, setUserSelection] = useState<string[]>([]); // array of IDs, e.g. ['A', 'B', 'C']
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Session stats & history
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<QuestionResult[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Fetch a set of questions from the server (Gemini API)
  const fetchQuestions = useCallback(async (cat: MathCategory | 'All Categories', diff: DifficultyLevel) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: cat === 'All Categories' ? undefined : cat,
          difficulty: diff,
          count: TOTAL_QUESTIONS
        })
      });

      if (!response.ok) throw new Error('API network response error');

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        let validQuestions = data.questions;
        if (cat !== 'All Categories') {
          // Strictly verify category match
          validQuestions = validQuestions.filter((q: Question) => q.category === cat);
          if (validQuestions.length < TOTAL_QUESTIONS) {
            const backupPool = getQuestionsPool(cat, diff, TOTAL_QUESTIONS);
            validQuestions = [
              ...validQuestions,
              ...backupPool.slice(validQuestions.length)
            ];
          }
        }
        const sanitized = validQuestions.slice(0, TOTAL_QUESTIONS).map((q: Question) => ensureDistinctValues(q));
        setQuestions(sanitized);
        setAiSource(data.source || 'gemini');
      } else {
        throw new Error('No questions returned');
      }
    } catch (err) {
      console.warn('Using tailored question pool:', err);
      const pool = getQuestionsPool(cat, diff, TOTAL_QUESTIONS);
      setQuestions(pool);
      setAiSource('algorithmic_cache');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchQuestions(category, difficulty);
  }, []);

  // Active question object - strictly guaranteed to match category & difficulty
  const currentQuestion: Question | undefined = questions[currentIndex] || getQuestionsPool(category, difficulty, 1)[0];

  // Map each expression ID to its true rank (1st = lowest, 2nd = middle, 3rd = highest)
  const trueRanks = React.useMemo(() => {
    if (!currentQuestion) return {};
    const sorted = [...currentQuestion.expressions].sort((a, b) => a.value - b.value);
    const ranks: Record<string, number> = {};
    sorted.forEach((exp, idx) => {
      ranks[exp.id] = idx + 1; // 1, 2, 3
    });
    return ranks;
  }, [currentQuestion]);

  // Evaluate user submission
  const evaluateAnswer = useCallback((selection: string[], isTimeout: boolean = false) => {
    if (isEvaluated) return;

    setIsLocked(true);
    setIsTimerRunning(false);
    setIsEvaluated(true);
    setTimedOut(isTimeout);

    const elapsedSeconds = Math.min(QUESTION_TIME_LIMIT, (Date.now() - startTimeRef.current) / 1000);

    if (!currentQuestion) return;

    const sorted = [...currentQuestion.expressions].sort((a, b) => a.value - b.value);
    const correctOrderIds = sorted.map(e => e.id);

    // To be correct: user must have selected all 3 AND in ascending order
    const correct = !isTimeout && 
      selection.length === 3 && 
      selection.every((id, idx) => id === correctOrderIds[idx]);

    setIsCorrect(correct);

    if (correct) {
      sound.playSuccess();
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      sound.playError();
      setStreak(0);
    }

    const result: QuestionResult = {
      questionNumber: currentIndex + 1,
      question: currentQuestion,
      userSelectionOrder: selection,
      correctOrder: correctOrderIds,
      isCorrect: correct,
      timeSpentSeconds: elapsedSeconds,
      timedOut: isTimeout
    };

    setHistory(prev => [...prev, result]);
  }, [currentIndex, currentQuestion, isEvaluated]);

  // 14-second countdown timer
  useEffect(() => {
    if (!isTimerRunning || isEvaluated || isGameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    const interval = 100; // update 10 times per second

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, QUESTION_TIME_LIMIT - elapsed);
      setTimeLeft(remaining);

      // Warning tick in last 3 seconds
      if (remaining <= 3 && Math.floor(remaining * 10) % 10 === 0 && remaining > 0.2) {
        sound.playTick();
      }

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setTimeLeft(0);
        evaluateAnswer(userSelection, true);
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isEvaluated, isGameOver, userSelection, evaluateAnswer]);

  // Handle bubble click
  const handleBubbleClick = (id: string) => {
    if (isLocked || isEvaluated) return;

    // If already in selection, toggle/deselect it
    if (userSelection.includes(id)) {
      const updated = userSelection.filter(item => item !== id);
      setUserSelection(updated);
      return;
    }

    // Add to selection
    const updated = [...userSelection, id];
    setUserSelection(updated);
    sound.playSelect(updated.length - 1);

    // If all 3 are selected, immediately lock and evaluate!
    if (updated.length === 3) {
      evaluateAnswer(updated, false);
    }
  };

  // Move to next question
  const handleNextQuestion = useCallback(() => {
    if (currentIndex + 1 >= TOTAL_QUESTIONS || currentIndex + 1 >= questions.length) {
      // 10 questions finished! Show Result Dashboard
      setIsGameOver(true);
      return;
    }

    // Reset for next question
    setCurrentIndex(prev => prev + 1);
    setUserSelection([]);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setIsLocked(false);
    setIsEvaluated(false);
    setIsCorrect(false);
    setTimedOut(false);
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
  }, [currentIndex, questions.length]);

  // Start a fresh 10-question set
  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setUserSelection([]);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setIsLocked(false);
    setIsEvaluated(false);
    setIsCorrect(false);
    setTimedOut(false);
    setIsTimerRunning(true);
    setScore(0);
    setStreak(0);
    setHistory([]);
    setIsGameOver(false);
    const immediatePool = getQuestionsPool(category, difficulty, TOTAL_QUESTIONS);
    setQuestions(immediatePool);
    fetchQuestions(category, difficulty);
  }, [category, difficulty, fetchQuestions]);

  // Category change
  const handleCategoryChange = (newCat: MathCategory | 'All Categories') => {
    setCategory(newCat);
    setCurrentIndex(0);
    setUserSelection([]);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setIsLocked(false);
    setIsEvaluated(false);
    setScore(0);
    setStreak(0);
    setHistory([]);
    setIsGameOver(false);
    // Instantly set queue with matching category questions
    const immediatePool = getQuestionsPool(newCat, difficulty, TOTAL_QUESTIONS);
    setQuestions(immediatePool);
    fetchQuestions(newCat, difficulty);
  };

  // Difficulty change
  const handleDifficultyChange = (newDiff: DifficultyLevel) => {
    setDifficulty(newDiff);
    setCurrentIndex(0);
    setUserSelection([]);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setIsLocked(false);
    setIsEvaluated(false);
    setScore(0);
    setStreak(0);
    setHistory([]);
    setIsGameOver(false);
    // Instantly set queue with matching difficulty questions
    const immediatePool = getQuestionsPool(category, newDiff, TOTAL_QUESTIONS);
    setQuestions(immediatePool);
    fetchQuestions(category, newDiff);
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Keyboard support: 1, 2, 3 to select bubbles
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked || isEvaluated || isGameOver || !currentQuestion) return;
      if (e.key === '1' && currentQuestion.expressions[0]) {
        handleBubbleClick(currentQuestion.expressions[0].id);
      } else if (e.key === '2' && currentQuestion.expressions[1]) {
        handleBubbleClick(currentQuestion.expressions[1].id);
      } else if (e.key === '3' && currentQuestion.expressions[2]) {
        handleBubbleClick(currentQuestion.expressions[2].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isEvaluated, isGameOver, currentQuestion, userSelection]);

  const expressions = currentQuestion?.expressions || [];
  const topBubble = expressions[0];
  const bottomLeftBubble = expressions[1];
  const bottomRightBubble = expressions[2];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Ambient Radial Glows */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.12),transparent_40%),radial-gradient(circle_at_20%_60%,rgba(16,185,129,0.08),transparent_40%)]" 
      />

      {/* Top Header */}
      <Header
        category={category}
        onCategoryChange={handleCategoryChange}
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        score={score}
        totalAnswered={history.length}
        currentStreak={streak}
        questionNumber={currentIndex + 1}
        totalQuestions={TOTAL_QUESTIONS}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isGameOver={isGameOver}
        aiSource={aiSource}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-5xl mx-auto">
        {isGameOver ? (
          /* Result Dashboard after 10 questions */
          <ResultDashboard 
            results={history} 
            onRestart={handleRestart} 
          />
        ) : (
          /* Active Question Practice Screen */
          <div className="w-full flex flex-col items-center justify-center relative">
            
            {/* Instruction banner */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 backdrop-blur-md mb-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Sort 3 Bubbles: <strong>Lowest → Highest</strong></span>
              </div>
              <p className="text-xs text-slate-400">
                Click in ascending order. Review solution tricks at your own pace when done.
              </p>
            </div>

            {/* Bubble Practice Stage with Side Timer */}
            <div className="relative w-full max-w-xl mx-auto flex flex-col items-center justify-center py-2 sm:py-4">
              
              {/* Triangular Bubble Formation Container - Tight and Close Together */}
              <div className="relative flex flex-col items-center justify-center z-20">
                {/* TOP BUBBLE */}
                {topBubble && (
                  <div className="mb-2 sm:mb-3 z-20">
                    <MathBubble
                      expression={topBubble}
                      selectionIndex={
                        userSelection.indexOf(topBubble.id) !== -1 
                          ? userSelection.indexOf(topBubble.id) 
                          : null
                      }
                      isLocked={isLocked}
                      isEvaluated={isEvaluated}
                      isCorrectOrder={
                        isEvaluated && trueRanks[topBubble.id] !== undefined
                          ? userSelection.indexOf(topBubble.id) === trueRanks[topBubble.id] - 1
                          : undefined
                      }
                      trueRank={trueRanks[topBubble.id]}
                      onClick={() => handleBubbleClick(topBubble.id)}
                      positionLabel="top"
                    />
                  </div>
                )}

                {/* BOTTOM ROW: LEFT & RIGHT BUBBLES - Kept closely together */}
                <div className="flex flex-row items-center justify-center gap-3 sm:gap-5 z-20">
                  {bottomLeftBubble && (
                    <MathBubble
                      expression={bottomLeftBubble}
                      selectionIndex={
                        userSelection.indexOf(bottomLeftBubble.id) !== -1 
                          ? userSelection.indexOf(bottomLeftBubble.id) 
                          : null
                      }
                      isLocked={isLocked}
                      isEvaluated={isEvaluated}
                      isCorrectOrder={
                        isEvaluated && trueRanks[bottomLeftBubble.id] !== undefined
                          ? userSelection.indexOf(bottomLeftBubble.id) === trueRanks[bottomLeftBubble.id] - 1
                          : undefined
                      }
                      trueRank={trueRanks[bottomLeftBubble.id]}
                      onClick={() => handleBubbleClick(bottomLeftBubble.id)}
                      positionLabel="bottom-left"
                    />
                  )}

                  {bottomRightBubble && (
                    <MathBubble
                      expression={bottomRightBubble}
                      selectionIndex={
                        userSelection.indexOf(bottomRightBubble.id) !== -1 
                          ? userSelection.indexOf(bottomRightBubble.id) 
                          : null
                      }
                      isLocked={isLocked}
                      isEvaluated={isEvaluated}
                      isCorrectOrder={
                        isEvaluated && trueRanks[bottomRightBubble.id] !== undefined
                          ? userSelection.indexOf(bottomRightBubble.id) === trueRanks[bottomRightBubble.id] - 1
                          : undefined
                      }
                      trueRank={trueRanks[bottomRightBubble.id]}
                      onClick={() => handleBubbleClick(bottomRightBubble.id)}
                      positionLabel="bottom-right"
                    />
                  )}
                </div>
              </div>

              {/* SIDE DOCKED TIMER - Placed to the side, no longer disturbing the center */}
              <div 
                id="side-timer-dock"
                className="absolute top-0 right-0 sm:right-0 md:-right-16 lg:-right-24 md:top-1/2 md:-translate-y-1/2 flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md shadow-xl z-30"
              >
                <CircularTimer
                  timeLeft={timeLeft}
                  totalTime={QUESTION_TIME_LIMIT}
                  isRunning={isTimerRunning && !isEvaluated}
                />
                <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider hidden sm:block">
                  Time Left
                </span>
              </div>

            </div>

            {/* Slide-in Solution Panel upon Evaluation (held until user manually clicks Next) */}
            <AnimatePresence>
              {isEvaluated && currentQuestion && (
                <SolutionPanel
                  question={currentQuestion}
                  userSelection={userSelection}
                  isCorrect={isCorrect}
                  timedOut={timedOut}
                  onNext={handleNextQuestion}
                />
              )}
            </AnimatePresence>

          </div>
        )}
      </main>

      {/* Sleek Minimalist Footer */}
      <footer className="w-full max-w-5xl mx-auto py-3 px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-900 z-10">
        <div className="flex items-center gap-2 mb-1 sm:mb-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Bubble Math Practice • Corporate Assessment Readiness</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>Shortcuts: [1, 2, 3] Select • [Space] Next</span>
          <span className="text-slate-400">Powered by Gemini 3.8 Flash</span>
        </div>
      </footer>
    </div>
  );
}
