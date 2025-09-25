import { ObsidianprotocolAccount } from '@project/anchor'
import { ellipsify } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ObsidianprotocolUiButtonClose } from './obsidianprotocol-ui-button-close'
import { ObsidianprotocolUiButtonDecrement } from './obsidianprotocol-ui-button-decrement'
import { ObsidianprotocolUiButtonIncrement } from './obsidianprotocol-ui-button-increment'
import { ObsidianprotocolUiButtonSet } from './obsidianprotocol-ui-button-set'

export function ObsidianprotocolUiCard({ obsidianprotocol }: { obsidianprotocol: ObsidianprotocolAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Obsidianprotocol: {obsidianprotocol.data.count}</CardTitle>
        <CardDescription>
          Account: <AppExplorerLink address={obsidianprotocol.address} label={ellipsify(obsidianprotocol.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <ObsidianprotocolUiButtonIncrement obsidianprotocol={obsidianprotocol} />
          <ObsidianprotocolUiButtonSet obsidianprotocol={obsidianprotocol} />
          <ObsidianprotocolUiButtonDecrement obsidianprotocol={obsidianprotocol} />
          <ObsidianprotocolUiButtonClose obsidianprotocol={obsidianprotocol} />
        </div>
      </CardContent>
    </Card>
  )
}
