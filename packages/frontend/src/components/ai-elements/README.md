# AI Elements Components

This directory contains AI-native UI components from the [AI Elements](https://ai-sdk.dev/elements) registry, built on top of shadcn/ui.

## Source

- **Registry**: https://registry.ai-sdk.dev/
- **Package**: `ai-elements@latest`
- **Documentation**: https://ai-sdk.dev/elements

## Installation Method

These components are installed via the AI Elements CLI, which uses shadcn's registry system:

```bash
# Install a specific component
npx ai-elements@latest add <component-name>

# Alternative: Use shadcn CLI directly
npx shadcn@latest add https://registry.ai-sdk.dev/<component-name>.json
```

## Installed Components

The following components are currently installed from the registry:

1. **message** - Individual chat messages with avatars
2. **conversation** - Container for chat conversations with auto-scroll
3. **prompt-input** - Advanced input with file attachments and model selection
4. **response** - Formatted AI response display with markdown
5. **reasoning** - Collapsible AI reasoning/thinking display
6. **tool** - Tool execution visualization with input/output
7. **code-block** - Syntax-highlighted code with copy functionality
8. **loader** - Loading states for AI operations
9. **shimmer** - Animated text shimmer effect
10. **suggestion** - Interactive suggestion chips for guided user input

## Maintenance Philosophy

### Clean Baseline Approach

Components are installed from the registry to establish a **clean baseline**. Any customizations made to these components will appear as git diffs from the registry version, making it easy to:

- ✅ Identify what you've customized vs. what's from the registry
- ✅ Understand whether bugs are from your changes or upstream
- ✅ Review and merge upstream updates when needed
- ✅ Track the evolution of your customizations over time

### Updating Components

To update a component to the latest registry version:

```bash
# Re-run the install command
npx ai-elements@latest add <component-name>

# Review the changes
git diff src/components/ai-elements/<component-name>.tsx
```

If you have customizations, you'll see a merge conflict. Review the upstream changes and decide which to keep.

## Current Customizations

### prompt-input.tsx

**Fixed**: TypeScript error in speech recognition handler
- **Line**: 1123
- **Change**: Added optional chaining to `result[0]?.transcript ?? ""`
- **Reason**: Registry version had possible undefined array access
- **Status**: Consider reporting upstream

## Adding New Components

To add additional AI Elements components:

```bash
# Available components:
npx ai-elements@latest add actions        # Interactive action buttons
npx ai-elements@latest add artifact       # Code/document display containers
npx ai-elements@latest add context        # Token usage and cost tracking
npx ai-elements@latest add chain-of-thought  # Reasoning step display
npx ai-elements@latest add task           # Task completion tracking
npx ai-elements@latest add sources        # Source attribution
# ...and more

# See all available: https://ai-sdk.dev/elements
```

## Dependencies

AI Elements components require:

- **Next.js** 14+ (App Router)
- **React** 18+
- **AI SDK** (`ai`, `@ai-sdk/react`)
- **shadcn/ui** initialized in your project
- **Tailwind CSS** with CSS Variables mode

Dependencies are automatically installed by the CLI when adding components.

## Integration Example

```tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';

export default function Chat() {
  const { messages } = useChat();

  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageContent>
              <Response>{message.content}</Response>
            </MessageContent>
          </Message>
        ))}
      </ConversationContent>
    </Conversation>
  );
}
```

## Architecture Notes

- **Compound Components**: Uses composition pattern (e.g., `<Message>` + `<MessageContent>`)
- **Context-based State**: Complex components use React Context for sub-component communication
- **shadcn/ui Integration**: Depends on shadcn primitives (Button, Avatar, Collapsible, etc.)
- **TypeScript**: Fully typed with exported prop interfaces
- **Tailwind**: Uses CSS variables for theming (light/dark mode support)

---

**Last Updated**: 2025-10-23
**Registry Version**: Latest (components installed via `ai-elements@1.1.2`)
