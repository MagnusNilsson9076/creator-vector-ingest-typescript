import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const documentSchema = z.object({
  creatorId: z.string().min(1),
  documentId: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  subscriberOnly: z.boolean().default(false),
});
export type CreatorDocument = z.infer<typeof documentSchema>;

export function chunkText(text: string, size = 500): string[] {
  const words = text.trim().split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size) chunks.push(words.slice(i, i + size).join(" "));
  return chunks.filter(Boolean);
}

export async function ingestDocument(input: unknown, client: InfraiClient, collection: string) {
  const doc = documentSchema.parse(input);
  if (doc.subscriberOnly) throw new Error("subscriber-only content requires an approved delivery policy");
  const chunks = chunkText(doc.body);
  const vectors = [];
  for (let index = 0; index < chunks.length; index++) {
    const embedding = await client.embeddings(chunks[index]);
    vectors.push({ id: `${doc.documentId}:${index}`, values: embedding, metadata: { creatorId: doc.creatorId, documentId: doc.documentId, title: doc.title, index } });
  }
  await client.upsert(collection, vectors);
  return { documentId: doc.documentId, chunks: vectors.length, collection };
}
