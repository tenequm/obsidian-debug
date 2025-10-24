/**
 * Transaction data enrichment utilities
 * Transforms raw transaction data into structured, human-readable format for AI analysis
 */

import type { Instruction } from "helius-sdk";
import { publicKeyMappings } from "../xray/config";
import { resolveErrorCode } from "./error-codes";
import { matchErrorPattern } from "./error-patterns";

/**
 * Enriched error information with human-readable details
 */
export type EnrichedError = {
  instructionIndex: number;
  programId: string;
  programName: string;
  errorCode: string;
  errorCodeDecimal: number;
  errorName: string | null;
  errorDescription: string | null;
  category: string | null;
  debugTip: string | null;
  pattern: {
    category: string;
    likelyReason: string;
    quickFix: string;
    severity: string;
  } | null;
  rawError: unknown;
};

/**
 * Execution flow for a single instruction
 */
export type InstructionExecution = {
  index: number;
  programId: string;
  programName: string;
  status: "success" | "failed";
  error?: string;
  computeUsed?: number;
};

/**
 * Structured program log entry
 */
export type ProgramLog = {
  program: string;
  message: string;
  level: "info" | "error" | "data";
};

/**
 * Parsed log messages with execution flow and structured logs
 */
export type ParsedLogs = {
  executionFlow: InstructionExecution[];
  programLogs: ProgramLog[];
};

/**
 * Get human-readable program name from address
 */
function getProgramName(programId: string): string {
  const mappings = publicKeyMappings as Record<string, string>;
  return mappings[programId] || programId;
}

/**
 * Enrich error data with human-readable information
 */
export function enrichErrorData(
  error: unknown,
  instructions: Instruction[],
  logs?: string[]
): EnrichedError | null {
  try {
    // Parse InstructionError format: { InstructionError: [index, { Custom: code }] }
    if (
      typeof error === "object" &&
      error !== null &&
      "InstructionError" in error
    ) {
      const instrError = (error as Record<string, unknown>).InstructionError;

      if (Array.isArray(instrError) && instrError.length === 2) {
        const instructionIndex = instrError[0] as number;
        const errorDetail = instrError[1] as Record<string, unknown>;

        // Extract custom error code
        let errorCode = 0;
        if (
          errorDetail &&
          typeof errorDetail === "object" &&
          "Custom" in errorDetail
        ) {
          errorCode = errorDetail.Custom as number;
        }

        // Get the program that failed
        const instruction = instructions[instructionIndex];
        const programId = instruction?.programId?.toString() || "Unknown";
        const programName = getProgramName(programId);

        // Resolve error code to human-readable name
        const resolved = resolveErrorCode(programId, errorCode);

        // Match error pattern from logs if available
        const pattern = logs ? matchErrorPattern(logs.join(" ")) : null;

        return {
          instructionIndex,
          programId,
          programName,
          errorCode: `0x${errorCode.toString(16)}`,
          errorCodeDecimal: errorCode,
          errorName: resolved?.name || null,
          errorDescription: resolved?.description || null,
          category: resolved?.category || null,
          debugTip: resolved?.debugTip || null,
          pattern: pattern
            ? {
                category: pattern.category,
                likelyReason: pattern.likelyReason,
                quickFix: pattern.quickFix,
                severity: pattern.severity,
              }
            : null,
          rawError: error,
        };
      }
    }

    return null;
  } catch (err) {
    console.error("Error enriching error data:", err);
    return null;
  }
}

/**
 * Parse log messages to extract execution flow and structured logs
 */
export function parseLogMessages(
  logs: string[],
  _instructions: Instruction[]
): ParsedLogs {
  const executionFlow: InstructionExecution[] = [];
  const programLogs: ProgramLog[] = [];

  try {
    // Regular expressions for log parsing
    const invokePattern = /Program (\w+) invoke \[(\d+)\]/;
    const successPattern = /Program (\w+) success/;
    const failedPattern = /Program (\w+) failed: (.+)/;
    const consumedPattern =
      /Program (\w+) consumed (\d+) of (\d+) compute units/;
    const logPattern = /Program log: (.+)/;
    const dataPattern = /Program data: (.+)/;

    // Track program invocation stack
    const invocationStack: Array<{
      programId: string;
      index: number;
      stackHeight: number;
    }> = [];

    // Map top-level instructions (stackHeight 1) to their indices
    let topLevelInstructionIndex = -1;

    for (const log of logs) {
      // Program invocation
      const invokeMatch = log.match(invokePattern);
      if (invokeMatch?.[1] && invokeMatch[2]) {
        const programId = invokeMatch[1];
        const stackHeight = invokeMatch[2];
        const height = Number.parseInt(stackHeight, 10);

        // Track top-level instructions only (stackHeight === 1)
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

      // Compute units consumed
      const consumedMatch = log.match(consumedPattern);
      if (consumedMatch?.[1] && consumedMatch[2]) {
        const programId = consumedMatch[1];
        const consumed = consumedMatch[2];
        const lastFlow = executionFlow.at(-1);
        if (lastFlow && lastFlow.programId === programId) {
          lastFlow.computeUsed = Number.parseInt(consumed, 10);
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
  } catch (err) {
    console.error("Error parsing log messages:", err);
  }

  return {
    executionFlow,
    programLogs,
  };
}

/**
 * Add program names to instructions
 */
export function enrichInstructions(instructions: Instruction[]): Array<{
  programId: string;
  programName: string;
  accounts: string[];
  data?: string;
}> {
  try {
    return instructions.map((instruction) => {
      const programId = instruction.programId?.toString() || "Unknown";
      return {
        programId,
        programName: getProgramName(programId),
        accounts: instruction.accounts?.map((acc) => acc.toString()) || [],
        data: instruction.data ? instruction.data.toString() : undefined,
      };
    });
  } catch (err) {
    console.error("Error enriching instructions:", err);
    return [];
  }
}
