import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Clerk appearance keeps the widget footer white and readable", () => {
  const source = readFileSync(new URL("./clerk-appearance.ts", import.meta.url), "utf8");
  assert.match(source, /colorBackground:\s*"#ffffff"/);
  assert.match(source, /colorNeutral:\s*"#ffffff"/);
  assert.match(source, /footer:\s*"bg-white/);
  assert.match(source, /footerActionText:\s*"text-mute"/);
  assert.match(source, /footerActionLink:\s*"text-ink/);
  assert.doesNotMatch(source, /colorBackground:\s*"transparent"/);
});
