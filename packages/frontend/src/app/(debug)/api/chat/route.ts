import type { TextUIPart, UIMessage } from "ai";
import { Helius } from "helius-sdk";
import { env } from "@/env";
import { transactionDebugger } from "@/lib/ai/agents/transaction-debugger";
import {
  enrichErrorData,
  enrichInstructions,
  parseLogMessages,
} from "@/lib/solana/enrich-transaction";
import { isValidSignature } from "@/lib/solana/utils";
import { parseTransaction } from "@/lib/xray";

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

          // Enrich transaction data with human-readable information
          let enrichedError: ReturnType<typeof enrichErrorData> = null;
          let executionFlow: ReturnType<
            typeof parseLogMessages
          >["executionFlow"] = [];
          let programLogs: ReturnType<typeof parseLogMessages>["programLogs"] =
            [];
          let enrichedInstructionsList: ReturnType<typeof enrichInstructions> =
            [];

          try {
            // Parse log messages for execution flow and structured logs
            // Type assertion: EnrichedTransaction has logs but TypeScript doesn't know about it
            const txWithMeta = enrichedTx as unknown as {
              meta?: { logMessages?: string[] };
            };
            const logs = txWithMeta.meta?.logMessages || [];

            // Enrich error data if transaction failed (pass logs for pattern matching)
            if (enrichedTx.transactionError) {
              enrichedError = enrichErrorData(
                enrichedTx.transactionError,
                enrichedTx.instructions,
                logs
              );
              console.log(
                "[Transaction Debug] Enriched error:",
                enrichedError?.errorName || "Unknown"
              );
            }

            const parsed = parseLogMessages(logs, enrichedTx.instructions);
            executionFlow = parsed.executionFlow;
            programLogs = parsed.programLogs;

            // Enrich instructions with program names
            enrichedInstructionsList = enrichInstructions(
              enrichedTx.instructions
            );
          } catch (enrichError) {
            console.error(
              "[Transaction Debug] Error during enrichment:",
              enrichError
            );
            // Continue with un-enriched data if enrichment fails
          }

          // Create comprehensive transaction summary
          const txSummary = {
            signature: parsedTx.signature,
            type: parsedTx.type,
            timestamp: parsedTx.timestamp,
            fee: parsedTx.fee,
            source: parsedTx.source,
            primaryUser: parsedTx.primaryUser,
            actions: parsedTx.actions,
            accounts: parsedTx.accounts,

            // Enhanced error information
            error: enrichedError,

            // Enhanced execution context
            executionFlow,
            programLogs,

            // Enhanced instructions
            instructions: enrichedInstructionsList,

            // Keep original data for reference
            rawError: enrichedTx.transactionError || null,
            tokenTransfers: enrichedTx.tokenTransfers || [],
            nativeTransfers: enrichedTx.nativeTransfers || [],
            accountData: enrichedTx.accountData || [],
            events: enrichedTx.events,
          };

          // Inject transaction data as a system message at the beginning
          messagesWithContext = [
            {
              role: "system",
              parts: [
                {
                  type: "text",
                  text: `=== PARSED TRANSACTION DATA ===

${JSON.stringify(txSummary, null, 2)}

=== END TRANSACTION DATA ===`,
                },
              ],
            },
            ...messages,
          ];

          console.log("[Transaction Debug] Added transaction data to messages");
        } else {
          console.log("[Transaction Debug] Transaction not found");
        }
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
