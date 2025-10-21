/**
 * Common Solana Error Patterns
 *
 * Library of known error codes and their explanations across major Solana programs
 */

export interface ErrorPattern {
  errorCode: string
  name: string
  program: string
  explanation: string
  commonCauses: string[]
  suggestedFixes: string[]
}

/**
 * Token Program Error Patterns
 */
const TOKEN_PROGRAM_ERRORS: ErrorPattern[] = [
  {
    errorCode: '0x1',
    name: 'InsufficientFunds',
    program: 'Token Program',
    explanation: 'The account does not have enough tokens to complete the operation',
    commonCauses: ['Trying to transfer more tokens than available', 'Insufficient balance for transaction fees'],
    suggestedFixes: [
      'Check account balance before transfer',
      'Reduce transfer amount',
      'Ensure wallet has sufficient SOL for fees',
    ],
  },
  {
    errorCode: '0x0',
    name: 'InvalidMint',
    program: 'Token Program',
    explanation: 'The provided mint address is not valid or does not exist',
    commonCauses: ['Incorrect mint address', 'Mint account not initialized', 'Wrong network (mainnet vs devnet)'],
    suggestedFixes: [
      'Verify mint address is correct',
      'Check you are on the correct network',
      'Ensure mint account is initialized',
    ],
  },
]

/**
 * System Program Error Patterns
 */
const SYSTEM_PROGRAM_ERRORS: ErrorPattern[] = [
  {
    errorCode: '0x1',
    name: 'AccountAlreadyInUse',
    program: 'System Program',
    explanation: 'The account is already being used and cannot be created',
    commonCauses: ['Trying to create account that already exists', 'Account address collision'],
    suggestedFixes: ['Use a different account address', 'Check if account already exists before creating'],
  },
]

/**
 * Common DEX/AMM Error Patterns
 */
const DEX_ERRORS: ErrorPattern[] = [
  {
    errorCode: '0x1772',
    name: 'SlippageExceeded',
    program: 'Jupiter/Raydium',
    explanation: 'Price moved beyond the specified slippage tolerance during swap',
    commonCauses: ['High market volatility', 'Slippage tolerance set too low', 'Large trade size for liquidity pool'],
    suggestedFixes: [
      'Increase slippage tolerance (e.g., from 0.5% to 1-2%)',
      'Reduce trade size',
      'Wait for market to stabilize',
      'Try splitting large trades into smaller chunks',
    ],
  },
  {
    errorCode: '0x1771',
    name: 'InsufficientLiquidity',
    program: 'AMM',
    explanation: 'Not enough liquidity in the pool to complete the swap',
    commonCauses: ['Pool has low liquidity', 'Trade size too large relative to pool'],
    suggestedFixes: [
      'Reduce trade amount',
      'Use a different liquidity pool',
      'Try Jupiter aggregator for better routing',
    ],
  },
]

/**
 * All error patterns combined
 */
export const ERROR_PATTERNS: ErrorPattern[] = [...TOKEN_PROGRAM_ERRORS, ...SYSTEM_PROGRAM_ERRORS, ...DEX_ERRORS]

/**
 * Find an error pattern by error code
 */
export function findErrorPattern(errorCode: string): ErrorPattern | undefined {
  return ERROR_PATTERNS.find((pattern) => pattern.errorCode === errorCode)
}

/**
 * Search error patterns by program name
 */
export function findErrorsByProgram(programName: string): ErrorPattern[] {
  return ERROR_PATTERNS.filter((pattern) => pattern.program.toLowerCase().includes(programName.toLowerCase()))
}

/**
 * Get a human-readable summary of an error
 */
export function getErrorSummary(errorCode: string): string {
  const pattern = findErrorPattern(errorCode)
  if (pattern) {
    return `${pattern.name} (${pattern.program}): ${pattern.explanation}`
  }
  return `Unknown error code: ${errorCode}`
}
