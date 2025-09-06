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
- **Multi-AI Support** - Supports OpenAI GPT-5, Anthropic Claude, Google Gemini, and Groq models
- **File Structure Analysis** - Parses and maintains component relationships and imports

### Configuration
- Environment variables required: `E2B_API_KEY`, `FIRECRAWL_API_KEY`, plus at least one AI provider API key
- Default AI model: `moonshotai/kimi-k2-instruct` (configurable in `app.config.ts`)
- E2B sandbox timeout: 15 minutes, Vite port: 5173

### Development Notes
- Uses Turbopack for faster development builds
- TypeScript with strict mode enabled
- ESLint configured for Next.js with custom rules
- Path aliases configured with `@/` pointing to root directory