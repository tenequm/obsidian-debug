/**
 * Transaction Parser
 *
 * Utilities for parsing Solana transaction data and extracting error information
 */

import { Connection, VersionedTransactionResponse } from '@solana/web3.js'

export interface ParsedTransactionError {
  signature: string
  errorMessage: string | null
  errorCode: string | null
  programId: string | null
  logs: string[]
  slot: number
  blockTime: number | null
}

/**
 * Fetch and parse a transaction from the Solana blockchain
 *
 * @param signature - Transaction signature to fetch
 * @param rpcEndpoint - Solana RPC endpoint URL
 * @returns Parsed transaction error data
 */
export async function parseTransaction(signature: string, rpcEndpoint: string): Promise<ParsedTransactionError> {
  const connection = new Connection(rpcEndpoint, 'confirmed')

  // Fetch transaction
  const transaction = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  })

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  return extractErrorInfo(transaction, signature)
}

/**
 * Extract error information from a transaction response
 */
function extractErrorInfo(transaction: VersionedTransactionResponse, signature: string): ParsedTransactionError {
  const logs = transaction.meta?.logMessages || []
  const error = transaction.meta?.err

  let errorMessage: string | null = null
  let errorCode: string | null = null
  let programId: string | null = null

  if (error) {
    // Extract error message from transaction metadata
    if (typeof error === 'object') {
      errorMessage = JSON.stringify(error)

      // Try to extract custom program error code
      if ('InstructionError' in error) {
        const instructionError = error.InstructionError as [number, { Custom?: number }]
        if (instructionError[1] && 'Custom' in instructionError[1]) {
          errorCode = `0x${instructionError[1].Custom?.toString(16)}`
        }
      }
    } else {
      errorMessage = String(error)
    }
  }

  // Extract program ID from logs if available
  const programLogMatch = logs.find((log) => log.includes('Program') && log.includes('invoke'))
  if (programLogMatch) {
    const match = programLogMatch.match(/Program (\w+) invoke/)
    if (match) {
      programId = match[1]
    }
  }

  return {
    signature,
    errorMessage,
    errorCode,
    programId,
    logs,
    slot: transaction.slot,
    blockTime: transaction.blockTime ?? null,
  }
}

/**
 * Validate a transaction signature format
 */
export function isValidSignature(signature: string): boolean {
  // Solana signatures are base58 encoded and typically 87-88 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/
  return base58Regex.test(signature)
}
