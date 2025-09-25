#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe");

#[program]
pub mod obsidianprotocol {
    use super::*;

    pub fn close(_ctx: Context<CloseObsidianprotocol>) -> Result<()> {
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.obsidianprotocol.count = ctx.accounts.obsidianprotocol.count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.obsidianprotocol.count = ctx.accounts.obsidianprotocol.count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn initialize(_ctx: Context<InitializeObsidianprotocol>) -> Result<()> {
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        ctx.accounts.obsidianprotocol.count = value.clone();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeObsidianprotocol<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + Obsidianprotocol::INIT_SPACE,
  payer = payer
    )]
    pub obsidianprotocol: Account<'info, Obsidianprotocol>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseObsidianprotocol<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  mut,
  close = payer, // close account and return lamports to payer
    )]
    pub obsidianprotocol: Account<'info, Obsidianprotocol>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub obsidianprotocol: Account<'info, Obsidianprotocol>,
}

#[account]
#[derive(InitSpace)]
pub struct Obsidianprotocol {
    count: u8,
}
