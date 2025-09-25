interface ObsidianprotocolAccount {
  address: string
  count: number
  [key: string]: unknown
}
import { Button } from '@/components/ui/button'
import { useObsidianprotocolIncrementMutation } from '../data-access/use-obsidianprotocol-increment-mutation'

export function ObsidianprotocolUiButtonIncrement({ obsidianprotocol }: { obsidianprotocol: ObsidianprotocolAccount }) {
  const incrementMutation = useObsidianprotocolIncrementMutation({ obsidianprotocol })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}
