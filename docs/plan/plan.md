# Plan (Combined)

<!-- Combined on 2026-02-01 -->

## Plan v0.60

Date: 2026-02-18
Owner: Codex
Scope: Hosted-pages browser E2E bootstrap with Playwright

### Steps
1. Add Playwright config and npm scripts for e2e/auth setup runs.
2. Add manual auth-state capture flow for OAuth-only login.
3. Add hosted-pages critical flow browser spec (create → detail save → list publish toggle).
4. Add concise run/setup documentation and validate lint/test.


---

## Plan v0.59

Date: 2026-02-18
Owner: Codex
Scope: Hosted-pages create/detail/toggle workflow regression automation

### Steps
1. Add workflow-level tests for hosted-pages create action redirect behavior.
2. Add workflow-level tests for update action redirect branching (detail vs list fallback).
3. Keep architecture boundaries unchanged by mocking guards/repositories in viewmodel tests.
4. Run test/lint and record progress.


---

## Plan v0.58

Date: 2026-02-18
Owner: Codex
Scope: Hosted-page update redirect branch regression tests

### Steps
1. Expose minimal pure redirect helper utilities from hosted-page actions for isolated testing.
2. Add unit tests for `redirectTo` branch rules (list, matching detail, invalid fallback).
3. Add query-param mutation tests for redirect helper.
4. Run test/lint and record progress update.


---

## Plan v0.57

Date: 2026-02-16
Owner: Codex
Scope: Hosted-page submit button feedback parity and detail redirect consistency

### Steps
1. Add safe optional redirect target handling in hosted-page update action.
2. Route detail-form updates back to detail page to surface saved/failed button feedback.
3. Map create/settings feedback states from query params and reflect them in button labels.
4. Run lint and record progress update.


---

## Plan v0.56

Date: 2026-02-14
Owner: Codex
Scope: Hosted-page slug form UX parity with context-link validation flow

### Steps
1. Apply real-time normalized slug validation to hosted-page create form.
2. Apply the same validation and submit-blocking rules to hosted-page settings form.
3. Keep server-side validation unchanged as final safety guard.
4. Run lint and redeploy production.


---

## Plan v0.55

Date: 2026-02-14
Owner: Codex
Scope: Development stack and architecture documentation bootstrap

### Steps
1. Add a dedicated architecture documentation file for current runtime stack.
2. Document layer responsibilities and service topology with a mermaid diagram.
3. Add update policy and stack change log section for future maintenance.
4. Run lint and record progress update.


---

## Plan v0.54

Date: 2026-02-14
Owner: Codex
Scope: Context-link slug UX guard (real-time validation + submit block)

### Steps
1. Convert context-link slug input to controlled state.
2. Add real-time normalized-length validation and invalid-pattern detection.
3. Block submit when slug is invalid or over 40 chars and show inline error copy.
4. Run lint and push production deploy for verification.


---

## Plan v0.53

Date: 2026-02-11
Owner: Codex
Scope: Context-link slug length enforcement + legacy alias redirect

### Steps
1. Add domain-level context-link slug max length validator and tests.
2. Enforce max length in context-link create action and surface explicit error copy.
3. Add UI input max length and long-text wrapping on context-link surfaces.
4. Add context-link alias/backfill migration and slug-length DB constraint validation.
5. Add `/c/[slug]` alias fallback redirect, then run lint/test/build + production deploy.


---

## Plan v0.52

Date: 2026-02-11
Owner: Codex
Scope: Legacy long-slug backfill + alias redirect compatibility

### Steps
1. Add DB migration for `hosted_page_slug_aliases` table and long-slug backfill.
2. Add published slug-alias resolver in hosted-page repository/query layer.
3. Apply `/p/[slug]` fallback redirect from legacy slug to current published slug.
4. Harden hosted-pages list/detail UI for long text wrapping.
5. Run lint/test/build and redeploy production alias.


---

## Plan v0.51

Date: 2026-02-11
Owner: Codex
Scope: Hosted-page slug length limit enforcement (max 40)

### Steps
1. Add shared domain constant/validator for slug max length.
2. Enforce length in hosted-page create/update server actions.
3. Apply input `maxLength` + user-facing error copy on hosted-pages list/detail.
4. Add DB check constraint migration and run lint/test/build + production deploy.


---

## Plan v0.50

Date: 2026-02-11
Owner: Codex
Scope: Hosted-pages mobile QA pass (button alignment/spacing/form wrap)

### Steps
1. Improve hosted-page detail CTA layout for mobile-first stacking.
2. Adjust context-link action button widths for stable wrapping on small screens.
3. Improve create-form input width handling on mobile.
4. Run lint/build and deploy production alias.


---

## Plan v0.49

Date: 2026-02-11
Owner: Codex
Scope: Hosted-page URL copy feedback interaction update

### Steps
1. Replace toast feedback with in-button label state transitions.
2. Keep copy behavior and publication guard unchanged.
3. Add brief success/error visual feedback on button style.
4. Run lint/build and deploy production alias.


---

## Plan v0.48

Date: 2026-02-11
Owner: Codex
Scope: Hosted-page detail public URL copy UX

### Steps
1. Add a client-side public URL field component for hosted-page detail.
2. Keep URL click-through behavior and add explicit copy button.
3. Add copy success/failure toast feedback on interaction.
4. Run lint/test/build and deploy production alias.


---

## Plan v0.47

Date: 2026-02-11
Owner: Codex
Scope: Production debug-surface lock-down

### Steps
1. Introduce a single runtime gate for debug features (`NODE_ENV !== production` or explicit override env).
2. Block `/api/debug/*` endpoints in production with not-found responses.
3. Block `?debug=1` hosted-page detail mode in production and fall back to normal detail route.
4. Add unit tests for debug gate behavior and run lint/test/build + production deploy.


---

## Plan v0.46

Date: 2026-02-11
Owner: Codex
Scope: Hosted-page create flow duplicate-submit hardening

### Steps
1. Add client-side submit lock for hosted-page create form.
2. Keep server-action flow intact while preventing repeated submissions before redirect.
3. Stabilize create CTA visual state with fixed-width loading label.
4. Run lint/build and deploy production alias.


---

## Plan v0.45

Date: 2026-02-11
Owner: Codex
Scope: Hosted-page detail deferred context loading stabilization

### Steps
1. Move hosted-page context links section to client-driven deferred fetch (`/api/hosted-pages/[id]/context`).
2. Remove invalid `next/dynamic` server usage (`ssr: false`) from server page to prevent runtime/build errors.
3. Keep server actions wired into the client section and preserve existing flow.
4. Run lint/test/build and deploy production alias.


---

## Plan v0.44

Date: 2026-02-11
Owner: Codex
Scope: Hosted-pages detail query slimming

### Steps
1. Remove unnecessary admin fallback query from hosted-pages list reads.
2. Reduce context-link lead option payload/limit for detail screen.
3. Build and deploy production.
4. Re-check hosted-pages response timing and headers.


---

## Plan v0.43

Date: 2026-02-11
Owner: Codex
Scope: Region co-location optimization for perceived latency

### Steps
1. Pin Vercel function region to `icn1` in deployment config.
2. Keep app/hosted-pages segment region preference close to KR/JP.
3. Build and deploy production.
4. Verify runtime region via response headers (`x-vercel-id`).


---

## Plan v0.42

Date: 2026-02-11
Owner: Codex
Scope: Hosted pages transition speed-up and responsiveness pass

### Steps
1. Remove redundant hosted-pages session fetches from repository read paths.
2. Tighten GSAP reveal defaults to avoid delayed visual entry between screens.
3. Add pending interaction feedback to hosted page create flow.
4. Improve top-nav prefetch hints for faster route transitions.
5. Run lint/build and deploy production.


---

## Plan v0.41

Date: 2026-02-09
Owner: Codex
Scope: Brand Identity module bootstrap (Core Interview + Persona Tuning)

### Steps
1. Add `users` profile columns for Brand Identity persistence.
2. Extend user domain/mapper/repository to read and upsert brand identity fields.
3. Extend auth viewmodel queries/actions for brand identity state and save flow.
4. Add `/brand-identity` page UI with core interview/persona tuning form.
5. Connect navigation/dashboard entry points and run lint/build.


---

## Plan v0.40

Date: 2026-02-06
Owner: Codex
Scope: Route transition loading UX policy enforcement

### Steps
1. Add a shared route loading component with a 1-second threshold.
2. Show skeleton UI only for the first second of waiting.
3. Switch to non-skeleton loading UI when waiting exceeds one second.
4. Wire the component via `app/loading.tsx`.
5. Run lint/build and verify no regressions.


---

## Plan v0.39

Date: 2026-02-06
Owner: Codex
Scope: Hosted pages reveal regression fix (render then disappear)

### Steps
1. Diagnose render flicker/disappear path after hosted page creation.
2. Fix `GsapReveal` initial-state handling to avoid persistent hidden state.
3. Run lint/build and deploy production.


---

## Plan v0.38

Date: 2026-02-06
Owner: Codex
Scope: Hosted pages UX refinement (simple modern UI + GSAP interactions)

### Steps
1. Audit hosted-pages flow with heuristic checks (location clarity, action hierarchy, consistency).
2. Refactor shared navigation and breadcrumb to a lighter, less intrusive style.
3. Redesign `/hosted-pages` list page for clearer CTA and status visibility.
4. Redesign `/hosted-pages/[id]` detail page for straightforward edit flow.
5. Add GSAP-based reveal interactions to major sections.
6. Run lint/build and update plan/progress logs.


---

## Plan v0.37

Date: 2026-02-06
Owner: Codex
Scope: Hosted pages/user-flow heuristic fixes (navigation and location awareness)

### Steps
1. Run heuristic inspection on current app pages (location clarity, consistency, control, feedback).
2. Add shared app navigation and breadcrumb components.
3. Apply to key pages (`dashboard`, `leads`, `settings`, `hosted-pages`, `pricing`) without breaking layer boundaries.
4. Normalize internal navigation links to `Link`.
5. Run lint/build.


---

## Plan v0.36

Date: 2026-02-06
Owner: Codex
Scope: Hosted page detail ownership mismatch recovery

### Steps
1. Reproduce hosted page detail "not found" path and confirm ownership check failure path.
2. Harden hosted page fetch fallback to recover ownership when the same email is detected across user IDs.
3. Keep access control in repository/viewmodel layers (no UI-side bypass).
4. Run lint/test/build and deploy production.


---

## Plan v0.35

Date: 2026-02-02
Owner: Codex
Scope: Hosted page detail routing bug fix (`params` resolution on Next.js 16)

### Steps
1. Update dynamic route pages to resolve async `params`.
2. Add a published hosted page route (`/p/[slug]`) and query path.
3. Add hosted page debug API endpoint for ownership/session snapshot.
4. Run tests and lint.


---

## Plan v0.27

Date: 2026-02-01
Owner: Codex
Scope: Hosted Pages UI skeleton (REQ-25 follow-up)

### Steps
1. Refresh /hosted-pages layout with placeholder sections (header, metrics, templates, list, next steps).
2. Preserve Pro guard and keep UI rendering-only.
3. Update plan/progress logs.
4. Run lint.


---

## Plan v0.28

Date: 2026-02-01
Owner: Codex
Scope: Hosted Pages CRUD schema + endpoints

### Steps
1. Add hosted_pages migration with indexes and RLS policies.
2. Add hosted page domain model + slug helpers.
3. Add repository CRUD functions and viewmodel actions/queries.
4. Add domain tests for slug normalization.
5. Run lint.


---

## Plan v0.29

Date: 2026-02-01
Owner: Codex
Scope: Hosted Pages list/create wiring

### Steps
1. Wire /hosted-pages to list user pages via viewmodel query.
2. Add create form (optional slug) tied to server action.
3. Add empty state + status banner UX.
4. Run lint.


---

## Plan v0.30

Date: 2026-02-01
Owner: Codex
Scope: Hosted Page detail skeleton route

### Steps
1. Add /hosted-pages/[id] route with Pro guard via query helper.
2. Render page metadata, URL preview, and editor placeholder.
3. Update plan/progress logs.
4. Run lint.


---

## Plan v0.31

Date: 2026-02-01
Owner: Codex
Scope: Hosted Pages publish toggle wiring

### Steps
1. Add publish/unpublish toggle actions in hosted pages list.
2. Wire toggle to updateHostedPageAction.
3. Update plan/progress logs.
4. Run lint.


---

## Plan v0.32

Date: 2026-02-01
Owner: Codex
Scope: Hosted Page detail edit form

### Steps
1. Add meta edit form (slug/theme/publish) on hosted page detail.
2. Wire form to updateHostedPageAction and show status banner.
3. Update plan/progress logs.
4. Run lint.


---

## Plan v0.33

Date: 2026-02-01
Owner: Codex
Scope: Hosted Pages create/list revalidation fix

### Steps
1. Revalidate /hosted-pages after create/update/delete actions.
2. Revalidate detail route after create/update.
3. Run lint.


---

## Plan v0.26

Date: 2026-02-01
Owner: Codex
Scope: REQ-25 Plan Enforcement + Pricing entry point

### Steps
1. Add plan/progress logs.
2. Extend user profile mapping with current_plan.
3. Add Pro plan guard and wire hosted pages.
4. Add /pricing page (REQ-39 entry) and /hosted-pages placeholder.
5. Add dashboard Pro CTA with upgrade modal.
6. Run lint.


---

## Plan v0.25

Date: 2026-02-01
Owner: Codex
Scope: Consolidate plan markdown files

### Steps
1. Merge plan-v0.* into plan.md.
2. Archive plan-v0.* files.


---

<!-- Source: plan-v0.1.md -->
## Plan v0.1

Date: 2026-01-30
Owner: Codex
Scope: Foundations (Next.js scaffold + Supabase base + layered structure + minimal auth/wallet UI)

### Steps
1. Scaffold Next.js 14 app (TS, Tailwind, App Router, src/) and install core dependencies.
2. Establish layer folders (UI/ViewModel/Repository/Domain) and add Supabase server client + env example.
3. Implement domain models + repository functions for wallets/transactions and session helpers.
4. Implement viewmodels (server actions) for auth, wallet, transactions.
5. Build minimal UI (login, dashboard) and route protection.
6. Add minimal tests for domain logic and run lint.

### Notes
- Follow AGENTS.md: no business logic in UI; repository handles data access.
- Comments added where logic is non-obvious.


---

<!-- Source: plan-v0.2.md -->
## Plan v0.2

Date: 2026-01-30
Owner: Codex
Scope: Consent Gate (REQ-33) + redirect flow updates

### Steps
1. Add domain model for user profile/consent.
2. Add repository functions to read/update user consent (users table).
3. Add viewmodel actions/queries/guards for consent flow.
4. Add consent UI route and redirect logic (login → consent → dashboard).
5. Add tests for consent domain logic and run lint/test.

### Notes
- UI should remain rendering-only; all data access goes through viewmodel/repository.
- Consent requires terms agreement; marketing is optional.


---

<!-- Source: plan-v0.3.md -->
## Plan v0.3

Date: 2026-01-30
Owner: Codex
Scope: REQ-34 Re-signup Policy (free credits restriction + transaction log)

### Steps
1. Extend domain models for last-left timestamp and restriction checks.
2. Update repositories to map last_left_at and apply wallet restrictions.
3. Add transaction type for abuse restriction and logging helper.
4. Apply restriction logic on auth callback.
5. Add/update tests, run lint/test.

### Notes
- Restriction applies when last_left_at is within 30 days.
- free_credits forced to 0 on re-signup day; next daily reset returns to 5.
- Log transaction with type abuse_restriction and amount 0.


---

<!-- Source: plan-v0.4.md -->
## Plan v0.4

Date: 2026-01-30
Owner: Codex
Scope: Withdrawal flow + last_left_at (REQ-34 dependency)

### Steps
1. Add repository update for users.last_left_at (soft delete timestamp).
2. Extend auth viewmodel with withdraw action (update timestamp, sign out, redirect).
3. Add /settings page with Danger Zone + modal confirm UI.
4. Add login toast for successful withdrawal.
5. Run lint/test and update progress log.

### Notes
- UI remains rendering-only; all updates flow through viewmodel/repository.
- Withdrawal uses modal confirm; no extra DELETE text requirement.


---

<!-- Source: plan-v0.5.md -->
## Plan v0.5

Date: 2026-01-30
Owner: Codex
Scope: Add settings navigation link

### Steps
1. Add plan/progress logs.
2. Add Settings link in dashboard header.
3. Run lint/test and update progress log.


---

<!-- Source: plan-v0.6.md -->
## Plan v0.6

Date: 2026-01-30
Owner: Codex
Scope: REQ-24 Ledger (deduction via DB RPC)

### Steps
1. Add plan/progress logs.
2. Add domain helper for transaction description formatting.
3. Add Supabase migration with ledger_deduct_credits RPC (atomic wallet + ledger).
4. Add repository RPC wrapper and viewmodel action for credit deduction.
5. Add/update tests, run lint/test.

### Notes
- Deduction order: free → subscription → purchased.
- Atomicity enforced at DB layer with a single transaction.
- Scope limited to deduction only (refund/charge later).


---

<!-- Source: plan-v0.7.md -->
## Plan v0.7

Date: 2026-01-30
Owner: Codex
Scope: REQ-01 Daily Lead Curation (list/detail + credit deduction)

### Steps
1. Add plan/progress logs.
2. Add lead domain model and repository queries.
3. Add leads viewmodel (list, detail, view action with ledger deduction).
4. Add leads UI with split view and view action wiring.
5. Run lint/test and update progress log.

### Notes
- Only status='new' leads, ordered by ai_urgency_score desc, limit 5.
- Lead view deducts 1 credit and logs transaction via ledger RPC.
- Lead status is not changed on view.


---

<!-- Source: plan-v0.8.md -->
## Plan v0.8

Date: 2026-01-30
Owner: Codex
Scope: REQ-04 Report Reward (instant compensation + lead_reports)

### Steps
1. Add plan/progress logs.
2. Update domain transaction types/formatting for report_reward.
3. Add Supabase migration: lead_reports table + ledger_reward_credits RPC.
4. Add repository RPC wrapper and lead report action.
5. Add UI modal for report reason/detail and wire to action.
6. Run lint/test and update progress log.

### Notes
- Reward is instant; credits are added to free_credits.
- lead_reports must be recorded for abuse prevention.
- Lead status is updated to reported when reward is granted.


---

<!-- Source: plan-v0.10.md -->
## Plan v0.10

Date: 2026-01-30
Owner: Codex
Scope: REQ-02 AI Conversational Editor (draft_message + undo)

### Steps
1. Add plan/progress logs.
2. Add DB migrations for draft_message and lead_draft_versions.
3. Add OpenAI API route (Responses API, gpt-4o-mini).
4. Add repositories/viewmodels for draft update + undo.
5. Add UI for draft display + chat input + undo.
6. Run lint/test and update progress log.

### Notes
- Non-streaming responses (spinner + full update).
- History stored in DB; UI exposes only 1-step undo.
- Safety guardrails in system prompt.


---

<!-- Source: plan-v0.11.md -->
## Plan v0.11

Date: 2026-01-30
Owner: Codex
Scope: REQ-03 One-Click Copy (draft copy + status update)

### Steps
1. Add plan/progress logs.
2. Add repository helper for conditional status update.
3. Add viewmodel action for copy handling.
4. Add client copy button + toast UI.
5. Run lint/test and update progress log.

### Notes
- Copy priority: draft_message, else content_summary + original_url.
- Status update only when status='new'.


---

<!-- Source: plan-v0.12.md -->
## Plan v0.12

Date: 2026-01-30
Owner: Codex
Scope: Lead status badges in list/detail

### Steps
1. Add plan/progress logs.
2. Add status badge styles for lead list and detail.
3. Run lint/test and update progress log.


---

<!-- Source: plan-v0.13.md -->
## Plan v0.13

Date: 2026-01-30
Owner: Codex
Scope: REQ-28 Async Process Bridge (email notification)

### Steps
1. Add plan/progress logs.
2. Add lead_notifications table migration.
3. Add repository + viewmodel for notification requests.
4. Update leads empty-state UI with notify action.
5. Run lint/test and update progress log.

### Notes
- Channel: email only.
- Notification type: initial_search.
- Status: pending/sent.


---

<!-- Source: plan-v0.14.md -->
## Plan v0.14

Date: 2026-01-30
Owner: Codex
Scope: REQ-02 History UI (recent 5 + restore)

### Steps
1. Add plan/progress logs.
2. Extend draft history repository/query with recent list + fetch by id.
3. Add restore action (overwrite without new version).
4. Add history list UI (relative time + preview, restore buttons).
5. Run lint/test and update progress log.


---

<!-- Source: plan-v0.15.md -->
## Plan v0.15

Date: 2026-01-30
Owner: Codex
Scope: REQ-28 Notification Pipeline (Resend + Cron)

### Steps
1. Add plan/progress logs.
2. Add Resend mailer and cron API route.
3. Extend notification repository for pending fetch + sent update.
4. Add Vercel cron configuration and env samples.
5. Run lint/test and update progress log.


---

<!-- Source: plan-v0.16.md -->
## Plan v0.16

Date: 2026-01-31
Owner: Codex
Scope: Vercel Cron Schedule (Hobby-safe daily)

### Steps
1. Add plan/progress logs.
2. Update Vercel cron schedule to daily.
3. Redeploy production with updated cron.
4. Update progress log.


---

<!-- Source: plan-v0.17.md -->
## Plan v0.17

Date: 2026-01-31
Owner: Codex
Scope: Vercel Custom Domain (xerebro.me)

### Steps
1. Add plan/progress logs.
2. Add custom domain to Vercel project.
3. Provide DNS instructions for Gabia (A record + optional www CNAME).
4. Update APP_BASE_URL to https://xerebro.me and redeploy after verification.
5. Update progress log.


---

<!-- Source: plan-v0.18.md -->
## Plan v0.18

Date: 2026-01-31
Owner: Codex
Scope: Vercel Framework Fix (force Next.js build)

### Steps
1. Add plan/progress logs.
2. Update vercel.json to use @vercel/next build.
3. Redeploy production and confirm root responds.
4. Update progress log.


---

<!-- Source: plan-v0.19.md -->
## Plan v0.19

Date: 2026-01-31
Owner: Codex
Scope: RLS Minimum Policies + Service Role Cron

### Steps
1. Add plan/progress logs.
2. Add RLS policies for user-owned tables (exclude leads).
3. Add service role Supabase client for cron usage.
4. Update cron route to use admin client.
5. Update env sample and progress log.


---

<!-- Source: plan-v0.20.md -->
## Plan v0.20

Date: 2026-02-01
Owner: Codex
Scope: Core schema bootstrap (users/wallets/transactions/leads)

### Steps
1. Add plan/progress logs.
2. Add core schema migration for users, leads, wallets, transactions, lead_reports, lead_draft_versions.
3. Add RLS policies for newly created user-owned tables (exclude leads).
4. Update progress log.


---

<!-- Source: plan-v0.21.md -->
## Plan v0.21

Date: 2026-02-01
Owner: Codex
Scope: Guard enum alteration for transactions.type

### Steps
1. Add plan/progress logs.
2. Guard enum mutation in ledger_deduct_credits migration.
3. Update progress log.


---

<!-- Source: plan-v0.22.md -->
## Plan v0.22

Date: 2026-02-01
Owner: Codex
Scope: Fix ledger_deduct_credits return row

### Steps
1. Add plan/progress logs.
2. Update ledger_deduct_credits to return updated wallet row safely.
3. Update progress log.


---

<!-- Source: plan-v0.23.md -->
## Plan v0.23

Date: 2026-02-01
Owner: Codex
Scope: Guard enum alteration + wallet return for report reward

### Steps
1. Add plan/progress logs.
2. Guard enum mutation in report_reward migration.
3. Return updated wallet row from ledger_reward_credits.
4. Update progress log.


---

<!-- Source: plan-v0.24.md -->
## Plan v0.24

Date: 2026-02-01
Owner: Codex
Scope: Document migration execution order

### Steps
1. Add plan/progress logs.
2. Update README with Supabase migration order and notes.
3. Update progress log.


---

<!-- Source: plan-v0.38.md -->
## Plan v0.38

Date: 2026-02-06
Owner: Codex
Scope: Hosted Pages UI hotfix + shadcn-style base component adoption

### Steps
1. Add shadcn-style base UI components (`Button`, `Card`, `Badge`, `Breadcrumb`, `Separator`).
2. Refactor shared navigation/breadcrumb components to use the new base UI.
3. Apply urgent style hotfix to hosted-pages list/detail flows and unify button/link visuals.
4. Run lint/build and update progress log.


---

<!-- Source: plan-v0.39.md -->
## Plan v0.39

Date: 2026-02-06
Owner: Codex
Scope: Simplify core app UI flow with chat-like minimal style

### Steps
1. Refine shared top navigation and breadcrumb to reduce visual weight.
2. Apply consistent minimal styling + GSAP reveal rhythm to dashboard/leads/settings pages.
3. Align hosted-pages list/detail cards and spacing with the same design system tone.
4. Run lint/build, deploy production, and update progress log.
