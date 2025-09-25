import { ObsidianprotocolAccount, getCloseInstruction } from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { useWalletTransactionSignAndSend } from '@/components/solana/use-wallet-transaction-sign-and-send'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { toastTx } from '@/components/toast-tx'
import { useObsidianprotocolAccountsInvalidate } from './use-obsidianprotocol-accounts-invalidate'

export function useObsidianprotocolCloseMutation({ obsidianprotocol }: { obsidianprotocol: ObsidianprotocolAccount }) {
  const invalidateAccounts = useObsidianprotocolAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async () => {
      return await signAndSend(
        getCloseInstruction({ payer: signer, obsidianprotocol: obsidianprotocol.address }),
        signer,
      )
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}
