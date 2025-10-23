/**
 * Simple script to test prompt changes
 * Run with: pnpm test:prompt
 */
/** biome-ignore-all lint/performance/useTopLevelRegex: don't need that here */
/** biome-ignore-all lint/performance/noNamespaceImport: don't need that here */

import * as fs from "node:fs";
import * as path from "node:path";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

// Load environment variables from .env
const envPath = path.join(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match?.[1] && match[2]) {
      const [, key, value] = match;
      process.env[key.trim()] = value.trim();
    }
  }
}

// Load sample transaction data
const sampleTx = JSON.parse(
  fs.readFileSync(path.join(__dirname, "sample-transaction.json"), "utf-8")
);

// =============================================================================
// EDIT THIS PROMPT TO TEST DIFFERENT VARIATIONS
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
- Show full program addresses (show first 8 chars: "6YX5T8Bj...")

## Example Output

### 1. What went wrong?
Slippage protection triggered - actual output (11.899925 USDC) was 0.002443 USDC less than minimum expected (11.902368 USDC).

### 2. Why it failed?
- The swap executed successfully through CP-Swap but the router's final validation rejected it
- You tried to sell 331.189463 tokens expecting at least 11.902368 USDC but only got 11.899925 USDC
- This 0.02% deviation exceeded your slippage tolerance, causing custom error 0x0 in program 6YX5T8Bj...

### 3. How to fix it?
**Recommended fix:** Increase slippage tolerance to 0.5% for this volatile pair.

**Alternative options:**
1. Split trade into smaller amounts to reduce price impact
2. Wait 30-60 seconds for better liquidity and retry`;

// =============================================================================
// EDIT THESE SETTINGS TO TEST DIFFERENT CONFIGURATIONS
// =============================================================================
const CONFIG = {
  model: "claude-haiku-4-5", // or "claude-sonnet-4-5"
  thinking: false, // Enable extended thinking?
  thinkingBudget: 10_000, // Thinking token budget
  lineLength: 80,
};

// =============================================================================
// Main execution
// =============================================================================
async function testPrompt() {
  console.log("=".repeat(CONFIG.lineLength));
  console.log("TESTING PROMPT WITH CONFIGURATION:");
  console.log("=".repeat(CONFIG.lineLength));
  console.log(`Model: ${CONFIG.model}`);
  console.log(`Extended Thinking: ${CONFIG.thinking ? "Enabled" : "Disabled"}`);
  if (CONFIG.thinking) {
    console.log(`Thinking Budget: ${CONFIG.thinkingBudget} tokens`);
  }
  console.log("=".repeat(CONFIG.lineLength));
  console.log();

  // Build transaction summary (same structure as route.ts would have)
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

  console.log("📤 Sending request to Anthropic...\n");

  const startTime = Date.now();

  try {
    const result = await generateText({
      model: anthropic(CONFIG.model),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: transactionData },
        { role: "user", content: "Debug this transaction" },
      ],
      ...(CONFIG.thinking
        ? {
            providerOptions: {
              anthropic: {
                thinking: {
                  type: "enabled",
                  budgetTokens: CONFIG.thinkingBudget,
                },
              },
            },
          }
        : {}),
    });

    const elapsed = Date.now() - startTime;

    console.log("=".repeat(CONFIG.lineLength));
    console.log("RESPONSE:");
    console.log("=".repeat(CONFIG.lineLength));
    console.log(result.text);
    console.log("=".repeat(CONFIG.lineLength));
    console.log();
    console.log("STATS:");
    console.log("=".repeat(CONFIG.lineLength));
    console.log(`⏱️  Time: ${elapsed}ms`);
    console.log(`📊 Input tokens: ${result.usage.inputTokens}`);
    console.log(`📊 Output tokens: ${result.usage.outputTokens}`);
    console.log(`📊 Total tokens: ${result.usage.totalTokens}`);
    console.log(
      `💰 Estimated cost: $${(result.usage.totalTokens ?? 0 * 0.000_001).toFixed(6)}`
    );
    console.log("=".repeat(CONFIG.lineLength));

    // Simple output validation
    console.log();
    console.log("VALIDATION:");
    console.log("=".repeat(CONFIG.lineLength));
    const text = result.text;
    const hasSection1 = text.includes("1. What went wrong");
    const hasSection2 = text.includes("2. Why it failed");
    const hasSection3 = text.includes("3. How to fix");
    const hasCodeBlock =
      text.includes("```") ||
      text.includes("javascript") ||
      text.includes("typescript");
    const wordCount = text.split(/\s+/).length;

    console.log(
      `✅ Has "What went wrong" section: ${hasSection1 ? "YES" : "NO"}`
    );
    console.log(
      `✅ Has "Why it failed" section: ${hasSection2 ? "YES" : "NO"}`
    );
    console.log(`✅ Has "How to fix" section: ${hasSection3 ? "YES" : "NO"}`);
    console.log(
      `❌ Contains code blocks: ${hasCodeBlock ? "YES (BAD)" : "NO (GOOD)"}`
    );
    console.log(`📝 Total word count: ${wordCount}`);
    console.log("=".repeat(CONFIG.lineLength));
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testPrompt();
