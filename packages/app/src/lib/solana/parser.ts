/**
 * Transaction Parser - Stub Implementation
 */

export type ParsedTransactionError = {
  signature: string;
  errorMessage: string | null;
  logs: string[];
};

// biome-ignore lint/suspicious/useAwait: Stub function maintains async signature for future implementation
export async function parseTransaction(
  signature: string,
  _rpcEndpoint: string
): Promise<ParsedTransactionError> {
  return {
    signature,
    errorMessage: "Transaction parsing not yet implemented",
    logs: [],
  };
}

export function isValidSignature(signature: string): boolean {
  return signature.length > 0;
}
