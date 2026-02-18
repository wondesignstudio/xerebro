This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Supabase) Setup

Run migrations in Supabase SQL Editor (paste the full file contents in order). The scripts are idempotent.

Recommended order for a fresh project:

1. `supabase/migrations/20260201000000_core_schema.sql`
2. `supabase/migrations/20260209090000_brand_identity_profile.sql`
3. `supabase/migrations/20260201012000_hosted_pages.sql`
4. `supabase/migrations/20260209000000_context_links.sql`
5. `supabase/migrations/20260130000100_ledger_deduct_credits.sql`
6. `supabase/migrations/20260130000200_report_reward.sql`
7. `supabase/migrations/20260130000300_ai_draft_editor.sql`
8. `supabase/migrations/20260130000400_lead_notifications.sql`
9. `supabase/migrations/20260131020000_rls_minimum.sql`

Notes:
- `20260201000000_core_schema.sql` creates core tables and enables RLS for user-owned tables (leads excluded).
- `20260209000000_context_links.sql` creates `context_links` and the click counter RPC for `/c/[slug]` redirects.
- `20260131020000_rls_minimum.sql` also adds RLS for `lead_notifications`.
- If you already have a database, you can re-run any script safely.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Project Architecture Docs

- Development stack and system architecture:
  - `/Users/dongjunma/Desktop/Xerebro/docs/architecture/development-stack.md`

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
