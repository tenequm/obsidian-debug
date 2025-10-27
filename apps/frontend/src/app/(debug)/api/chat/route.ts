import { createAgentUIStreamResponse } from "ai";
import { transactionDebugger } from "@/lib/ai/agents/transaction-debugger";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Agent will use fetchTransaction tool to get transaction data when needed
    return createAgentUIStreamResponse({
      agent: transactionDebugger,
      messages,
      sendReasoning: true,
      headers: {
        "anthropic-beta":
          "interleaved-thinking-2025-05-14,extended-cache-ttl-2025-04-11",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
