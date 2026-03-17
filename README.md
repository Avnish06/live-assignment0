## Voice Notes Maker (Next.js)

Voice-to-text notes app built in **Next.js**.

- Records audio in the browser (Record / Stop)
- Sends audio to **Deepgram** for transcription
- Displays the transcript as **plain text** (no database)
- Shows a **wallet/balance** value in the UI

## Requirements

- Node.js 18+ (recommended)
- A Deepgram API key (for transcription)

## Setup

Create `c:\Users\Lenovo\Assignmento\voice-notes-maker\.env.local`:

```bash
DEEPGRAM_API_KEY=your_deepgram_api_key_here
DEEPGRAM_PROJECT_ID=
```

Notes:
- `DEEPGRAM_PROJECT_ID` is optional.
- You must restart the dev server after changing `.env.local`.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API routes

- `POST /api/transcribe`
  - Accepts `multipart/form-data` with `audio` (file)
  - Calls Deepgram `/v1/listen` and returns:
    - `{ "transcript": "..." }`

- `GET /api/balance`
  - Temporary implementation that returns:
    - `{ "balance": "$200" }`

## Assignment checklist (from prompt)

- Start/stop recording controls
- Transcript display (plain text)
- Wallet/balance display

