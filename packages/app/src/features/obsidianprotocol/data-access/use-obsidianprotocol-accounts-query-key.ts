import { useSolana } from '@/components/solana/use-solana'

export function useObsidianprotocolAccountsQueryKey() {
  const { cluster } = useSolana()

  return ['obsidianprotocol', 'accounts', { cluster }]
}
