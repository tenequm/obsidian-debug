import { OBSIDIANPROTOCOL_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function ObsidianprotocolUiProgramExplorerLink() {
  return (
    <AppExplorerLink address={OBSIDIANPROTOCOL_PROGRAM_ADDRESS} label={ellipsify(OBSIDIANPROTOCOL_PROGRAM_ADDRESS)} />
  )
}
