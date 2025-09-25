import { Button } from '@/components/ui/button'

import { useObsidianprotocolInitializeMutation } from '@/features/obsidianprotocol/data-access/use-obsidianprotocol-initialize-mutation'

export function ObsidianprotocolUiButtonInitialize() {
  const mutationInitialize = useObsidianprotocolInitializeMutation()

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Obsidianprotocol {mutationInitialize.isPending && '...'}
    </Button>
  )
}
