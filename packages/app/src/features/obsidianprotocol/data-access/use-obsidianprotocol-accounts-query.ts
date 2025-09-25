import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { getObsidianprotocolProgramAccounts } from '@project/anchor'
import { useObsidianprotocolAccountsQueryKey } from './use-obsidianprotocol-accounts-query-key'

export function useObsidianprotocolAccountsQuery() {
  const { client } = useSolana()

  return useQuery({
    queryKey: useObsidianprotocolAccountsQueryKey(),
    queryFn: async () => await getObsidianprotocolProgramAccounts(client.rpc),
  })
}
