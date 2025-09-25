import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill'
import {
  fetchObsidianprotocol,
  getCloseInstruction,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '../src'
// @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
import { loadKeypairSignerFromFile } from 'gill/node'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('obsidianprotocol', () => {
  let payer: KeyPairSigner
  let obsidianprotocol: KeyPairSigner

  beforeAll(async () => {
    obsidianprotocol = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
  })

  it('Initialize Obsidianprotocol', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getInitializeInstruction({ payer: payer, obsidianprotocol: obsidianprotocol })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSER
    const currentObsidianprotocol = await fetchObsidianprotocol(rpc, obsidianprotocol.address)
    expect(currentObsidianprotocol.data.count).toEqual(0)
  })

  it('Increment Obsidianprotocol', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({
      obsidianprotocol: obsidianprotocol.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchObsidianprotocol(rpc, obsidianprotocol.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Increment Obsidianprotocol Again', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({ obsidianprotocol: obsidianprotocol.address })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchObsidianprotocol(rpc, obsidianprotocol.address)
    expect(currentCount.data.count).toEqual(2)
  })

  it('Decrement Obsidianprotocol', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getDecrementInstruction({
      obsidianprotocol: obsidianprotocol.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchObsidianprotocol(rpc, obsidianprotocol.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Set obsidianprotocol value', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getSetInstruction({ obsidianprotocol: obsidianprotocol.address, value: 42 })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchObsidianprotocol(rpc, obsidianprotocol.address)
    expect(currentCount.data.count).toEqual(42)
  })

  it('Set close the obsidianprotocol account', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getCloseInstruction({
      payer: payer,
      obsidianprotocol: obsidianprotocol.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    try {
      await fetchObsidianprotocol(rpc, obsidianprotocol.address)
    } catch (e) {
      if (!isSolanaError(e)) {
        throw new Error(`Unexpected error: ${e}`)
      }
      expect(e.message).toEqual(`Account not found at address: ${obsidianprotocol.address}`)
    }
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
async function sendAndConfirm({ ix, payer }: { ix: Instruction; payer: KeyPairSigner }) {
  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  })
  const signedTransaction = await signTransactionMessageWithSigners(tx)
  return await sendAndConfirmTransaction(signedTransaction)
}
