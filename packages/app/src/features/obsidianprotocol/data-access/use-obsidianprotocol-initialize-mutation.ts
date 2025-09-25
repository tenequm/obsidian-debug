import { useSolana } from '@/components/solana/use-solana'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useObsidianprotocolInitializeMutation() {
  const { cluster } = useSolana()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // TODO: Implement attestation creation
      toast.info('Attestation creation not yet implemented')
      return null
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['obsidianprotocol', 'accounts', { cluster }] })
    },
    onError: () => toast.error('Failed to run program'),
  })
}
