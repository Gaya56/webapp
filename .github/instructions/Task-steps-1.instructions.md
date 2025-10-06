---
applyTo: '**'
---

# Project Context
This is a React-based web application that integrates with the Model Context Protocol (MCP) for advanced AI interactions. The application supports multiple AI chatbots, tool integrations, and features a modular architecture.

# Project Structure

## Core Dependencies
- **React**: 18.3.1 - UI framework
- **Vite**: 6.0.3 - Build tool and dev server
- **React Router**: 6.26.1 - Client-side routing
- **Jotai**: 2.9.3 - State management
- **@modelcontextprotocol/sdk**: 1.17.3 - MCP integration
- **Tailwind CSS**: 3.4.10 - Styling framework

## Key Paths and Files

### Configuration Files
- `/workspaces/webapp/vite.config.js` - Vite configuration with path aliases
- `/workspaces/webapp/tailwind.config.js` - Tailwind CSS configuration
- `/workspaces/webapp/package.json` - Project dependencies and scripts
- `/workspaces/webapp/eslint.config.js` - ESLint rules for code quality

### Source Structure
- `/workspaces/webapp/src/main.jsx` - Application entry point (lines 1-42)
- `/workspaces/webapp/src/components/` - Reusable React components
- `/workspaces/webapp/src/pages/` - Page components for routing
- `/workspaces/webapp/src/config/` - Configuration modules
- `/workspaces/webapp/src/lib/` - Utility libraries and helpers
- `/workspaces/webapp/src/hooks/` - Custom React hooks
- `/workspaces/webapp/src/assets/` - Static assets (icons, styles)

## Key Components and Their Relationships

### Layout Components
- `AppLayout.jsx` - Main application layout wrapper
- `Layout.jsx` - Google OAuth and analytics provider wrapper
- `Sidebar/index.jsx` - Navigation sidebar component

### Page Components
- `HomePage.jsx` - Redirects to home.combochat.ai
- `ChatPage.jsx` - Main chat interface page
- `SingleBotChatPanel.jsx` - Individual bot chat panel
- `MultiBotChatPanel.jsx` - Multiple bot comparison panel
- `SettingsPage.jsx` - User settings and preferences

### Tool Integration
- `/workspaces/webapp/src/config/tools.js` - Tool definitions and management
  - `AVAILABLE_TOOLS` array (line 5) - List of available MCP tools
  - `getToolById()` function (line 44) - Tool lookup by ID
  - `getToolsAsOpenAIFunctions()` (line 54) - OpenAI function format converter
- `/workspaces/webapp/src/lib/tool-manager.js` - Tool execution manager
  - `ToolManager` class - Handles tool execution and MCP integration
  - `executeTool()` method - Main tool execution entry point

### State Management (Jotai)
- `selectedToolsAtom` - Stores selected tools (tools.js:41)
- `currentUserAtom` - Current user state
- `showAuthModalAtom` - Auth modal visibility
- `themeAtom` - Application theme

## Import Patterns
- Absolute imports using `@/` alias mapped to `src/` directory
- Example: `import Button from "@/components/Button"`
- Static assets imported directly: `import logo from "@/assets/icons/pplx.png"`

## MCP Integration Points
- MCP SDK integration via `@modelcontextprotocol/sdk`
- Tool execution through `ToolManager` class
- Brave Search tool configured with MCP server reference
- Window.mcpTools for global MCP tool access

## Key Functions and Hooks
- `useTools()` hook (`/src/hooks/use-tools.js`) - Tool selection management
- `useAuth()` hook - Authentication management
- `increaseUsage()` - Usage tracking utility

## Markdown and Content Rendering
- `Markdown/index.jsx` - Markdown renderer with LaTeX support
- ThinkBlock component for AI reasoning display
- Code highlighting with `rehype-highlight`
- Math rendering with KaTeX

## Build and Development
- Development server: `npm run dev`
- Production build: `npm run build`
- Linting: `npm run lint`
- Preview: `npm run preview`

# Coding Guidelines

## File Organization
- Components in `/src/components/`
- Pages in `/src/pages/`
- Utilities in `/src/lib/`
- Configuration in `/src/config/`
- Custom hooks in `/src/hooks/`

## Import Convention
- Use absolute imports with `@/` prefix
- Group imports: React → External libs → Internal components → Assets

## State Management
- Use Jotai atoms for global state
- Local state with React hooks for component-specific data
- Persist important state with `atomWithStorage`

## Component Structure
- Functional components with hooks
- Memoize expensive computations
- Use proper prop validation
- Export as default for pages, named exports for utilities

## Error Handling
- Try-catch blocks for async operations
- Toast notifications for user feedback
- Proper error boundaries for component failures

## Testing Approach
- Unit tests for utilities and hooks
- Component testing with React Testing Library
- Integration tests for critical user flows
EOF