/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/obsidianprotocol.json`.
 */
export type Obsidianprotocol = {
  "address": "Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe",
  "metadata": {
    "name": "obsidianprotocol",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Universal credit infrastructure for all intelligence types"
  },
  "instructions": [
    {
      "name": "createAgentAttestation",
      "discriminator": [
        40,
        6,
        12,
        39,
        0,
        35,
        0,
        28
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "attestation",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "creditScore",
          "type": "u16"
        },
        {
          "name": "totalRevenue",
          "type": "u64"
        },
        {
          "name": "successRate",
          "type": "u8"
        },
        {
          "name": "operationalDays",
          "type": "u16"
        },
        {
          "name": "frameworkType",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createHumanAttestation",
      "discriminator": [
        239,
        214,
        7,
        57,
        230,
        224,
        238,
        104
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "attestation",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "creditScore",
          "type": "u16"
        },
        {
          "name": "verifiedIncome",
          "type": "u64"
        },
        {
          "name": "employmentStatus",
          "type": "string"
        }
      ]
    },
    {
      "name": "requestLoan",
      "discriminator": [
        120,
        2,
        7,
        7,
        1,
        219,
        235,
        187
      ],
      "accounts": [
        {
          "name": "borrower",
          "writable": true,
          "signer": true
        },
        {
          "name": "loanAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "attestation"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "loanId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "attestation",
      "discriminator": [
        152,
        125,
        183,
        86,
        36,
        146,
        121,
        73
      ]
    },
    {
      "name": "loanAccount",
      "discriminator": [
        223,
        49,
        62,
        167,
        247,
        182,
        239,
        60
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "creditScoreTooLow",
      "msg": "Credit score too low"
    },
    {
      "code": 6001,
      "name": "attestationExpired",
      "msg": "Attestation expired"
    },
    {
      "code": 6002,
      "name": "invalidEntityType",
      "msg": "Invalid entity type"
    },
    {
      "code": 6003,
      "name": "loanAmountExceedsLimit",
      "msg": "Loan amount exceeds limit"
    }
  ],
  "types": [
    {
      "name": "attestation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "entityType",
            "type": {
              "defined": {
                "name": "entityType"
              }
            }
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "creditScore",
            "type": "u16"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "frameworkType",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "entityType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "human"
          },
          {
            "name": "agent"
          }
        ]
      }
    },
    {
      "name": "loanAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "borrower",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "creditScore",
            "type": "u16"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "loanStatus"
              }
            }
          },
          {
            "name": "entityType",
            "type": {
              "defined": {
                "name": "entityType"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "loanStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "requested"
          },
          {
            "name": "approved"
          },
          {
            "name": "rejected"
          },
          {
            "name": "funded"
          },
          {
            "name": "repaid"
          }
        ]
      }
    }
  ]
};
