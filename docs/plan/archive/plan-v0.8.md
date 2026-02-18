# Plan v0.8

Date: 2026-01-30
Owner: Codex
Scope: REQ-04 Report Reward (instant compensation + lead_reports)

## Steps
1. Add plan/progress logs.
2. Update domain transaction types/formatting for report_reward.
3. Add Supabase migration: lead_reports table + ledger_reward_credits RPC.
4. Add repository RPC wrapper and lead report action.
5. Add UI modal for report reason/detail and wire to action.
6. Run lint/test and update progress log.

## Notes
- Reward is instant; credits are added to free_credits.
- lead_reports must be recorded for abuse prevention.
- Lead status is updated to reported when reward is granted.
