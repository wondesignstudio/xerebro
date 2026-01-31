# Plan v0.1

Date: 2026-01-30
Owner: Codex
Scope: Foundations (Next.js scaffold + Supabase base + layered structure + minimal auth/wallet UI)

## Steps
1. Scaffold Next.js 14 app (TS, Tailwind, App Router, src/) and install core dependencies.
2. Establish layer folders (UI/ViewModel/Repository/Domain) and add Supabase server client + env example.
3. Implement domain models + repository functions for wallets/transactions and session helpers.
4. Implement viewmodels (server actions) for auth, wallet, transactions.
5. Build minimal UI (login, dashboard) and route protection.
6. Add minimal tests for domain logic and run lint.

## Notes
- Follow AGENTS.md: no business logic in UI; repository handles data access.
- Comments added where logic is non-obvious.
