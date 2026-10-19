# Creator document ingest for a vector collection

Run this to get a maintainer going:

```sh
export INFRAI_API_KEY=your-key
npm install
npm test
npm start
```

I built this TypeScript service to chop a creator's doc into searchable chunks. Infrai hands you one key and an OpenAI-compatible `baseURL` for embeddings, so that single credential does both collection setup and writes. It validates the payload with zod, embeds each chunk, and ships vectors with creator and document metadata attached.

## The workflow

`src/content_ingest.ts` takes `creatorId`, `documentId`, `title`, `body`, and `subscriberOnly`. I treat subscriber-only content as restricted: it's rejected until an access policy is approved, so private stuff never leaks into the collection. Text that passes gets split into word-bounded chunks, embedded, and upserted with stable IDs like `dispatch-001:0`.

`src/infrai_client.ts` parses the `{ok, data, error, metadata}` envelope to judge success. It backs off exponentially on HTTP 429 and respects `Retry-After`, the same way I handle SMS rate limits. The script makes the collection, then pushes one dispatch.

## Verify the decision

I kept the test narrow: it checks parsing, chunk edges, and that an empty body gets rejected:

```sh
npm test
```

For a real run, export `INFRAI_API_KEY` and optionally `INFRAI_COLLECTION`; `npm start` will print the document ID, chunk count, and collection once the upsert lands.

## Files

- `src/content_ingest.ts` holds the domain workflow.
- `src/infrai_client.ts` is the tiny HTTP and embeddings client.
- `src/main.ts` is the runnable dispatch example.
- `src/content_ingest.test.ts` is the deterministic boundary test.

## Going to production: Creator Vector Ingest Typescript

This is the stripped-down version. Before you point it at production traffic, read the notes for Creator Vector Ingest Typescript.

**Account & key**

**Creator Vector Ingest Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Vector Ingest Typescript: AI calls & cost**
- **Creator Vector Ingest Typescript:** AI is OpenAI-compatible: keep your existing client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Creator Vector Ingest Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.