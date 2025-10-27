/**
 * Program metadata enrichment utilities
 * Fetches additional context about Solana programs from on-chain data
 */

import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

export type ProgramMetadata = {
  programId: string;
  isUpgradeable: boolean;
  upgradeAuthority: string | null;
  programDataAccount: string | null;
};

/**
 * Fetch metadata about a Solana program
 * @param connection - Solana RPC connection
 * @param programId - Program address to fetch metadata for
 * @returns Program metadata including upgrade authority if upgradeable
 */
export async function fetchProgramMetadata(
  connection: Connection,
  programId: string
): Promise<ProgramMetadata | null> {
  try {
    const pubkey = new PublicKey(programId);
    const accountInfo = await connection.getAccountInfo(pubkey);

    if (!accountInfo) {
      return null;
    }

    // Check if it's an upgradeable BPF program
    const isUpgradeable =
      accountInfo.owner.toBase58() ===
      "BPFLoaderUpgradeab1e11111111111111111111111";

    if (!isUpgradeable) {
      return {
        programId,
        isUpgradeable: false,
        upgradeAuthority: null,
        programDataAccount: null,
      };
    }

    // For upgradeable programs, parse the program data account from account data
    // The first 4 bytes are the program type (1 for program account)
    // Bytes 4-36 are the program data account address
    if (accountInfo.data.length >= 36) {
      const programDataBytes = accountInfo.data.slice(4, 36);
      const programDataAccount = new PublicKey(programDataBytes).toBase58();

      // Fetch the program data account to get upgrade authority
      const programDataInfo = await connection.getAccountInfo(
        new PublicKey(programDataAccount)
      );

      if (programDataInfo && programDataInfo.data.length >= 45) {
        // Program data account structure:
        // 0-4: Type (2 for program data)
        // 4-8: Slot
        // 8-12: Option for upgrade authority (1 = Some, 0 = None)
        // 12-44: Upgrade authority pubkey (if option = 1)
        const hasAuthority = programDataInfo.data[8] === 1;
        const upgradeAuthority = hasAuthority
          ? new PublicKey(programDataInfo.data.slice(12, 44)).toBase58()
          : null;

        return {
          programId,
          isUpgradeable: true,
          upgradeAuthority,
          programDataAccount,
        };
      }

      return {
        programId,
        isUpgradeable: true,
        upgradeAuthority: null,
        programDataAccount,
      };
    }

    return {
      programId,
      isUpgradeable: true,
      upgradeAuthority: null,
      programDataAccount: null,
    };
  } catch (error) {
    console.error(`Error fetching program metadata for ${programId}:`, error);
    return null;
  }
}

/**
 * Extract unique programs that were called (CPIs) from execution flow
 * @param executionFlow - Array of instruction execution results
 * @returns Array of unique programs with IDs and names
 */
export function extractCalledPrograms(
  executionFlow: Array<{ programId: string; programName: string }>
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
