import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useObsidianprotocolAccountsInvalidate } from './use-obsidianprotocol-accounts-invalidate'

interface ObsidianprotocolAccount {
  address: string
  [key: string]: unknown
}

export function useObsidianprotocolIncrementMutation({
  obsidianprotocol,
}: {
  obsidianprotocol: ObsidianprotocolAccount
}) {
  const invalidateAccounts = useObsidianprotocolAccountsInvalidate()

  return useMutation({
    mutationFn: async () => {
      // TODO: Implement increment
      toast.info('Increment not yet implemented')
      return null
    },
    onSuccess: async () => {
      await invalidateAccounts()
    },
  })
}
