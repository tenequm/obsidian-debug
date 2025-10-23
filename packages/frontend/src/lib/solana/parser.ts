/**
 * Transaction Parser - Fetches and analyzes failed Solana transactions
 */

import { Connection, type VersionedTransactionResponse } from "@solana/web3.js";
import { env } from "@/env";

export type ParsedTransactionError = {
  signature: string;
  errorMessage: string | null;
  errorObject: unknown;
  logs: string[];
  rawTransaction: VersionedTransactionResponse | null;
};

/**
 * Creates a Solana connection using Helius RPC endpoint
 */
function createConnection(): Connection {
  const apiKey = env.HELIUS_API_KEY;
  if (!apiKey) {
    throw new Error("HELIUS_API_KEY not found in environment variables");
  }

  const endpoint = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  return new Connection(endpoint, "confirmed");
}

/**
 * Fetches a transaction from Solana blockchain via Helius RPC
 */
export async function fetchTransaction(
  signature: string
): Promise<VersionedTransactionResponse | null> {
  const connection = createConnection();

  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });

  return tx;
}

/**
 * Extracts error information from a failed transaction
 */
export function extractError(
  tx: VersionedTransactionResponse | null,
  signature: string
): ParsedTransactionError {
  if (!tx) {
    return {
      signature,
      errorMessage: "Transaction not found",
      errorObject: null,
      logs: [],
      rawTransaction: null,
    };
  }

  const errorObject = tx.meta?.err ?? null;
  const logs = tx.meta?.logMessages ?? [];

  // Generate human-readable error message
  let errorMessage = "Transaction succeeded";
  if (errorObject) {
    errorMessage = JSON.stringify(errorObject);
  }

  return {
    signature,
    errorMessage,
    errorObject,
    logs,
    rawTransaction: tx,
  };
}

/**
 * Main entry point: fetches transaction and extracts error data
 */
export async function parseTransaction(
  signature: string
): Promise<ParsedTransactionError> {
  const tx = await fetchTransaction(signature);
  return extractError(tx, signature);
}

// Solana signatures are base58-encoded and typically 87-88 characters
const SOLANA_SIGNATURE_REGEX = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;

/**
 * Validates if a string is a valid Solana transaction signature
 */
export function isValidSignature(signature: string): boolean {
  return SOLANA_SIGNATURE_REGEX.test(signature.trim());
}
