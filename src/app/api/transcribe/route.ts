import { deepgramFetch, hasDeepgramApiKey } from "@/lib/deepgram";
import { NextResponse } from "next/server";

type DeepgramListenResponse = {
  results?: {
    channels?: Array<{
      alternatives?: Array<{
        transcript?: string;
      }>;
    }>;
  };
};

export async function POST(request: Request) {
  if (!hasDeepgramApiKey()) {
    return NextResponse.json(
      {
        error:
          "Deepgram API key not configured. Create .env.local with DEEPGRAM_API_KEY and restart the dev server.",
      },
      { status: 400 },
    );
  }

  try {
    const form = await request.formData();
    const audio = form.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "Missing form-data file field: audio" },
        { status: 400 },
      );
    }

    const contentType = audio.type || "application/octet-stream";
    const bytes = new Uint8Array(await audio.arrayBuffer());

    const qs = new URLSearchParams({
      model: "nova-2",
      smart_format: "true",
      punctuate: "true",
    });

    const res = await deepgramFetch(`/v1/listen?${qs.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body: bytes,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Deepgram transcription failed (${res.status})`, details: text },
        { status: 502 },
      );
    }

    const data = (await res.json()) as DeepgramListenResponse;
    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

    return NextResponse.json({ transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

