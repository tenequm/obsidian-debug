/**
 * Error Enrichment Integration Test Suite
 *
 * Tests the frontend's integration with @obsidian-debug/solana-errors library
 * Validates enrichErrorData() function and real transaction processing
 *
 * Run with: pnpm test
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { Instruction } from "helius-sdk";
import { describe, expect, it } from "vitest";
import { enrichErrorData } from "../src/lib/solana/enrich-transaction";

// Load test transaction data
const testDataPath = path.join(__dirname, "test-transactions.json");
const testData = JSON.parse(fs.readFileSync(testDataPath, "utf-8"));

describe("Error Enrichment Integration", () => {
  it("enriches InsufficientFunds error correctly", () => {
    const mockError = {
      InstructionError: [
        2,
        {
          Custom: 1,
        },
      ],
    };

    const mockInstructions: Instruction[] = [
      {
        programId: "11111111111111111111111111111111",
        accounts: [],
        data: "",
      },
      {
        programId: "11111111111111111111111111111111",
        accounts: [],
        data: "",
      },
      {
        programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        accounts: [],
        data: "",
      },
    ] as unknown as Instruction[];

    const enriched = enrichErrorData(mockError, mockInstructions);

    expect(enriched).toBeTruthy();
    expect(enriched?.instructionIndex).toBe(2);
    expect(enriched?.errorCodeDecimal).toBe(1);
    expect(enriched?.errorName).toBe("insufficientFunds");
    expect(enriched?.errorDescription).toContain("Insufficient funds");
  });

  it("enriches Jupiter SlippageToleranceExceeded error correctly", () => {
    const mockError = {
      InstructionError: [
        1,
        {
          Custom: 6001,
        },
      ],
    };

    const mockInstructions: Instruction[] = [
      {
        programId: "11111111111111111111111111111111",
        accounts: [],
        data: "",
      },
      {
        programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        accounts: [],
        data: "",
      },
    ] as unknown as Instruction[];

    const enriched = enrichErrorData(mockError, mockInstructions);

    expect(enriched).toBeTruthy();
    expect(enriched?.instructionIndex).toBe(1);
    expect(enriched?.errorCodeDecimal).toBe(6001);
    expect(enriched?.errorCode).toBe("0x1771");
    expect(enriched?.errorName).toBe("SlippageToleranceExceeded");
    expect(enriched?.errorDescription).toContain("Slippage tolerance exceeded");
  });

  it("enriches Orca TokenMinSubceeded error correctly", () => {
    const mockError = {
      InstructionError: [
        0,
        {
          Custom: 6018,
        },
      ],
    };

    const mockInstructions: Instruction[] = [
      {
        programId: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
        accounts: [],
        data: "",
      },
    ] as unknown as Instruction[];

    const enriched = enrichErrorData(mockError, mockInstructions);

    expect(enriched).toBeTruthy();
    expect(enriched?.errorName).toBe("TokenMinSubceeded");
    expect(enriched?.errorDescription).toBeDefined();
    expect(enriched?.programName).toBe("Orca Whirlpools");
  });

  it("returns null for non-InstructionError format", () => {
    const mockError = {
      SomeOtherError: "test",
    };

    const mockInstructions: Instruction[] = [];
    const enriched = enrichErrorData(mockError, mockInstructions);

    expect(enriched).toBeNull();
  });
});

describe("Real Transaction Data Validation", () => {
  it("successfully loads test transaction dataset", () => {
    expect(testData).toBeTruthy();
    expect(testData.transactions).toBeDefined();
    expect(Array.isArray(testData.transactions)).toBe(true);
    expect(testData.transactions.length).toBeGreaterThan(0);
  });

  it("validates all test transactions have required fields", () => {
    for (const tx of testData.transactions) {
      expect(tx.signature).toBeDefined();
      expect(typeof tx.signature).toBe("string");
      expect(tx.signature.length).toBeGreaterThan(0);

      expect(tx.expectedError).toBeDefined();
      expect(tx.expectedError.code).toBeDefined();
      expect(tx.expectedError.name).toBeDefined();
      expect(tx.expectedError.program).toBeDefined();
      expect(tx.expectedError.category).toBeDefined();

      expect(tx.fullTransactionData).toBeDefined();
    }
  });

  it("validates test transactions cover diverse error categories", () => {
    const categories = new Set<string>();
    for (const tx of testData.transactions) {
      categories.add(tx.expectedError.category);
    }

    // Should have at least 4 different categories
    expect(categories.size).toBeGreaterThanOrEqual(4);

    // Specific categories we care about
    const categoryArray = Array.from(categories);
    expect(
      categoryArray.some((cat) => cat.toLowerCase().includes("slippage"))
    ).toBe(true);
    expect(
      categoryArray.some(
        (cat) =>
          cat.toLowerCase().includes("balance") ||
          cat.toLowerCase().includes("token")
      )
    ).toBe(true);
  });

  it("enriches real transaction errors successfully", () => {
    let successCount = 0;
    let resolvedCount = 0;

    for (const tx of testData.transactions) {
      const fullTx = tx.fullTransactionData;

      // Helius Enhanced Transactions use transactionError field directly
      if (!fullTx?.transactionError) {
        continue;
      }

      const enriched = enrichErrorData(
        fullTx.transactionError,
        fullTx.instructions || []
      );

      if (enriched) {
        successCount++;

        // Check if error was successfully resolved (not just enriched)
        if (enriched.errorName && enriched.errorDescription) {
          resolvedCount++;
        }
      }
    }

    // Should successfully enrich most transactions
    expect(successCount).toBeGreaterThan(testData.transactions.length * 0.7);

    // Should successfully resolve at least 30% of errors to names
    // (some errors may be from programs not in our database)
    expect(resolvedCount).toBeGreaterThan(testData.transactions.length * 0.3);

    console.log("\n📊 Enrichment Results:");
    console.log(`  Total: ${testData.transactions.length} transactions`);
    console.log(`  Enriched: ${successCount}`);
    console.log(
      `  Resolved: ${resolvedCount} (${((resolvedCount / testData.transactions.length) * 100).toFixed(1)}%)`
    );
  });
});
