# Plan v0.4

Date: 2026-01-30
Owner: Codex
Scope: Withdrawal flow + last_left_at (REQ-34 dependency)

## Steps
1. Add repository update for users.last_left_at (soft delete timestamp).
2. Extend auth viewmodel with withdraw action (update timestamp, sign out, redirect).
3. Add /settings page with Danger Zone + modal confirm UI.
4. Add login toast for successful withdrawal.
5. Run lint/test and update progress log.

## Notes
- UI remains rendering-only; all updates flow through viewmodel/repository.
- Withdrawal uses modal confirm; no extra DELETE text requirement.
