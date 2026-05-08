# BaseLens — Base Upgrade Intelligence

> AI-powered tool that transforms complex Base blockchain upgrade announcements into structured, easy-to-understand insights.

## Live Demo
[https://baselens-psi.vercel.app](https://baselens-psi.vercel.app)

---

## What is BaseLens?

BaseLens sits between raw blockchain technical information and user understanding. When protocols like Base publish upgrades, the information is often dense, scattered, or written for developers. Most users — especially airdrop farmers, creators, or casual Web3 participants — don't fully grasp what changed or why it matters.

BaseLens solves that gap.

Paste an upgrade announcement, click Analyze, and get a structured breakdown instantly.

---

## Features

- AI-powered analysis using OpenAI GPT-4o-mini
- Structured output: title, summary, what changed, why it changed, user impact, developer impact, significance, and impact level
- Per-user feed — each user sees only their own analyses
- Email and Google authentication
- Duplicate prevention (input and title level)
- Persistent storage with Supabase
- Live reveal animation on new analyses
- Clean, branded UI matching Base ecosystem aesthetics
- Deployed on Vercel

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| AI | OpenAI API (GPT-4o-mini) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google) |
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
APP_URL=http://localhost:3000
```

### 4. Set up Supabase
Create a table called `upgrades` with these columns:
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

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

1. User signs in with email or Google
2. Paste a Base upgrade announcement, changelog, or release note
3. AI analyzes the content and returns structured JSON
4. Results are saved to Supabase and displayed as a card
5. Each user has their own private feed of analyzed upgrades

---

## Roadmap

- [ ] Auto-fetch Base upgrade announcements automatically
- [ ] Twitter/X login
- [ ] Filter feed by impact level (High / Medium / Low)
- [ ] Email notifications for new upgrades
- [ ] Public upgrade discovery feed
- [ ] Mobile app

---

## Built By

[Abu Olumi](https://x.com/olumi441)

GitHub: [2TheMoom/baselens](https://github.com/2TheMoom/baselens)
