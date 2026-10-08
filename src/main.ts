import { InfraiClient } from "./infrai_client.js";
import { ingestDocument } from "./content_ingest.js";

const client = new InfraiClient();
const collection = process.env.INFRAI_COLLECTION ?? "creator-notes";
const document = { creatorId: "creator-42", documentId: "dispatch-001", title: "Subscriber dispatch", body: "A short field note about publishing digital assets with access checks and clear delivery receipts." };
await client.createCollection(collection, 1536);
console.log(await ingestDocument(document, client, collection));
