export type MathCategory = 
  | 'Basic Arithmetic'
  | 'Exponents/Powers'
  | 'Fractions'
  | 'Decimals'
  | 'Percentages'
  | 'BODMAS';

export type DifficultyLevel = 'Basic' | 'Intermediate' | 'Advanced';

export interface MathExpression {
  id: string; // 'A', 'B', 'C'
  expression: string; // e.g. "15% of 240"
  value: number; // exact numeric value e.g. 36
  category?: MathCategory;
}

export interface Question {
  id: string;
  category: MathCategory;
  difficulty: DifficultyLevel;
  expressions: MathExpression[]; // exactly 3 items
  trick: string; // 1-2 sentence fast mental math trick/solution
}

export interface QuestionResult {
  questionNumber: number;
  question: Question;
  userSelectionOrder: string[]; // IDs in clicked order
  correctOrder: string[]; // IDs in ascending numeric value order
  isCorrect: boolean;
  timeSpentSeconds: number;
  timedOut: boolean;
}

export interface GameStats {
  score: number;
  streak: number;
  maxStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  history: QuestionResult[];
}
