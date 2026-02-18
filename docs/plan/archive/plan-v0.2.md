# Plan v0.2

Date: 2026-01-30
Owner: Codex
Scope: Consent Gate (REQ-33) + redirect flow updates

## Steps
1. Add domain model for user profile/consent.
2. Add repository functions to read/update user consent (users table).
3. Add viewmodel actions/queries/guards for consent flow.
4. Add consent UI route and redirect logic (login → consent → dashboard).
5. Add tests for consent domain logic and run lint/test.

## Notes
- UI should remain rendering-only; all data access goes through viewmodel/repository.
- Consent requires terms agreement; marketing is optional.
