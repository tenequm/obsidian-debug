import { createCodamaConfig } from 'gill'
import { addPdasVisitor } from 'codama'
import { constantPdaSeedNodeFromString, variablePdaSeedNode, publicKeyTypeNode, numberTypeNode } from 'codama'

export default createCodamaConfig({
  clientJs: 'src/generated',
  idl: 'target/idl/obsidianprotocol.json',
  visitors: [
    addPdasVisitor({
      obsidianprotocol: [
        // Human attestation PDA
        {
          name: 'attestationHuman',
          seeds: [
            constantPdaSeedNodeFromString('utf8', 'attestation_human'),
            variablePdaSeedNode('owner', publicKeyTypeNode()),
          ],
        },
        // Agent attestation PDA
        {
          name: 'attestationAgent',
          seeds: [
            constantPdaSeedNodeFromString('utf8', 'attestation_agent'),
            variablePdaSeedNode('owner', publicKeyTypeNode()),
          ],
        },
        // Loan account PDA
        {
          name: 'loanAccount',
          seeds: [
            constantPdaSeedNodeFromString('utf8', 'loan'),
            variablePdaSeedNode('borrower', publicKeyTypeNode()),
            variablePdaSeedNode('loanId', numberTypeNode('u64')),
          ],
        },
      ],
    }),
  ],
})
