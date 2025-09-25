import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { ObsidianprotocolUiButtonInitialize } from './ui/obsidianprotocol-ui-button-initialize'
import { ObsidianprotocolUiList } from './ui/obsidianprotocol-ui-list'
import { ObsidianprotocolUiProgramExplorerLink } from './ui/obsidianprotocol-ui-program-explorer-link'
import { ObsidianprotocolUiProgramGuard } from './ui/obsidianprotocol-ui-program-guard'

export default function ObsidianprotocolFeature() {
  const { account } = useSolana()

  return (
    <ObsidianprotocolUiProgramGuard>
      <AppHero
        title="Obsidianprotocol"
        subtitle={
          account
            ? "Initialize a new obsidianprotocol onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <ObsidianprotocolUiProgramExplorerLink />
        </p>
        {account ? (
          <ObsidianprotocolUiButtonInitialize />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletDropdown />
          </div>
        )}
      </AppHero>
      {account ? <ObsidianprotocolUiList /> : null}
    </ObsidianprotocolUiProgramGuard>
  )
}
