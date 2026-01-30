# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start Next.js development server with Turbopack
- `npm run build` - Build the application for production 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

### Testing
- `npm run test:integration` - Run E2B sandbox integration tests
- `npm run test:api` - Test API endpoints functionality
- `npm run test:code` - Test code execution features
- `npm run test:all` - Run all test suites

## Architecture Overview

This is a Next.js AI-powered code generation platform that creates and manages sandboxed React applications through E2B sandboxes. The system allows users to chat with AI to build applications instantly.

### Core Components
- **AI Chat Interface** (`app/page.tsx`) - Main UI for user interactions, handles chat, file management, and preview
- **E2B Sandboxes** - Isolated environments for running generated code with Vite
- **AI Streaming** - Real-time code generation with multiple AI providers (OpenAI, Anthropic, Google, Groq)

### Key Directories
- `app/api/` - Next.js API routes for sandbox management, AI interactions, and file operations
- `lib/` - Core utilities for file parsing, context selection, and edit intent analysis
- `types/` - TypeScript definitions for sandbox state, conversation management, and file manifests
- `config/app.config.ts` - Centralized configuration for AI models, E2B settings, and application behavior

### Data Flow
1. User inputs prompt → AI analyzes intent and context → Code generation with streaming
2. Generated code → Applied to E2B sandbox → Real-time preview updates
3. File changes tracked through conversation state and file manifests

### Key Features
- **Context-Aware Editing** - Intelligently selects relevant files based on user intent
- **Package Detection** - Automatically detects and installs missing npm packages
- **Real-time Preview** - Live sandbox preview with error detection and recovery
- **Multi-AI Support** - Supports OpenAI GPT-5.2 Codex, Anthropic Claude Sonnet 4.5, Google Gemini 3 Flash, and Kimi K2.5 (Groq)
- **File Structure Analysis** - Parses and maintains component relationships and imports

### Configuration
- Environment variables required: `E2B_API_KEY`, `FIRECRAWL_API_KEY`, plus at least one AI provider API key
- Default AI model: `moonshotai/kimi-k2.5` (configurable in `app.config.ts`)
- E2B sandbox timeout: 15 minutes, Vite port: 5173

### Development Notes
- Uses Turbopack for faster development builds
- TypeScript with strict mode enabled
- ESLint configured for Next.js with custom rules
- Path aliases configured with `@/` pointing to root directory

## Task Management with BD CLI

This project uses `bd` (beads) for issue tracking with first-class dependency support:

```bash
# List all tasks
bd list

# Create new task
bd create "Task title" -t task -p 1 -d "Description"

# Show ready work (no blockers)
bd ready

# Update task status
bd update <task-id> --title "New title"

# Close task
bd close <task-id> --reason "Completion reason"

# Add dependencies
bd dep add <task-id> blocks:<other-task-id>
```

Task types: `task`, `bug`, `feature`, `epic`, `chore`. Priorities: 0 (P0 highest) to 4 (P4 lowest).

### Using bv as an AI sidecar

bv is a fast terminal UI for Beads projects (.beads/beads.jsonl). It renders lists/details and precomputes dependency metrics (PageRank, critical path, cycles, etc.) so you instantly see blockers and execution order. For agents, it’s a graph sidecar: instead of parsing JSONL or risking hallucinated traversal, call the robot flags to get deterministic, dependency-aware outputs.

*IMPORTANT: As an agent, you must ONLY use bv with the robot flags, otherwise you'll get stuck in the interactive TUI that's intended for human usage only!*

- bv --robot-help — shows all AI-facing commands.
- bv --robot-insights — JSON graph metrics (PageRank, betweenness, HITS, critical path, cycles) with top-N summaries for quick triage.
- bv --robot-plan — JSON execution plan: parallel tracks, items per track, and unblocks lists showing what each item frees up.
- bv --robot-priority — JSON priority recommendations with reasoning and confidence.
- bv --robot-recipes — list recipes (default, actionable, blocked, etc.); apply via bv --recipe <name> to pre-filter/sort before other flags.
- bv --robot-diff --diff-since <commit|date> — JSON diff of issue changes, new/closed items, and cycles introduced/resolved.

Use these commands instead of hand-rolling graph logic; bv already computes the hard parts so agents can act safely and quickly.