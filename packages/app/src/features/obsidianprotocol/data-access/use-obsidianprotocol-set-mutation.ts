import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useObsidianprotocolAccountsInvalidate } from './use-obsidianprotocol-accounts-invalidate'

interface ObsidianprotocolAccount {
  address: string
  [key: string]: unknown
}

export function useObsidianprotocolSetMutation({ obsidianprotocol }: { obsidianprotocol: ObsidianprotocolAccount }) {
  const invalidateAccounts = useObsidianprotocolAccountsInvalidate()

  return useMutation({
    mutationFn: async ({ value }: { value: number }) => {
      // TODO: Implement set value
      toast.info(`Set value to ${value} not yet implemented`)
      return null
    },
    onSuccess: async () => {
      await invalidateAccounts()
    },
  })
}
