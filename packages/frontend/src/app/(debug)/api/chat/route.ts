import { anthropic } from "@ai-sdk/anthropic";
import type { TextUIPart, UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";
import { Helius } from "helius-sdk";
import { env } from "@/env";
import { isValidSignature } from "@/lib/solana/utils";
import { parseTransaction } from "@/lib/xray";

export const maxDuration = 60;

// Constants
const WHITESPACE_REGEX = /\s+/;

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

You'll receive enriched transaction data with categorized actions, balance changes, and error details. Extract and calculate:

1. **Error location:** Which instruction failed, which program
2. **Token amounts:** Compare sent vs received, look for transfer amounts and balance changes
3. **Deviations:** Calculate shortfalls or slippage percentages
4. **Root cause:** Map error code → likely meaning based on transaction context

## Common Error Patterns

**Custom error 0x0 in swap routers:**
- Likely slippage protection triggered
- Compare token transfer amounts to find expected vs actual
- Recommend specific slippage % (0.5-1% for volatile, 0.1-0.3% for stable)

**InsufficientFunds errors:**
- Calculate exact shortfall from balance changes
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

/**
 * Detects if a message contains a Solana transaction signature
 */
function detectTransactionSignature(message: string): string | null {
  const words = message.split(WHITESPACE_REGEX);
  for (const word of words) {
    if (isValidSignature(word)) {
      return word.trim();
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Check the last user message for a transaction signature
    const lastMessage = messages.at(-1) as UIMessage | undefined;
    // Extract text from message parts (AI SDK v5 pattern)
    const textPart = lastMessage?.parts?.find(
      (p): p is TextUIPart => p.type === "text"
    );
    const userMessage = textPart?.text || "";

    // Build system messages array (following x3000 backend pattern)
    const systemMessages: Array<{ role: "system"; content: string }> = [];

    // Part 1: Static system prompt (always present, cacheable)
    systemMessages.push({
      role: "system",
      content: SYSTEM_PROMPT,
    });

    // Part 2: Transaction data (only when signature detected, dynamic)
    const signature = detectTransactionSignature(userMessage);
    if (signature) {
      console.log(`[Transaction Debug] Detected signature: ${signature}`);

      try {
        // Fetch enriched transaction using Helius SDK
        const helius = new Helius(env.HELIUS_API_KEY);
        const [enrichedTx] = await helius.parseTransactions({
          transactions: [signature],
        });

        if (enrichedTx) {
          console.log(
            "[Transaction Debug] Fetched enriched transaction:",
            enrichedTx.type || "UNKNOWN"
          );

          // Parse transaction with xray to get structured ProtonTransaction
          const parsedTx = parseTransaction(enrichedTx, undefined);

          console.log(
            "[Transaction Debug] Parsed transaction:",
            parsedTx.type,
            "with",
            parsedTx.actions.length,
            "actions"
          );

          // Create comprehensive transaction summary for Claude
          const txSummary = {
            signature: parsedTx.signature,
            type: parsedTx.type,
            timestamp: parsedTx.timestamp,
            fee: parsedTx.fee,
            source: parsedTx.source,
            primaryUser: parsedTx.primaryUser,

            // Structured actions (what happened)
            actions: parsedTx.actions,

            // Account-level changes (who was affected)
            accounts: parsedTx.accounts,

            // Raw enriched data for reference
            error: enrichedTx.transactionError || null,
            tokenTransfers: enrichedTx.tokenTransfers || [],
            nativeTransfers: enrichedTx.nativeTransfers || [],
            accountData: enrichedTx.accountData || [],
            events: enrichedTx.events,
            instructions: enrichedTx.instructions,
          };

          // Add structured transaction data for Claude
          systemMessages.push({
            role: "system",
            content: `=== PARSED TRANSACTION DATA ===

${JSON.stringify(txSummary, null, 2)}

=== END TRANSACTION DATA ===`,
          });

          console.log(
            "[Transaction Debug] Added parsed transaction to system messages"
          );
        } else {
          console.log("[Transaction Debug] Transaction not found");
        }
      } catch (error) {
        console.error("[Transaction Debug] Error fetching transaction:", error);
        // Continue without transaction data if fetch fails
      }
    }

    // Convert UI messages to model messages
    const convertedMessages = convertToModelMessages(messages);

    const result = streamText({
      model: anthropic("claude-haiku-4-5"),
      messages: [...systemMessages, ...convertedMessages],
      // providerOptions: {
      //   anthropic: {
      //     thinking: { type: "enabled", budgetTokens: 10_000 },
      //   } satisfies AnthropicProviderOptions,
      // },
      // headers: {
      //   "anthropic-beta": "extended-cache-ttl-2025-04-11",
      // },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
