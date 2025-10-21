---
allowed-tools: Bash(git:*)
description: Generate commit message from staged changes
---

Check staged changes: !`git diff --cached`

**Format**: `type(scope): description` where scope is optional
**Types**: feat|fix|refactor|chore|docs|ci|style|test|feat!
**Rules**: lowercase, no period, concise but specific

**Examples**:
- `feat: implement multi-tenant accounts architecture`
- `fix: resolve Docker native module error and queue stack overflow`
- `chore: update turbo to 2.5.8`
- `docs: improve claude.md instructions to be more up to date`
- `fix(chat-persistence): ensure proper chat context storage and retrieval`

Generate a commit message following this format. Present message only - do not commit.
