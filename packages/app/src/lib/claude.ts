/**
 * Claude AI Integration
 *
 * Wrapper for Anthropic Claude API to analyze Solana transaction errors
 */

import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import type { ParsedTransactionError } from './solana/parser'
import { findErrorPattern, type ErrorPattern } from './solana/patterns'

export interface ErrorAnalysis {
  summary: string
  rootCause: string
  fixSteps: string[]
  codeExample?: string
}

/**
 * Analyze a transaction error using Claude AI
 *
 * @param transactionError - Parsed transaction error data
 * @param apiKey - Anthropic API key
 * @returns Detailed error analysis
 */
export async function analyzeTransactionError(
  transactionError: ParsedTransactionError,
  apiKey: string,
): Promise<ErrorAnalysis> {
  // Check if we have a known pattern first
  const knownPattern = transactionError.errorCode ? findErrorPattern(transactionError.errorCode) : null

  // Build context for Claude
  const context = buildAnalysisContext(transactionError, knownPattern)

  // Initialize Anthropic client
  const anthropic = createAnthropic({
    apiKey,
  })

  // Generate analysis using Claude
  const { text } = await generateText({
    model: anthropic('claude-3-5-haiku-20241022'), // Fast and cost-effective
    prompt: context,
    temperature: 0.3, // Lower temperature for more consistent analysis
    maxTokens: 1024,
  })

  // Parse Claude's response into structured format
  return parseAnalysisResponse(text)
}

/**
 * Build analysis context/prompt for Claude
 */
function buildAnalysisContext(error: ParsedTransactionError, knownPattern: ErrorPattern | null | undefined): string {
  let context = `You are an expert Solana blockchain developer debugging a failed transaction.

Transaction Signature: ${error.signature}
Error Message: ${error.errorMessage || 'No error message'}
Error Code: ${error.errorCode || 'No error code'}
Program ID: ${error.programId || 'Unknown'}

Transaction Logs:
${error.logs.join('\n')}
`

  if (knownPattern) {
    context += `\n\nKnown Error Pattern:
Name: ${knownPattern.name}
Program: ${knownPattern.program}
Explanation: ${knownPattern.explanation}
Common Causes: ${knownPattern.commonCauses.join(', ')}
`
  }

  context += `\n\nProvide a detailed analysis in the following format:

SUMMARY: [One sentence summary of what went wrong]

ROOT CAUSE: [Detailed explanation of why this error occurred]

FIX STEPS:
1. [First step to fix]
2. [Second step to fix]
3. [Additional steps as needed]

CODE EXAMPLE (if applicable):
[Provide corrected code snippet]

Be specific, actionable, and assume the developer is familiar with Solana but may not know this specific error.`

  return context
}

/**
 * Parse Claude's text response into structured format
 */
function parseAnalysisResponse(text: string): ErrorAnalysis {
  const lines = text.split('\n')
  let summary = ''
  let rootCause = ''
  const fixSteps: string[] = []
  let codeExample = ''

  let currentSection = ''

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('SUMMARY:')) {
      currentSection = 'summary'
      summary = trimmed.replace('SUMMARY:', '').trim()
    } else if (trimmed.startsWith('ROOT CAUSE:')) {
      currentSection = 'rootCause'
      rootCause = trimmed.replace('ROOT CAUSE:', '').trim()
    } else if (trimmed.startsWith('FIX STEPS:')) {
      currentSection = 'fixSteps'
    } else if (trimmed.startsWith('CODE EXAMPLE')) {
      currentSection = 'codeExample'
    } else if (trimmed) {
      // Add content to current section
      if (currentSection === 'summary' && !summary) {
        summary = trimmed
      } else if (currentSection === 'rootCause' && trimmed) {
        rootCause += (rootCause ? ' ' : '') + trimmed
      } else if (currentSection === 'fixSteps' && /^\d+\./.test(trimmed)) {
        fixSteps.push(trimmed.replace(/^\d+\.\s*/, ''))
      } else if (currentSection === 'codeExample' && trimmed) {
        codeExample += (codeExample ? '\n' : '') + line
      }
    }
  }

  // Fallback parsing if structured format not found
  if (!summary && text.length > 0) {
    const sentences = text.split('. ')
    summary = sentences[0] || 'Error analysis unavailable'
    rootCause = text
  }

  return {
    summary,
    rootCause,
    fixSteps: fixSteps.length > 0 ? fixSteps : ['Analysis not available'],
    codeExample: codeExample || undefined,
  }
}
