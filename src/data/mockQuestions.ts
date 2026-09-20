import { Question } from '../types';

export const fallbackQuestions: Question[] = [
  {
    id: 'seed-1',
    category: 'Percentages',
    difficulty: 'Intermediate',
    expressions: [
      { id: 'A', expression: '15% of 240', value: 36, category: 'Percentages' },
      { id: 'B', expression: '25% of 128', value: 32, category: 'Percentages' },
      { id: 'C', expression: '40% of 95', value: 38, category: 'Percentages' }
    ],
    trick: '10% of 240 is 24 + half (12) = 36. 25% of 128 is 128 ÷ 4 = 32. 40% of 95 is 4 × 9.5 = 38.'
  },
  {
    id: 'seed-2',
    category: 'Fractions',
    difficulty: 'Basic',
    expressions: [
      { id: 'A', expression: '5/8 × 64', value: 40, category: 'Fractions' },
      { id: 'B', expression: '3/7 × 98', value: 42, category: 'Fractions' },
      { id: 'C', expression: '2/3 × 57', value: 38, category: 'Fractions' }
    ],
    trick: 'Divide by denominator first: 64 ÷ 8 = 8 (×5 = 40); 98 ÷ 7 = 14 (×3 = 42); 57 ÷ 3 = 19 (×2 = 38).'
  },
  {
    id: 'seed-3',
    category: 'Exponents/Powers',
    difficulty: 'Intermediate',
    expressions: [
      { id: 'A', expression: '2^6 - 15', value: 49, category: 'Exponents/Powers' },
      { id: 'B', expression: '3^4 - 34', value: 47, category: 'Exponents/Powers' },
      { id: 'C', expression: '7^2 + 3', value: 52, category: 'Exponents/Powers' }
    ],
    trick: 'Recall benchmark powers: 2^6 = 64 (64 - 15 = 49); 3^4 = 81 (81 - 34 = 47); 7^2 = 49 (49 + 3 = 52).'
  },
  {
    id: 'seed-4',
    category: 'BODMAS',
    difficulty: 'Intermediate',
    expressions: [
      { id: 'A', expression: '12 + 6 × 8 - 14', value: 46, category: 'BODMAS' },
      { id: 'B', expression: '(18 - 6) × 4 + 5', value: 53, category: 'BODMAS' },
      { id: 'C', expression: '70 - 45 ÷ 3 - 5', value: 50, category: 'BODMAS' }
    ],
    trick: 'Prioritize multiplication/division: 6 × 8 = 48, so 12 + 48 - 14 = 46. 12 × 4 = 48 + 5 = 53. 70 - 15 - 5 = 50.'
  },
  {
    id: 'seed-5',
    category: 'Decimals',
    difficulty: 'Intermediate',
    expressions: [
      { id: 'A', expression: '3.5 × 14', value: 49, category: 'Decimals' },
      { id: 'B', expression: '0.8 × 65', value: 52, category: 'Decimals' },
      { id: 'C', expression: '2.4 × 20 + 3', value: 51, category: 'Decimals' }
    ],
    trick: 'Halve and double: 3.5 × 14 = 7 × 7 = 49. 0.8 × 65 = 8 × 6.5 = 52. 2.4 × 20 = 48 (+3 = 51).'
  },
  {
    id: 'seed-6',
    category: 'Basic Arithmetic',
    difficulty: 'Advanced',
    expressions: [
      { id: 'A', expression: '17 × 4 + 19', value: 87, category: 'Basic Arithmetic' },
      { id: 'B', expression: '14 × 6 + 7', value: 91, category: 'Basic Arithmetic' },
      { id: 'C', expression: '19 × 5 - 12', value: 83, category: 'Basic Arithmetic' }
    ],
    trick: 'Decompose: 17 × 4 = 68 (+ 19 = 87); 14 × 6 = 84 (+ 7 = 91); 19 × 5 = 95 (- 12 = 83).'
  },
  {
    id: 'seed-7',
    category: 'Percentages',
    difficulty: 'Advanced',
    expressions: [
      { id: 'A', expression: '35% of 220', value: 77, category: 'Percentages' },
      { id: 'B', expression: '75% of 96', value: 72, category: 'Percentages' },
      { id: 'C', expression: '45% of 160', value: 72, category: 'Percentages' }
    ],
    trick: 'Note: If values are equal, ensure distinct values in generation. 35% of 220 = 7 × 11 = 77. 3/4 of 96 = 72. 45% of 160 = 72.'
  },
  {
    id: 'seed-8',
    category: 'Fractions',
    difficulty: 'Intermediate',
    expressions: [
      { id: 'A', expression: '7/9 × 72', value: 56, category: 'Fractions' },
      { id: 'B', expression: '4/5 × 75', value: 60, category: 'Fractions' },
      { id: 'C', expression: '5/6 × 66', value: 55, category: 'Fractions' }
    ],
    trick: 'Cancel factors: 72 ÷ 9 = 8 (× 7 = 56); 75 ÷ 5 = 15 (× 4 = 60); 66 ÷ 6 = 11 (× 5 = 55).'
  },
  {
    id: 'seed-9',
    category: 'Exponents/Powers',
    difficulty: 'Advanced',
    expressions: [
      { id: 'A', expression: '4^3 + 2^5', value: 96, category: 'Exponents/Powers' },
      { id: 'B', expression: '5^3 - 27', value: 98, category: 'Exponents/Powers' },
      { id: 'C', expression: '10^2 - 3^2', value: 91, category: 'Exponents/Powers' }
    ],
    trick: 'Benchmark squares & cubes: 64 + 32 = 96. 125 - 27 = 98. 100 - 9 = 91.'
  },
  {
    id: 'seed-10',
    category: 'BODMAS',
    difficulty: 'Advanced',
    expressions: [
      { id: 'A', expression: '(25 - 9) × 4 - 6', value: 58, category: 'BODMAS' },
      { id: 'B', expression: '8 × 8 - 36 ÷ 6', value: 58, category: 'BODMAS' },
      { id: 'C', expression: '15 × 3 + 24 ÷ 2', value: 57, category: 'BODMAS' }
    ],
    trick: 'Break down parentheses first: (16) × 4 = 64 - 6 = 58; 64 - 6 = 58; 45 + 12 = 57.'
  }
];

// Helper to make sure expressions have 3 distinct values for strict ordering
export function ensureDistinctValues(question: Question): Question {
  const values = question.expressions.map(e => e.value);
  const uniqueValues = new Set(values);
  if (uniqueValues.size === values.length) {
    return question;
  }
  // If any values collide, adjust slightly
  const adjusted = [...question.expressions];
  if (adjusted[0].value === adjusted[1].value) {
    adjusted[1] = {
      ...adjusted[1],
      expression: `${adjusted[1].expression} + 3`,
      value: adjusted[1].value + 3
    };
  }
  if (adjusted[2].value === adjusted[0].value || adjusted[2].value === adjusted[1].value) {
    adjusted[2] = {
      ...adjusted[2],
      expression: `${adjusted[2].expression} + 7`,
      value: adjusted[2].value + 7
    };
  }
  return {
    ...question,
    expressions: adjusted
  };
}
