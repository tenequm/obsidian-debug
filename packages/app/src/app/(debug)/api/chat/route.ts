import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText } from "ai";
import { isValidSignature, parseTransaction } from "@/lib/solana/parser";

export const maxDuration = 60;

// Constants
const MAX_LOGS_TO_INCLUDE = 50;
const WHITESPACE_REGEX = /\s+/;

/**
 * Formats transaction error data (pure data, no instructions)
 */
function formatTransactionData(
  signature: string,
  errorMessage: string | null,
  errorObject: unknown,
  logs: string[]
): string {
  const relevantLogs = logs.filter(
    (log) =>
      log.includes("failed") ||
      log.includes("Error") ||
      log.includes("exceeded") ||
      log.includes("insufficient") ||
      log.includes("invalid")
  );

  return `=== TRANSACTION DATA ===

Signature: ${signature}

Error: ${errorMessage || "No error found - transaction may have succeeded"}

Error Object:
${JSON.stringify(errorObject, null, 2)}

Relevant Logs (filtered for errors):
${relevantLogs.length > 0 ? relevantLogs.join("\n") : "No relevant error logs found"}

All Transaction Logs:
${logs.slice(0, MAX_LOGS_TO_INCLUDE).join("\n")}

=== END TRANSACTION DATA ===`;
}

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
    const lastMessage = messages.at(-1);
    // Extract text from message parts (AI SDK v5 pattern)
    const textPart = lastMessage?.parts?.find(
      (p: { type: string }) => p.type === "text"
    );
    const userMessage = (textPart as { text?: string })?.text || "";

    // Build system messages array (following x3000 backend pattern)
    const systemMessages: Array<{ role: "system"; content: string }> = [];

    // Part 1: Static system prompt (always present, cacheable)
    systemMessages.push({
      role: "system",
      content: `You are a Solana transaction debugger. When users share transaction signatures, you analyze failed Solana transactions and explain what went wrong in plain English.

## Your Output Format

**What happened:**
[1 sentence explaining the error in simple terms]

**Why it failed:**
[1 sentence with the specific reason]

**How to fix it:**
[Specific action with exact numbers if relevant]

## Rules

1. **Write for normal people, not developers**
   - "You don't have enough SOL" not "InsufficientFundsForRent"
   - "The price changed too fast" not "Slippage tolerance exceeded"
   - No code, no technical jargon, no instruction indices

2. **Be extremely specific**
   - Bad: "You need more SOL"
   - Good: "You need 0.015 more SOL (you have 0.008, need 0.023)"

3. **Give ONE clear action**
   - Don't list multiple options
   - Don't say "you could try..." - tell them what to do
   - If you can't determine exact fix, say that clearly

4. **Keep it short**
   - Max 3 sentences total
   - Every word must be necessary
   - No apologies, no hedging, no fluff

## Common Errors (in plain English)

**Insufficient funds:**
- "You need X more SOL to complete this transaction"
- Always calculate exact shortfall

**Account doesn't exist:**
- "This token account hasn't been created yet. Add 0.00203928 SOL for account creation"

**Price moved (slippage):**
- "The token price changed while your transaction was processing. Try again immediately or increase your slippage tolerance to 2%"

**Wrong amount:**
- "You're trying to send X but only have Y"

**Already processed:**
- "This transaction already succeeded earlier"

**Network congestion:**
- "Network is congested. Wait 30 seconds and try again"

## What NOT to Do

- ❌ No error codes (0x1772, InstructionError, etc.)
- ❌ No program addresses
- ❌ No code examples
- ❌ No "it seems like" - be definitive
- ❌ No explaining how Solana works
- ❌ No multiple paragraphs

## Example Good Response

**What happened:**
You don't have enough SOL for this transaction.

**Why it failed:**
You have 0.008 SOL but need 0.023 SOL (0.020 for the transfer + 0.003 for fees).

**How to fix it:**
Add 0.015 SOL to your wallet and try again.

## Example Bad Response

"It appears your transaction encountered an InsufficientFundsForRent error (0x1). This occurs when the account doesn't have sufficient lamports to maintain rent exemption. You could try adding more SOL, or you might want to check your balance first..."

[Too wordy, uses jargon, not specific about amounts]`,
    });

    // Part 2: Transaction data (only when signature detected, dynamic)
    const signature = detectTransactionSignature(userMessage);
    if (signature) {
      console.log(`[Transaction Debug] Detected signature: ${signature}`);

      try {
        const txData = await parseTransaction(signature);
        console.log(
          "[Transaction Debug] Fetched transaction:",
          txData.errorMessage
        );

        // Add transaction data (pure data, no instructions)
        const transactionData = formatTransactionData(
          txData.signature,
          txData.errorMessage,
          txData.errorObject,
          txData.logs
        );

        systemMessages.push({
          role: "system",
          content: transactionData,
        });

        console.log(
          "[Transaction Debug] Added transaction data to system messages"
        );
      } catch (error) {
        console.error("[Transaction Debug] Error fetching transaction:", error);
        // Continue without transaction data if fetch fails
      }
    }

    // Convert UI messages to model messages
    const convertedMessages = convertToModelMessages(messages);

    // Build complete message array: system messages + user conversation
    const allMessages = [...systemMessages, ...convertedMessages];

    const result = streamText({
      model: anthropic("claude-haiku-4-5"),
      messages: allMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
