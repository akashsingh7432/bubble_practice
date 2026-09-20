import { Question, MathCategory, DifficultyLevel, MathExpression } from '../types';

// Algorithmic generator for strictly category-matched questions
export function generateCategoryQuestion(
  category: MathCategory,
  difficulty: DifficultyLevel,
  index: number = 0
): Question {
  const qId = `alg-${category.toLowerCase().replace(/[^a-z]/g, '')}-${difficulty.toLowerCase()}-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`;

  if (category === 'Basic Arithmetic') {
    if (difficulty === 'Basic') {
      // Small integers, intuitive single-step operations (addition, subtraction, single-digit multiplication, clean division)
      // We vary base ranges to create unique, distinct questions
      const baseValues = [
        { target: 45, items: [
          { expr: '18 + 27', val: 45, trick: '18 + 27 = 45' },
          { expr: '12 × 4', val: 48, trick: '12 × 4 = 48' },
          { expr: '75 - 33', val: 42, trick: '75 - 33 = 42' }
        ], generalTrick: 'Basic arithmetic: 75 - 33 = 42 < 18 + 27 = 45 < 12 × 4 = 48.' },

        { target: 36, items: [
          { expr: '19 + 18', val: 37, trick: '19 + 18 = 37' },
          { expr: '9 × 4', val: 36, trick: '9 × 4 = 36' },
          { expr: '50 - 16', val: 34, trick: '50 - 16 = 34' }
        ], generalTrick: 'Compare values: 50 - 16 = 34, 9 × 4 = 36, and 19 + 18 = 37.' },

        { target: 54, items: [
          { expr: '28 + 24', val: 52, trick: '28 + 24 = 52' },
          { expr: '6 × 9', val: 54, trick: '6 × 9 = 54' },
          { expr: '80 - 25', val: 55, trick: '80 - 25 = 55' }
        ], generalTrick: 'Split and combine: 28 + 24 = 52, 6 × 9 = 54, 80 - 25 = 55.' },

        { target: 63, items: [
          { expr: '7 × 9', val: 63, trick: '7 × 9 = 63' },
          { expr: '38 + 27', val: 65, trick: '38 + 27 = 65' },
          { expr: '90 - 29', val: 61, trick: '90 - 29 = 61' }
        ], generalTrick: 'Direct mental calculation: 90 - 29 = 61, 7 × 9 = 63, 38 + 27 = 65.' },

        { target: 72, items: [
          { expr: '8 × 9', val: 72, trick: '8 × 9 = 72' },
          { expr: '45 + 29', val: 74, trick: '45 + 29 = 74' },
          { expr: '95 - 26', val: 69, trick: '95 - 26 = 69' }
        ], generalTrick: 'Quick addition and multiplication: 95 - 26 = 69, 8 × 9 = 72, 45 + 29 = 74.' },

        { target: 28, items: [
          { expr: '15 + 14', val: 29, trick: '15 + 14 = 29' },
          { expr: '7 × 4', val: 28, trick: '7 × 4 = 28' },
          { expr: '42 - 16', val: 26, trick: '42 - 16 = 26' }
        ], generalTrick: 'Quick single-step operations: 42 - 16 = 26 < 7 × 4 = 28 < 15 + 14 = 29.' },

        { target: 80, items: [
          { expr: '9 × 9 - 3', val: 78, trick: '81 - 3 = 78' },
          { expr: '44 + 38', val: 82, trick: '44 + 38 = 82' },
          { expr: '96 - 17', val: 79, trick: '96 - 17 = 79' }
        ], generalTrick: 'Mental rounding: 9×9-3 = 78, 96 - 17 = 79, 44 + 38 = 82.' },

        { target: 48, items: [
          { expr: '16 × 3', val: 48, trick: '16 × 3 = 48' },
          { expr: '25 + 26', val: 51, trick: '25 + 26 = 51' },
          { expr: '65 - 19', val: 46, trick: '65 - 19 = 46' }
        ], generalTrick: 'Multiples of 16 and rounding: 65 - 19 = 46 < 16 × 3 = 48 < 25 + 26 = 51.' },

        { target: 60, items: [
          { expr: '12 × 5', val: 60, trick: '12 × 5 = 60' },
          { expr: '34 + 28', val: 62, trick: '34 + 28 = 62' },
          { expr: '85 - 27', val: 58, trick: '85 - 27 = 58' }
        ], generalTrick: 'Basic mental math: 85 - 27 = 58 < 12 × 5 = 60 < 34 + 28 = 62.' },

        { target: 90, items: [
          { expr: '15 × 6', val: 90, trick: '15 × 6 = 90' },
          { expr: '48 + 45', val: 93, trick: '48 + 45 = 93' },
          { expr: '110 - 23', val: 87, trick: '110 - 23 = 87' }
        ], generalTrick: 'Quick mental math: 110 - 23 = 87 < 15 × 6 = 90 < 48 + 45 = 93.' }
      ];

      const chosen = baseValues[index % baseValues.length];
      const exps: MathExpression[] = [
        { id: 'A', expression: chosen.items[0].expr, value: chosen.items[0].val, category: 'Basic Arithmetic' },
        { id: 'B', expression: chosen.items[1].expr, value: chosen.items[1].val, category: 'Basic Arithmetic' },
        { id: 'C', expression: chosen.items[2].expr, value: chosen.items[2].val, category: 'Basic Arithmetic' }
      ];

      return ensureDistinctValues({
        id: qId,
        category: 'Basic Arithmetic',
        difficulty: 'Basic',
        expressions: exps,
        trick: chosen.generalTrick
      });
    } else if (difficulty === 'Intermediate') {
      const intermediateSet = [
        { items: [{ expr: '14 × 5 + 8', val: 78 }, { expr: '13 × 6 - 4', val: 74 }, { expr: '95 - 19', val: 76 }], trick: '14 × 5 = 70 (+8 = 78). 13 × 6 = 78 (-4 = 74). 95 - 19 = 76.' },
        { items: [{ expr: '16 × 4 + 7', val: 71 }, { expr: '18 × 4 - 5', val: 67 }, { expr: '88 - 15', val: 73 }], trick: '16 × 4 = 64 (+7 = 71). 18 × 4 = 72 (-5 = 67). 88 - 15 = 73.' },
        { items: [{ expr: '15 × 5 + 9', val: 84 }, { expr: '17 × 5 - 3', val: 82 }, { expr: '110 - 24', val: 86 }], trick: '15 × 5 = 75 (+9 = 84). 17 × 5 = 85 (-3 = 82). 110 - 24 = 86.' },
        { items: [{ expr: '12 × 7 - 6', val: 78 }, { expr: '19 × 4 + 5', val: 81 }, { expr: '98 - 23', val: 75 }], trick: '12 × 7 = 84 (-6 = 78). 19 × 4 = 76 (+5 = 81). 98 - 23 = 75.' }
      ];
      const chosen = intermediateSet[index % intermediateSet.length];
      return ensureDistinctValues({
        id: qId,
        category: 'Basic Arithmetic',
        difficulty: 'Intermediate',
        expressions: [
          { id: 'A', expression: chosen.items[0].expr, value: chosen.items[0].val, category: 'Basic Arithmetic' },
          { id: 'B', expression: chosen.items[1].expr, value: chosen.items[1].val, category: 'Basic Arithmetic' },
          { id: 'C', expression: chosen.items[2].expr, value: chosen.items[2].val, category: 'Basic Arithmetic' }
        ],
        trick: chosen.trick
      });
    } else {
      // Advanced Basic Arithmetic
      const advancedSet = [
        { items: [{ expr: '17 × 6 - 15', val: 87 }, { expr: '19 × 5 + 6', val: 101 }, { expr: '23 × 4 + 3', val: 95 }], trick: '17 × 6 = 102 (-15 = 87). 19 × 5 = 95 (+6 = 101). 23 × 4 = 92 (+3 = 95).' },
        { items: [{ expr: '18 × 6 - 19', val: 89 }, { expr: '21 × 4 + 8', val: 92 }, { expr: '14 × 7 - 12', val: 86 }], trick: '18 × 6 = 108 (-19 = 89). 21 × 4 = 84 (+8 = 92). 14 × 7 = 98 (-12 = 86).' }
      ];
      const chosen = advancedSet[index % advancedSet.length];
      return ensureDistinctValues({
        id: qId,
        category: 'Basic Arithmetic',
        difficulty: 'Advanced',
        expressions: [
          { id: 'A', expression: chosen.items[0].expr, value: chosen.items[0].val, category: 'Basic Arithmetic' },
          { id: 'B', expression: chosen.items[1].expr, value: chosen.items[1].val, category: 'Basic Arithmetic' },
          { id: 'C', expression: chosen.items[2].expr, value: chosen.items[2].val, category: 'Basic Arithmetic' }
        ],
        trick: chosen.trick
      });
    }
  }

  if (category === 'Percentages') {
    const baseVal = 30 + (index * 6);
    const v1 = baseVal;
    const v2 = baseVal + 4;
    const v3 = baseVal - 3;
    return ensureDistinctValues({
      id: qId,
      category: 'Percentages',
      difficulty,
      expressions: [
        { id: 'A', expression: `15% of ${Math.round(v1 / 0.15)}`, value: v1, category: 'Percentages' },
        { id: 'B', expression: `20% of ${v2 * 5}`, value: v2, category: 'Percentages' },
        { id: 'C', expression: `25% of ${v3 * 4}`, value: v3, category: 'Percentages' }
      ],
      trick: 'Benchmark 10%, 20% (÷5), and 25% (÷4) for fast mental comparison.'
    });
  }

  if (category === 'Fractions') {
    const denom = 8;
    const n = 3 + (index % 4);
    const v1 = n * 6;
    const v2 = (n + 1) * 6 - 2;
    const v3 = (n * 6) + 3;
    return ensureDistinctValues({
      id: qId,
      category: 'Fractions',
      difficulty,
      expressions: [
        { id: 'A', expression: `${n}/${denom} × 48`, value: v1, category: 'Fractions' },
        { id: 'B', expression: `2/3 × ${Math.round(v2 * 1.5)}`, value: v2, category: 'Fractions' },
        { id: 'C', expression: `3/4 × ${Math.round(v3 / 0.75)}`, value: v3, category: 'Fractions' }
      ],
      trick: 'Cancel factors by dividing the whole number by the denominator first.'
    });
  }

  if (category === 'Exponents/Powers') {
    return ensureDistinctValues({
      id: qId,
      category: 'Exponents/Powers',
      difficulty,
      expressions: [
        { id: 'A', expression: `2^6 - ${15 + (index * 2)}`, value: 64 - (15 + (index * 2)), category: 'Exponents/Powers' },
        { id: 'B', expression: `3^4 - ${30 + (index * 2)}`, value: 81 - (30 + (index * 2)), category: 'Exponents/Powers' },
        { id: 'C', expression: `7^2 - ${index * 3}`, value: 49 - (index * 3), category: 'Exponents/Powers' }
      ],
      trick: 'Use benchmark powers: 2^6 = 64, 3^4 = 81, 7^2 = 49.'
    });
  }

  if (category === 'Decimals') {
    const v1 = 40 + index * 4;
    const v2 = v1 + 3.5;
    const v3 = v1 - 2.5;
    return ensureDistinctValues({
      id: qId,
      category: 'Decimals',
      difficulty,
      expressions: [
        { id: 'A', expression: `2.5 × ${v1 / 2.5}`, value: v1, category: 'Decimals' },
        { id: 'B', expression: `0.5 × ${(v2 * 2)}`, value: v2, category: 'Decimals' },
        { id: 'C', expression: `1.5 × ${Math.round(v3 / 1.5)}`, value: v3, category: 'Decimals' }
      ],
      trick: 'Use doubling and halving to eliminate decimal points.'
    });
  }

  // BODMAS
  return ensureDistinctValues({
    id: qId,
    category: 'BODMAS',
    difficulty,
    expressions: [
      { id: 'A', expression: `12 + 6 × ${5 + index} - 10`, value: 12 + 6 * (5 + index) - 10, category: 'BODMAS' },
      { id: 'B', expression: `(${15 + index} - 5) × 4 + 3`, value: (15 + index - 5) * 4 + 3, category: 'BODMAS' },
      { id: 'C', expression: `70 - ${30 + index * 2} ÷ 2`, value: 70 - (30 + index * 2) / 2, category: 'BODMAS' }
    ],
    trick: 'Always evaluate brackets and multiplication/division before addition/subtraction.'
  });
}

// Get a strictly tailored pool of questions matching category & difficulty
export function getQuestionsPool(
  category: MathCategory | 'All Categories',
  difficulty: DifficultyLevel,
  count: number = 10
): Question[] {
  const result: Question[] = [];
  const allCategories: MathCategory[] = [
    'Basic Arithmetic',
    'Percentages',
    'Fractions',
    'Decimals',
    'Exponents/Powers',
    'BODMAS'
  ];

  for (let i = 0; i < count; i++) {
    const cat = category === 'All Categories' 
      ? allCategories[i % allCategories.length]
      : category;
    result.push(generateCategoryQuestion(cat, difficulty, i));
  }

  return result;
}

export const fallbackQuestions: Question[] = getQuestionsPool('All Categories', 'Intermediate', 10);

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
      expression: `${adjusted[2].expression} + 5`,
      value: adjusted[2].value + 5
    };
  }
  return {
    ...question,
    expressions: adjusted
  };
}

