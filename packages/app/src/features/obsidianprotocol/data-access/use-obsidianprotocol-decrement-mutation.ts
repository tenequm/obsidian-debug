import { ObsidianprotocolAccount, getDecrementInstruction } from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { useWalletTransactionSignAndSend } from '@/components/solana/use-wallet-transaction-sign-and-send'
import { toastTx } from '@/components/toast-tx'
import { useObsidianprotocolAccountsInvalidate } from './use-obsidianprotocol-accounts-invalidate'

export function useObsidianprotocolDecrementMutation({
  obsidianprotocol,
}: {
  obsidianprotocol: ObsidianprotocolAccount
}) {
  const invalidateAccounts = useObsidianprotocolAccountsInvalidate()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () =>
      await signAndSend(getDecrementInstruction({ obsidianprotocol: obsidianprotocol.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}
