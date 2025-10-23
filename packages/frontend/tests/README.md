# Prompt Testing

Simple script to test different prompts and configurations for the transaction debugger.

## Quick Start

```bash
pnpm test:prompt
```

## How to Use

### 1. **Edit the Prompt**
Open `test-prompt.ts` and modify the `SYSTEM_PROMPT` variable (lines ~20-120)

### 2. **Adjust Configuration**
Change model or thinking settings:

```typescript
const CONFIG = {
  model: "claude-haiku-4-5",     // or "claude-sonnet-4-5"
  thinking: false,                // Enable extended thinking?
  thinkingBudget: 10000,         // Thinking token budget
};
```

### 3. **Run and Compare**
```bash
pnpm test:prompt
```

Output shows:
- ✅ Full AI response
- 📊 Token usage and cost
- ✅ Validation checks (sections, word count, no code blocks)

### 4. **Test Different Transactions**

Edit `sample-transaction.json` with different transaction data to test various error types.

## Tips

- **Iterate fast**: Make small prompt changes, run immediately
- **Watch word count**: Target <100 for "Why", <150 for "How to fix"
- **Check for code**: Should always be "NO (GOOD)"
- **Compare costs**: Haiku is ~10x cheaper than Sonnet

## Example Workflow

1. Edit prompt in `test-prompt.ts`
2. Run `pnpm test:prompt`
3. Check output quality
4. Copy improved prompt to `route.ts`
5. Test in actual app
