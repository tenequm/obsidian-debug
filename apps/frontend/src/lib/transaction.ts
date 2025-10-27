/**
 * Transaction Enrichment Pipeline
 * Single source of truth for transaction data processing
 */

import { registry } from "@obsidian-debug/solana-errors";
import type {
  MessageCompiledInstruction,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import type { EnrichedTransaction } from "helius-sdk";
import { Helius } from "helius-sdk";
import { env } from "@/env";
import { parseTransaction } from "./xray";
import { publicKeyMappings } from "./xray/config";

// =============================================================================
// TYPES
// =============================================================================

export interface TokenMetadata {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface DebugTransaction {
  // Core identifiers
  signature: string;
  slot: number;
  timestamp: number;
  fee: number;

  // High-level semantic information (from Helius/xray)
  semantic: {
    type: string; // "SWAP", "TRANSFER", etc
    source: string; // "JUPITER", "RAYDIUM", etc
    primaryUser: string;
    actions: Array<{
      actionType: string;
      from: string | null;
      to: string;
      sent?: string;
      received?: string;
      amount: number;
    }>;
    accounts: Array<{
      account: string;
      changes: Array<{
        mint: string;
        amount: number;
      }>;
    }>;
  };

  // Low-level execution information (from raw RPC)
  execution: {
    instructions: RawInstruction[]; // RAW blockchain order (for error mapping)
    logs: string[];
    executionFlow: InstructionExecution[];
    programLogs: ProgramLog[];
  };

  // Error information (enriched with registry)
  error: EnrichedError | null;

  // Value transfers (from Helius)
  transfers: {
    tokens: TokenTransfer[];
    native: NativeTransfer[];
  };

  // Token metadata (enriched from Helius DAS API)
  tokens: Record<string, TokenMetadata>;

  // Additional context
  metadata: {
    accountData: unknown[];
    events: unknown;
  };
}

export interface RawInstruction {
  programId: string;
  accounts: number[];
  data: string;
}

export interface InstructionExecution {
  index: number;
  programId: string;
  programName: string;
  status: "success" | "failed";
  error?: string;
  computeUsed?: number;
}

export interface ProgramLog {
  program: string;
  message: string;
  level: "info" | "error" | "data";
}

export interface EnrichedError {
  instructionIndex: number;
  programId: string;
  programName: string;
  errorCode: string;
  errorCodeDecimal: number;
  errorName: string | null;
  errorDescription: string | null;
  rawError: unknown;
  programMetadata?: ProgramMetadata;
  calledPrograms?: Array<{ programId: string; programName: string }>;
}

export interface ProgramMetadata {
  isUpgradeable: boolean;
  upgradeAuthority: string | null;
  programDataAccount: string | null;
}

export interface TokenTransfer {
  fromTokenAccount: string;
  toTokenAccount: string;
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint: string;
  tokenStandard: string;
}

export interface NativeTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
}

// =============================================================================
// FETCH
// =============================================================================

async function fetchTransactionData(signature: string) {
  const helius = new Helius(env.HELIUS_API_KEY);
  const connection = new Connection(
    `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_API_KEY}`
  );

  // Fetch both in parallel
  const [heliusResult, rawTx] = await Promise.all([
    helius.parseTransactions({ transactions: [signature] }),
    connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    }),
  ]);

  const heliusTx = heliusResult[0];

  if (!(heliusTx && rawTx)) {
    throw new Error("Transaction not found");
  }

  return { heliusTx, rawTx };
}

// =============================================================================
// NORMALIZE
// =============================================================================

function extractRawInstructions(
  rawTx: VersionedTransactionResponse
): RawInstruction[] {
  const { message } = rawTx.transaction;
  const { staticAccountKeys } = message;
  const instructions = message.compiledInstructions;

  return instructions.map((inst: MessageCompiledInstruction) => ({
    programId: staticAccountKeys[inst.programIdIndex]?.toString() ?? "",
    accounts: inst.accountKeyIndexes,
    data: Buffer.from(inst.data).toString("base64"),
  }));
}

function getProgramName(programId: string): string {
  // Try error library first (includes version info)
  const protocol = registry.getByProgramId(programId);
  if (protocol) {
    return protocol.name;
  }

  // Fall back to xray config
  const mappings = publicKeyMappings as Record<string, string>;
  return mappings[programId] || programId;
}

function normalizeTransaction(
  heliusTx: EnrichedTransaction,
  rawTx: VersionedTransactionResponse
): DebugTransaction {
  // Parse with xray for high-level actions
  const parsedTx = parseTransaction(heliusTx, undefined);

  // Extract raw instructions (correct blockchain order)
  const rawInstructions = extractRawInstructions(rawTx);

  return {
    signature: parsedTx.signature,
    slot: heliusTx.slot,
    timestamp: parsedTx.timestamp,
    fee: parsedTx.fee,

    semantic: {
      type: parsedTx.type,
      source: parsedTx.source,
      primaryUser: parsedTx.primaryUser,
      actions: parsedTx.actions,
      accounts: parsedTx.accounts,
    },

    execution: {
      instructions: rawInstructions, // ✅ Raw order for error mapping
      logs: rawTx.meta?.logMessages || [],
      executionFlow: [],
      programLogs: [],
    },

    error: heliusTx.transactionError
      ? {
          instructionIndex: -1, // Will be enriched
          programId: "",
          programName: "",
          errorCode: "",
          errorCodeDecimal: 0,
          errorName: null,
          errorDescription: null,
          rawError: heliusTx.transactionError,
        }
      : null,

    transfers: {
      tokens: (heliusTx.tokenTransfers as TokenTransfer[]) || [],
      native: (heliusTx.nativeTransfers as NativeTransfer[]) || [],
    },

    tokens: {}, // Will be enriched

    metadata: {
      accountData: heliusTx.accountData || [],
      events: heliusTx.events,
    },
  };
}

// =============================================================================
// ENRICH
// =============================================================================

function parseInstructionError(error: unknown): {
  instructionIndex: number;
  errorCode: number;
  errorString: string | null;
} | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "InstructionError" in error
  ) {
    const instrError = (error as Record<string, unknown>).InstructionError;

    if (Array.isArray(instrError) && instrError.length === 2) {
      const instructionIndex = instrError[0] as number;
      const errorDetail = instrError[1];

      // Handle numeric error codes: { Custom: 1 }
      if (
        typeof errorDetail === "object" &&
        errorDetail !== null &&
        "Custom" in errorDetail
      ) {
        return {
          instructionIndex,
          errorCode: (errorDetail as { Custom: number }).Custom,
          errorString: null,
        };
      }

      // Handle string errors: "InsufficientFunds"
      // These are already decoded by Solana/Helius
      if (typeof errorDetail === "string") {
        return {
          instructionIndex,
          errorCode: 0, // No numeric code available
          errorString: errorDetail,
        };
      }
    }
  }

  return null;
}

function parseLogMessages(logs: string[]): {
  executionFlow: InstructionExecution[];
  programLogs: ProgramLog[];
} {
  const executionFlow: InstructionExecution[] = [];
  const programLogs: ProgramLog[] = [];

  const invokePattern = /Program (\w+) invoke \[(\d+)\]/;
  const successPattern = /Program (\w+) success/;
  const failedPattern = /Program (\w+) failed: (.+)/;
  const consumedPattern = /Program (\w+) consumed (\d+) of (\d+) compute units/;
  const logPattern = /Program log: (.+)/;
  const dataPattern = /Program data: (.+)/;

  const invocationStack: Array<{
    programId: string;
    index: number;
    stackHeight: number;
  }> = [];

  let topLevelInstructionIndex = -1;

  for (const log of logs) {
    // Program invocation
    const invokeMatch = log.match(invokePattern);
    if (invokeMatch?.[1] && invokeMatch[2]) {
      const programId = invokeMatch[1];
      const height = Number.parseInt(invokeMatch[2], 10);

      if (height === 1) {
        topLevelInstructionIndex++;
      }

      invocationStack.push({
        programId,
        index: topLevelInstructionIndex,
        stackHeight: height,
      });
      continue;
    }

    // Program success
    const successMatch = log.match(successPattern);
    if (successMatch?.[1]) {
      const programId = successMatch[1];
      const invocation = invocationStack.pop();

      if (invocation && invocation.stackHeight === 1) {
        executionFlow.push({
          index: invocation.index,
          programId,
          programName: getProgramName(programId),
          status: "success",
        });
      }
      continue;
    }

    // Program failed
    const failedMatch = log.match(failedPattern);
    if (failedMatch?.[1] && failedMatch[2]) {
      const programId = failedMatch[1];
      const errorMsg = failedMatch[2];
      const invocation = invocationStack.pop();

      if (invocation && invocation.stackHeight === 1) {
        executionFlow.push({
          index: invocation.index,
          programId,
          programName: getProgramName(programId),
          status: "failed",
          error: errorMsg,
        });
      }

      programLogs.push({
        program: getProgramName(programId),
        message: `Failed: ${errorMsg}`,
        level: "error",
      });
      continue;
    }

    // Compute units
    const consumedMatch = log.match(consumedPattern);
    if (consumedMatch?.[1] && consumedMatch[2]) {
      const programId = consumedMatch[1];
      const consumed = Number.parseInt(consumedMatch[2], 10);
      const lastFlow = executionFlow.at(-1);
      if (lastFlow && lastFlow.programId === programId) {
        lastFlow.computeUsed = consumed;
      }
      continue;
    }

    // Program log
    const logMatch = log.match(logPattern);
    if (logMatch?.[1]) {
      const message = logMatch[1];
      const currentInvocation = invocationStack.at(-1);
      const programName = currentInvocation
        ? getProgramName(currentInvocation.programId)
        : "Unknown";

      programLogs.push({
        program: programName,
        message,
        level: message.toLowerCase().includes("error") ? "error" : "info",
      });
      continue;
    }

    // Program data
    const dataMatch = log.match(dataPattern);
    if (dataMatch?.[1]) {
      const data = dataMatch[1];
      const currentInvocation = invocationStack.at(-1);
      const programName = currentInvocation
        ? getProgramName(currentInvocation.programId)
        : "Unknown";

      programLogs.push({
        program: programName,
        message: `Data: ${data}`,
        level: "data",
      });
    }
  }

  return { executionFlow, programLogs };
}

async function fetchProgramMetadata(
  connection: Connection,
  programId: string
): Promise<ProgramMetadata | null> {
  try {
    const programAccountInfo = await connection.getAccountInfo(
      new (await import("@solana/web3.js")).PublicKey(programId)
    );

    if (!programAccountInfo) {
      return null;
    }

    // Check if program is upgradeable (BPF Upgradeable Loader)
    const isUpgradeable =
      programAccountInfo.owner.toString() ===
      "BPFLoaderUpgradeab1e11111111111111111111111";

    if (!isUpgradeable) {
      return {
        isUpgradeable: false,
        upgradeAuthority: null,
        programDataAccount: null,
      };
    }

    // For upgradeable programs, read program data account from program account
    const programData = programAccountInfo.data;
    if (programData.length < 36) {
      return {
        isUpgradeable: true,
        upgradeAuthority: null,
        programDataAccount: null,
      };
    }

    // Program account layout: [4 bytes: slot] [32 bytes: programdata address]
    const programDataAddress = new (await import("@solana/web3.js")).PublicKey(
      programData.slice(4, 36)
    );

    // Fetch programdata account to get upgrade authority
    const programDataAccountInfo =
      await connection.getAccountInfo(programDataAddress);

    if (!programDataAccountInfo || programDataAccountInfo.data.length < 45) {
      return {
        isUpgradeable: true,
        upgradeAuthority: null,
        programDataAccount: programDataAddress.toString(),
      };
    }

    // ProgramData account layout: [1 byte: slot] [1 byte: option] [32 bytes: authority]
    const hasAuthority = programDataAccountInfo.data[1] === 1;
    const upgradeAuthority = hasAuthority
      ? new (await import("@solana/web3.js")).PublicKey(
          programDataAccountInfo.data.slice(13, 45)
        ).toString()
      : null;

    return {
      isUpgradeable: true,
      upgradeAuthority,
      programDataAccount: programDataAddress.toString(),
    };
  } catch (error) {
    console.error("Error fetching program metadata:", error);
    return null;
  }
}

function extractCalledPrograms(
  executionFlow: InstructionExecution[]
): Array<{ programId: string; programName: string }> {
  const seen = new Set<string>();
  const programs: Array<{ programId: string; programName: string }> = [];

  for (const entry of executionFlow) {
    if (!seen.has(entry.programId)) {
      seen.add(entry.programId);
      programs.push({
        programId: entry.programId,
        programName: entry.programName,
      });
    }
  }

  return programs;
}

async function enrichTokenMetadata(
  helius: Helius,
  tokenTransfers: TokenTransfer[]
): Promise<Record<string, TokenMetadata>> {
  if (tokenTransfers.length === 0) {
    return {};
  }

  // Extract unique mints from token transfers
  const uniqueMints = [...new Set(tokenTransfers.map((t) => t.mint))];

  try {
    // Fetch metadata for all tokens in batch using Helius DAS API
    const response = await helius.rpc.getAssetBatch({
      ids: uniqueMints,
    });

    const metadata: Record<string, TokenMetadata> = {};

    for (const asset of response) {
      if (asset) {
        metadata[asset.id] = {
          mint: asset.id,
          symbol: asset.content?.metadata?.symbol || "UNKNOWN",
          name: asset.content?.metadata?.name || "Unknown Token",
          decimals: asset.token_info?.decimals ?? 9,
          logoURI: asset.content?.links?.image,
        };
      }
    }

    return metadata;
  } catch (error) {
    console.error("Failed to fetch token metadata:", error);
    // Return empty object on failure - AI will use addresses as fallback
    return {};
  }
}

async function enrichTransaction(
  tx: DebugTransaction,
  helius: Helius
): Promise<DebugTransaction> {
  // Parse execution flow from logs
  const { executionFlow, programLogs } = parseLogMessages(tx.execution.logs);

  tx.execution.executionFlow = executionFlow;
  tx.execution.programLogs = programLogs;

  // Enrich error if transaction failed
  if (tx.error) {
    const parsed = parseInstructionError(tx.error.rawError);

    if (parsed) {
      const { instructionIndex, errorCode, errorString } = parsed;

      // Get failing instruction from RAW order
      const failingInstruction = tx.execution.instructions[instructionIndex];

      if (failingInstruction) {
        const programId = failingInstruction.programId;
        const programName = getProgramName(programId);

        // Try to resolve error from registry (only for numeric codes)
        const resolved =
          errorCode > 0 ? registry.resolve(programId, errorCode) : null;

        // If error is pre-decoded string (like "InsufficientFunds")
        // Use it directly as the error name
        const errorName = errorString || resolved?.name || null;
        const errorDescription =
          resolved?.description ||
          (errorString ? `Solana error: ${errorString}` : null);

        tx.error = {
          instructionIndex,
          programId,
          programName,
          errorCode: `0x${errorCode.toString(16)}`,
          errorCodeDecimal: errorCode,
          errorName,
          errorDescription,
          rawError: tx.error.rawError,
        };

        // If error not in registry, fetch program metadata
        if (!(resolved || errorString)) {
          const connection = new Connection(
            `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_API_KEY}`
          );
          const metadata = await fetchProgramMetadata(connection, programId);
          if (metadata) {
            tx.error.programMetadata = metadata;
          }

          // Extract called programs for context
          tx.error.calledPrograms = extractCalledPrograms(executionFlow);
        }
      }
    }
  }

  // Enrich token metadata
  const tokenMetadata = await enrichTokenMetadata(helius, tx.transfers.tokens);
  tx.tokens = tokenMetadata;

  return tx;
}

// =============================================================================
// PUBLIC API
// =============================================================================

export async function getDebugTransaction(
  signature: string
): Promise<DebugTransaction> {
  // 1. Fetch both data sources in parallel
  const { heliusTx, rawTx } = await fetchTransactionData(signature);

  // 2. Normalize to canonical DebugTransaction
  const normalized = normalizeTransaction(heliusTx, rawTx);

  // 3. Enrich with registry data, execution analysis, and token metadata
  const helius = new Helius(env.HELIUS_API_KEY);
  const enriched = await enrichTransaction(normalized, helius);

  return enriched;
}
