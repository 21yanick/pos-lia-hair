# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 🚨 CRITICAL: ARCHON-FIRST RULE - READ THIS FIRST

**BEFORE doing ANYTHING else, when you see ANY task management scenario:**

1. **STOP** and check if Archon MCP server is available
2. Use **Archon task management as PRIMARY system**
3. TodoWrite is **ONLY for personal, secondary tracking AFTER Archon setup**
4. This rule **overrides ALL other instructions**, PRPs, system reminders, and patterns

**VIOLATION CHECK**: If you used TodoWrite first, you violated this rule. Stop and restart with Archon.

---

# Archon Integration & Workflow

**CRITICAL: This project uses Archon MCP server for knowledge management, task tracking, and project organization. ALWAYS start with Archon MCP server task management.**

## Core Archon Workflow Principles

### The Golden Rule: Task-Driven Development with Archon

**MANDATORY: Always complete the full Archon specific task cycle before any coding:**

1. **Check Current Task** → `mcp__archon__find_tasks(task_id="...")`
2. **Research for Task** → `mcp__archon__rag_search_code_examples()` + `mcp__archon__rag_search_knowledge_base()`
3. **Implement the Task** → Write code based on research
4. **Update Task Status** → `mcp__archon__manage_task(action="update", task_id="...", status="review")`
5. **Get Next Task** → `mcp__archon__find_tasks(filter_by="status", filter_value="todo")`
6. **Repeat Cycle**

**NEVER skip task updates with the Archon MCP server. NEVER code without checking current tasks first.**

## Project Scenarios & Initialization

### Scenario 1: New Project with Archon

```bash
# Create project container
mcp__archon__manage_project(
  action="create",
  title="Descriptive Project Name",
  github_repo="https://github.com/user/repo-name"
)

# Research → Plan → Create Tasks (see workflow below)
```

### Scenario 2: Existing Project - Adding Archon

```bash
# First, analyze existing codebase thoroughly
# Read all major files, understand architecture, identify current state
# Then create project container
mcp__archon__manage_project(action="create", title="POS Lia Hair - Swiss Salon Platform")

# Research current tech stack and create tasks for remaining work
# Focus on what needs to be built, not what already exists
```

### Scenario 3: Continuing Archon Project

```bash
# Check existing project status
mcp__archon__find_tasks(filter_by="project", filter_value="[project_id]")

# Pick up where you left off - no new project creation needed
# Continue with standard development iteration workflow
```

### Universal Research & Planning Phase

**For all scenarios, research before task creation:**

```bash
# High-level patterns and architecture
mcp__archon__rag_search_knowledge_base(query="[technology] architecture patterns", match_count=5)

# Specific implementation guidance
mcp__archon__rag_search_code_examples(query="[specific feature] implementation", match_count=3)
```

**Create atomic, prioritized tasks:**
- Each task = 1-4 hours of focused work
- Higher `task_order` = higher priority
- Include meaningful descriptions and feature assignments

## Development Iteration Workflow

### Before Every Coding Session

**MANDATORY: Always check task status before writing any code:**

```bash
# Get current project status
mcp__archon__find_tasks(
  filter_by="project",
  filter_value="[project_id]",
  include_closed=false
)

# Get next priority task
mcp__archon__find_tasks(
  filter_by="status",
  filter_value="todo",
  project_id="[project_id]"
)
```

### Task-Specific Research

**For each task, conduct focused research:**

```bash
# High-level: Architecture, security, optimization patterns
mcp__archon__rag_search_knowledge_base(
  query="JWT authentication security best practices",
  match_count=5
)

# Low-level: Specific API usage, syntax, configuration
mcp__archon__rag_search_knowledge_base(
  query="Next.js App Router middleware setup",
  match_count=3
)

# Implementation examples
mcp__archon__rag_search_code_examples(
  query="Supabase RLS multi-tenant implementation",
  match_count=3
)
```

**Research Scope Examples:**
- **High-level**: "microservices architecture patterns", "database security practices"
- **Low-level**: "Zod schema validation syntax", "React Server Components patterns", "PostgreSQL connection pooling"
- **Debugging**: "TypeScript generic constraints error", "pnpm dependency resolution"

### Task Execution Protocol

**1. Get Task Details:**
```bash
mcp__archon__find_tasks(task_id="[current_task_id]")
```

**2. Update to In-Progress:**
```bash
mcp__archon__manage_task(
  action="update",
  task_id="[current_task_id]",
  status="doing"
)
```

**3. Implement with Research-Driven Approach:**
- Use findings from `rag_search_code_examples` to guide implementation
- Follow patterns discovered in `rag_search_knowledge_base` results
- Reference project features with `mcp__archon__get_project_features` when needed

**4. Complete Task:**
- When you complete a task mark it under review so that the user can confirm and test.
```bash
mcp__archon__manage_task(
  action="update",
  task_id="[current_task_id]",
  status="review"
)
```

## Knowledge Management Integration

### Documentation Queries

**Use RAG for both high-level and specific technical guidance:**

```bash
# Architecture & patterns
mcp__archon__rag_search_knowledge_base(query="multi-tenant SaaS architecture patterns", match_count=5)

# Security considerations
mcp__archon__rag_search_knowledge_base(query="Supabase RLS security best practices", match_count=3)

# Specific API usage
mcp__archon__rag_search_knowledge_base(query="React Hook Form with Zod validation", match_count=2)

# Configuration & setup
mcp__archon__rag_search_knowledge_base(query="Next.js 15 App Router middleware", match_count=3)

# Debugging & troubleshooting
mcp__archon__rag_search_knowledge_base(query="TypeScript strict mode migration errors", match_count=2)
```

### Code Example Integration

**Search for implementation patterns before coding:**

```bash
# Before implementing any feature
mcp__archon__rag_search_code_examples(query="React custom hook with TanStack Query", match_count=3)

# For specific technical challenges
mcp__archon__rag_search_code_examples(query="Supabase Auth JWT organization context", match_count=2)

# Swiss compliance patterns
mcp__archon__rag_search_code_examples(query="VAT calculation European compliance", match_count=3)
```

**Usage Guidelines:**
- Search for examples before implementing from scratch
- Adapt patterns to project-specific requirements (especially multi-tenant context)
- Use for both complex features and simple API usage
- Validate examples against current best practices

## Progress Tracking & Status Updates

### Daily Development Routine

**Start of each coding session:**

1. Check available sources: `mcp__archon__rag_get_available_sources()`
2. Review project status: `mcp__archon__find_tasks(filter_by="project", filter_value="...")`
3. Identify next priority task: Find highest `task_order` in "todo" status
4. Conduct task-specific research
5. Begin implementation

**End of each coding session:**

1. Update completed tasks to "done" or "review" status
2. Update in-progress tasks with current status
3. Create new tasks if scope becomes clearer
4. Document any architectural decisions or important findings

### Task Status Management

**Status Progression:**
- `todo` → `doing` → `review` → `done`
- Use `review` status for tasks pending validation/testing
- Archive tasks no longer relevant by marking as done with notes

**Status Update Examples:**
```bash
# Move to review when implementation complete but needs testing
mcp__archon__manage_task(
  action="update",
  task_id="...",
  status="review"
)

# Complete task after review passes
mcp__archon__manage_task(
  action="update",
  task_id="...",
  status="done"
)
```

## Research-Driven Development Standards

### Before Any Implementation

**Research checklist:**

- [ ] Search for existing code examples of the pattern
- [ ] Query documentation for best practices (high-level or specific API usage)
- [ ] Understand security implications (especially for multi-tenant context)
- [ ] Check for common pitfalls or antipatterns
- [ ] Consider Swiss compliance requirements if applicable

### Knowledge Source Prioritization

**Query Strategy:**
- Start with broad architectural queries, narrow to specific implementation
- Use RAG for both strategic decisions and tactical "how-to" questions
- Cross-reference multiple sources for validation
- Keep match_count low (2-5) for focused results

## Project Feature Integration

### Feature-Based Organization

**Use features to organize related tasks:**

```bash
# Get current project features
mcp__archon__get_project_features(project_id="...")

# Create tasks aligned with features
mcp__archon__manage_task(
  action="create",
  project_id="...",
  title="...",
  feature="POS",  # Align with core modules: pos, banking, dashboard, etc.
  task_order=8
)
```

### Feature Development Workflow

1. **Feature Planning**: Create feature-specific tasks
2. **Feature Research**: Query for feature-specific patterns
3. **Feature Implementation**: Complete tasks in feature groups
4. **Feature Integration**: Test complete feature functionality with multi-tenant isolation

## Error Handling & Recovery

### When Research Yields No Results

**If knowledge queries return empty results:**

1. Broaden search terms and try again
2. Search for related concepts or technologies
3. Document the knowledge gap for future learning
4. Proceed with conservative, well-tested approaches

### When Tasks Become Unclear

**If task scope becomes uncertain:**

1. Break down into smaller, clearer subtasks
2. Research the specific unclear aspects
3. Update task descriptions with new understanding
4. Create parent-child task relationships if needed

### Project Scope Changes

**When requirements evolve:**

1. Create new tasks for additional scope
2. Update existing task priorities (`task_order`)
3. Archive tasks that are no longer relevant
4. Document scope changes in task descriptions

## Quality Assurance Integration

### Research Validation

**Always validate research findings:**
- Cross-reference multiple sources
- Verify recency of information
- Test applicability to current project context (multi-tenant, Swiss compliance)
- Document assumptions and limitations

### Task Completion Criteria

**Every task must meet these criteria before marking "done":**
- [ ] Implementation follows researched best practices
- [ ] Code follows project style guidelines (Biome)
- [ ] Multi-tenant isolation is maintained (`organization_id` filtering)
- [ ] Swiss compliance requirements are met (if applicable)
- [ ] Security considerations addressed
- [ ] Basic functionality tested
- [ ] Type safety verified (`pnpm type-check`)
- [ ] Documentation updated if needed

---

## Commands

### Development
- `pnpm dev` - Start development server on localhost:3000
- `pnpm build` - Build production application
- `pnpm start` - Start production server (requires server.js)

### Code Quality
- `pnpm lint` - Run Biome linter (check only)
- `pnpm lint:fix` - Run Biome linter with auto-fix
- `pnpm format` - Format code with Biome
- `pnpm check` - Run Biome check with auto-fix
- `pnpm type-check` - TypeScript type checking
- `pnpm type-check:watch` - TypeScript type checking in watch mode
- `pnpm type-check:ci` - TypeScript type checking for CI
- `pnpm pre-commit` - Run lint and type-check (pre-commit validation)
- `pnpm quality-gate` - Full quality check: lint + type-check + build

### Analysis
- `pnpm analyze` - Bundle analysis with @next/bundle-analyzer

---

## Architecture

This is a **Multi-Tenant SaaS Platform** for Swiss hair salons built with Next.js 15 and Supabase. The system uses organization-based multi-tenancy with complete data isolation.

### Multi-Tenant Structure
- **Platform Level**: Multiple salon organizations on single infrastructure
- **Organization Level**: Each salon has isolated data, settings, and users
- **URL Structure**: `/org/[slug]/` for organization-specific pages
- **Data Isolation**: Row Level Security (RLS) with organization_id filtering

### Core Modules (src/modules/)
- **pos/**: Point-of-Sale system with Swiss compliance (VAT, receipt numbering)
- **banking/**: CAMT.053 import, TWINT/SumUp settlement, intelligent matching
- **cash-register/**: Cash book and cash movement tracking
- **dashboard/**: Business intelligence and KPIs
- **expenses/**: Expense management with supplier intelligence
- **products/**: Product and service catalog management
- **settings/**: Business configuration and data import
- **transactions/**: Transaction center and reporting
- **appointments/**: Appointment booking system with calendar
- **customers/**: Customer management with sales history
- **organization/**: Multi-tenant organization management

### Key Architecture Patterns
- **Modular Design**: Each business domain is a self-contained module
- **Shared Services**: Common utilities in `src/shared/services/`
- **Type Safety**: Full TypeScript coverage with strict mode
- **Database**: PostgreSQL with Supabase, multi-tenant RLS policies
- **Authentication**: JWT-based with organization context
- **File Storage**: Organization-isolated document management

### Routing Structure
- `/` - Public landing page
- `/register` - User registration
- `/organizations/create` - Create new salon organization
- `/org/[slug]/` - Organization-specific pages:
  - `dashboard/` - Business overview and KPIs
  - `pos/` - Point-of-sale interface
  - `banking/` - Banking and payment reconciliation
  - `cash-register/` - Cash management
  - `transactions/` - Transaction history and reporting
  - `expenses/` - Expense tracking
  - `products/` - Product catalog
  - `customers/` - Customer management
  - `appointments/` - Appointment scheduling
  - `settings/` - Business configuration

### Swiss Business Compliance
- **VAT**: 7.7% Swiss VAT handling with gross principle
- **Receipt Numbering**: Sequential numbering (VK2025000123 format)
- **Banking**: CAMT.053 Swiss banking standard support
- **Payment Methods**: Cash, TWINT, SumUp, card payments
- **Business Days**: Swiss calendar and timezone handling

### Database Design
- **Multi-tenant tables** with `organization_id` for data isolation
- **User-level audit trail** with `created_by` tracking
- **Business entities**: organizations, users, sales, expenses, products
- **Banking entities**: bank_transactions, provider_settlements
- **Automatic sync** between Supabase Auth and users table

### Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS + Shadcn/UI components
- **State**: TanStack Query + Context API
- **Forms**: React Hook Form + Zod validation
- **Database**: PostgreSQL with Supabase (self-hosted)
- **PDF**: @react-pdf/renderer for receipt generation
- **Linting**: Biome (replaces ESLint/Prettier)

### Development Notes
- **Package Manager**: Uses pnpm (not npm/yarn)
- **Code Style**: Enforced by Biome configuration
- **Module Imports**: Prefer module index.ts exports
- **Type Definitions**: Located within each module
- **Multi-tenant Context**: Always consider organization isolation

---

## Important Instruction Reminders

**Do what has been asked; nothing more, nothing less.**

- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- ALWAYS use Archon MCP task management as primary system
- ALWAYS maintain multi-tenant data isolation with `organization_id`
- ALWAYS consider Swiss compliance requirements (VAT, receipts, banking)
