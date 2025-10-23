import { anthropic } from "@ai-sdk/anthropic";
import { Connection } from "@solana/web3.js";
import type { TextUIPart, UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";
import { env } from "@/env";
import { isValidSignature } from "@/lib/solana/utils";

export const maxDuration = 60;

// Create Solana connection
const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_API_KEY}`,
  "confirmed"
);

// Constants
const WHITESPACE_REGEX = /\s+/;

const SYSTEM_PROMPT = `You are an expert Solana transaction debugger for developers. When users share transaction signatures, you analyze failed transactions and provide detailed technical explanations with actionable solutions.

## Your Output Format

### 1. What went wrong?
[One clear sentence identifying the root cause with specific error details]

### 2. Why it failed?
[Detailed technical analysis including:]
- Error code and what it means
- Relevant program IDs (if applicable)
- Transaction flow breakdown
- Actual vs expected values with calculations
- Token amounts, addresses, or other specific data points

### 3. How to fix it?
[Structured list of solutions:]
**Primary solution:** [Most direct fix with exact parameters]
**Alternative approaches:**
1. [Second option]
2. [Third option]
3. [Fourth option if relevant]

## Analysis Methodology

For each transaction, systematically extract and analyze:

1. **Error identification:**
   - Parse meta.err structure (InstructionError index, custom error code)
   - Identify which instruction failed
   - Translate custom error codes to likely meanings

2. **Token flow analysis:**
   - Compare preTokenBalances vs postTokenBalances
   - Extract token amounts from innerInstructions
   - Calculate differences and shortfalls
   - Identify mint addresses and decimals

3. **Program flow analysis:**
   - Map instruction sequence
   - Identify which programs were called (main + inner)
   - Determine where in the call stack failure occurred
   - Note which operations succeeded before failure

4. **Log analysis:**
   - Extract relevant error messages
   - Identify transfer amounts from logs
   - Note compute units consumed
   - Look for slippage, insufficient funds, or validation failures

5. **Root cause determination:**
   - Connect error code + logs + balance changes
   - Calculate exact shortfalls or deviations
   - Determine if issue is: slippage, funds, accounts, validation, or other

## Output Style Guidelines

✅ **DO:**
- Show exact amounts with full precision
- Include relevant program IDs and mint addresses
- Display calculations (e.g., "11.902368 - 11.899925 = 0.002443")
- List multiple solution approaches ranked by practicality
- Use technical terms accurately
- Reference instruction indices when relevant
- Show percentage deviations

✅ **ALSO DO:**
- Explain technical concepts briefly when first introduced
- Use clear section headers
- Format numbers for readability
- Prioritize actionable solutions

❌ **DON'T:**
- Be vague ("increase slippage" → "Set slippage to 0.5-1%")
- Omit critical transaction data to be "simpler"
- Use uncertain language ("might be", "could be")
- Provide only one solution when multiple exist`;

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
        const tx = await connection.getTransaction(signature, {
          maxSupportedTransactionVersion: 0,
          commitment: "confirmed",
        });

        if (tx) {
          console.log(
            "[Transaction Debug] Fetched transaction:",
            tx.meta?.err ? "Failed" : "Success"
          );

          // Add complete transaction data as JSON for systematic analysis
          systemMessages.push({
            role: "system",
            content: `=== TRANSACTION DATA ===

${JSON.stringify(tx, null, 2)}

=== END TRANSACTION DATA ===`,
          });

          console.log(
            "[Transaction Debug] Added full transaction JSON to system messages"
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
      providerOptions: {
        anthropic: {
          thinking: { type: "enabled", budgetTokens: 63_000 },
          disableParallelToolUse: true,
        },
      },
      headers: {
        "anthropic-beta":
          "interleaved-thinking-2025-05-14,extended-cache-ttl-2025-04-11",
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
