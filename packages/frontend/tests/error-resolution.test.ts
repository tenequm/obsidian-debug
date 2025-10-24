/**
 * Error Resolution Test Suite
 *
 * Validates that the enhanced error database correctly resolves
 * error codes from SPL Token, Orca Whirlpools, Jupiter, Raydium, and Anchor.
 *
 * Run with: pnpm test
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { Instruction } from "helius-sdk";
import { describe, expect, it } from "vitest";
import { enrichErrorData } from "../src/lib/solana/enrich-transaction";
import {
  PROGRAM_ERROR_CODES,
  resolveErrorCode,
} from "../src/lib/solana/error-codes";

// Load test transaction data
const testDataPath = path.join(__dirname, "test-transactions.json");
const testData = JSON.parse(fs.readFileSync(testDataPath, "utf-8"));

describe("Error Code Resolution - SPL Token Program", () => {
  const SPL_TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

  it("resolves InsufficientFunds (code 1)", () => {
    const resolved = resolveErrorCode(SPL_TOKEN_PROGRAM, 1);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("InsufficientFunds");
    expect(resolved?.category).toBe("Token Balance");
    expect(resolved?.debugTip).toContain("balance");
  });

  it("resolves InvalidMint (code 2)", () => {
    const resolved = resolveErrorCode(SPL_TOKEN_PROGRAM, 2);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("InvalidMint");
    expect(resolved?.category).toBe("Token Mint");
  });

  it("resolves MintMismatch (code 3)", () => {
    const resolved = resolveErrorCode(SPL_TOKEN_PROGRAM, 3);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("MintMismatch");
    expect(resolved?.category).toBe("Token Account");
  });

  it("resolves AccountFrozen (code 17)", () => {
    const resolved = resolveErrorCode(SPL_TOKEN_PROGRAM, 17);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("AccountFrozen");
    expect(resolved?.category).toBe("Token Account");
    expect(resolved?.debugTip).toContain("frozen");
  });

  it("resolves NotRentExempt (code 0)", () => {
    const resolved = resolveErrorCode(SPL_TOKEN_PROGRAM, 0);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("NotRentExempt");
    expect(resolved?.category).toBe("Token Account");
    expect(resolved?.debugTip).toContain("rent-exempt");
  });

  it("returns null for unknown SPL Token error code", () => {
    const resolved = resolveErrorCode(SPL_TOKEN_PROGRAM, 9999);
    expect(resolved).toBeNull();
  });
});

describe("Error Code Resolution - Jupiter Aggregator", () => {
  const JUPITER_V6 = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";
  const JUPITER_V4 = "JUP6i4ozu5ydDCnLiMogSckDPpbtr7BJ4FtzYWkb5Rk";

  it("resolves SlippageToleranceExceeded (code 6001) for v6", () => {
    const resolved = resolveErrorCode(JUPITER_V6, 6001);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("SlippageToleranceExceeded");
    expect(resolved?.category).toBe("Slippage");
    expect(resolved?.debugTip).toContain("slippage");
  });

  it("resolves SlippageToleranceExceeded (code 6001) for v4", () => {
    const resolved = resolveErrorCode(JUPITER_V4, 6001);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("SlippageToleranceExceeded");
    expect(resolved?.category).toBe("Slippage");
  });

  it("resolves NotEnoughAccountKeys (code 6008)", () => {
    const resolved = resolveErrorCode(JUPITER_V6, 6008);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("NotEnoughAccountKeys");
    expect(resolved?.category).toBe("Account Validation");
    expect(resolved?.debugTip).toContain("account");
  });

  it("resolves InsufficientFunds (code 6024)", () => {
    const resolved = resolveErrorCode(JUPITER_V6, 6024);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("InsufficientFunds");
    expect(resolved?.category).toBe("Balance");
  });

  it("resolves InvalidTokenAccount (code 6025)", () => {
    const resolved = resolveErrorCode(JUPITER_V6, 6025);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("InvalidTokenAccount");
    expect(resolved?.category).toBe("Token Account");
  });
});

describe("Error Code Resolution - Orca Whirlpools", () => {
  const ORCA_WHIRLPOOLS = "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc";

  it("resolves InvalidStartTick (code 6001)", () => {
    const resolved = resolveErrorCode(ORCA_WHIRLPOOLS, 6001);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("InvalidStartTick");
    expect(resolved?.category).toBe("Tick Management");
  });

  it("resolves TokenMaxExceeded (code 6017)", () => {
    const resolved = resolveErrorCode(ORCA_WHIRLPOOLS, 6017);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("TokenMaxExceeded");
    expect(resolved?.category).toBe("Slippage Protection");
    expect(resolved?.debugTip).toContain("max token amount");
  });

  it("resolves TokenMinSubceeded (code 6018)", () => {
    const resolved = resolveErrorCode(ORCA_WHIRLPOOLS, 6018);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("TokenMinSubceeded");
    expect(resolved?.category).toBe("Slippage Protection");
    expect(resolved?.debugTip).toContain("min token amount");
  });

  it("resolves FeeRateMaxExceeded (code 6028)", () => {
    const resolved = resolveErrorCode(ORCA_WHIRLPOOLS, 6028);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("FeeRateMaxExceeded");
    expect(resolved?.category).toBe("Pool Configuration");
  });

  it("resolves AmountOutBelowMinimum (code 6036)", () => {
    const resolved = resolveErrorCode(ORCA_WHIRLPOOLS, 6036);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("AmountOutBelowMinimum");
    expect(resolved?.category).toBe("Slippage Protection");
    expect(resolved?.debugTip).toContain("slippage");
  });

  it("resolves InvalidPositionTokenAmount (code 6020)", () => {
    const resolved = resolveErrorCode(ORCA_WHIRLPOOLS, 6020);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("InvalidPositionTokenAmount");
    expect(resolved?.category).toBe("Position Management");
  });
});

describe("Error Code Resolution - Raydium AMM", () => {
  const RAYDIUM_V4 = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";

  it("resolves ExceededSlippage (code 30/0x1e)", () => {
    const resolved = resolveErrorCode(RAYDIUM_V4, 30);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("ExceededSlippage");
    expect(resolved?.category).toBe("Slippage Protection");
    expect(resolved?.debugTip).toContain("slippage");
  });

  it("resolves InvalidSplTokenProgram (code 38/0x26)", () => {
    const resolved = resolveErrorCode(RAYDIUM_V4, 38);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("InvalidSplTokenProgram");
    expect(resolved?.category).toBe("Account Validation");
  });

  it("resolves InsufficientFunds (code 40/0x28)", () => {
    const resolved = resolveErrorCode(RAYDIUM_V4, 40);
    expect(resolved).toBeTruthy();
    expect(resolved?.name).toBe("InsufficientFunds");
    expect(resolved?.category).toBe("Token Balance");
  });
});

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
    expect(enriched?.errorName).toBe("InsufficientFunds");
    expect(enriched?.category).toBe("Token Balance");
    expect(enriched?.debugTip).toContain("balance");
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
    expect(enriched?.category).toBe("Slippage");
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
    expect(enriched?.category).toBe("Slippage Protection");
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
        fullTx.instructions || [],
        fullTx.logMessages || []
      );

      if (enriched) {
        successCount++;

        // Check if error was successfully resolved (not just enriched)
        if (enriched.errorName && enriched.category) {
          resolvedCount++;
        }
      }
    }

    // Should successfully enrich most transactions
    expect(successCount).toBeGreaterThan(testData.transactions.length * 0.7);

    // Should successfully resolve at least 60% of errors to names
    expect(resolvedCount).toBeGreaterThan(testData.transactions.length * 0.6);

    console.log("\n📊 Enrichment Results:");
    console.log(`  Total: ${testData.transactions.length} transactions`);
    console.log(`  Enriched: ${successCount}`);
    console.log(
      `  Resolved: ${resolvedCount} (${((resolvedCount / testData.transactions.length) * 100).toFixed(1)}%)`
    );
  });
});

describe("Coverage Validation", () => {
  it("validates all new error codes are in PROGRAM_ERROR_CODES", () => {
    // SPL Token
    expect(
      PROGRAM_ERROR_CODES.TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
    ).toBeDefined();

    // Jupiter variants
    expect(
      PROGRAM_ERROR_CODES.JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4
    ).toBeDefined();
    expect(
      PROGRAM_ERROR_CODES.JUP6i4ozu5ydDCnLiMogSckDPpbtr7BJ4FtzYWkb5Rk
    ).toBeDefined();

    // Orca Whirlpools
    expect(
      PROGRAM_ERROR_CODES.whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc
    ).toBeDefined();

    // Raydium variants
    expect(
      PROGRAM_ERROR_CODES["675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"]
    ).toBeDefined();
  });

  it("validates SPL Token has 20 error codes", () => {
    const splTokenErrors =
      PROGRAM_ERROR_CODES.TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA;
    const errorCount = Object.keys(splTokenErrors ?? {}).length;
    expect(errorCount).toBe(20);
  });

  it("validates Jupiter has 6 error codes", () => {
    const jupiterErrors =
      PROGRAM_ERROR_CODES.JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4;
    const errorCount = Object.keys(jupiterErrors ?? {}).length;
    expect(errorCount).toBe(6);
  });

  it("validates Orca Whirlpools has 68 error codes", () => {
    const orcaErrors =
      PROGRAM_ERROR_CODES.whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc;
    const errorCount = Object.keys(orcaErrors ?? {}).length;
    expect(errorCount).toBe(68);
  });

  it("validates total coverage of at least 250 error codes", () => {
    let totalCount = 0;
    for (const programErrors of Object.values(PROGRAM_ERROR_CODES)) {
      totalCount += Object.keys(programErrors).length;
    }
    expect(totalCount).toBeGreaterThanOrEqual(250);
    console.log(`\n📈 Total Error Codes: ${totalCount}`);
  });
});
