import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
  lamports,
} from 'gill'
import {
  fetchAttestation,
  fetchLoanAccount,
  getCreateHumanAttestationInstruction,
  getCreateAgentAttestationInstruction,
  getRequestLoanInstruction,
} from '../../src/generated'
// @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
import { loadKeypairSignerFromFile } from 'gill/node'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({
  urlOrMoniker: process.env.ANCHOR_PROVIDER_URL!,
})

describe('obsidianprotocol', () => {
  let payer: KeyPairSigner
  let humanUser: KeyPairSigner
  let agentUser: KeyPairSigner

  beforeAll(async () => {
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
    humanUser = await generateKeyPairSigner()
    agentUser = await generateKeyPairSigner()

    // Airdrop SOL to test accounts for rent and transaction fees
    await rpc.requestAirdrop(humanUser.address, lamports(1000000000n)).send() // 1 SOL
    await rpc.requestAirdrop(agentUser.address, lamports(1000000000n)).send() // 1 SOL
  })

  describe('Human Credit Attestation', () => {
    let humanAttestation: KeyPairSigner

    it('Create human attestation with valid credit score', async () => {
      // ARRANGE
      expect.assertions(5)
      const creditScore = 720
      const verifiedIncome = 75000n * 1000000000n // 75k SOL in lamports
      const employmentStatus = 'employed'
      humanAttestation = await generateKeyPairSigner()

      const ix = getCreateHumanAttestationInstruction({
        owner: humanUser,
        attestation: humanAttestation,
        creditScore,
        verifiedIncome,
        employmentStatus,
      })

      // ACT
      await sendAndConfirm({ ix, payer: humanUser, signers: [humanAttestation] })

      // ASSERT
      const attestation = await fetchAttestation(rpc, humanAttestation.address)
      expect(attestation.data.entityType).toEqual({ __kind: 'Human' })
      expect(attestation.data.owner).toEqual(humanUser.address)
      expect(attestation.data.creditScore).toEqual(creditScore)
      expect(attestation.data.frameworkType).toEqual(0) // Not applicable for humans
      expect(attestation.data.createdAt).toBeGreaterThan(0n)
    })

    it('Request loan with human attestation', async () => {
      // ARRANGE
      expect.assertions(5)
      const loanAmount = 10000n * 1000000000n // 10k SOL in lamports
      const loanId = 1n
      const loanAccount = await generateKeyPairSigner()

      const ix = getRequestLoanInstruction({
        borrower: humanUser,
        loanAccount,
        attestation: humanAttestation.address,
        amount: loanAmount,
        loanId,
      })

      // ACT
      await sendAndConfirm({ ix, payer: humanUser, signers: [loanAccount] })

      // ASSERT
      const loan = await fetchLoanAccount(rpc, loanAccount.address)
      expect(loan.data.borrower).toEqual(humanUser.address)
      expect(loan.data.amount).toEqual(loanAmount)
      expect(loan.data.creditScore).toEqual(720)
      expect(loan.data.status).toEqual({ __kind: 'Requested' })
      expect(loan.data.entityType).toEqual({ __kind: 'Human' })
    })
  })

  describe('Agent Credit Attestation', () => {
    let agentAttestation: KeyPairSigner

    it('Create agent attestation with ElizaOS framework', async () => {
      // ARRANGE
      expect.assertions(6)
      const creditScore = 680
      const totalRevenue = 150000n * 1000000000n // 150k SOL in lamports
      const successRate = 85
      const operationalDays = 120
      const frameworkType = 1 // ElizaOS
      agentAttestation = await generateKeyPairSigner()

      const ix = getCreateAgentAttestationInstruction({
        owner: agentUser,
        attestation: agentAttestation,
        creditScore,
        totalRevenue,
        successRate,
        operationalDays,
        frameworkType,
      })

      // ACT
      await sendAndConfirm({ ix, payer: agentUser, signers: [agentAttestation] })

      // ASSERT
      const attestation = await fetchAttestation(rpc, agentAttestation.address)
      expect(attestation.data.entityType).toEqual({ __kind: 'Agent' })
      expect(attestation.data.owner).toEqual(agentUser.address)
      expect(attestation.data.creditScore).toEqual(creditScore)
      expect(attestation.data.frameworkType).toEqual(frameworkType)
      expect(attestation.data.createdAt).toBeGreaterThan(0n)
      // Agent attestations expire in 30 days
      expect(attestation.data.expiresAt).toBeGreaterThan(attestation.data.createdAt)
    })

    it('Create agent attestation with AI16Z framework', async () => {
      // ARRANGE
      const ai16zAgent = await generateKeyPairSigner()
      const creditScore = 750
      const totalRevenue = 250000n * 1000000000n // 250k SOL
      const successRate = 92
      const operationalDays = 200
      const frameworkType = 2 // AI16Z
      const ai16zAttestation = await generateKeyPairSigner()

      // Airdrop SOL to AI16Z agent
      await rpc.requestAirdrop(ai16zAgent.address, lamports(1000000000n)).send()

      const ix = getCreateAgentAttestationInstruction({
        owner: ai16zAgent,
        attestation: ai16zAttestation,
        creditScore,
        totalRevenue,
        successRate,
        operationalDays,
        frameworkType,
      })

      // ACT
      await sendAndConfirm({ ix, payer: ai16zAgent, signers: [ai16zAttestation] })

      // ASSERT
      const attestation = await fetchAttestation(rpc, ai16zAttestation.address)
      expect(attestation.data.frameworkType).toEqual(2) // AI16Z
      expect(attestation.data.creditScore).toEqual(750)
    })

    it('Request loan with agent attestation (zero collateral)', async () => {
      // ARRANGE
      expect.assertions(5)
      const loanAmount = 25000n * 1000000000n // 25k SOL - higher than human due to good credit
      const loanId = 2n
      const loanAccount = await generateKeyPairSigner()

      const ix = getRequestLoanInstruction({
        borrower: agentUser,
        loanAccount,
        attestation: agentAttestation.address,
        amount: loanAmount,
        loanId,
      })

      // ACT
      await sendAndConfirm({ ix, payer: agentUser, signers: [loanAccount] })

      // ASSERT
      const loan = await fetchLoanAccount(rpc, loanAccount.address)
      expect(loan.data.borrower).toEqual(agentUser.address)
      expect(loan.data.amount).toEqual(loanAmount)
      expect(loan.data.creditScore).toEqual(680)
      expect(loan.data.status).toEqual({ __kind: 'Requested' })
      expect(loan.data.entityType).toEqual({ __kind: 'Agent' })
    })
  })

  describe('Error Cases', () => {
    it('Should fail to request loan without attestation', async () => {
      // ARRANGE
      const noAttestationUser = await generateKeyPairSigner()
      const fakeAttestation = await generateKeyPairSigner() // Not initialized
      const loanAccount = await generateKeyPairSigner()

      // Airdrop SOL for transaction
      await rpc.requestAirdrop(noAttestationUser.address, lamports(1000000000n)).send()

      const ix = getRequestLoanInstruction({
        borrower: noAttestationUser,
        loanAccount,
        attestation: fakeAttestation.address,
        amount: 1000n * 1000000000n,
        loanId: 999n,
      })

      // ACT & ASSERT
      expect.assertions(1)
      try {
        await sendAndConfirm({ ix, payer: noAttestationUser, signers: [loanAccount] })
      } catch (e) {
        if (!isSolanaError(e)) {
          throw new Error(`Unexpected error: ${e}`)
        }
        expect(e.message).toContain('AccountNotInitialized') // Attestation doesn't exist
      }
    })

    it('Should fail duplicate attestation creation', async () => {
      // ARRANGE - Try to create attestation on same account
      const existingAttestation = await generateKeyPairSigner()
      const creditScore = 600
      const verifiedIncome = 50000n * 1000000000n
      const employmentStatus = 'employed'

      // Create first attestation
      const ix1 = getCreateHumanAttestationInstruction({
        owner: humanUser,
        attestation: existingAttestation,
        creditScore,
        verifiedIncome,
        employmentStatus,
      })

      await sendAndConfirm({ ix: ix1, payer: humanUser, signers: [existingAttestation] })

      // Try to create again on same account
      const duplicateUser = await generateKeyPairSigner()
      await rpc.requestAirdrop(duplicateUser.address, lamports(1000000000n)).send()

      const ix2 = getCreateHumanAttestationInstruction({
        owner: duplicateUser,
        attestation: existingAttestation, // Same account!
        creditScore: 800,
        verifiedIncome: 100000n * 1000000000n,
        employmentStatus: 'self_employed',
      })

      // ACT & ASSERT
      expect.assertions(1)
      try {
        await sendAndConfirm({ ix: ix2, payer: duplicateUser, signers: [existingAttestation] })
      } catch (e) {
        if (!isSolanaError(e)) {
          throw new Error(`Unexpected error: ${e}`)
        }
        expect(e.message).toContain('already in use') // Account already exists
      }
    })
  })
})

// Helper function to keep the tests DRY
let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined
async function getLatestBlockhash(): Promise<Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>> {
  if (latestBlockhash) {
    return latestBlockhash
  }
  return await rpc
    .getLatestBlockhash()
    .send()
    .then(({ value }) => value)
}

async function sendAndConfirm({
  ix,
  payer,
  signers = [],
}: {
  ix: Instruction
  payer: KeyPairSigner
  signers?: KeyPairSigner[]
}) {
  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  })
  const allSigners = [payer, ...signers]
  const signedTransaction = await signTransactionMessageWithSigners(tx, allSigners)
  return await sendAndConfirmTransaction(signedTransaction)
}
