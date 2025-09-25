import { ObsidianprotocolAccount, getIncrementInstruction } from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { toastTx } from '@/components/toast-tx'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { useWalletTransactionSignAndSend } from '@/components/solana/use-wallet-transaction-sign-and-send'
import { useObsidianprotocolAccountsInvalidate } from './use-obsidianprotocol-accounts-invalidate'

export function useObsidianprotocolIncrementMutation({
  obsidianprotocol,
}: {
  obsidianprotocol: ObsidianprotocolAccount
}) {
  const invalidateAccounts = useObsidianprotocolAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async () =>
      await signAndSend(getIncrementInstruction({ obsidianprotocol: obsidianprotocol.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}
