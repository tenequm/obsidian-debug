import { ObsidianprotocolAccount } from '@project/anchor'
import { Button } from '@/components/ui/button'

import { useObsidianprotocolCloseMutation } from '@/features/obsidianprotocol/data-access/use-obsidianprotocol-close-mutation'

export function ObsidianprotocolUiButtonClose({ obsidianprotocol }: { obsidianprotocol: ObsidianprotocolAccount }) {
  const closeMutation = useObsidianprotocolCloseMutation({ obsidianprotocol })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Close
    </Button>
  )
}
