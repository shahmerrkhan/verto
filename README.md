# VERTO

A Canadian high school opportunity finder powered by AI-matched rankings. Find scholarships, competitions, internships, and programs that actually fit your profile—not just what's trending.

## What It Does

VERTO surfaces opportunities tailored to your grade, province, and interests. Instead of hunting across dozens of websites and filtering manually, you get a ranked feed. Save opportunities, track your applications, and see your progress in one dashboard.

## Tech Stack

- **Frontend**: React 19 + Vite
- **State Management**: Context API (AuthContext)
- **Database & Auth**: Supabase
- **Routing**: React Router v7
- **AI Matching**: Custom ranking algorithm (aiMatcher.js)

## Project Structure

src/
├── pages/              # Full page views (Dashboard, Profile, Analytics, etc.)
├── components/         # Reusable UI (OpportunityCard, FilterBar, SortBar, etc.)
├── context/            # Global state (AuthContext)
├── lib/                # Utilities (Supabase client, AI matching logic)
├── App.jsx             # Main router
├── main.jsx            # Entry point
└── App.css             # Global styles

## Getting Started

### Prerequisites
- Node.js 16+
- A Supabase project (PostgreSQL database with auth enabled)

### Installation

1. Clone the repo:
```bash
git clone <repo-url>
cd verto
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Start dev server:
```bash
npm run dev
```

Open http://localhost:5173.

## Core Features

- **AI-Matched Feed**: Opportunities ranked by fit based on your profile
- **Grade & Province Filtering**: Only see relevant opportunities for your region
- **Save & Apply Tracking**: Keep track of what you're interested in
- **Dashboard Analytics**: See your viewing, saving, and application history
- **Profile Management**: Update your interests and preferences anytime

## Database Schema (Supabase)

You'll need these tables:

**profiles**
- id (UUID, primary key)
- full_name, grade, province, gpa_range
- interests (JSONB array)
- financial_need (boolean)
- updated_at

**opportunities**
- id, title, org_name, description, type
- deadline, amount, link
- is_active (boolean)

**saves**
- user_id, opportunity_id

**applications**
- user_id, opportunity_id, created_at

**opportunity_views**
- user_id, opportunity_id, created_at

**opportunity_clicks** *(optional, for CTR tracking)*
- user_id, opportunity_id, created_at

## Roadmap

- [x] Core opportunity feed & filtering
- [x] User authentication & profiles
- [x] Save & application tracking
- [x] Analytics dashboard (basic)
- [ ] AI-powered recommendation refinements
- [ ] Email digest of upcoming deadlines
- [ ] Collections/folders for organizing saves
- [ ] Mobile app
- [ ] Opportunity submission portal for admins/orgs

## How to Contribute

Found a bug? Have a feature idea? Open an issue or PR.

## License

MIT



