import assert from "node:assert/strict";
import { chunkText, documentSchema } from "./content_ingest.js";

const parsed = documentSchema.parse({ creatorId: "c1", documentId: "d1", title: "Note", body: "one two", subscriberOnly: false });
assert.equal(parsed.creatorId, "c1");
assert.deepEqual(chunkText("one two three four", 2), ["one two", "three four"]);
assert.throws(() => documentSchema.parse({ creatorId: "c1", documentId: "d1", title: "Note", body: "" }));
console.log("content boundary checks passed");
