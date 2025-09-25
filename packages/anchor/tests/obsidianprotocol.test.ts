import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Obsidianprotocol } from "../target/types/obsidianprotocol";
import { assert, expect } from "chai";
import { SystemProgram, PublicKey } from "@solana/web3.js";

describe("obsidianprotocol", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .Obsidianprotocol as Program<Obsidianprotocol>;

  // Test accounts
  const humanUser = anchor.web3.Keypair.generate();
  const agentUser = anchor.web3.Keypair.generate();

  before(async () => {
    // Airdrop SOL to test accounts
    const airdropTx1 = await provider.connection.requestAirdrop(
      humanUser.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropTx1);

    const airdropTx2 = await provider.connection.requestAirdrop(
      agentUser.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropTx2);
  });

  describe("Human Credit Attestation", () => {
    it("Creates human attestation with valid credit score", async () => {
      const creditScore = 720;
      const verifiedIncome = new anchor.BN(75000).mul(
        new anchor.BN(1_000_000_000),
      );
      const employmentStatus = "employed";

      // Derive PDA
      const [attestationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("attestation_human"), humanUser.publicKey.toBuffer()],
        program.programId,
      );

      // Create attestation
      const tx = await program.methods
        .createHumanAttestation(creditScore, verifiedIncome, employmentStatus)
        .accountsStrict({
          owner: humanUser.publicKey,
          attestation: attestationPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([humanUser])
        .rpc();

      console.log("Transaction signature:", tx);

      // Fetch and verify
      const attestation =
        await program.account.attestation.fetch(attestationPda);
      assert.equal(attestation.creditScore, creditScore);
      assert.equal(
        attestation.owner.toString(),
        humanUser.publicKey.toString(),
      );
      assert.equal(attestation.entityType.human !== undefined, true);
    });

    it("Updates human attestation with new credit score", async () => {
      const newCreditScore = 780;
      const verifiedIncome = new anchor.BN(85000).mul(
        new anchor.BN(1_000_000_000),
      );
      const employmentStatus = "employed";

      const [attestationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("attestation_human"), humanUser.publicKey.toBuffer()],
        program.programId,
      );

      await program.methods
        .updateHumanAttestation(
          newCreditScore,
          verifiedIncome,
          employmentStatus,
        )
        .accountsStrict({
          owner: humanUser.publicKey,
          attestation: attestationPda,
        })
        .signers([humanUser])
        .rpc();

      const attestation =
        await program.account.attestation.fetch(attestationPda);
      assert.equal(attestation.creditScore, newCreditScore);
    });

    it("Requests loan with human attestation", async () => {
      const loanAmount = new anchor.BN(10000).mul(new anchor.BN(1_000_000_000));
      const loanId = new anchor.BN(1);

      const [attestationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("attestation_human"), humanUser.publicKey.toBuffer()],
        program.programId,
      );

      const [loanPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("loan"),
          humanUser.publicKey.toBuffer(),
          loanId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId,
      );

      await program.methods
        .requestLoan(loanAmount, loanId)
        .accountsStrict({
          borrower: humanUser.publicKey,
          loanAccount: loanPda,
          attestation: attestationPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([humanUser])
        .rpc();

      // Since we're using UncheckedAccount, fetch the raw account data
      const loanAccountInfo = await provider.connection.getAccountInfo(loanPda);
      assert(loanAccountInfo, "Loan account not found");

      // Verify account was created and has expected data
      // Skip discriminator (8 bytes), then read borrower (32 bytes)
      const borrower = new PublicKey(loanAccountInfo.data.slice(8, 40));
      // Read amount (8 bytes as u64)
      const amount = new anchor.BN(loanAccountInfo.data.slice(40, 48), "le");

      assert.equal(borrower.toString(), humanUser.publicKey.toString());
      assert.equal(amount.toString(), loanAmount.toString());
      // Status is at byte 48+2 (after credit_score which is 2 bytes)
      const status = loanAccountInfo.data[50];
      assert.equal(status, 0, "Status should be Requested (0)");
    });
  });

  describe("Agent Credit Attestation", () => {
    it("Creates agent attestation with ElizaOS framework", async () => {
      const creditScore = 680;
      const totalRevenue = new anchor.BN(150000).mul(
        new anchor.BN(1_000_000_000),
      );
      const successRate = 85;
      const operationalDays = 120;
      const frameworkType = 1; // ElizaOS

      const [attestationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("attestation_agent"), agentUser.publicKey.toBuffer()],
        program.programId,
      );

      await program.methods
        .createAgentAttestation(
          creditScore,
          totalRevenue,
          successRate,
          operationalDays,
          frameworkType,
        )
        .accountsStrict({
          owner: agentUser.publicKey,
          attestation: attestationPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([agentUser])
        .rpc();

      const attestation =
        await program.account.attestation.fetch(attestationPda);
      assert.equal(attestation.creditScore, creditScore);
      assert.equal(attestation.frameworkType, frameworkType);
      assert.equal(attestation.entityType.agent !== undefined, true);
    });

    it("Requests loan with agent attestation", async () => {
      const loanAmount = new anchor.BN(25000).mul(new anchor.BN(1_000_000_000));
      const loanId = new anchor.BN(2);

      const [attestationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("attestation_agent"), agentUser.publicKey.toBuffer()],
        program.programId,
      );

      const [loanPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("loan"),
          agentUser.publicKey.toBuffer(),
          loanId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId,
      );

      await program.methods
        .requestLoan(loanAmount, loanId)
        .accountsStrict({
          borrower: agentUser.publicKey,
          loanAccount: loanPda,
          attestation: attestationPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([agentUser])
        .rpc();

      // Since we're using UncheckedAccount, fetch the raw account data
      const loanAccountInfo = await provider.connection.getAccountInfo(loanPda);
      assert(loanAccountInfo, "Loan account not found");

      // Verify account was created and has expected data
      // Skip discriminator (8 bytes), then read borrower (32 bytes)
      const borrower = new PublicKey(loanAccountInfo.data.slice(8, 40));
      // Read amount (8 bytes as u64)
      const amount = new anchor.BN(loanAccountInfo.data.slice(40, 48), "le");
      // Entity type is at byte 51 (after status at byte 50)
      const entityType = loanAccountInfo.data[51];

      assert.equal(borrower.toString(), agentUser.publicKey.toString());
      assert.equal(amount.toString(), loanAmount.toString());
      assert.equal(entityType, 1, "Entity type should be Agent (1)");
    });
  });

  describe("Error Cases", () => {
    it("Should fail to request loan without attestation", async () => {
      const noAttestationUser = anchor.web3.Keypair.generate();
      const loanAmount = new anchor.BN(1000).mul(new anchor.BN(1_000_000_000));
      const loanId = new anchor.BN(999);

      // Airdrop SOL
      const airdropTx = await provider.connection.requestAirdrop(
        noAttestationUser.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL,
      );
      await provider.connection.confirmTransaction(airdropTx);

      const [attestationPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("attestation_human"),
          noAttestationUser.publicKey.toBuffer(),
        ],
        program.programId,
      );

      const [loanPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("loan"),
          noAttestationUser.publicKey.toBuffer(),
          loanId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId,
      );

      try {
        await program.methods
          .requestLoan(loanAmount, loanId)
          .accountsStrict({
            borrower: noAttestationUser.publicKey,
            loanAccount: loanPda,
            attestation: attestationPda, // Doesn't exist
            systemProgram: SystemProgram.programId,
          })
          .signers([noAttestationUser])
          .rpc();

        assert.fail("Should have failed with missing attestation");
      } catch (error) {
        expect((error as Error).toString()).to.include("AccountNotInitialized");
      }
    });
  });
});
