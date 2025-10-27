import type { TextUIPart, UIMessage } from "ai";
import { transactionDebugger } from "@/lib/ai/agents/transaction-debugger";
import { isValidSignature } from "@/lib/solana/validators";
import { getDebugTransaction } from "@/lib/transaction";

export const maxDuration = 60;

// Constants
const WHITESPACE_REGEX = /\s+/;

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
    const textPart = lastMessage?.parts?.find(
      (p): p is TextUIPart => p.type === "text"
    );
    const userMessage = textPart?.text || "";

    // Detect and fetch transaction data if signature is found
    const signature = detectTransactionSignature(userMessage);
    let messagesWithContext = messages;

    if (signature) {
      console.log(`[Transaction Debug] Detected signature: ${signature}`);

      try {
        // Fetch and enrich transaction using unified pipeline
        const debugTx = await getDebugTransaction(signature);

        console.log(
          "[Transaction Debug] Enriched transaction:",
          debugTx.semantic.type,
          "with error:",
          debugTx.error?.errorName || "None"
        );

        // Inject transaction data as a system message
        messagesWithContext = [
          {
            role: "system",
            parts: [
              {
                type: "text",
                text: `=== PARSED TRANSACTION DATA ===

${JSON.stringify(debugTx, null, 2)}

=== END TRANSACTION DATA ===`,
              },
            ],
          },
          ...messages,
        ];

        console.log("[Transaction Debug] Added transaction data to messages");
      } catch (error) {
        console.error("[Transaction Debug] Error fetching transaction:", error);
        // Continue without transaction data if fetch fails
      }
    }

    // Use the native Agent's respond() method
    return transactionDebugger.respond({
      messages: messagesWithContext,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
