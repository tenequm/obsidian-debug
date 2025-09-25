import { useQueryClient } from '@tanstack/react-query'
import { useObsidianprotocolAccountsQueryKey } from './use-obsidianprotocol-accounts-query-key'

export function useObsidianprotocolAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useObsidianprotocolAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}
