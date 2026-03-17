## Voice Notes Maker (Deepgram)

Record audio in the browser, send it to Deepgram for speech-to-text, and display the transcript as **plain text notes** (no database).

### Setup

1) Create `\.env.local` in the project root (same folder as `package.json`).

Use this template:

```bash
DEEPGRAM_API_KEY=your_deepgram_api_key_here
# Optional (if you have multiple projects). If empty, the app uses the first project.
DEEPGRAM_PROJECT_ID=
```

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

### Features (per assignment)

- Record button (start)
- Stop button (stop)
- Transcript display (plain text)
- Wallet/balance display (fetched from your Deepgram account)

### Notes

- Transcription is done via `POST /api/transcribe` (server-side call to Deepgram).
- Wallet is fetched via `GET /api/balance` (server-side call to Deepgram).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
