import { ObsidianprotocolAccount } from '@project/anchor'
import { Button } from '@/components/ui/button'

import { useObsidianprotocolSetMutation } from '@/features/obsidianprotocol/data-access/use-obsidianprotocol-set-mutation'

export function ObsidianprotocolUiButtonSet({ obsidianprotocol }: { obsidianprotocol: ObsidianprotocolAccount }) {
  const setMutation = useObsidianprotocolSetMutation({ obsidianprotocol })

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', obsidianprotocol.data.count.toString() ?? '0')
        if (!value || parseInt(value) === obsidianprotocol.data.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync(parseInt(value))
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}
