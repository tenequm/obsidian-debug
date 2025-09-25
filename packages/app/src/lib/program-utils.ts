import { Program, AnchorProvider, Idl, BN, Wallet } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import IDL from '@/../../../anchor/target/idl/obsidianprotocol.json'

export const PROGRAM_ID = new PublicKey('Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe')

export interface AttestationAccount {
  entityType: { human: object } | { agent: object }
  owner: PublicKey
  creditScore: number
  createdAt: BN
  expiresAt: BN
  frameworkType: number
  bump: number
}

export interface LoanAccount {
  borrower: PublicKey
  attestation: PublicKey
  amount: BN
  loanId: BN
  status: { active: object } | { repaid: object } | { defaulted: object }
  createdAt: BN
  dueDate: BN
}

export function getProgram(connection: Connection, wallet: Wallet): Program {
  const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())
  return new Program(IDL as Idl, provider)
}

export function getAttestationPDA(owner: PublicKey, entityType: 'human' | 'agent'): [PublicKey, number] {
  const typeBuffer = Buffer.from(entityType)
  return PublicKey.findProgramAddressSync([Buffer.from('attestation'), owner.toBuffer(), typeBuffer], PROGRAM_ID)
}

export function getLoanPDA(borrower: PublicKey, loanId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('loan'), borrower.toBuffer(), loanId.toArrayLike(Buffer, 'le', 8)],
    PROGRAM_ID,
  )
}

export async function createHumanAttestation(
  program: Program,
  owner: PublicKey,
  creditScore: number,
  verifiedIncome: BN,
  employmentStatus: string,
) {
  const [attestationPDA] = getAttestationPDA(owner, 'human')

  return await program.methods
    .createHumanAttestation(creditScore, verifiedIncome, employmentStatus)
    .accounts({
      owner,
      attestation: attestationPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export async function createAgentAttestation(
  program: Program,
  owner: PublicKey,
  creditScore: number,
  totalRevenue: BN,
  successRate: number,
  operationalDays: number,
  frameworkType: number,
) {
  const [attestationPDA] = getAttestationPDA(owner, 'agent')

  return await program.methods
    .createAgentAttestation(creditScore, totalRevenue, successRate, operationalDays, frameworkType)
    .accounts({
      owner,
      attestation: attestationPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export async function requestLoan(
  program: Program,
  borrower: PublicKey,
  attestation: PublicKey,
  amount: BN,
  loanId: BN,
) {
  const [loanPDA] = getLoanPDA(borrower, loanId)

  return await program.methods
    .requestLoan(amount, loanId)
    .accounts({
      borrower,
      loanAccount: loanPDA,
      attestation,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export async function fetchAttestation(
  program: Program,
  attestationPDA: PublicKey,
): Promise<AttestationAccount | null> {
  try {
    // TODO: Implement when attestation account is in IDL
    // return await program.account.attestation.fetch(attestationPDA)
    return null
  } catch (error) {
    console.error('Error fetching attestation:', error)
    return null
  }
}

export async function fetchLoan(program: Program, loanPDA: PublicKey): Promise<LoanAccount | null> {
  try {
    // TODO: Implement when loan account is in IDL
    // return await program.account.loanAccount.fetch(loanPDA)
    return null
  } catch (error) {
    console.error('Error fetching loan:', error)
    return null
  }
}

export const FRAMEWORK_TYPES = {
  ElizaOS: 0,
  AI16Z: 1,
  Custom: 2,
} as const

export function getFrameworkName(type: number): string {
  const frameworks = Object.entries(FRAMEWORK_TYPES)
  const found = frameworks.find(([, value]) => value === type)
  return found ? found[0] : 'Unknown'
}
