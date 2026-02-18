# Progress (Combined)

<!-- Combined on 2026-02-01 -->

## Progress v0.60

Date: 2026-02-18

### Log
- Added Playwright tooling and scripts:
  - `/Users/dongjunma/Desktop/Xerebro/playwright.config.ts`
  - `/Users/dongjunma/Desktop/Xerebro/package.json` (`e2e`, `e2e:headed`, `e2e:auth`)
  - `/Users/dongjunma/Desktop/Xerebro/.gitignore` (`playwright-report`, `test-results`, `tests/e2e/.auth`)
- Added OAuth manual auth-state capture test:
  - `/Users/dongjunma/Desktop/Xerebro/tests/e2e/auth.setup.ts`
- Added hosted-pages browser workflow spec:
  - `/Users/dongjunma/Desktop/Xerebro/tests/e2e/hosted-pages.spec.ts`
  - flow: hosted-pages 진입 → slug 생성 → 상세 저장 → 목록 복귀 → 게시 토글
  - optional cleanup: `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`가 있으면 테스트 slug 자동 삭제
- Added E2E usage guide:
  - `/Users/dongjunma/Desktop/Xerebro/tests/e2e/README.md`
- Validation complete:
  - `npm run lint`
  - `npm run test`
  - `npm run e2e -- --list`


---

## Progress v0.59

Date: 2026-02-18

### Log
- Added hosted-pages workflow regression tests:
  - `/Users/dongjunma/Desktop/Xerebro/src/viewmodels/hostedPages/actions.workflow.test.ts`
- Covered scenarios:
  - create action redirects to detail (`/hosted-pages/[id]?created=1`)
  - detail settings update with valid `redirectTo` stays on detail (`?updated=1`)
  - update action with missing/invalid `redirectTo` falls back to list (`/hosted-pages?updated=1`)
- Tests use mocked guard/repository dependencies, preserving existing layer boundaries.
- Validation complete:
  - `npm run test`
  - `npm run lint`


---

## Progress v0.58

Date: 2026-02-18

### Log
- Added redirect helper export surface for hosted-page update flow:
  - `/Users/dongjunma/Desktop/Xerebro/src/viewmodels/hostedPages/actions.ts`
  - `hostedPagesActionUtils` now exposes pure redirect path helpers for regression tests.
- Added hosted-page update redirect branch tests:
  - `/Users/dongjunma/Desktop/Xerebro/src/viewmodels/hostedPages/actions.test.ts`
  - validates list/detail allow-list behavior and invalid-path fallback.
  - validates query param append/overwrite behavior used by update redirects.
- Validation complete:
  - `npm run test`
  - `npm run lint`


---

## Progress v0.57

Date: 2026-02-16

### Log
- Added safe update redirect handling in hosted-page server action:
  - `/Users/dongjunma/Desktop/Xerebro/src/viewmodels/hostedPages/actions.ts`
  - update form can now pass `redirectTo` (`/hosted-pages` or `/hosted-pages/[id]`) and keeps list toggle flow unchanged.
- Added create-form button feedback state mapping on hosted-pages list:
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/page.tsx`
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPageCreateForm.tsx`
  - labels now support `생성됨` / `생성 실패`.
- Added detail settings-form button feedback + redirect wiring:
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/[id]/page.tsx`
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPageSettingsForm.tsx`
  - labels now support `저장됨` / `저장 실패`, and detail updates return to the same detail page.
- Validation complete: `npm run lint`.


---

## Progress v0.56

Date: 2026-02-14

### Log
- Hosted-page slug UX validation parity applied on create/update forms:
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPageCreateForm.tsx`
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPageSettingsForm.tsx`
- Behavior updates:
  - real-time normalized slug validation
  - invalid/over-limit inline error copy
  - submit disabled while slug is invalid or exceeds 40 chars
- Validation complete: `npm run lint`.


---

## Progress v0.55

Date: 2026-02-14

### Log
- Added development stack and architecture documentation:
  - `/Users/dongjunma/Desktop/Xerebro/docs/architecture/development-stack.md`
- Documented:
  - current frontend/backend/infra/tooling stack
  - layered architecture responsibilities
  - mermaid system topology diagram
  - stack update policy and update log section
- Validation complete: `npm run lint`.


---

## Progress v0.54

Date: 2026-02-14

### Log
- Updated context-link create form UX to prevent silent truncation flow:
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPageContextLinksSectionClient.tsx`
- Applied client-side real-time validation based on normalized slug length and pattern validity.
- Added inline error states:
  - invalid normalized slug -> 안내 문구 노출
  - over 40 chars -> 길이 초과 문구 노출
- Disabled `링크 생성` submit while slug is invalid/too long.
- Validation complete: `npm run lint`.


---

## Progress v0.53

Date: 2026-02-11

### Log
- Added context-link slug max-length domain guard (40 chars):
  - `/Users/dongjunma/Desktop/Xerebro/src/domain/contextLink.ts`
  - `/Users/dongjunma/Desktop/Xerebro/src/domain/contextLink.test.ts`
- Enforced context-link slug length in create action and added explicit error key:
  - `/Users/dongjunma/Desktop/Xerebro/src/viewmodels/hostedPages/actions.ts`
  - error key: `context_slug_too_long`
- Updated hosted-page detail copy and context-link input UX for slug limit/wrapping:
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/[id]/page.tsx`
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPageContextLinksSectionClient.tsx`
- Added context-link alias/backfill migration and DB slug-length constraint validation:
  - `/Users/dongjunma/Desktop/Xerebro/supabase/migrations/20260211163000_context_link_slug_aliases_backfill.sql`
- Added `/c/[slug]` legacy alias fallback redirect:
  - `/Users/dongjunma/Desktop/Xerebro/src/repositories/contextLinks/contextLinkRepository.ts`
  - `/Users/dongjunma/Desktop/Xerebro/src/viewmodels/hostedPages/queries.ts`
  - `/Users/dongjunma/Desktop/Xerebro/src/app/c/[slug]/route.ts`
- Validation complete: `npm run lint`, `npm run test`, `npm run build`.
- Production redeployed and aliased to `https://xerebro.me`:
  - `https://xerebro-35jw6essm-wondesign01-6115s-projects.vercel.app`


---

## Progress v0.52

Date: 2026-02-11

### Log
- Added legacy slug compatibility migration:
  - `/Users/dongjunma/Desktop/Xerebro/supabase/migrations/20260211162000_hosted_page_slug_aliases_backfill.sql`
  - Creates `public.hosted_page_slug_aliases`
  - Backfills rows where `char_length(hosted_pages.slug) > 40`
  - Stores old slug aliases and rewrites long slugs to a deterministic 40-char-safe slug
  - Validates `hosted_pages_slug_max_length` constraint after backfill
- Added repository/viewmodel alias resolver flow:
  - `/Users/dongjunma/Desktop/Xerebro/src/repositories/hostedPages/hostedPageRepository.ts`
  - `/Users/dongjunma/Desktop/Xerebro/src/viewmodels/hostedPages/queries.ts`
- Added public route fallback redirect for legacy slugs:
  - `/Users/dongjunma/Desktop/Xerebro/src/app/p/[slug]/page.tsx`
  - if direct slug lookup fails but alias exists, 308 영구 리다이렉트 to latest `/p/{newSlug}`
- Hardened long-text layout in hosted-pages screens:
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/page.tsx`
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/[id]/page.tsx`
- Validation complete: `npm run lint`, `npm run test`, `npm run build`.
- Production redeployed and aliased to `https://xerebro.me`:
  - `https://xerebro-1xad3hm5e-wondesign01-6115s-projects.vercel.app`


---

## Progress v0.51

Date: 2026-02-11

### Log
- Added hosted-page slug length limit (max 40) at domain level:
  - `/Users/dongjunma/Desktop/Xerebro/src/domain/hostedPage.ts`
  - `/Users/dongjunma/Desktop/Xerebro/src/domain/hostedPage.test.ts`
- Enforced server-side validation on create/update actions with explicit redirect error:
  - `/Users/dongjunma/Desktop/Xerebro/src/viewmodels/hostedPages/actions.ts`
  - error key: `slug_too_long`
- Updated hosted-pages UI inputs + feedback copy:
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPageCreateForm.tsx`
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPageSettingsForm.tsx`
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/page.tsx`
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/[id]/page.tsx`
- Added DB guard migration:
  - `/Users/dongjunma/Desktop/Xerebro/supabase/migrations/20260211154000_hosted_pages_slug_max_length.sql`
- Validation complete: `npm run lint`, `npm run test`, `npm run build`.
- Production redeployed and aliased to `https://xerebro.me`:
  - `https://xerebro-44peponjx-wondesign01-6115s-projects.vercel.app`


---

## Progress v0.50

Date: 2026-02-11

### Log
- Completed hosted-pages mobile QA layout pass:
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/[id]/page.tsx`
    - detail/not-found CTA groups now stack full-width on small screens and collapse to inline on larger breakpoints.
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPageContextLinksSectionClient.tsx`
    - per-item action buttons (`열기/활성화/삭제`) now wrap predictably with full-width behavior on mobile.
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPageCreateForm.tsx`
    - slug input now uses responsive width (`w-full` on mobile, fixed width on larger screens).
  - `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPagePublicUrlField.tsx`
    - long URL text now uses `break-all` to prevent overflow.
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/page.tsx`
    - list row action buttons now use mobile full-width behavior.
- Validation complete: `npm run lint`, `npm run build`.
- Production redeployed and aliased to `https://xerebro.me`:
  - `https://xerebro-mw2mmx71m-wondesign01-6115s-projects.vercel.app`


---

## Progress v0.49

Date: 2026-02-11

### Log
- Updated `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPagePublicUrlField.tsx` feedback UX:
  - Removed toast feedback.
  - Added button-label feedback flow: `URL 복사` -> `복사됨` / `복사 실패` -> auto reset.
  - Added temporary success/error button styling and copy-in-flight lock.
- Validation complete: `npm run lint`, `npm run build`.
- Production redeployed and aliased to `https://xerebro.me`:
  - `https://xerebro-fffwqruna-wondesign01-6115s-projects.vercel.app`


---

## Progress v0.48

Date: 2026-02-11

### Log
- Added `/Users/dongjunma/Desktop/Xerebro/src/ui/components/HostedPagePublicUrlField.tsx` as a client UI component for public URL actions.
- Updated `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/[id]/page.tsx` to use the new component in the detail summary area.
- Behavior change:
  - Published page: clickable URL + `URL 복사` button.
  - Copy interaction shows toast feedback (success/failure) and auto-dismisses.
  - Unpublished page: existing “비공개 상태입니다.” messaging preserved.
- Validation complete: `npm run lint`, `npm run test`, `npm run build`.
- Production redeployed and aliased to `https://xerebro.me`:
  - `https://xerebro-pfcgdy3m7-wondesign01-6115s-projects.vercel.app`


---

## Progress v0.47

Date: 2026-02-11

### Log
- Added shared debug runtime gate in `/Users/dongjunma/Desktop/Xerebro/src/viewmodels/auth/runtime.ts`.
- Locked down production debug endpoints:
  - `/Users/dongjunma/Desktop/Xerebro/src/app/api/debug/whoami/route.ts`
  - `/Users/dongjunma/Desktop/Xerebro/src/app/api/debug/hosted-page/route.ts`
  - now return `404 {\"error\":\"not_found\"}` when debug access is disabled.
- Updated `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/[id]/page.tsx` to reject production `?debug=1` mode and redirect to standard detail route.
- Added unit tests for gate policy:
  - `/Users/dongjunma/Desktop/Xerebro/src/viewmodels/auth/runtime.test.ts`
- Validation complete: `npm run lint`, `npm run test`, `npm run build`.
- Production redeployed and aliased to `https://xerebro.me`:
  - `https://xerebro-oj5apylo2-wondesign01-6115s-projects.vercel.app`


---

## Progress v0.46

Date: 2026-02-11

### Log
- Hardened hosted-page create form against accidental duplicate submits by adding a client submit-lock guard.
- Kept existing server-action architecture and redirect behavior unchanged.
- Updated create button loading state for stable width/feedback (`생성 중...`) and disabled slug input while locked.
- Validation complete: `npm run lint`, `npm run build`.
- Production redeployed and aliased to `https://xerebro.me`:
  - `https://xerebro-jafnb1yu7-wondesign01-6115s-projects.vercel.app`


---

## Progress v0.45

Date: 2026-02-11

### Log
- Completed deferred context loading path for hosted-page detail with client fetch hook + `/api/hosted-pages/[id]/context`.
- Removed invalid server-page dynamic pattern (`next/dynamic` + `ssr: false`) that caused build/runtime failures in production.
- Kept context-link server actions connected through the client section without changing business-layer boundaries.
- Validation complete: `npm run lint`, `npm run test`, `npm run build`.
- Production redeployed and aliased to `https://xerebro.me`:
  - `https://xerebro-p0vax9fe7-wondesign01-6115s-projects.vercel.app`


---

## Progress v0.44

Date: 2026-02-11

### Log
- Removed extra admin-fallback query from `listHostedPagesByUser` to avoid duplicate DB hit on list render.
- Slimmed context-link lead option query:
  - select columns from `id, content_summary, source_channel, status, created_at` to `id, content_summary`
  - reduced limit from 50 to 20 in hosted-page detail context loader.
- Lint/build passed and production redeployed to `https://xerebro.me`.
- Warm-call latency check (from CLI) showed hosted-pages routes in ~80ms~180ms range.


---

## Progress v0.43

Date: 2026-02-11

### Log
- Applied Vercel function region pinning in `/Users/dongjunma/Desktop/Xerebro/vercel.json` (`regions: ["icn1"]`).
- Added app/segment region preference for hosted-page traffic near KR/JP:
  - `/Users/dongjunma/Desktop/Xerebro/src/app/layout.tsx`
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/page.tsx`
  - `/Users/dongjunma/Desktop/Xerebro/src/app/hosted-pages/[id]/page.tsx`
- Rebuilt and redeployed production alias (`https://xerebro.me`).
- Verified runtime moved from `icn1::iad1` to `icn1::icn1` via `x-vercel-id` on:
  - `/api/debug/whoami`
  - `/hosted-pages`
  - `/hosted-pages/[id]`


---

## Progress v0.42

Date: 2026-02-11

### Log
- Reduced hosted-pages query latency by removing redundant `supabase.auth.getSession()` calls in hosted-page repository reads.
- Tuned `GsapReveal` for faster transitions (delay clamp, shorter duration, reduced-motion bypass, lighter opacity/y animation).
- Added pending feedback for hosted-page creation form (`생성 중...`) to remove “무반응” 체감.
- Enabled explicit prefetch in shared top navigation links.
- Lint/build passed and production was re-deployed/aliased to `xerebro.me`.


---

## Progress v0.41

Date: 2026-02-09

### Log
- Added migration `20260209090000_brand_identity_profile.sql` to persist Brand Identity profile fields on `users`.
- Extended user profile domain and mapper/repository read/upsert paths for:
  - `brand_industry`, `brand_target_audience`, `brand_usp`
  - `persona_tone`, `persona_guideline`
- Added auth viewmodel support for Brand Identity:
  - `getBrandIdentityState`
  - `submitBrandIdentityAction`
- Added new page `src/app/brand-identity/page.tsx` with:
  - Core Interview form
  - Persona Tuning form
  - completion/status feedback
- Updated app navigation and dashboard entry to include Brand Identity access.


---

## Progress v0.40

Date: 2026-02-06

### Log
- Added shared route transition loader: `RouteLoadingState`.
- Implemented 1-second threshold policy:
- `<= 1s` uses skeleton placeholders.
- `> 1s` switches to non-skeleton loading view (spinner + status text).
- Wired global app route loading through `src/app/loading.tsx`.
- Lint and build executed successfully.


---

## Progress v0.39

Date: 2026-02-06

### Log
- Diagnosed hosted page screen "render then disappear" regression to persistent hidden state in `GsapReveal`.
- Replaced CSS-class-based hidden state with JS-controlled initial animation state.
- Updated animation cleanup to avoid resetting visible opacity.
- Lint/build executed successfully.
- Production deployed and aliased to `xerebro.me`.


---

## Progress v0.38

Date: 2026-02-06

### Log
- Ran heuristic inspection on hosted-pages flow and identified over-heavy card shells, weak action hierarchy, and low location readability.
- Reworked shared `AppNavigation` into a lighter sticky top bar with clearer active state.
- Reworked shared `AppBreadcrumbs` into a compact line breadcrumb.
- Redesigned `/hosted-pages` with focused hero CTA, concise stats, and cleaner page list actions.
- Redesigned `/hosted-pages/[id]` with simplified detail/edit flow and resilient not-found action layout.
- Added `GSAP` dependency and `GsapReveal` component for section-level reveal interactions.
- Lint and build executed successfully.


---

## Progress v0.37

Date: 2026-02-06

### Log
- Ran heuristic inspection focused on location awareness and navigation consistency.
- Added shared `AppNavigation` and `AppBreadcrumbs` components.
- Applied nav/breadcrumb to `dashboard`, `leads`, `settings`, `hosted-pages`, `hosted-pages/[id]`, and `pricing`.
- Replaced internal anchor navigation with `Link` in updated pages/components.
- Lint and build executed successfully.


---

## Progress v0.36

Date: 2026-02-06

### Log
- Hardened hosted page detail fetch fallback with email-based ownership recovery when user IDs drift.
- Passed current user email through hosted-page viewmodel queries for repository-level validation.
- Ran lint/test/build and deployed production alias update (`xerebro.me`).


---

## Progress v0.35

Date: 2026-02-02

### Log
- Fixed dynamic hosted-page route params handling for Next.js 16 (`params` Promise resolution).
- Added public published route `/p/[slug]` and viewmodel/repository query.
- Added `/api/debug/hosted-page?id=...` endpoint for hosted page access diagnostics.
- Fixed `normalizeHostedPageSlug` whitespace normalization regex.
- Updated user profile domain test typing to satisfy `UserPlan` constraints.
- Tests and lint executed.


---

## Progress v0.34

Date: 2026-02-02

### Log
- Hardened server Supabase cookie mutations to avoid RSC runtime crashes.
- Lint and build executed.
- Redirected hosted page creation to the new detail page for clearer feedback.
- Lint and build executed.
- Added admin-client fallback for hosted page reads when SSR auth cookies are missing.
- Lint and build executed.
- Forced dynamic rendering on hosted page detail to avoid stale cache after create.
- Lint and build executed.
- Normalized hosted page user id comparison for detail/list queries.
- Lint and build executed.
- Ensured Supabase session is loaded before hosted page RLS queries.
- Lint and build executed.
- Added hosted page debug snapshot panel for access diagnosis.
- Lint and build executed.


---

## Progress v0.27

Date: 2026-02-01

### Log
- Refreshed /hosted-pages UI with structured placeholder sections.
- Kept Pro guard and rendering-only layout.
- Lint executed.


---

## Progress v0.28

Date: 2026-02-01

### Log
- Added hosted_pages migration with indexes and RLS policies.
- Added hosted page domain model and slug helpers.
- Added hosted page repository CRUD and viewmodel actions/queries.
- Added hosted page domain tests.
- Lint executed.


---

## Progress v0.29

Date: 2026-02-01

### Log
- Wired /hosted-pages to list hosted pages via viewmodel query.
- Added create form (optional slug) and status banner handling.
- Added empty state and list rendering for hosted pages.
- Lint executed.


---

## Progress v0.30

Date: 2026-02-01

### Log
- Added /hosted-pages/[id] route with detail skeleton UI.
- Rendered status, update timestamp, and preview URL placeholder.
- Lint executed.


---

## Progress v0.31

Date: 2026-02-01

### Log
- Wired publish/unpublish toggle to hosted page list actions.
- Lint executed.


---

## Progress v0.32

Date: 2026-02-01

### Log
- Added hosted page detail edit form (slug/theme/publish).
- Wired update action with status banner handling.
- Lint executed.


---

## Progress v0.33

Date: 2026-02-01

### Log
- Added revalidatePath calls after hosted page create/update/delete.
- Lint executed.


---

## Progress v0.26

Date: 2026-02-01

### Log
- Added current_plan to user profile mapping and Pro guard.
- Added /pricing page and /hosted-pages gated entry.
- Added dashboard Pro CTA with upgrade modal.
- Noted email template design polish as a backlog item.
- Lint executed.


---

## Progress v0.25

Date: 2026-02-01

### Log
- Consolidated plan/progress markdown into single files.
- Archived versioned files under docs/plan/archive.


---

<!-- Source: progress-v0.1.md -->
## Progress v0.1

Date: 2026-01-30

### Log
- Initialized plan and progress tracking files.
- Scaffolded Next.js app and moved it into repo root.
- Added layer directories (domain/viewmodels/repositories/ui).
- Added Supabase server client helper and middleware.
- Added `.env.example` for Supabase configuration.
- Added domain models for auth, wallet, transactions.
- Added repositories for auth session, OAuth, wallets, and transactions.
- Added auth, wallet, and transaction viewmodel functions (server actions/queries).
- Built minimal login and dashboard pages with route protection and auth callback.
- Updated global styles and metadata to align with PRD baseline.
- Added Vitest config and domain tests.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.2.md -->
## Progress v0.2

Date: 2026-01-30

### Log
- Initialized v0.2 plan and progress logs.
- Added domain model for user consent.
- Added user profile repository with consent upsert.
- Added consent actions/queries/guards and consent page routing.
- Added consent domain tests.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.3.md -->
## Progress v0.3

Date: 2026-01-30

### Log
- Initialized v0.3 plan and progress logs.
- Extended user profile domain and mapping for last_left_at.
- Added re-signup restriction domain logic and transaction type.
- Added wallet ensure/restriction helpers and restriction workflow.
- Updated auth callback to apply restriction after session setup.
- Extended tests for restriction logic.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.4.md -->
## Progress v0.4

Date: 2026-01-30

### Log
- Initialized v0.4 plan and progress logs.
- Added repository helper for withdrawal timestamp updates.
- Added withdrawal server action to update last_left_at and sign out.
- Added settings page with danger zone and withdrawal modal.
- Added login toast for successful withdrawal.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.5.md -->
## Progress v0.5

Date: 2026-01-30

### Log
- Initialized v0.5 plan and progress logs.
- Added settings link in dashboard header.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.6.md -->
## Progress v0.6

Date: 2026-01-30

### Log
- Initialized v0.6 plan and progress logs.
- Added transaction description formatter and tests.
- Added Supabase migration for ledger_deduct_credits RPC.
- Added ledger repository RPC wrapper and deduction viewmodel action.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.7.md -->
## Progress v0.7

Date: 2026-01-30

### Log
- Initialized v0.7 plan and progress logs.
- Added lead domain model and repository queries.
- Added leads viewmodel (queries + view action with ledger deduction).
- Added leads split-view UI with view action wiring.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.8.md -->
## Progress v0.8

Date: 2026-01-30

### Log
- Initialized v0.8 plan and progress logs.
- Updated transaction types and description formatting for report reward.
- Added Supabase migration for lead_reports and reward RPC.
- Added report modal UI and wired to report action.
- Added ledger reward RPC wrapper and report action.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.10.md -->
## Progress v0.10

Date: 2026-01-30

### Log
- Initialized v0.10 plan and progress logs.
- Added DB migration for draft_message and lead_draft_versions.
- Added OpenAI draft API route (Responses API).
- Added AI draft repository, draft history repository, and viewmodel actions.
- Added AI editor UI in leads detail.
- Lint and tests executed successfully.
- Lint and tests re-run after final adjustments.


---

<!-- Source: progress-v0.11.md -->
## Progress v0.11

Date: 2026-01-30

### Log
- Initialized v0.11 plan and progress logs.
- Added lead status update repository for copy action.
- Added copy action, status update helper, and copy button UI.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.12.md -->
## Progress v0.12

Date: 2026-01-30

### Log
- Initialized v0.12 plan and progress logs.
- Added lead status badges in list and detail views.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.13.md -->
## Progress v0.13

Date: 2026-01-30

### Log
- Initialized v0.13 plan and progress logs.
- Added lead_notifications migration.
- Added lead notification repository + viewmodel actions/queries.
- Updated leads empty-state UI with notification signup.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.14.md -->
## Progress v0.14

Date: 2026-01-30

### Log
- Initialized v0.14 plan and progress logs.
- Extended draft history repository with version lookup.
- Added history list UI and restore action wiring.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.15.md -->
## Progress v0.15

Date: 2026-01-30

### Log
- Initialized v0.15 plan and progress logs.
- Added Resend mailer and cron route for lead notification sending.
- Extended lead notifications repository for pending fetch and status updates.
- Added env samples and Vercel cron config.
- Lint and tests executed successfully.


---

<!-- Source: progress-v0.16.md -->
## Progress v0.16

Date: 2026-01-31

### Log
- Initialized v0.16 plan and progress logs.
- Updated Vercel cron schedule to daily (Hobby plan compatible).
- Fixed Next.js server header usage in auth/AI flows and removed duplicate callback variable.
- Adjusted lead notification email join typing for build compatibility.
- Verified local production build and lint.
- Deployed production successfully (current alias: https://xerebro-2is86v6ff-wondesign01-6115s-projects.vercel.app).


---

<!-- Source: progress-v0.17.md -->
## Progress v0.17

Date: 2026-01-31

### Log
- Initialized v0.17 plan and progress logs.
- Added custom domain xerebro.me to the Vercel project.
- Removed middleware to stop Edge runtime crashes (revisit Supabase session refresh later).
- Awaiting DNS A record verification from Gabia before updating APP_BASE_URL.


---

<!-- Source: progress-v0.18.md -->
## Progress v0.18

Date: 2026-01-31

### Log
- Initialized v0.18 plan and progress logs.
- Forced Next.js builder via vercel.json to fix 404 deployments.
- Updated @vercel/next build source to package.json for compatibility.
- Handled missing Supabase auth sessions to avoid 500s on first visit.
- Deployed production and re-aliased xerebro.me.
- Verified production cron sends and updates lead_notifications to sent.


---

<!-- Source: progress-v0.19.md -->
## Progress v0.19

Date: 2026-01-31

### Log
- Initialized v0.19 plan and progress logs.
- Added RLS policies for user-owned tables (excluding leads).
- Guarded RLS migration to skip missing tables safely.
- Added Supabase service role client and wired cron to use it.
- Updated env sample for SUPABASE_SERVICE_ROLE_KEY.


---

<!-- Source: progress-v0.20.md -->
## Progress v0.20

Date: 2026-02-01

### Log
- Added v0.20 plan/progress logs.
- Added core schema migration for users, leads, wallets, transactions, lead_reports, and lead_draft_versions.
- Included RLS enablement/policies for newly created user-owned tables (leads excluded).


---

<!-- Source: progress-v0.21.md -->
## Progress v0.21

Date: 2026-02-01

### Log
- Added v0.21 plan/progress logs.
- Guarded enum alteration in ledger_deduct_credits migration for text columns.


---

<!-- Source: progress-v0.22.md -->
## Progress v0.22

Date: 2026-02-01

### Log
- Added v0.22 plan/progress logs.
- Updated ledger_deduct_credits to return the updated wallet row via RETURNING.


---

<!-- Source: progress-v0.23.md -->
## Progress v0.23

Date: 2026-02-01

### Log
- Added v0.23 plan/progress logs.
- Guarded enum alteration in report_reward migration for text columns.
- Updated ledger_reward_credits to return the updated wallet row.


---

<!-- Source: progress-v0.24.md -->
## Progress v0.24

Date: 2026-02-01

### Log
- Added v0.24 plan/progress logs.
- Documented Supabase migration order in README.


---

<!-- Source: progress-v0.26.md -->
## Progress v0.26

Date: 2026-02-02

### Log
- Added hosted pages debug flow to compare session vs admin visibility.
- Relaxed debug to run without Pro guard for troubleshooting.
- Added /api/debug/whoami endpoint for session verification.
- Enforced Pro gating even in debug mode to prevent plan bypass.


---

<!-- Source: progress-v0.38.md -->
## Progress v0.38

Date: 2026-02-06

### Log
- Added shadcn-style base UI primitives for reuse:
  - `src/ui/components/ui/button.tsx`
  - `src/ui/components/ui/card.tsx`
  - `src/ui/components/ui/badge.tsx`
  - `src/ui/components/ui/breadcrumb.tsx`
  - `src/ui/components/ui/separator.tsx`
  - `src/ui/components/ui/cn.ts`
- Refactored shared navigation/breadcrumb to consume the new base primitives.
- Fixed hosted-pages UI flow polish issues:
  - Normalized link/button rendering with `buttonVariants` (prevents stretched/broken button appearance).
  - Upgraded list/detail sections to card-based consistent layout.
- Validation complete: `npm run lint`, `npm run build`.


---

<!-- Source: progress-v0.39.md -->
## Progress v0.39

Date: 2026-02-06

### Log
- Updated shared navigation and breadcrumb to a lighter, lower-contrast style:
  - `src/ui/components/AppNavigation.tsx`
  - `src/ui/components/AppBreadcrumbs.tsx`
- Applied unified minimal UI and GSAP reveal timing across primary workflow pages:
  - `src/app/dashboard/page.tsx`
  - `src/app/leads/page.tsx`
  - `src/app/settings/page.tsx`
- Refined hosted-pages list/detail surface hierarchy to match the new style:
  - `src/app/hosted-pages/page.tsx`
  - `src/app/hosted-pages/[id]/page.tsx`
- Validation complete: `npm run lint`, `npm run build`.
- Production deployment complete and aliased:
  - `https://xerebro-44m8bq1zr-wondesign01-6115s-projects.vercel.app`
  - `https://xerebro.me`
