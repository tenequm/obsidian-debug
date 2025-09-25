import { PROGRAM_ID } from '@/lib/program-utils'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function ObsidianprotocolUiProgramExplorerLink() {
  return <AppExplorerLink address={PROGRAM_ID.toString()} label={ellipsify(PROGRAM_ID.toString())} />
}
