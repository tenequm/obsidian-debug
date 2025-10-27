/**
 * Quick manual test script for agent prompt changes
 * Run with: pnpm test:prompt
 */
import "dotenv/config";
import { transactionDebugger } from "@/lib/ai/agents/transaction-debugger";

// Transaction signature to test
const TRANSACTION_SIGNATURE =
  "21TQdryJZpurVh2gFKpUMi6n1ypvvUUzaiUwynPBEbdMULwU5j5d7HiQwvReovoPZdW18bkKbnyKKWY4jUmj9WbT";

async function testPrompt() {
  console.log("\n🧪 Testing Agent with Tool-Based Transaction Fetching\n");

  // Turn 1: Send transaction signature
  console.log("📤 Sending signature to agent...\n");

  const result1 = await transactionDebugger.generate({
    prompt: TRANSACTION_SIGNATURE,
  });

  console.log("📝 Agent Response:\n");
  console.log(result1.text);

  const tools1 = result1.steps.flatMap(
    (s) => s.toolCalls?.map((tc) => tc.toolName) || []
  );
  console.log(`\n🔧 Tools called: ${tools1.join(", ") || "none"}`);

  // Turn 2: Request timeline
  console.log("\n\n📤 Asking for timeline...\n");

  const result2 = await transactionDebugger.generate({
    messages: [
      ...result1.response.messages,
      {
        role: "user",
        content: "Show me a visual timeline",
      },
    ],
  });

  console.log("📝 Timeline Response:\n");
  console.log(result2.text);

  const tools2 = result2.steps.flatMap(
    (s) => s.toolCalls?.map((tc) => tc.toolName) || []
  );
  console.log(`\n🔧 Tools called: ${tools2.join(", ") || "none"}`);

  // Summary
  console.log("\n\n✅ Test Complete");
  console.log(`📊 Total steps: ${result1.steps.length + result2.steps.length}`);
  console.log(
    `🔧 Total tool calls: ${tools1.length + tools2.length} (${[...tools1, ...tools2].join(", ")})`
  );
}

testPrompt().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
