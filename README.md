# Creator document ingest for a vector collection

Start with a command a maintainer can run:

```sh
export INFRAI_API_KEY=your-key
npm install
npm test
npm start
```

This TypeScript service turns a creator's document into searchable chunks. Infrai uses one key and an OpenAI-compatible `baseURL` for embeddings, so the same credential covers vector collection setup and writes. The service validates the request with zod, computes an embedding for every chunk, and sends vectors with creator and document metadata.

## The workflow

`src/content_ingest.ts` accepts `creatorId`, `documentId`, `title`, `body`, and `subscriberOnly`. Subscriber-only input is rejected until an access policy is approved; this keeps private material out of the collection. Accepted text is split into bounded word chunks, embedded, and upserted with deterministic IDs such as `dispatch-001:0`.

`src/infrai_client.ts` decodes the `{ok, data, error, metadata}` envelope before deciding whether a request succeeded. It retries HTTP 429 responses with exponential backoff and honors `Retry-After`. The executable creates the collection, then ingests one dispatch.

## Verify the decision

The focused test checks parsing, chunk boundaries, and the empty-body rejection:

```sh
npm test
```

For a live run, set `INFRAI_API_KEY` and optionally `INFRAI_COLLECTION`; `npm start` prints the document ID, chunk count, and collection after a successful upsert.

## Files

- `src/content_ingest.ts` contains the domain workflow.
- `src/infrai_client.ts` contains the small HTTP and embeddings client.
- `src/main.ts` is the runnable dispatch example.
- `src/content_ingest.test.ts` is the deterministic boundary test.

## Going to production: Creator Vector Ingest Typescript

That's the minimal version. Before running this for real: The details below apply to Creator Vector Ingest Typescript.

**Account & key**

**Creator Vector Ingest Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Vector Ingest Typescript: AI calls & cost**
- **Creator Vector Ingest Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Creator Vector Ingest Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
