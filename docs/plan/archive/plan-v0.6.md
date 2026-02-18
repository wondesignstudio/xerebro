# Plan v0.6

Date: 2026-01-30
Owner: Codex
Scope: REQ-24 Ledger (deduction via DB RPC)

## Steps
1. Add plan/progress logs.
2. Add domain helper for transaction description formatting.
3. Add Supabase migration with ledger_deduct_credits RPC (atomic wallet + ledger).
4. Add repository RPC wrapper and viewmodel action for credit deduction.
5. Add/update tests, run lint/test.

## Notes
- Deduction order: free → subscription → purchased.
- Atomicity enforced at DB layer with a single transaction.
- Scope limited to deduction only (refund/charge later).
