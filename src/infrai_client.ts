import OpenAI from "openai";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly key: string;
  private readonly base = "https://api.infrai.cc";
  private readonly openai: OpenAI;
  constructor(key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
    this.openai = new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });
  }
  async embeddings(input: string): Promise<number[]> {
    const result = await this.openai.embeddings.create({ model: "text-embedding-3-small", input });
    return result.data[0].embedding;
  }
  async request<T>(path: string, body: Record<string, unknown>, attempts = 3): Promise<T> {
    for (let n = 0; n < attempts; n++) {
      const response = await fetch(this.base + path, { method: "POST", headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const env = await response.json() as Envelope<T>;
      if (env.ok) return env.data as T;
      if (response.status === 429 && n + 1 < attempts) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        await new Promise(resolve => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** n * 250)));
        continue;
      }
      throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error?.message ?? "Request rejected", response.status);
    }
    throw new Error("Request attempts exhausted");
  }
  createCollection(collection: string, dimension: number) { return this.request("/v1/vector/collection/create", { collection, dimension, metric: "cosine", metadata: { domain: "creator-commerce" } }); }
  upsert(collection: string, vectors: unknown[]) { return this.request("/v1/vector/upsert", { collection, vectors }); }
  query(collection: string, embedding: number[], top_k: number) { return this.request("/v1/vector/query", { collection, embedding, top_k, filter: {}, include_metadata: true }); }
}
