/**
 * Prompt evaluation tests following Vercel's eval-driven development pattern
 * Run with: pnpm test:eval
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { config } from "dotenv";

// Load .env.local (Next.js convention)
config({ path: ".env.local" });

import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { describe, expect, it } from "vitest";
import {
  averageQualityScore,
  scoreQualityWithLLM,
  scoreSpecificity,
  scoreStructure,
} from "./scorers";

// =============================================================================
// SYSTEM PROMPT (edit in test-prompt.ts if you want to iterate manually)
// =============================================================================
const SYSTEM_PROMPT = `You are a Solana transaction debugger. Analyze failed transactions and provide clear, actionable explanations with specific numbers.

## Output Format

### 1. What went wrong?
[One sentence with the core issue and key numbers]

### 2. Why it failed?
[2-3 bullet points explaining:]
- The error type and what triggered it
- Specific amounts involved (input vs output, expected vs actual)
- Which program/instruction failed

Keep this section under 100 words.

### 3. How to fix it?
**Recommended fix:** [One specific action with exact parameters]

**Alternative options:**
1. [Second approach]
2. [Third approach if applicable]

Keep this section under 150 words.

## Analysis Instructions

Extract and calculate:
1. **Error location:** Which instruction index failed, which program
2. **Token amounts:** Compare pre/post balances, find transfers in innerInstructions
3. **Deviations:** Calculate shortfalls or slippage percentages
4. **Root cause:** Map error code → likely meaning based on context

## Common Error Patterns

**Custom error 0x0 in swap routers:**
- Likely slippage protection
- Compare token transfer amounts to find expected vs actual
- Recommend specific slippage % (0.5-1% for volatile, 0.1-0.3% for stable)

**InsufficientFunds errors:**
- Calculate exact shortfall from pre/post balances
- Show: "Need X more SOL (have Y, need Z)"

**AccountNotFound errors:**
- Identify missing account from logs
- Recommend: "Initialize account (costs 0.00203928 SOL for token accounts)"

## Output Rules

✅ DO:
- Show exact amounts: "11.899925 USDC" not "~12 USDC"
- Calculate differences: "Shortfall: 0.002443 USDC (0.02%)"
- Give specific parameters: "Set slippage to 0.5-1%" not "increase slippage"
- Use clear structure with headers

❌ DON'T:
- Include code examples or syntax
- Exceed word limits (100 for "Why", 150 for "How to fix")
- Use vague language ("might be", "could be", "possibly")
- List more than 3 alternative solutions
- Include instruction data or raw bytes
- Show full program addresses (show first 8 chars: "6YX5T8Bj...")`;

// =============================================================================
// DATASET - Test cases
// =============================================================================

// Load sample transaction
const sampleTx = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sample-transaction.json"), "utf-8")
);

// Build transaction summary (same structure as route.ts)
const txSummary = {
  signature:
    "21TQdryJZpurVh2gFKpUMi6n1ypvvUUzaiUwynPBEbdMULwU5j5d7HiQwvReovoPZdW18bkKbnyKKWY4jUmj9WbT",
  error: {
    type: JSON.stringify(sampleTx.meta.err),
    object: sampleTx.meta.err,
  },
  innerInstructions: sampleTx.meta.innerInstructions,
  logs: sampleTx.meta.logMessages,
  balanceChange: {
    pre: sampleTx.meta.preBalances[0],
    post: sampleTx.meta.postBalances[0],
    fee: sampleTx.meta.fee,
  },
  tokens: {
    pre: sampleTx.meta.preTokenBalances,
    post: sampleTx.meta.postTokenBalances,
  },
};

const transactionData = `=== TRANSACTION DATA ===

${JSON.stringify(txSummary, null, 2)}

=== END TRANSACTION DATA ===`;

// =============================================================================
// RUNNER - Execute LLM calls
// =============================================================================

async function runDebugger(prompt: string): Promise<string> {
  const result = await generateText({
    model: anthropic("claude-haiku-4-5"),
    messages: [
      { role: "system", content: prompt },
      { role: "system", content: transactionData },
      { role: "user", content: "Debug this transaction" },
    ],
  });

  return result.text;
}

// =============================================================================
// TESTS - Scorers + Assertions
// =============================================================================

describe("Transaction debugger prompt evals", () => {
  it("outputs required sections and no code blocks", async () => {
    const response = await runDebugger(SYSTEM_PROMPT);

    const score = scoreStructure(response);

    expect(score.hasSection1, "Should have 'What went wrong' section").toBe(
      true
    );
    expect(score.hasSection2, "Should have 'Why it failed' section").toBe(true);
    expect(score.hasSection3, "Should have 'How to fix' section").toBe(true);
    expect(score.noCodeBlocks, "Should not include code blocks").toBe(true);
  }, 30_000); // 30s timeout for LLM calls

  it("uses specific numbers and avoids vague language", async () => {
    const response = await runDebugger(SYSTEM_PROMPT);

    const score = scoreSpecificity(response);

    expect(
      score.hasNumbers,
      "Should include specific numbers (amounts, percentages)"
    ).toBe(true);
    expect(
      score.noVagueLanguage,
      'Should avoid vague language like "might be", "could be"'
    ).toBe(true);
  }, 30_000);

  it.skip("produces high-quality output (LLM-as-judge)", async () => {
    const response = await runDebugger(SYSTEM_PROMPT);

    const qualityScore = await scoreQualityWithLLM(
      response,
      "Slippage protection triggered in swap transaction"
    );

    const avgScore = averageQualityScore(qualityScore);

    // Log the detailed scores for inspection
    console.log("\n📊 Quality Scores:");
    console.log(`  Clarity: ${qualityScore.clarity.toFixed(2)}`);
    console.log(`  Actionability: ${qualityScore.actionability.toFixed(2)}`);
    console.log(`  Accuracy: ${qualityScore.accuracy.toFixed(2)}`);
    console.log(`  Conciseness: ${qualityScore.conciseness.toFixed(2)}`);
    console.log(`  Average: ${avgScore.toFixed(2)}`);
    console.log(`  Reasoning: ${qualityScore.reasoning}\n`);

    // Expect average quality above 0.7 (70%)
    expect(avgScore, "Average quality score should be > 0.7").toBeGreaterThan(
      0.7
    );
  }, 60_000); // 60s timeout (2 LLM calls)
});
