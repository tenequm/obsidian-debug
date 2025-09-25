#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe");

// SAS Program ID (mainnet)
pub const SAS_PROGRAM_ID: &str = "SAS1jx5wFPCUH6xyRqCCQ5ACphK7JwRPMVUvEPVqN3p";

// Universal Credit Schema Hash (will be updated after schema deployment)
pub const UNIVERSAL_CREDIT_SCHEMA: &str = "obsidian-universal-credit-v1";

// PDA Seeds
pub const ATTESTATION_HUMAN_SEED: &[u8] = b"attestation_human";
pub const ATTESTATION_AGENT_SEED: &[u8] = b"attestation_agent";
pub const LOAN_SEED: &[u8] = b"loan";

#[program]
pub mod obsidianprotocol {
    use super::*;

    pub fn create_human_attestation(
        ctx: Context<CreateHumanAttestation>,
        credit_score: u16,
        _verified_income: u64,
        _employment_status: String,
    ) -> Result<()> {
        // Derive PDA and get bump
        let (pda, bump) = Pubkey::find_program_address(
            &[ATTESTATION_HUMAN_SEED, ctx.accounts.owner.key().as_ref()],
            ctx.program_id,
        );

        // Verify the account is the correct PDA
        require_keys_eq!(
            ctx.accounts.attestation.key(),
            pda,
            LendingError::InvalidPDA
        );

        // Create the account
        let space = 8 + Attestation::INIT_SPACE;
        let lamports = Rent::get()?.minimum_balance(space);

        let owner_key = ctx.accounts.owner.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            ATTESTATION_HUMAN_SEED,
            owner_key.as_ref(),
            &[bump],
        ]];

        anchor_lang::system_program::create_account(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::CreateAccount {
                    from: ctx.accounts.owner.to_account_info(),
                    to: ctx.accounts.attestation.to_account_info(),
                },
                signer_seeds,
            ),
            lamports,
            space as u64,
            ctx.program_id,
        )?;

        // Initialize the attestation account
        let mut attestation_data = ctx.accounts.attestation.try_borrow_mut_data()?;

        // Create the attestation
        let attestation = Attestation {
            entity_type: EntityType::Human,
            owner: ctx.accounts.owner.key(),
            credit_score,
            created_at: Clock::get()?.unix_timestamp,
            expires_at: Clock::get()?.unix_timestamp + 86400 * 90, // 90 days
            framework_type: 0, // Not applicable for humans
            bump,
        };

        // Serialize the entire account including discriminator
        let mut data = Vec::with_capacity(attestation_data.len());
        attestation.try_serialize(&mut data)?;

        // Copy to the account data (Anchor will handle the discriminator)
        attestation_data.copy_from_slice(&data);

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
        // Derive PDA and get bump
        let (pda, bump) = Pubkey::find_program_address(
            &[ATTESTATION_AGENT_SEED, ctx.accounts.owner.key().as_ref()],
            ctx.program_id,
        );

        // Verify the account is the correct PDA
        require_keys_eq!(
            ctx.accounts.attestation.key(),
            pda,
            LendingError::InvalidPDA
        );

        // Create the account
        let space = 8 + Attestation::INIT_SPACE;
        let lamports = Rent::get()?.minimum_balance(space);

        let owner_key = ctx.accounts.owner.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            ATTESTATION_AGENT_SEED,
            owner_key.as_ref(),
            &[bump],
        ]];

        anchor_lang::system_program::create_account(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::CreateAccount {
                    from: ctx.accounts.owner.to_account_info(),
                    to: ctx.accounts.attestation.to_account_info(),
                },
                signer_seeds,
            ),
            lamports,
            space as u64,
            ctx.program_id,
        )?;

        // Initialize the attestation account
        let mut attestation_data = ctx.accounts.attestation.try_borrow_mut_data()?;

        // Create the attestation
        let attestation = Attestation {
            entity_type: EntityType::Agent,
            owner: ctx.accounts.owner.key(),
            credit_score,
            created_at: Clock::get()?.unix_timestamp,
            expires_at: Clock::get()?.unix_timestamp + 86400 * 30, // 30 days for agents
            framework_type,
            bump,
        };

        // Serialize the entire account including discriminator
        let mut data = Vec::with_capacity(attestation_data.len());
        attestation.try_serialize(&mut data)?;

        // Copy to the account data (Anchor will handle the discriminator)
        attestation_data.copy_from_slice(&data);

        // SAS Integration: Create on-chain attestation using universal credit schema
        msg!("Agent attestation created for {} with credit score: {} (framework: {}, schema: {})",
             ctx.accounts.owner.key(), credit_score, framework_type, UNIVERSAL_CREDIT_SCHEMA);

        Ok(())
    }

    pub fn update_human_attestation(
        ctx: Context<UpdateAttestation>,
        credit_score: u16,
        _verified_income: u64,
        _employment_status: String,
    ) -> Result<()> {
        // Verify PDA
        let (expected_pda, _bump) = Pubkey::find_program_address(
            &[ATTESTATION_HUMAN_SEED, ctx.accounts.owner.key().as_ref()],
            ctx.program_id,
        );
        require_keys_eq!(
            ctx.accounts.attestation.key(),
            expected_pda,
            LendingError::InvalidPDA
        );

        let attestation = &mut ctx.accounts.attestation;

        // Verify this is a human attestation
        require!(
            attestation.entity_type == EntityType::Human,
            LendingError::InvalidEntityType
        );

        // Update attestation
        attestation.credit_score = credit_score;
        attestation.created_at = Clock::get()?.unix_timestamp;
        attestation.expires_at = Clock::get()?.unix_timestamp + 86400 * 90; // 90 days

        msg!("Human attestation updated for {} with new credit score: {}",
             ctx.accounts.owner.key(), credit_score);

        Ok(())
    }

    pub fn update_agent_attestation(
        ctx: Context<UpdateAttestation>,
        credit_score: u16,
        _total_revenue: u64,
        _success_rate: u8,
        _operational_days: u16,
        framework_type: u8,
    ) -> Result<()> {
        // Verify PDA
        let (expected_pda, _bump) = Pubkey::find_program_address(
            &[ATTESTATION_AGENT_SEED, ctx.accounts.owner.key().as_ref()],
            ctx.program_id,
        );
        require_keys_eq!(
            ctx.accounts.attestation.key(),
            expected_pda,
            LendingError::InvalidPDA
        );

        let attestation = &mut ctx.accounts.attestation;

        // Verify this is an agent attestation
        require!(
            attestation.entity_type == EntityType::Agent,
            LendingError::InvalidEntityType
        );

        // Update attestation
        attestation.credit_score = credit_score;
        attestation.framework_type = framework_type;
        attestation.created_at = Clock::get()?.unix_timestamp;
        attestation.expires_at = Clock::get()?.unix_timestamp + 86400 * 30; // 30 days

        msg!("Agent attestation updated for {} with new credit score: {}",
             ctx.accounts.owner.key(), credit_score);

        Ok(())
    }

    pub fn close_attestation(
        ctx: Context<CloseAttestation>,
    ) -> Result<()> {
        // We can validate either human or agent PDA based on the entity type
        let attestation = &ctx.accounts.attestation;
        let seed = match attestation.entity_type {
            EntityType::Human => ATTESTATION_HUMAN_SEED,
            EntityType::Agent => ATTESTATION_AGENT_SEED,
        };

        let (expected_pda, _bump) = Pubkey::find_program_address(
            &[seed, ctx.accounts.owner.key().as_ref()],
            ctx.program_id,
        );
        require_keys_eq!(
            ctx.accounts.attestation.key(),
            expected_pda,
            LendingError::InvalidPDA
        );

        msg!("Attestation closed and rent returned");
        Ok(())
    }

    pub fn request_loan(
        ctx: Context<RequestLoan>,
        amount: u64,
        loan_id: u64,
    ) -> Result<()> {
        // Derive PDA and get bump
        let (pda, bump) = Pubkey::find_program_address(
            &[LOAN_SEED, ctx.accounts.borrower.key().as_ref(), &loan_id.to_le_bytes()],
            ctx.program_id,
        );

        // Verify the account is the correct PDA
        require_keys_eq!(
            ctx.accounts.loan_account.key(),
            pda,
            LendingError::InvalidPDA
        );

        // Create the account
        let space = 8 + LoanAccount::INIT_SPACE;
        let lamports = Rent::get()?.minimum_balance(space);

        let borrower_key = ctx.accounts.borrower.key();
        let loan_id_bytes = loan_id.to_le_bytes();
        let signer_seeds: &[&[&[u8]]] = &[&[
            LOAN_SEED,
            borrower_key.as_ref(),
            &loan_id_bytes,
            &[bump],
        ]];

        anchor_lang::system_program::create_account(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::CreateAccount {
                    from: ctx.accounts.borrower.to_account_info(),
                    to: ctx.accounts.loan_account.to_account_info(),
                },
                signer_seeds,
            ),
            lamports,
            space as u64,
            ctx.program_id,
        )?;

        // Initialize the loan account
        let attestation = &ctx.accounts.attestation;
        let mut loan_data = ctx.accounts.loan_account.try_borrow_mut_data()?;

        // Create the loan account
        let loan_account = LoanAccount {
            borrower: ctx.accounts.borrower.key(),
            amount,
            credit_score: attestation.credit_score,
            status: LoanStatus::Requested,
            entity_type: attestation.entity_type.clone(),
            bump,
            loan_id,
        };

        // Serialize the entire account including discriminator
        let mut data = Vec::with_capacity(loan_data.len());
        loan_account.try_serialize(&mut data)?;

        // Copy to the account data (Anchor will handle the discriminator)
        loan_data.copy_from_slice(&data);

        msg!("Loan requested: {} SOL by {} (credit score: {})",
             amount, ctx.accounts.borrower.key(), attestation.credit_score);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateHumanAttestation<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: PDA validation is done in the instruction handler
    #[account(mut)]
    pub attestation: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateAgentAttestation<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: PDA validation is done in the instruction handler
    #[account(mut)]
    pub attestation: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAttestation<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        constraint = attestation.owner == owner.key(),
    )]
    pub attestation: Account<'info, Attestation>,
}

#[derive(Accounts)]
pub struct CloseAttestation<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        close = owner,
        constraint = attestation.owner == owner.key(),
    )]
    pub attestation: Account<'info, Attestation>,
}

#[derive(Accounts)]
#[instruction(_amount: u64, loan_id: u64)]
pub struct RequestLoan<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    /// CHECK: PDA validation is done in the instruction handler
    #[account(mut)]
    pub loan_account: UncheckedAccount<'info>,

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
    pub loan_id: u64,                   // 8 bytes
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
    #[msg("Invalid PDA")]
    InvalidPDA,
}