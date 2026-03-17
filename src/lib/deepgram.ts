type DeepgramFetchInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string | undefined>;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export function getDeepgramApiKey(): string {
  return requireEnv("DEEPGRAM_API_KEY");
}

export function hasDeepgramApiKey(): boolean {
  return Boolean(process.env.DEEPGRAM_API_KEY);
}

export async function deepgramFetch(
  path: string,
  init: DeepgramFetchInit = {},
): Promise<Response> {
  const apiKey = getDeepgramApiKey();
  const url = path.startsWith("http")
    ? path
    : `https://api.deepgram.com${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Token ${apiKey}`,
    ...(init.headers ?? {}),
  };

  return fetch(url, { ...init, headers });
}

export type DeepgramProject = {
  project_id: string;
  name?: string;
};

export async function getDeepgramProjectId(): Promise<string> {
  const configured = process.env.DEEPGRAM_PROJECT_ID;
  if (configured) return configured;

  const res = await deepgramFetch("/v1/projects");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Deepgram projects request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { projects?: DeepgramProject[] };
  const first = data.projects?.[0]?.project_id;
  if (!first) throw new Error("No Deepgram projects found for this API key.");
  return first;
}

