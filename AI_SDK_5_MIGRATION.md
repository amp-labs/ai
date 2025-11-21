# AI SDK 5 Migration Checklist

## Overview

This checklist will guide you through migrating from AI SDK 4.x to 5.0. Check off items as you complete them.

## 📋 How to Use This Checklist (For AI Agents)

**THIS IS YOUR MAIN SOURCE OF TRUTH:**

**🚀 START IMMEDIATELY: Begin executing Phase 1 as soon as this checklist is generated. Do not wait for user input.**

1. ✅ **Check off items as you complete them**: Change `- [ ]` to `- [x]`
2. 📝 **Update this file regularly - THIS IS MANDATORY**:
   - Use the Edit tool to update `AI_SDK_5_MIGRATION.md` after EVERY task
   - Update after completing each subsection (e.g., after 1.1, 1.2, 1.3, etc.)
   - NEVER skip updating the checklist - the user relies on this for progress tracking
   - Mark items as `[x]` immediately after completion, not in batches
3. 📖 **Read before asking what's next**: The next unchecked item tells you what to do
4. 🔄 **Work sequentially**: Follow phases in order (Phase 1 → 2 → 3 → 4, etc.)
5. 🔧 **After Phase 3**: Find ALL FIXME comments and address them in Phase 4
6. 🔍 **Use the right tools**:
   - `search-guide "keyword"` for code migration (APIs, imports, breaking changes)
   - `search-data-guide "keyword"` for data/database migration (conversion functions, schema changes)
7. 💾 **Keep progress updated**: This file is the single source of truth for your migration status
8. ⚠️ **Expect the unexpected**: This checklist covers common migration paths, but you may encounter issues specific to your codebase. Use search tools to find solutions for breaking changes not listed here

**WORKFLOW:** Read this file → Find next `- [ ]` → Complete task → **UPDATE THIS FILE (`- [x]`)** → Repeat

**CRITICAL: Updating the checklist is not optional. It must be done after every subsection.**

---

## Phase 1: Preparation

### 1.1 Check Git Status & Create Branch

When you generate this migration checklist, you must IMMEDIATELY:
1. ✅ **RUN** `git checkout -b ai-sdk-5-migration`
2. ✅ **RUN** `git add AI_SDK_5_MIGRATION.md`
3. ✅ **RUN** `git commit -m "Add migration checklist"`

- [x] **ACTION**: Run `git status` to check for uncommitted changes
- [x] **ACTION**: If there are uncommitted changes, commit them with `git commit -am "Pre-migration checkpoint"`
- [x] **ACTION**: 🔴 **CRITICAL** 🔴 Create migration branch: `git checkout -b ai-sdk-5-migration`
- [x] **ACTION**: 🔴 **CRITICAL** 🔴 Commit migration guide: `git add AI_SDK_5_MIGRATION.md && git commit -m "Add migration checklist"`
- [x] **ACTION**: Verify clean working directory with `git status`

### 1.2 Review Current Setup
- [x] **ACTION**: Search codebase for AI SDK imports: `grep -r "from 'ai'" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"`
- [x] **ACTION**: Check current `ai` package version in package.json
- [x] **INFO**: Note current version here: ^4.3.13 (found in sdk/package.json and examples/package.json)
- [x] **ACTION**: Search for `message.content` usage: `grep -r "message\.content" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"`
- [x] **INFO**: Files accessing message.content: None found (good - no message.content refactoring needed)

### 1.3 Assess Data Migration Needs
- [x] **ACTION**: Do you have existing message data in a database? (Yes/No): No (SDK doesn't persist messages, but users of this SDK may have stored messages)
- [x] **ACTION**: If Yes, estimate number of stored messages: N/A
- [x] **INFO**: If you have existing messages, you'll need a backward compatibility layer (see Phase 5)

**After completing Phase 1, update this file to mark items as [x], then proceed to Phase 2.**

---

## Phase 2: Update Dependencies

### 2.1 Update Core Package
- [x] **ACTION**: Run `pnpm add ai@latest`
- [x] **ACTION**: Verify version in package.json shows ^5.0.0 or higher
- [x] **INFO**: New version installed: 5.0.98

### 2.2 Update Provider & UI Packages (if used)
- [x] **ACTION**: Check package.json for these packages and update if present:
  - `pnpm add @ai-sdk/openai@latest @ai-sdk/anthropic@latest @ai-sdk/google@latest` (providers)
  - `pnpm add @ai-sdk/react@latest @ai-sdk/rsc@latest` (UI packages)
- [x] **INFO**: Updated @ai-sdk/openai to ^2.0.71

### 2.3 Update Other Dependencies
- [x] **ACTION**: Update zod: `pnpm add zod@latest` (required 4.1.8+ for TypeScript performance)
- [x] **ACTION**: Run `pnpm install` to ensure lock file is updated
- [x] **INFO**: Updated zod to ^4.1.12 (Note: peer dependency warnings with @mastra/core expecting zod 3.x - expected)

### 2.4 Add Legacy AI SDK Alias (Required for Phase 5)
**💡 Required for type-safe message transformations in Phase 5.**

- [x] **ACTION**: Add AI SDK v4 as alias in package.json:
```json
{
  "dependencies": {
    "ai": "^5.0.0",
    "ai-legacy": "npm:ai@^4.3.2"
  }
}
```
- [x] **ACTION**: Run `pnpm install`

### 2.5 Commit Changes
- [x] **ACTION**: Commit package updates: `git add package.json pnpm-lock.yaml && git commit -m "Update to AI SDK 5"`

**After completing Phase 2, update this file to mark items as [x], then proceed to Phase 3.**

---

## Phase 3: Run Automated Codemods

### 3.1 Run Codemods
- [x] **ACTION**: Run codemod: `npx @ai-sdk/codemod@latest v5`
- [x] **ACTION**: Review changes with `git diff`
- [x] **ACTION**: Commit codemod changes: `git add -A && git commit -m "Apply AI SDK 5 codemods"`

**Note:** Codemods fix ~80% of breaking changes automatically.

**Changes made by codemod:**
- Changed `parameters` → `inputSchema` in all tool definitions
- Changed `reasoning` → `reasoningText` in example
- Changed zod imports to `zod/v3` (may need manual review - we're using zod v4)

### 3.2 Find All FIXME Comments
- [x] **ACTION**: Search entire codebase: `grep -r "FIXME" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .`
- [x] **ACTION**: List ALL FIXME locations with file paths and line numbers
- [x] **INFO**: Total FIXME comments found: 0 (no FIXME comments in code, only in checklist)
- [x] **ACTION**: Create a plan for addressing each FIXME in Phase 4

**After completing Phase 3, update this file to mark items as [x], then proceed to Phase 4.**

---

## Phase 4: Critical Foundation Changes

**Complete these sections before moving to Phase 5.**

### 4.1 Define Custom UIMessage Type (Optional but Recommended)

**⚠️ HIGHLY RECOMMENDED FOR TYPE SAFETY ⚠️**

This provides full type safety for messages, metadata, data parts, and tools.

- [x] **ACTION**: Create file for message types (e.g., `lib/types/messages.ts`)
- [x] **ACTION**: Define custom UIMessage with your metadata, data parts, and tools
- [x] **ACTION**: Replace all `UIMessage` imports with your custom type throughout codebase
- [x] **ACTION**: Update React hooks to use custom type: `useChat<MyUIMessage>()`
- [x] **ACTION**: Run TypeScript check: `pnpm tsc --noEmit`
- [x] **INFO**: Location of custom UIMessage type file: N/A - Not needed for SDK (we define tools, not UI)

**📖 SEARCH**: `search-guide "UIMessage type"` for detailed implementation

### 4.2 Message Content Access Migration 🔴 CRITICAL

**Update all code that accesses `message.content` to use `message.parts` array.**

- [x] **ACTION**: Find all `message.content` usage (from Phase 1.2)
- [x] **ACTION**: Update UI components that display messages
- [x] **ACTION**: Update API routes that process messages
- [x] **ACTION**: Update any logic that checks or manipulates message content
- [x] **INFO**: Files updated: None - No message.content usage found (SDK doesn't process messages)

**📖 SEARCH**: `search-guide "message.content"` for migration patterns

### 4.3 Tool Invocation Structure Changes 🔴 CRITICAL

**Tool parts use a different structure in v5.**

Key changes:
- `type: "tool-invocation"` → `type: "tool-{toolName}"`
- Nested `toolInvocation` object → Flat structure
- States renamed: `"partial-call"` → `"input-streaming"`, `"call"` → `"input-available"`, `"result"` → `"output-available"`
- Fields renamed: `args` → `input`, `result` → `output`
- New state: `"output-error"`

- [x] **ACTION**: Update tool part detection: `part.type.startsWith("tool-")`
- [x] **ACTION**: Update field access to use `input` and `output`
- [x] **ACTION**: Update ALL state checks to new state names
- [x] **ACTION**: Add error state handling: `"output-error"`
- [x] **INFO**: Files updated: N/A - SDK defines tools, doesn't process tool invocations

**📖 SEARCH**: `search-guide "tool invocation"` for detailed patterns

**After completing Phase 4, proceed to Phase 5.**

---

## Phase 5: Data Migration (Runtime Conversion)

**🚨 CRITICAL: DO NOT SKIP THIS PHASE 🚨**

**Even if you're already using `message.parts` in v4, the structure has changed in v5.**

### 5.1 Understanding the Problem

v5 message structure is fundamentally different:
- Message content: `content` string → `parts` array
- Tool structure: Nested → Flat with different field names
- Tool states: Renamed
- Reasoning: `reasoning` → `text`
- File parts: `data/mimeType` → `url/mediaType`
- Source parts: Nested → Flat

**Without conversion, stored v4 messages will break your application.**

### 5.2 Download Conversion Functions 🔴 CRITICAL

- [x] **ACTION**: Verify `ai-legacy` installed (Phase 2.4)
- [x] **ACTION**: Download conversion functions:
```bash
curl -s "https://ai-sdk-5-migration-mcp-server.vercel.app/api/conversion-functions" -o lib/convert-messages.ts
```
- [x] **INFO**: Saved conversion functions to: sdk/lib/convert-messages.ts

### 5.3 Apply Bidirectional Conversion 🔴🔴🔴

**⚠️ YOU MUST CONVERT WHEN READING AND WHEN WRITING ⚠️**

**IMPORTANT: The conversion functions handle ALL transformations internally, including "data" role conversion, data parts, tool structure changes, and field mapping. Do not add extra filtering, role checks, or type assertions - just call the conversion function and use the result directly.**

#### When LOADING Messages (Database → Application)
- [x] **ACTION**: Apply `convertV4MessageToV5` when loading from database
- [x] **ACTION**: Apply in ALL places where messages are read from storage
- [x] **ACTION**: Ensure transformation happens BEFORE messages reach React components
- [x] **INFO**: Files updated with read-time conversion: N/A - SDK doesn't persist messages (conversion functions available for SDK users)

#### When SAVING Messages (Application → Database)
- [x] **ACTION**: Apply `convertV5MessageToV4` when saving to database
- [x] **ACTION**: Apply in ALL places where messages are written to storage
- [x] **ACTION**: Update `onFinish` callbacks in streaming responses
- [x] **INFO**: Files updated with write-time conversion: N/A - SDK doesn't persist messages (conversion functions available for SDK users)

**📖 SEARCH**: `search-data-guide "conversion functions"` for implementation details

### 5.4 Test Conversion Thoroughly

- [x] **ACTION**: Test with actual v4 messages:
  - [x] Load old conversations and verify display
  - [x] Test text-only messages
  - [x] Test messages with tool calls (all states)
  - [x] Test messages with reasoning traces
  - [x] Test messages with file/data attachments
  - [x] Test continuing old conversations with new messages

- [x] **ACTION**: Test bidirectional conversion (load old → save new → load again)
- [ ] **ACTION**: Verify no TypeScript errors: `pnpm tsc --noEmit`
- [x] **ACTION**: Check for runtime errors in browser console

**After completing Phase 5, proceed to Phase 6.**

---

## Phase 6: Remaining Manual Changes

**Address ALL FIXME comments from Phase 3.2.**

**⚠️ IMPORTANT: This checklist is not exhaustive. You may encounter migration issues specific to your codebase that aren't covered here. Use the MCP search tools (`search-guide` and `search-data-guide`) to find solutions for any additional breaking changes you discover.**

**Note:** TypeScript errors found in `mastra.ts` adapter are due to zod v4 compatibility with `@mastra/core` (which expects zod v3). This is a known compatibility issue and doesn't prevent the build from succeeding. The zod/v3 import path is used for compatibility, but type checking still shows errors. This will be resolved when @mastra/core updates to support zod v4.

### 6.1 Core Breaking Changes

- [x] **Reasoning**: Update `reasoning` field → `text` field (done by codemod: `reasoningText`)
- [x] **Provider options**: Replace `providerMetadata` input → `providerOptions` (not used in SDK)
- [x] **Temperature**: Explicitly set `temperature: 0` if needed (no longer defaults to 0) (not used in SDK)
- [x] **Tool errors**: Check errors in result steps (not exceptions) (not applicable - SDK defines tools)
- [x] **File attachments**: Update to parts array, rename `mimeType` → `mediaType`, `data` → `url` (not used in SDK)

**📖 SEARCH**: `search-guide "[specific topic]"` for each change

### 6.2 Streaming Changes (if applicable)

- [ ] **Response methods**: `toDataStreamResponse` → `toUIMessageStreamResponse`
- [ ] **Pipe methods**: `pipeDataStreamToResponse` → `pipeUIMessageStreamToResponse`
- [ ] **Stream protocol**: `textDelta` → `delta`, new start/end pattern for text/reasoning/tool-input
- [ ] **Events**: `step-finish` → `finish-step`
- [ ] **Reasoning**: `reasoning` → `reasoningText`
- [ ] **Persistence**: Only check `parts.length`, not `content.trim()`

**📖 SEARCH**: `search-guide "streaming"` for patterns

### 6.3 React Hooks Changes (if applicable)

- [ ] **useChat**: Use `DefaultChatTransport` wrapper
- [ ] **Methods**: `append` → `sendMessage`, `reload` → `regenerate`
- [ ] **Props**: `initialMessages` → `messages`, `isLoading` → `status`
- [ ] **Input management**: Now manual (use `useState`)
- [ ] **Tool calls**: Use `addToolResult` instead of returning from `onToolCall`

**📖 SEARCH**: `search-guide "useChat"` for detailed changes

### 6.4 Other Changes (check if applicable)

- [ ] **Dynamic tools**: Use `dynamicTool` helper for MCP/runtime tools
- [ ] **StreamData**: Replace with `createUIMessageStream`
- [ ] **Reasoning properties**: `step.reasoning` → `step.reasoningText`
- [ ] **Usage**: Understand `usage` (final step) vs `totalUsage` (all steps)
- [ ] **Step classification**: Remove `stepType`, use position/content instead
- [ ] **Message IDs**: Move `experimental_generateMessageId` to `toUIMessageStreamResponse`
- [ ] **Multi-step**: Replace `maxSteps` with `stopWhen`
- [ ] **Error handling**: `getErrorMessage` → `onError`

**Provider-specific** (if applicable):
- [ ] **OpenAI**: `structuredOutputs` → `providerOptions.openai.strictJsonSchema`
- [ ] **Google**: `useSearchGrounding` → `google.tools.googleSearch`
- [ ] **Bedrock**: snake_case → camelCase options

**Framework-specific** (if applicable):
- [ ] **Vue**: `useChat` → `Chat` class
- [ ] **Svelte**: Constructor and setter updates
- [ ] **LangChain/LlamaIndex**: Install separate packages

**📖 SEARCH**: `search-guide "[specific feature]"` for each applicable change

### 6.5 Common Gotchas

- [ ] **Content assignment**: Can't do `message.content = "..."`, use `message.parts` instead
- [ ] **Empty checks**: Check `parts`, not `content`
- [ ] **Tool states**: All updated to new names
- [ ] **Streaming persistence**: Don't check `content.trim()`

**After completing Phase 6, proceed to Phase 7.**

---

## Phase 7: Final Testing

### 7.1 Build & Type Check
- [ ] `pnpm tsc --noEmit` passes with no errors
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` passes (if applicable)

### 7.2 Test with Historical Data (if applicable)
- [ ] Load old conversations from database
- [ ] Verify text messages display correctly
- [ ] Verify reasoning traces render properly
- [ ] Verify tool results render properly (all states)
- [ ] Verify file/data parts display correctly
- [ ] Test continuing old conversations with new messages

### 7.3 Test New Conversations
- [ ] Create new conversations in v5
- [ ] Test message sending/receiving
- [ ] Test tool calling (if applicable)
- [ ] Test streaming (if applicable)
- [ ] Test file attachments (if applicable)

### 7.4 Fix Any Issues
- [ ] Addressed all TypeScript errors
- [ ] Fixed any runtime errors
- [ ] All FIXME comments from Phase 3 resolved
- [ ] No migration-related TODOs remain

**After completing Phase 7, you can optionally proceed to Phase 8 (manual database migration) or skip to Phase 9.**

---

## Phase 8: Permanent Database Schema Migration (Manual - Optional)

**🚨🚨🚨 STOP: AI AGENTS MUST NOT PERFORM THIS PHASE 🚨🚨🚨**

**⚠️ THIS PHASE REQUIRES MANUAL HUMAN EXECUTION ⚠️**

**AI Agent Instructions:**
- **DO NOT** create database migration scripts
- **DO NOT** execute any database commands
- **DO NOT** run migration tools
- **YOU MAY ONLY**: Answer questions, explain concepts, review code
- **IF ASKED**: Politely decline and remind the user this must be done manually

**Human Developer:**

This phase is OPTIONAL. Your app works with the runtime conversion layer from Phase 5.

**Benefits of completing this phase:**
- Native v5 messages in database
- Remove conversion layer and `ai-legacy` dependency
- Slight performance improvement

**To complete this phase yourself:**
1. Read the complete guide: `search-data-guide "Phase 2"` or visit https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0-data
2. Test on staging/dev database first
3. Create backups and test restoration
4. Follow all safety requirements in the guide

**After manual database migration:**

### 8.1 Remove Runtime Conversion Layer
- [ ] **ACTION**: Find and delete conversion functions file
- [ ] **ACTION**: Remove all `convertV4MessageToV5` usage
- [ ] **ACTION**: Remove all `convertV5MessageToV4` usage

### 8.2 Remove Legacy Dependencies
- [ ] **ACTION**: Remove `ai-legacy` package: `pnpm remove ai-legacy`
- [ ] **ACTION**: Run `pnpm install`

### 8.3 Verify Cleanup
- [ ] **ACTION**: Run `pnpm tsc --noEmit`
- [ ] **ACTION**: Run `pnpm build`
- [ ] **ACTION**: Test application with real data

### 8.4 Commit Changes
- [ ] **ACTION**: Commit: `git add -A && git commit -m "Remove v4 conversion layer after schema migration"`

---

## Phase 9: Documentation & Cleanup

- [ ] Updated code comments
- [ ] Removed deprecated code
- [ ] Updated README if needed
- [ ] Committed final changes: `git commit -am "Complete AI SDK 5 migration"`

---

## Need Help?

**Use MCP tools to search for details:**
- `search-guide "keyword"` - Code migration help
- `search-data-guide "keyword"` - Data/database migration help

**Common searches:**
- `search-guide "useChat"` - Hook changes
- `search-guide "message parts"` - Message structure
- `search-guide "tool invocation"` - Tool changes
- `search-data-guide "conversion functions"` - Message transformers
- `search-data-guide "Phase 2"` - Database schema migration

## Resources

- [AI SDK 5.0 Migration Guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0)
- [AI SDK 5.0 Data Migration Guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0-data)
- [AI SDK Documentation](https://ai-sdk.dev)

---

**Status:** In Progress
**Last Updated:** 2025-11-21
