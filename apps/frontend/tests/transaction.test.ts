/**
 * Transaction Pipeline Tests
 * Tests the actual public API and critical fixes
 * Run with: pnpm test
 */

import { describe, expect, it } from "vitest";
import { getDebugTransaction } from "../src/lib/transaction";

// Test transaction with known error (InsufficientFunds)
const KNOWN_ERROR_SIG =
  "4VK25o26kxq89H31F2kC5EUwHe3EXZ6CVt9BLVsm4n11ocGoukwZ8vvQ5d3sPVMuU9tbvbwLRC6TZTmtuJPEtgpS";

describe("getDebugTransaction() - End-to-End", () => {
  it("fetches and enriches transactions correctly", async () => {
    const debugTx = await getDebugTransaction(KNOWN_ERROR_SIG);

    // Basic structure
    expect(debugTx).toBeTruthy();
    expect(debugTx.signature).toBe(KNOWN_ERROR_SIG);
    expect(debugTx.semantic.type).toBeDefined();
    expect(debugTx.execution.instructions.length).toBeGreaterThan(0);
  }, 30_000);

  it("resolves error names (string errors)", async () => {
    const debugTx = await getDebugTransaction(KNOWN_ERROR_SIG);

    expect(debugTx.error).toBeTruthy();
    expect(debugTx.error?.errorName).toBe("InsufficientFunds");
    expect(debugTx.error?.errorDescription).toContain("InsufficientFunds");
  }, 30_000);

  it("identifies correct failing program (not ComputeBudget)", async () => {
    const debugTx = await getDebugTransaction(KNOWN_ERROR_SIG);

    // Critical test: Verify instruction ordering fix
    expect(debugTx.error).toBeTruthy();

    if (debugTx.error) {
      const errorIndex = debugTx.error.instructionIndex;
      const failingInstruction = debugTx.execution.instructions[errorIndex];

      // The error should reference the actual failing instruction
      expect(failingInstruction).toBeDefined();
      expect(failingInstruction?.programId).toBe(debugTx.error.programId);

      // Should NOT be ComputeBudget (the bug we fixed)
      expect(failingInstruction?.programId).not.toContain("ComputeBudget");
    }
  }, 30_000);

  it("includes execution flow and program logs", async () => {
    const debugTx = await getDebugTransaction(KNOWN_ERROR_SIG);

    expect(debugTx.execution.executionFlow.length).toBeGreaterThan(0);
    expect(debugTx.execution.programLogs.length).toBeGreaterThan(0);

    // Verify execution flow has status
    const flow = debugTx.execution.executionFlow[0];
    expect(flow).toBeDefined();
    expect(flow?.status).toMatch(/success|failed/);
    expect(flow?.programName).toBeDefined();
  }, 30_000);
});

describe("Error Resolution Coverage", () => {
  it("handles transactions gracefully when not found", async () => {
    // Transaction that doesn't exist
    const invalidSig =
      "1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111";

    // Should throw (either "Transaction not found" or API error)
    await expect(getDebugTransaction(invalidSig)).rejects.toThrow();
  });
});

describe("Real Transaction Value", () => {
  it("provides debuggable information for developers", async () => {
    const debugTx = await getDebugTransaction(KNOWN_ERROR_SIG);

    // Developer needs: What failed?
    expect(debugTx.error?.errorName).toBeTruthy();

    // Developer needs: Where did it fail?
    expect(debugTx.error?.programName).toBeTruthy();
    expect(debugTx.error?.instructionIndex).toBeGreaterThanOrEqual(0);

    // Developer needs: What happened?
    expect(debugTx.execution.logs.length).toBeGreaterThan(0);
    expect(
      debugTx.transfers.tokens.length + debugTx.transfers.native.length
    ).toBeGreaterThan(0);

    // Can serialize for AI without errors
    const serialized = JSON.stringify(debugTx);
    expect(serialized).toBeTruthy();
    expect(serialized.length).toBeGreaterThan(1000); // Has substantial data
  }, 30_000);
});
