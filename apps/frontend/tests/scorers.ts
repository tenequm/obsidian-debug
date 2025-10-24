/**
 * Scoring utilities for prompt evaluation
 * Following Vercel's eval-driven development pattern
 */

import { config } from "dotenv";

// Load .env.local (Next.js convention)
config({ path: ".env.local" });

import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

// =============================================================================
// CODE-BASED SCORERS (Deterministic)
// =============================================================================

export type StructureScore = {
  hasSection1: boolean;
  hasSection2: boolean;
  hasSection3: boolean;
  noCodeBlocks: boolean;
  allSectionsPassed: boolean;
};

/**
 * Check if response has required sections and no code blocks
 */
export function scoreStructure(response: string): StructureScore {
  const hasSection1 = response.includes("1. What went wrong");
  const hasSection2 = response.includes("2. Why it failed");
  const hasSection3 = response.includes("3. How to fix");
  const noCodeBlocks = !(
    response.includes("```") ||
    response.includes("javascript") ||
    response.includes("typescript")
  );

  return {
    hasSection1,
    hasSection2,
    hasSection3,
    noCodeBlocks,
    allSectionsPassed:
      hasSection1 && hasSection2 && hasSection3 && noCodeBlocks,
  };
}

export type SpecificityScore = {
  hasNumbers: boolean;
  noVagueLanguage: boolean;
  passed: boolean;
};

/**
 * Check if response uses specific numbers and avoids vague language
 */
export function scoreSpecificity(response: string): SpecificityScore {
  // Check for numbers (percentages, decimals, integers)
  const hasNumbers = /\d+\.?\d*%?/.test(response);

  // Check for vague language patterns
  const vaguePatterns = [
    /might be/i,
    /could be/i,
    /possibly/i,
    /perhaps/i,
    /~\d+/i, // approximate numbers like ~12
  ];

  const noVagueLanguage = !vaguePatterns.some((pattern) =>
    pattern.test(response)
  );

  return {
    hasNumbers,
    noVagueLanguage,
    passed: hasNumbers && noVagueLanguage,
  };
}

// =============================================================================
// LLM-AS-JUDGE SCORER (Semantic)
// =============================================================================

const QualityScoreSchema = z.object({
  clarity: z
    .number()
    .min(0)
    .max(1)
    .describe("How clear and understandable the explanation is (0-1)"),
  actionability: z
    .number()
    .min(0)
    .max(1)
    .describe("How specific and actionable the fix recommendations are (0-1)"),
  accuracy: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "How accurate the technical analysis appears based on the error (0-1)"
    ),
  conciseness: z
    .number()
    .min(0)
    .max(1)
    .describe("How concise the response is without unnecessary details (0-1)"),
  reasoning: z
    .string()
    .describe("Brief explanation of the scores (1-2 sentences)"),
});

export type QualityScore = z.infer<typeof QualityScoreSchema>;

/**
 * Use Claude to grade the response quality
 * This is slower and costs tokens, but provides semantic evaluation
 */
export async function scoreQualityWithLLM(
  response: string,
  errorContext?: string
): Promise<QualityScore> {
  const prompt = `You are evaluating the quality of a Solana transaction error explanation.

${errorContext ? `ERROR CONTEXT:\n${errorContext}\n\n` : ""}RESPONSE TO EVALUATE:
${response}

Rate this response on:
- Clarity: Is it easy to understand?
- Actionability: Are the fixes specific and actionable?
- Accuracy: Does the technical analysis seem correct?
- Conciseness: Is it concise without unnecessary fluff?

Provide scores 0-1 (0=poor, 1=excellent) and brief reasoning.`;

  const result = await generateObject({
    model: anthropic("claude-haiku-4-5"),
    schema: QualityScoreSchema,
    prompt,
  });

  return result.object;
}

/**
 * Calculate average score from quality metrics
 */
export function averageQualityScore(score: QualityScore): number {
  return (
    (score.clarity + score.actionability + score.accuracy + score.conciseness) /
    4
  );
}
