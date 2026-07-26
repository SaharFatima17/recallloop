# RecallLoop

**Flashcards that know when you'll forget.**

RecallLoop turns raw study notes into flashcards with AI, then uses a
spaced-repetition scheduler to tell you exactly which cards to review
today — and pushes the rest back to the exact day you're about to forget
them.

## a. The problem, and who it's for

Every student who makes flashcards runs into the same two problems:

1. **Writing good flashcards is slow.** Turning ten pages of lecture
   notes into question/answer pairs by hand takes longer than actually
   studying them.
2. **Knowing *when* to review is guesswork.** Most people either
   re-read everything the night before an exam (inefficient, and it
   doesn't stick), or review at random and end up re-studying things
   they already know while forgetting things they don't.

RecallLoop solves both: paste your notes and an AI drafts the
flashcards for you; a spaced-repetition algorithm (a simplified
SM-2 — the same family of algorithm behind Anki) tracks every card
individually and tells you precisely which ones are due, based on how
well you remembered them last time. It's built for students revising
for exams, but works for anyone memorizing structured material
(language vocab, interview prep, certifications).

## b. Live URL

**https://recallloop.vercel.app** *(replace with your actual deployment URL after you deploy — see Section g)*

## c. Features

- **AI flashcard generation** — paste any notes and get back a
  reviewable set of question/answer flashcards, with a slider to
  target how many cards to generate.
- **Selective import** — preview every AI-generated card and
  uncheck any you don't want before adding them to your deck.
- **Manual card creation and editing** — add, edit, or delete any
  card by hand, at any time.
- **Spaced-repetition scheduling** — every card carries its own
  interval, ease factor, and due date; reviewing a card reschedules
  it automatically (SM-2 style — see Section d for the exact logic).
- **Study mode** — a focused, full-screen flip-card session that
  only shows cards that are actually due, with four self-graded
  recall ratings (Again / Hard / Good / Easy).
- **Multiple decks** — organize cards by subject/topic, each with
  its own progress bar and due count.
- **Dashboard stats** — total cards due right now, total cards,
  mastered count, and not-yet-studied count, at a glance.
- **Backup and restore** — export all decks to a JSON file and
  re-import them later or on another device.
- **No account, no login** — the app works the instant you open the
  link; all data is stored in your own browser.

## d. The AI feature

**What it does:** On the "Generate with AI" tab (available both when
creating a new deck and inside any existing deck), you paste raw notes
— a paragraph, a page of lecture notes, a textbook excerpt — and pick
a target number of cards. The app sends your notes to Claude, which
returns a structured set of flashcards designed to test *understanding*
of the material, not just word-matching against the source text. You
get a checklist preview of every generated card and choose which ones
to actually add to your deck.

**Where it lives in the code:** [`app/api/generate-cards/route.ts`](app/api/generate-cards/route.ts)

**The exact system prompt used** (written for this project, sent to the model on every request):

```
You are an expert study coach who converts raw lecture notes or textbook material into high-quality active-recall flashcards for spaced-repetition learning.

Rules:
- Extract only the core concepts, definitions, cause-effect relationships, comparisons, and facts a student actually needs to understand and remember. Ignore filler, examples that teach nothing new, and formatting artifacts from the source.
- Write each question so it tests understanding or recall, never simple word-matching lifted verbatim from the notes (no fill-in-the-blank copied straight from the text).
- Vary question types across the set: definitions, "why/how" reasoning, comparisons, application to a new scenario, and cause-effect.
- Keep answers concise (1-3 sentences), correct, and self-contained, so a student can grade their own recall against it without re-reading the notes.
- Produce as many cards as the distinct content supports, between the given minimum and maximum. Do not pad with trivial or duplicate questions just to hit a count. Do not invent facts that are not in, or reasonably implied by, the notes.
- Return ONLY valid JSON. No prose, no markdown code fences, no commentary. The response must be exactly this shape:
[{"question": "string", "answer": "string"}]
```

The user message that follows it carries the deck title, the
min/max card count (derived from the slider), and the pasted notes.
The model used is **Groq's `llama-3.3-70b-versatile`**, called via
Groq's OpenAI-compatible chat completions endpoint with JSON mode
enabled — fast (Groq's whole pitch is low-latency inference) and
free to use within Groq's generous free-tier rate limits, which suits
a structured extraction task like this well. Swappable to any other
Groq-hosted model, or a different provider entirely, by editing
`app/api/generate-cards/route.ts`.

**The spaced-repetition logic** (not AI — deterministic scheduling
that pairs with the AI feature): implemented in
[`lib/srs.ts`](lib/srs.ts). Each card stores an interval, an ease
factor, and a repetition count. Rating a card "Again" resets its
streak and brings it back tomorrow; rating "Hard/Good/Easy" grows the
interval (1 day → 6 days → `interval × ease factor`, compounding),
and the ease factor itself is nudged up or down based on the rating,
exactly as in the standard SM-2 algorithm.

## e. Tools, services, and models used

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4, custom design tokens (no UI kit)
- **AI model:** `llama-3.3-70b-versatile` via the Groq API (OpenAI-compatible chat completions endpoint, called with plain `fetch` — no extra SDK)
- **Icons:** lucide-react
- **Persistence:** browser `localStorage` (no database — see design
  note below)
- **Hosting:** Vercel
- **Built with the help of:** Claude (Claude.ai), used to scaffold,
  write, and review this codebase end-to-end

**Why localStorage instead of a database:** the assignment's bar is a
complete, working, deployable app by the deadline. A per-browser
store means anyone can open the live link and use every feature
immediately, with zero signup friction and zero database
provisioning — while still being "real" persistence (it survives
refreshes and browser restarts, and can be exported/imported as a
backup file). The trade-off is explicit: data doesn't sync across
devices. Swapping in Postgres (e.g. via Vercel Postgres or Supabase)
later would mean replacing `lib/storage.ts` behind the same
`useDecks` hook — the rest of the app wouldn't need to change.

## f. Screenshots

<img width="1920" height="882" alt="New Project – Vercel - Google Chrome 7_26_2026 9_28_38 AM" src="https://github.com/user-attachments/assets/d47e37a0-72f8-4d0c-9270-c963ac3275fa" />
<img width="1920" height="874" alt="New Project – Vercel - Google Chrome 7_26_2026 9_28_15 AM" src="https://github.com/user-attachments/assets/b98f3371-5520-4259-9a6b-b55f4baadc8c" />
<img width="1920" height="893" alt="New Project – Vercel - Google Chrome 7_26_2026 9_27_54 AM" src="https://github.com/user-attachments/assets/dbaf42ca-02f4-46f3-b6c2-ad1604c17cd6" />
<img width="1920" height="893" alt="New Project – Vercel - Google Chrome 7_26_2026 9_27_40 AM" src="https://github.com/user-attachments/assets/88a58915-80fa-4c70-93fe-c53a4d3f64c9" />
<img width="1920" height="886" alt="New Project – Vercel - Google Chrome 7_26_2026 9_27_32 AM" src="https://github.com/user-attachments/assets/ba758eef-4eb8-48d5-be69-710786b98854" />





## g. How to run this project

### Run it locally

```bash
git clone https://github.com/<your-username>/recallloop.git
cd recallloop
npm install
cp .env.example .env.local
# edit .env.local and paste your own Groq API key
npm run dev
```

Open http://localhost:3000.

You need a Groq API key to use the AI generation feature (get one
for free at https://console.groq.com/keys). Every other feature works
without it.

### Deploy it to Vercel (what's live at the URL in Section b)

1. Push this repo to your own **public** GitHub repository.
2. Go to https://vercel.com/new and import that repository.
3. In the project's Environment Variables, add:
   - `GROQ_API_KEY` = your Groq API key
4. Deploy. Vercel auto-detects Next.js — no other configuration
   needed.

No secrets are committed to this repo; `.env*` is gitignored, and the
key is only ever read server-side inside the API route.

## Project structure

```
app/
  page.tsx                  Dashboard: stats, deck grid, deck creation
  deck/[id]/page.tsx        Deck view: card list, manual editor, study mode entry
  api/generate-cards/route.ts   The AI feature (server-side, calls Claude)
  layout.tsx, globals.css   Fonts, design tokens, base styles
components/
  DecayCurve.tsx            Ambient "forgetting curve" visual on the dashboard
  GenerateCardsForm.tsx     Notes → AI → checklist preview → add to deck
  CardEditor.tsx            Manual add/edit form for a single card
  StudySession.tsx          Full-screen flip-card review session
lib/
  types.ts                  Card / Deck / Rating types
  srs.ts                    Spaced-repetition scheduling (SM-2 style)
  storage.ts                localStorage persistence + export/import
  useDecks.ts               Shared state hook wrapping storage + srs
```
