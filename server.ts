import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const CATEGORIES = [
  'Basic Arithmetic',
  'Exponents/Powers',
  'Fractions',
  'Decimals',
  'Percentages',
  'BODMAS'
] as const;

const DIFFICULTIES = ['Basic', 'Intermediate', 'Advanced'] as const;

// Fallback generator for instant offline/keyless resiliency
function generateFallbackQuestion(category?: string, difficulty?: string) {
  const selectedCategory = (category && CATEGORIES.includes(category as any))
    ? category
    : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    
  const selectedDiff = (difficulty && DIFFICULTIES.includes(difficulty as any))
    ? difficulty
    : DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];

  const id = `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (selectedCategory === 'Percentages') {
    const baseVal = 20 + Math.floor(Math.random() * 40);
    const v1 = baseVal;
    const v2 = baseVal + 3 + Math.floor(Math.random() * 5);
    const v3 = baseVal - 4 - Math.floor(Math.random() * 4);
    return {
      id,
      category: selectedCategory,
      difficulty: selectedDiff,
      expressions: [
        { id: 'A', expression: `15% of ${Math.round((v1 / 0.15))}`, value: v1, category: selectedCategory },
        { id: 'B', expression: `20% of ${v2 * 5}`, value: v2, category: selectedCategory },
        { id: 'C', expression: `25% of ${v3 * 4}`, value: v3, category: selectedCategory }
      ],
      trick: `Benchmark 10% or standard fractions: 20% is ÷5, 25% is ÷4, and 15% is 10% + half of 10%.`
    };
  } else if (selectedCategory === 'Fractions') {
    const denom = 8;
    const n1 = 3 + Math.floor(Math.random() * 4);
    const n2 = n1 + 1;
    const mult = 48;
    const v1 = (n1 * mult) / denom;
    const v2 = (n2 * mult) / denom;
    const v3 = v1 + 2;
    return {
      id,
      category: selectedCategory,
      difficulty: selectedDiff,
      expressions: [
        { id: 'A', expression: `${n1}/${denom} × ${mult}`, value: v1, category: selectedCategory },
        { id: 'B', expression: `${n2}/${denom} × ${mult}`, value: v2, category: selectedCategory },
        { id: 'C', expression: `2/3 × ${Math.round((v3 * 1.5))}`, value: v3, category: selectedCategory }
      ],
      trick: `Divide the whole number by the denominator first, then multiply by the numerator.`
    };
  } else if (selectedCategory === 'Exponents/Powers') {
    const offset = Math.floor(Math.random() * 6);
    return {
      id,
      category: selectedCategory,
      difficulty: selectedDiff,
      expressions: [
        { id: 'A', expression: `2^6 - ${15 + offset}`, value: 64 - (15 + offset), category: selectedCategory },
        { id: 'B', expression: `3^4 - ${30 + offset}`, value: 81 - (30 + offset), category: selectedCategory },
        { id: 'C', expression: `7^2 + ${3 - offset}`, value: 49 + (3 - offset), category: selectedCategory }
      ],
      trick: `Remember benchmark powers: 2^6 = 64, 3^4 = 81, 7^2 = 49.`
    };
  } else if (selectedCategory === 'Decimals') {
    const mult = 12 + Math.floor(Math.random() * 6);
    return {
      id,
      category: selectedCategory,
      difficulty: selectedDiff,
      expressions: [
        { id: 'A', expression: `3.5 × ${mult}`, value: 3.5 * mult, category: selectedCategory },
        { id: 'B', expression: `0.5 × ${(3.5 * mult * 2) - 4}`, value: (3.5 * mult) - 2, category: selectedCategory },
        { id: 'C', expression: `1.5 × ${Math.round(((3.5 * mult) + 4) / 1.5)}`, value: Math.round(((3.5 * mult) + 4) / 1.5) * 1.5, category: selectedCategory }
      ],
      trick: `Use doubling and halving: 3.5 × 16 = 7 × 8 = 56. 0.5 is half.`
    };
  } else if (selectedCategory === 'BODMAS') {
    const k = 4 + Math.floor(Math.random() * 5);
    return {
      id,
      category: selectedCategory,
      difficulty: selectedDiff,
      expressions: [
        { id: 'A', expression: `18 + 7 × ${k} - 12`, value: 18 + 7 * k - 12, category: selectedCategory },
        { id: 'B', expression: `(15 - 6) × ${k} + 4`, value: 9 * k + 4, category: selectedCategory },
        { id: 'C', expression: `80 - 48 ÷ 6 - ${10 + k}`, value: 80 - 8 - (10 + k), category: selectedCategory }
      ],
      trick: `Always solve brackets and multiplication/division first.`
    };
  } else {
    // Basic Arithmetic - STRICTLY integer addition, subtraction, multiplication, and clean division
    if (selectedDiff === 'Basic') {
      const basicPairs = [
        { a: '18 + 27', vA: 45, b: '12 × 4', vB: 48, c: '75 - 33', vC: 42, trick: 'Single-step mental math: 75 - 33 = 42 < 18 + 27 = 45 < 12 × 4 = 48.' },
        { a: '19 + 18', vA: 37, b: '9 × 4', vB: 36, c: '50 - 16', vC: 34, trick: 'Quick addition & multiplication: 50 - 16 = 34 < 9 × 4 = 36 < 19 + 18 = 37.' },
        { a: '28 + 24', vA: 52, b: '6 × 9', vB: 54, c: '80 - 25', vC: 55, trick: 'Round and adjust: 28 + 24 = 52 < 6 × 9 = 54 < 80 - 25 = 55.' },
        { a: '7 × 9', vA: 63, b: '38 + 27', vB: 65, c: '90 - 29', vC: 61, trick: 'Mental comparison: 90 - 29 = 61 < 7 × 9 = 63 < 38 + 27 = 65.' },
        { a: '8 × 9', vA: 72, b: '45 + 29', vB: 74, c: '95 - 26', vC: 69, trick: 'Multiplication table and tens addition: 95 - 26 = 69 < 8 × 9 = 72 < 45 + 29 = 74.' },
        { a: '16 × 3', vA: 48, b: '25 + 26', vB: 51, c: '65 - 19', vC: 46, trick: 'Multiples of 16: 65 - 19 = 46 < 16 × 3 = 48 < 25 + 26 = 51.' }
      ];
      const pick = basicPairs[Math.floor(Math.random() * basicPairs.length)];
      return {
        id,
        category: 'Basic Arithmetic',
        difficulty: 'Basic',
        expressions: [
          { id: 'A', expression: pick.a, value: pick.vA, category: 'Basic Arithmetic' },
          { id: 'B', expression: pick.b, value: pick.vB, category: 'Basic Arithmetic' },
          { id: 'C', expression: pick.c, value: pick.vC, category: 'Basic Arithmetic' }
        ],
        trick: pick.trick
      };
    } else if (selectedDiff === 'Intermediate') {
      const interPairs = [
        { a: '16 × 4 + 11', vA: 75, b: '13 × 6 - 9', vB: 69, c: '95 - 28 ÷ 2', vC: 81, trick: 'Split numbers: 16 × 4 = 64 (+ 11 = 75). 13 × 6 = 78 (- 9 = 69). 95 - 14 = 81.' },
        { a: '14 × 5 + 8', vA: 78, b: '17 × 4 + 6', vB: 74, c: '110 - 32', vC: 78, trick: '14 × 5 = 70 (+8 = 78); 17 × 4 = 68 (+6 = 74); 110 - 32 = 78.' }
      ];
      const pick = interPairs[Math.floor(Math.random() * interPairs.length)];
      return {
        id,
        category: 'Basic Arithmetic',
        difficulty: 'Intermediate',
        expressions: [
          { id: 'A', expression: pick.a, value: pick.vA, category: 'Basic Arithmetic' },
          { id: 'B', expression: pick.b, value: pick.vB, category: 'Basic Arithmetic' },
          { id: 'C', expression: pick.c, value: pick.vC, category: 'Basic Arithmetic' }
        ],
        trick: pick.trick
      };
    } else {
      // Advanced Basic Arithmetic
      const advPairs = [
        { a: '17 × 4 + 19', vA: 87, b: '14 × 6 + 7', vB: 91, c: '19 × 5 - 12', vC: 83, trick: 'Decompose: 17 × 4 = 68 (+ 19 = 87); 14 × 6 = 84 (+ 7 = 91); 19 × 5 = 95 (- 12 = 83).' },
        { a: '18 × 5 + 14', vA: 104, b: '22 × 4 + 9', vB: 97, c: '16 × 6 + 5', vC: 101, trick: '18 × 5 = 90 (+14 = 104); 22 × 4 = 88 (+9 = 97); 16 × 6 = 96 (+5 = 101).' }
      ];
      const pick = advPairs[Math.floor(Math.random() * advPairs.length)];
      return {
        id,
        category: 'Basic Arithmetic',
        difficulty: 'Advanced',
        expressions: [
          { id: 'A', expression: pick.a, value: pick.vA, category: 'Basic Arithmetic' },
          { id: 'B', expression: pick.b, value: pick.vB, category: 'Basic Arithmetic' },
          { id: 'C', expression: pick.c, value: pick.vC, category: 'Basic Arithmetic' }
        ],
        trick: pick.trick
      };
    }
  }
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Generate dynamic question(s) via Gemini API
app.post("/api/questions/generate", async (req, res) => {
  const { category, difficulty, count = 1 } = req.body;
  const numQuestions = Math.min(Math.max(1, Number(count) || 1), 10);

  const ai = getGeminiClient();

  if (!ai) {
    // Fallback if API key is not yet set
    const fallbackResults = Array.from({ length: numQuestions }, () => 
      generateFallbackQuestion(category, difficulty)
    );
    return res.json({ 
      questions: fallbackResults, 
      source: 'fallback_offline' 
    });
  }

  try {
    const isCategorySelected = category && category !== 'All Categories';
    const categoryMandate = isCategorySelected
      ? `CRITICAL CATEGORY CONSTRAINT: The user has selected "${category}".
EVERY question and EVERY expression ('A', 'B', 'C') MUST strictly be from "${category}" ONLY!
- If "${category}" is "Basic Arithmetic": ONLY use integers and basic operations (+, -, ×, ÷). Strictly DO NOT include percentages (%), fractions (/), exponents (^), or decimals (.).
- If "${category}" is "Percentages": Every expression MUST be a percentage calculation.
- If "${category}" is "Fractions": Every expression MUST involve fraction arithmetic.
- If "${category}" is "Decimals": Every expression MUST involve decimals.
- If "${category}" is "Exponents/Powers": Every expression MUST involve exponents.
- If "${category}" is "BODMAS": Every expression MUST test order of operations with brackets.`
      : `Category can be chosen from: Basic Arithmetic, Exponents/Powers, Fractions, Decimals, Percentages, BODMAS.`;

    const difficultyMandate = `Difficulty Level: "${difficulty || 'Intermediate'}".
- If "Basic": Clean, accessible mental math calculations (small to medium integers, single-step operations or intuitive combinations like 18 + 27, 12 × 4, 75 - 33).
- If "Intermediate": 2-step calculations (e.g. 14 × 5 + 8, 16 × 4 - 9).
- If "Advanced": Multi-step or larger calculations requiring smart shortcuts.`;

    const prompt = `Generate ${numQuestions} question(s) for a corporate assessment fast mental math speed test (like McKinsey PST, Bain, BCG, or trading assessment).
Each question MUST contain:
1. Exactly 3 distinct math expressions ('A', 'B', 'C').
2. ${categoryMandate}
3. ${difficultyMandate}
4. The expressions must have CLOSE but STRICTLY DISTINCT numerical values (no two expressions can evaluate to the exact same number!).
5. Include exact numerical values as floats/integers.
6. Provide a crisp 1-2 sentence "trick" explaining the fastest mental math calculation shortcut.

Return in strict JSON format.`;

    // Multi-model cascade: if primary model experiences temporary 503 high demand spikes, automatically try fallback models
    const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let lastError: any = null;
    let successfulData: any = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Gemini generation timed out")), 10000)
        );

        const generatePromise = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      expressions: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING, description: "'A', 'B', or 'C'" },
                            expression: { type: Type.STRING, description: "e.g. 15% of 240, 2^7 - 35, etc." },
                            value: { type: Type.NUMBER, description: "Exact numeric result" }
                          },
                          required: ["id", "expression", "value"]
                        }
                      },
                      trick: { type: Type.STRING, description: "Fast 1-2 sentence mental calculation trick" }
                    },
                    required: ["category", "difficulty", "expressions", "trick"]
                  }
                }
              },
              required: ["questions"]
            }
          }
        });

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        const parsed = JSON.parse(response.text || "{}");
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          successfulData = { questions: parsed.questions, model: modelName };
          break; // Success!
        }
      } catch (err: any) {
        lastError = err;
        const isHighDemand = err?.message?.includes("503") || err?.message?.includes("high demand") || err?.status === 503;
        if (isHighDemand) {
          console.warn(`[Model ${modelName}] 503 high demand spike. Attempting next fallback model...`);
        } else {
          console.warn(`[Model ${modelName}] generation failed:`, err?.message || err);
        }
      }
    }

    if (successfulData) {
      const sanitizedQuestions = successfulData.questions.map((q: any, index: number) => {
        const effectiveCategory = isCategorySelected ? category : (q.category || 'Basic Arithmetic');
        const effectiveDifficulty = difficulty || q.difficulty || 'Intermediate';

        // Check if any expression violates category rules
        const hasViolations = (q.expressions || []).some((e: any) => {
          const str = String(e.expression || '');
          if (effectiveCategory === 'Basic Arithmetic') {
            return str.includes('%') || str.includes('^') || (str.includes('/') && !str.includes('÷'));
          }
          if (effectiveCategory === 'Percentages') {
            return !str.includes('%');
          }
          if (effectiveCategory === 'Fractions') {
            return !str.includes('/') && !str.includes('÷');
          }
          if (effectiveCategory === 'Exponents/Powers') {
            return !str.includes('^');
          }
          return false;
        });

        if (hasViolations) {
          return generateFallbackQuestion(effectiveCategory, effectiveDifficulty);
        }

        // Ensure expressions have distinct values
        const exps = (q.expressions || []).slice(0, 3).map((e: any, idx: number) => ({
          id: ['A', 'B', 'C'][idx] || `exp-${idx}`,
          expression: String(e.expression || '').trim(),
          value: Number(e.value),
          category: effectiveCategory
        }));

        // Adjust if any collision
        if (exps.length === 3) {
          if (exps[0].value === exps[1].value) {
            exps[1].value += 2;
            exps[1].expression += ' + 2';
          }
          if (exps[2].value === exps[0].value || exps[2].value === exps[1].value) {
            exps[2].value += 4;
            exps[2].expression += ' + 4';
          }
        }

        return {
          id: `gemini-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          category: effectiveCategory,
          difficulty: effectiveDifficulty,
          expressions: exps,
          trick: q.trick || 'Compute expressions mentally and compare key benchmarks.'
        };
      });

      return res.json({ questions: sanitizedQuestions, source: 'gemini', model: successfulData.model });
    }

    throw lastError || new Error("All Gemini models temporarily unavailable");
  } catch (err: any) {
    const isHighDemand = err?.message?.includes("503") || err?.message?.includes("high demand") || err?.status === 503;
    if (isHighDemand) {
      console.warn("Gemini service is currently at peak capacity. Seamlessly serving algorithmic question set.");
    } else {
      console.warn("Serving resilient fallback question set:", err?.message || err);
    }

    // Graceful fallback to guarantee smooth uninterrupted gameplay
    const fallbackResults = Array.from({ length: numQuestions }, () => 
      generateFallbackQuestion(category, difficulty)
    );
    return res.json({ 
      questions: fallbackResults, 
      source: 'algorithmic_backup',
      notice: isHighDemand ? 'Temporary high demand on AI models; backup generator active' : undefined
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the standalone HTTP server if not running in Vercel serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
