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
    return {
      id,
      category: selectedCategory,
      difficulty: selectedDiff,
      expressions: [
        { id: 'A', expression: '2^6 - 18', value: 46, category: selectedCategory },
        { id: 'B', expression: '3^4 - 32', value: 49, category: selectedCategory },
        { id: 'C', expression: '7^2 - 5', value: 44, category: selectedCategory }
      ],
      trick: `Remember powers of 2 (2^6=64) and 3 (3^4=81). 64 - 18 = 46, 81 - 32 = 49, 49 - 5 = 44.`
    };
  } else if (selectedCategory === 'Decimals') {
    return {
      id,
      category: selectedCategory,
      difficulty: selectedDiff,
      expressions: [
        { id: 'A', expression: '3.5 × 16', value: 56, category: selectedCategory },
        { id: 'B', expression: '0.75 × 72', value: 54, category: selectedCategory },
        { id: 'C', expression: '4.2 × 14 - 1', value: 57.8, category: selectedCategory }
      ],
      trick: `Use doubling and halving: 3.5 × 16 = 7 × 8 = 56. 0.75 is 3/4 (72 ÷ 4 × 3 = 54).`
    };
  } else if (selectedCategory === 'BODMAS') {
    return {
      id,
      category: selectedCategory,
      difficulty: selectedDiff,
      expressions: [
        { id: 'A', expression: '18 + 7 × 6 - 22', value: 38, category: selectedCategory },
        { id: 'B', expression: '(15 - 7) × 5 + 2', value: 42, category: selectedCategory },
        { id: 'C', expression: '80 - 64 ÷ 8 - 36', value: 36, category: selectedCategory }
      ],
      trick: `Always solve brackets and multiplication/division first: 7 × 6 = 42; 8 × 5 = 40; 64 ÷ 8 = 8.`
    };
  } else {
    // Basic Arithmetic
    return {
      id,
      category: selectedCategory,
      difficulty: selectedDiff,
      expressions: [
        { id: 'A', expression: '16 × 4 + 11', value: 75, category: selectedCategory },
        { id: 'B', expression: '13 × 6 - 9', value: 69, category: selectedCategory },
        { id: 'C', expression: '95 - 28 ÷ 2', value: 81, category: selectedCategory }
      ],
      trick: `Split numbers: 16 × 4 = 64 (+ 11 = 75). 13 × 6 = 78 (- 9 = 69). 95 - 14 = 81.`
    };
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
    const prompt = `Generate ${numQuestions} question(s) for a corporate assessment fast mental math speed test (like McKinsey PST, Bain, BCG, or trading assessment).
Each question MUST contain:
1. Exactly 3 distinct math expressions ('A', 'B', 'C') from the selected category (${category || 'one of: Basic Arithmetic, Exponents/Powers, Fractions, Decimals, Percentages, BODMAS'}).
2. Difficulty: ${difficulty || 'spanning Basic to Advanced'}.
3. The expressions must have CLOSE but STRICTLY DISTINCT numerical values (no two expressions can evaluate to the exact same number!).
4. Include exact numerical values as floats/integers.
5. Provide a crisp 1-2 sentence "Trick/Solution" explaining the fastest mental math trick (e.g., doubling/halving, benchmark percentages, factorization, or order of operations).

Return in strict JSON format.`;

    // 12-second timeout to allow Gemini full generation window
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Gemini generation timed out")), 12000)
    );

    const generatePromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
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
      const sanitizedQuestions = parsed.questions.map((q: any, index: number) => {
        // Ensure expressions have distinct values
        const exps = (q.expressions || []).slice(0, 3).map((e: any, idx: number) => ({
          id: ['A', 'B', 'C'][idx] || `exp-${idx}`,
          expression: String(e.expression || '').trim(),
          value: Number(e.value),
          category: q.category || category || 'Basic Arithmetic'
        }));

        // Adjust if any collision
        if (exps.length === 3) {
          if (exps[0].value === exps[1].value) {
            exps[1].value += 1.5;
            exps[1].expression += ' + 1.5';
          }
          if (exps[2].value === exps[0].value || exps[2].value === exps[1].value) {
            exps[2].value += 3.5;
            exps[2].expression += ' + 3.5';
          }
        }

        return {
          id: `gemini-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          category: q.category || category || 'Basic Arithmetic',
          difficulty: q.difficulty || difficulty || 'Intermediate',
          expressions: exps,
          trick: q.trick || 'Compute expressions mentally and compare key benchmarks.'
        };
      });

      return res.json({ questions: sanitizedQuestions, source: 'gemini' });
    }

    throw new Error("Invalid structure returned from Gemini");
  } catch (err: any) {
    console.error("Gemini generation error:", err);
    // Graceful fallback to guarantee smooth gameplay without blocking
    const fallbackResults = Array.from({ length: numQuestions }, () => 
      generateFallbackQuestion(category, difficulty)
    );
    return res.json({ 
      questions: fallbackResults, 
      source: 'fallback_error',
      error: err?.message || 'Error occurred' 
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

startServer();
