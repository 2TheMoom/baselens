# BaseLens — Base Upgrade Intelligence

> AI-powered tool that transforms complex Base blockchain upgrade announcements into structured, easy-to-understand insights.

## Live Demo
[https://baselens-psi.vercel.app](https://baselens-psi.vercel.app)

---

## What is BaseLens?

BaseLens sits between raw blockchain technical information and user understanding. When protocols like Base publish upgrades, the information is often dense, scattered, or written for developers. Most users — especially airdrop farmers, creators, or casual Web3 participants — don't fully grasp what changed or why it matters.

BaseLens solves that gap.

Paste an upgrade announcement, click Analyze, and get a structured breakdown instantly — or browse the public feed, which is fetched and analyzed automatically with no input needed.

---

## Features

- AI-powered analysis using OpenAI GPT-4o-mini
- Structured output: title, summary, what changed, why it changed, user impact, developer impact, significance, and impact level
- Public feed of auto-analyzed Base upgrades, paginated, filterable by impact level, searchable — no login required
- Per-user dashboard — paste your own announcements and build a private feed
- Daily email digest (opt-in) when new upgrades land in the public feed
- Email and Google authentication
- Duplicate prevention (input and title level)
- Persistent storage with Supabase (RLS-scoped per user)
- Live reveal animation on new analyses, accordion-style card expand/collapse
- Dynamic OG image and apple touch icon for link previews
- Deployed on Vercel

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| AI | OpenAI API (GPT-4o-mini) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google) |
| Email | Resend |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/2TheMoom/baselens.git
cd baselens
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root of the project:
```
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
```

`SUPABASE_SERVICE_ROLE_KEY` is the service_role secret from Project Settings → API — never the anon key. It's server-only and bypasses RLS, used by the digest subscribe/confirm/unsubscribe/send routes. `RESEND_API_KEY` comes from [resend.com](https://resend.com). Note: until you verify a domain you own in Resend, its default sender can only deliver to the email address on your own Resend account, not to arbitrary subscribers.

### 4. Set up Supabase

Create a table called `upgrades` (per-user private feed) with these columns:
- `id` — uuid (primary key)
- `user_id` — uuid
- `title` — text
- `summary` — text
- `category` — text
- `what_changed` — text
- `why_it_changed` — text
- `user_impact` — text
- `developer_impact` — text
- `significance_reason` — text
- `impact_level` — text
- `created_at` — timestamp (default: now())

Enable RLS and add policies for SELECT, INSERT, and DELETE using `auth.uid() = user_id`.

Create a second table called `public_upgrades` (public auto-fetched feed) with the same columns, minus `user_id`, plus:
- `source_url` — text (the originating GitHub release URL, used for dedup)
- `notified_at` — timestamptz, nullable (marks an upgrade as already included in a sent digest)

Enable RLS with a public SELECT policy (anyone can read) and restrict INSERT to what `/api/auto-fetch` needs.

Create a third table called `digest_subscribers` for the email digest:
- `id` — uuid (primary key, default `gen_random_uuid()`)
- `email` — text, unique
- `user_id` — uuid, nullable (references `auth.users`)
- `confirmed` — boolean, default false
- `confirm_token` — uuid, default `gen_random_uuid()`
- `unsubscribe_token` — uuid, default `gen_random_uuid()`
- `created_at` — timestamptz, default now()
- `confirmed_at` — timestamptz, nullable

Enable RLS with a single policy: authenticated users can SELECT/INSERT/UPDATE where `auth.uid() = user_id` (their own row only). Deliberately no anon policy — the public subscribe/confirm/unsubscribe flows and the digest sender all go through server routes using the service role key, so the anon key (public, embedded in client JS) can never be used to list subscriber emails.

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

**Private dashboard**
1. User signs in with email or Google
2. Paste a Base upgrade announcement, changelog, or release note
3. AI analyzes the content and returns structured JSON
4. Results are saved to Supabase and displayed as a card in the user's own feed

**Public feed**
1. `/api/auto-fetch` polls a set of Base GitHub repos for new releases
2. New releases are analyzed by AI and saved to `public_upgrades`, deduplicated by release URL
3. Anyone can browse the result at `/feed` — no login required

**Email digest**
1. Anyone can subscribe from the public feed (double opt-in: confirms via an emailed link) or toggle it on from the dashboard if logged in (auto-confirmed, since Supabase Auth already verified that email)
2. `/api/send-digest` rolls up every `public_upgrades` row not yet included in a digest and emails it to confirmed subscribers, skipped entirely if nothing's new
3. Every digest includes a one-click unsubscribe link

To keep things current, schedule two recurring GET requests against your deployed URL (e.g. via [cron-job.org](https://cron-job.org) or Vercel Cron):
- `/api/auto-fetch` — fetches and analyzes new Base releases
- `/api/send-digest` — sends the daily digest to confirmed subscribers

---

## Roadmap

- [x] Auto-fetch Base upgrade announcements automatically
- [x] Filter feed by impact level (High / Medium / Low)
- [x] Public upgrade discovery feed
- [x] Email notifications for new upgrades
- [ ] Mobile app
