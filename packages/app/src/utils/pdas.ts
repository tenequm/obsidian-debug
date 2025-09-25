/**
 * PDA Helper Functions for Obsidian Protocol
 * These utility functions help derive Program Derived Addresses (PDAs)
 */

import { getAddressEncoder, getU64Encoder, getProgramDerivedAddress, type Address } from 'gill'
import { OBSIDIANPROTOCOL_PROGRAM_ADDRESS } from '../generated/programs'

/**
 * Derives the PDA for attestation accounts
 * @param entityType - "human" or "agent"
 * @param owner - The owner's public key
 * @returns [PDA address, bump seed]
 */
export async function getAttestationPda({
  entityType,
  owner,
}: {
  entityType: 'human' | 'agent'
  owner: Address
}): Promise<[Address, number]> {
  const seeds = [
    new TextEncoder().encode(entityType === 'human' ? 'attestation_human' : 'attestation_agent'),
    getAddressEncoder().encode(owner),
  ]

  const [pda, bump] = await getProgramDerivedAddress({
    seeds,
    programAddress: OBSIDIANPROTOCOL_PROGRAM_ADDRESS,
  })

  return [pda, bump]
}

/**
 * Derives the PDA for loan account
 * @param borrower - The borrower's public key
 * @param loanId - The loan ID as bigint
 * @returns [PDA address, bump seed]
 */
export async function getLoanAccountPda({
  borrower,
  loanId,
}: {
  borrower: Address
  loanId: number | bigint
}): Promise<[Address, number]> {
  const seeds = [
    new TextEncoder().encode('loan'),
    getAddressEncoder().encode(borrower),
    getU64Encoder().encode(BigInt(loanId)),
  ]

  const [pda, bump] = await getProgramDerivedAddress({
    seeds,
    programAddress: OBSIDIANPROTOCOL_PROGRAM_ADDRESS,
  })

  return [pda, bump]
}
