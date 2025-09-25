// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, getBase58Decoder, SolanaClient } from 'gill'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { Obsidianprotocol, OBSIDIANPROTOCOL_DISCRIMINATOR, OBSIDIANPROTOCOL_PROGRAM_ADDRESS, getObsidianprotocolDecoder } from './client/js'
import ObsidianprotocolIDL from '../target/idl/obsidianprotocol.json'

export type ObsidianprotocolAccount = Account<Obsidianprotocol, string>

// Re-export the generated IDL and type
export { ObsidianprotocolIDL }

export * from './client/js'

export function getObsidianprotocolProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getObsidianprotocolDecoder(),
    filter: getBase58Decoder().decode(OBSIDIANPROTOCOL_DISCRIMINATOR),
    programAddress: OBSIDIANPROTOCOL_PROGRAM_ADDRESS,
  })
}
