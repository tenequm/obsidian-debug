interface ObsidianprotocolAccount {
  address: string
  count: number
  [key: string]: unknown
}
import { Button } from '@/components/ui/button'

import { useObsidianprotocolDecrementMutation } from '../data-access/use-obsidianprotocol-decrement-mutation'

export function ObsidianprotocolUiButtonDecrement({ obsidianprotocol }: { obsidianprotocol: ObsidianprotocolAccount }) {
  const decrementMutation = useObsidianprotocolDecrementMutation({ obsidianprotocol })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}
