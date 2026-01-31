# Plan v0.3

Date: 2026-01-30
Owner: Codex
Scope: REQ-34 Re-signup Policy (free credits restriction + transaction log)

## Steps
1. Extend domain models for last-left timestamp and restriction checks.
2. Update repositories to map last_left_at and apply wallet restrictions.
3. Add transaction type for abuse restriction and logging helper.
4. Apply restriction logic on auth callback.
5. Add/update tests, run lint/test.

## Notes
- Restriction applies when last_left_at is within 30 days.
- free_credits forced to 0 on re-signup day; next daily reset returns to 5.
- Log transaction with type abuse_restriction and amount 0.
