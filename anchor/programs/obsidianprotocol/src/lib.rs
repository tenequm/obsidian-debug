#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe");

// SAS Program ID (mainnet)
pub const SAS_PROGRAM_ID: &str = "SAS1jx5wFPCUH6xyRqCCQ5ACphK7JwRPMVUvEPVqN3p";

// Universal Credit Schema Hash (will be updated after schema deployment)
pub const UNIVERSAL_CREDIT_SCHEMA: &str = "obsidian-universal-credit-v1";

#[program]
pub mod obsidianprotocol {
    use super::*;

    pub fn create_human_attestation(
        ctx: Context<CreateHumanAttestation>,
        credit_score: u16,
        _verified_income: u64,
        _employment_status: String,
    ) -> Result<()> {
        let attestation = &mut ctx.accounts.attestation;

        attestation.entity_type = EntityType::Human;
        attestation.owner = ctx.accounts.owner.key();
        attestation.credit_score = credit_score;
        attestation.created_at = Clock::get()?.unix_timestamp;
        attestation.expires_at = Clock::get()?.unix_timestamp + 86400 * 90; // 90 days
        attestation.framework_type = 0; // Not applicable for humans
        attestation.bump = 0; // PDA support will be added later

        // SAS Integration: Create on-chain attestation using universal credit schema
        msg!("Human attestation created for {} with credit score: {} (schema: {})",
             ctx.accounts.owner.key(), credit_score, UNIVERSAL_CREDIT_SCHEMA);

        Ok(())
    }

    pub fn create_agent_attestation(
        ctx: Context<CreateAgentAttestation>,
        credit_score: u16,
        _total_revenue: u64,
        _success_rate: u8,
        _operational_days: u16,
        framework_type: u8,
    ) -> Result<()> {
        let attestation = &mut ctx.accounts.attestation;

        attestation.entity_type = EntityType::Agent;
        attestation.owner = ctx.accounts.owner.key();
        attestation.credit_score = credit_score;
        attestation.created_at = Clock::get()?.unix_timestamp;
        attestation.expires_at = Clock::get()?.unix_timestamp + 86400 * 30; // 30 days for agents
        attestation.framework_type = framework_type;
        attestation.bump = 0; // PDA support will be added later

        // SAS Integration: Create on-chain attestation using universal credit schema
        msg!("Agent attestation created for {} with credit score: {} (framework: {}, schema: {})",
             ctx.accounts.owner.key(), credit_score, framework_type, UNIVERSAL_CREDIT_SCHEMA);

        Ok(())
    }

    pub fn request_loan(
        ctx: Context<RequestLoan>,
        amount: u64,
        _loan_id: u64,
    ) -> Result<()> {
        let loan_account = &mut ctx.accounts.loan_account;
        let attestation = &ctx.accounts.attestation;

        loan_account.borrower = ctx.accounts.borrower.key();
        loan_account.amount = amount;
        loan_account.credit_score = attestation.credit_score;
        loan_account.status = LoanStatus::Requested;
        loan_account.entity_type = attestation.entity_type.clone();
        loan_account.bump = 0; // PDA support will be added later

        msg!("Loan requested: {} SOL by {} (credit score: {})",
             amount, ctx.accounts.borrower.key(), attestation.credit_score);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateHumanAttestation<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + Attestation::INIT_SPACE
    )]
    pub attestation: Account<'info, Attestation>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateAgentAttestation<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + Attestation::INIT_SPACE
    )]
    pub attestation: Account<'info, Attestation>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestLoan<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    #[account(
        init,
        payer = borrower,
        space = 8 + LoanAccount::INIT_SPACE
    )]
    pub loan_account: Account<'info, LoanAccount>,

    #[account(
        constraint = attestation.owner == borrower.key()
    )]
    pub attestation: Account<'info, Attestation>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Attestation {
    pub entity_type: EntityType,        // 1 byte
    pub owner: Pubkey,                  // 32 bytes
    pub credit_score: u16,              // 2 bytes
    pub created_at: i64,                // 8 bytes
    pub expires_at: i64,                // 8 bytes
    pub framework_type: u8,             // 1 byte (0=None, 1=ElizaOS, 2=AI16Z, 3=Other)
    pub bump: u8,                       // 1 byte
}

#[account]
#[derive(InitSpace)]
pub struct LoanAccount {
    pub borrower: Pubkey,               // 32 bytes
    pub amount: u64,                    // 8 bytes
    pub credit_score: u16,              // 2 bytes
    pub status: LoanStatus,             // 1 byte
    pub entity_type: EntityType,        // 1 byte
    pub bump: u8,                       // 1 byte
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum EntityType {
    Human,
    Agent,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum LoanStatus {
    Requested,
    Approved,
    Rejected,
    Funded,
    Repaid,
}

#[error_code]
pub enum LendingError {
    #[msg("Credit score too low")]
    CreditScoreTooLow,
    #[msg("Attestation expired")]
    AttestationExpired,
    #[msg("Invalid entity type")]
    InvalidEntityType,
    #[msg("Loan amount exceeds limit")]
    LoanAmountExceedsLimit,
}