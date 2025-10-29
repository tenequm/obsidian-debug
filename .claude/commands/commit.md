---
allowed-tools: Bash(git:*)
description: Generate commit message from staged changes
---

**IMPORTANT: ALWAYS run these commands BEFORE writing the message:**

1. Check recent commit history for style: `git log --oneline -5`
2. Check change summary statistics: `git diff --staged --stat`
3. Check shortstat for scale: `git diff --staged --shortstat`
4. Check actual content changes: `git diff --cached`

**Format**: `type(scope): description` where scope is optional
**Types**: feat|fix|refactor|chore|docs|ci|style|test|feat!
**Rules**: lowercase, no period, concise but specific

**Scale Guidelines**:
- Small changes (<100 lines): Simple one-line message
- Medium changes (100-1000 lines): Add brief body explaining what/why
- Large changes (1000+ lines): Use detailed body with sections
- Breaking changes: Add ! after type (e.g., `refactor!:`) and add `BREAKING CHANGE:` in body

**Examples**:
- `feat: implement multi-tenant accounts architecture`
- `fix: resolve Docker native module error and queue stack overflow`
- `chore: update turbo to 2.5.8`
- `docs: improve claude.md instructions to be more up to date`
- `fix(chat-persistence): ensure proper chat context storage and retrieval`
- `refactor!: extract solana-idls package to standalone repository` (for breaking changes with 399K+ deletions)

Generate a commit message following this format. Present message only - do not commit.
