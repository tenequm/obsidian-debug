import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { useObsidianprotocolAccountsQueryKey } from './use-obsidianprotocol-accounts-query-key'

interface ObsidianprotocolAccount {
  address: string
  count: number
  [key: string]: unknown
}

export function useObsidianprotocolAccountsQuery() {
  useSolana() // Will be used when implementing account fetching

  return useQuery<ObsidianprotocolAccount[]>({
    queryKey: useObsidianprotocolAccountsQueryKey(),
    queryFn: async () => {
      // TODO: Implement fetching attestation accounts
      return [] as ObsidianprotocolAccount[]
    },
  })
}
