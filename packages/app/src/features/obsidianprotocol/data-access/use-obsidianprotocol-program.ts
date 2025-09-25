import { PROGRAM_ID } from '@/lib/program-utils'
import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { useClusterVersion } from '@/features/cluster/data-access/use-cluster-version'
import { address } from 'gill'

export function useObsidianprotocolProgram() {
  const { client, cluster } = useSolana()
  const query = useClusterVersion()

  return useQuery({
    retry: false,
    queryKey: ['get-program-account', { cluster, clusterVersion: query.data }],
    queryFn: () => client.rpc.getAccountInfo(address(PROGRAM_ID.toString())).send(),
  })
}
