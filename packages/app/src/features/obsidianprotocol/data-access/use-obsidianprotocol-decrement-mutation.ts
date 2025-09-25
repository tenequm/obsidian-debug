import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useObsidianprotocolAccountsInvalidate } from './use-obsidianprotocol-accounts-invalidate'

interface ObsidianprotocolAccount {
  address: string
  [key: string]: unknown
}

export function useObsidianprotocolDecrementMutation({
  obsidianprotocol,
}: {
  obsidianprotocol: ObsidianprotocolAccount
}) {
  const invalidateAccounts = useObsidianprotocolAccountsInvalidate()

  return useMutation({
    mutationFn: async () => {
      // TODO: Implement decrement
      toast.info('Decrement not yet implemented')
      return null
    },
    onSuccess: async () => {
      await invalidateAccounts()
    },
  })
}
