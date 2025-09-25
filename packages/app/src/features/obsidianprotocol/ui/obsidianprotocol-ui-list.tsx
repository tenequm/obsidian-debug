import { ObsidianprotocolUiCard } from './obsidianprotocol-ui-card'
import { useObsidianprotocolAccountsQuery } from '@/features/obsidianprotocol/data-access/use-obsidianprotocol-accounts-query'

export function ObsidianprotocolUiList() {
  const obsidianprotocolAccountsQuery = useObsidianprotocolAccountsQuery()

  if (obsidianprotocolAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!obsidianprotocolAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No accounts</h2>
        No accounts found. Initialize one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {obsidianprotocolAccountsQuery.data?.map((obsidianprotocol) => (
        <ObsidianprotocolUiCard key={obsidianprotocol.address} obsidianprotocol={obsidianprotocol} />
      ))}
    </div>
  )
}
