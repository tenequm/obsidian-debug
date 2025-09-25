interface ObsidianprotocolAccount {
  address: string
  count: number
  [key: string]: unknown
}
import { Button } from '@/components/ui/button'

import { useObsidianprotocolSetMutation } from '@/features/obsidianprotocol/data-access/use-obsidianprotocol-set-mutation'

export function ObsidianprotocolUiButtonSet({ obsidianprotocol }: { obsidianprotocol: ObsidianprotocolAccount }) {
  const setMutation = useObsidianprotocolSetMutation({ obsidianprotocol })

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', obsidianprotocol.count?.toString() ?? '0')
        if (!value || parseInt(value) === obsidianprotocol.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync({ value: parseInt(value) })
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}
