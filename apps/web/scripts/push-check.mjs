// End-to-end check of the push path: tap → worker → scores → Realtime → board, with the fallback poll
// switched off so only a Realtime push can move the row.
//
// Usage (two terminals):
//   NEXT_PUBLIC_POLL_MS=600000 npx next dev -p 3125
//   BASE_URL=http://localhost:3125 npm run push-check
// Reads SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SECRET_KEY from apps/web/.env (the secret key invokes the
// worker and deletes the test tap again). Inserts one tap for CARD at READER, waits for the board to change
// without a reload, then removes the tap and waits for the revert. Exit code 1 on any failure.
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")]),
);
const base = process.env.BASE_URL ?? "http://localhost:3125";
const CARD = process.env.CARD ?? "04:D4:16:67:CF:EF:62"; // QubitBryce in seed_users.sql
const READER = process.env.READER ?? "esp32c3-3"; // the 17 column
const url = env.SUPABASE_URL.replace(/\/$/, "");
const anon = env.SUPABASE_ANON_KEY;
const secret = env.SUPABASE_SECRET_KEY;
if (!url || !anon || !secret) throw new Error("apps/web/.env needs SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SECRET_KEY");

const rest = (path, key, init = {}) =>
  fetch(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers ?? {}) } });
const runWorker = async () => {
  const r = await fetch(`${url}/functions/v1/score-taps`, { method: "POST", headers: { apikey: secret, "Content-Type": "application/json" }, body: "{}" });
  const body = await r.json();
  if (!r.ok || !body.ok) throw new Error(`worker: ${r.status} ${JSON.stringify(body)}`);
  return body;
};

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let failed = false;
const check = (ok, msg) => { console.log(`${ok ? "OK  " : "FAIL"} ${msg}`); if (!ok) failed = true; };

try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-row]", { timeout: 60_000 });
  const pill = page.getByRole("status");
  await page.waitForFunction(() => /PUSH/.test(document.querySelector('[role="status"]')?.textContent ?? ""), null, { timeout: 15_000 }).catch(() => {});
  const pillText = (await pill.textContent())?.replace(/\s+/g, " ").trim();
  check(/LIVE/.test(pillText) && /PUSH/.test(pillText), `header pill reads "${pillText}" (expected LIVE + PUSH; WORKER IDLE means the cron job is not authenticating: store worker_key in Vault)`);

  const rowOf = () => page.locator("[data-row]").filter({ hasText: "QubitBryce" }).first();
  const totalOf = async () => Number(((await rowOf().locator('[data-cell="total"]').textContent()) ?? "").replace(/,/g, ""));
  const before = await totalOf();
  check(Number.isFinite(before) && before > 0, `QubitBryce total before: ${before}`);

  const inserted = await rest("nfc_reads", anon, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ uid: CARD, reader_id: READER }) });
  const [tap] = await inserted.json();
  check(inserted.ok && tap?.id, `inserted test tap id=${tap?.id} for ${CARD} at ${READER}`);

  const t0 = Date.now();
  const run1 = await runWorker();
  check(run1.changed >= 1, `worker run 1: ${JSON.stringify(run1)}`);
  await page.waitForFunction(
    (want) => { const row = [...document.querySelectorAll("[data-row]")].find((r) => r.textContent?.includes("QubitBryce")); return Number((row?.querySelector('[data-cell="total"]')?.textContent ?? "").replace(/,/g, "")) === want; },
    before + 100,
    { timeout: 10_000 },
  ).then(() => check(true, `board moved to ${before + 100} without a reload, ${Date.now() - t0} ms after the worker wrote (poll is off: this was a Realtime push)`))
   .catch(async () => check(false, `board still shows ${await totalOf()} after 10 s (expected ${before + 100})`));

  const removed = await rest(`nfc_reads?id=eq.${tap.id}`, secret, { method: "DELETE" });
  check(removed.ok, `deleted test tap ${tap.id}`);
  const run2 = await runWorker();
  check(run2.changed >= 1, `worker run 2: ${JSON.stringify(run2)}`);
  await page.waitForFunction(
    (want) => { const row = [...document.querySelectorAll("[data-row]")].find((r) => r.textContent?.includes("QubitBryce")); return Number((row?.querySelector('[data-cell="total"]')?.textContent ?? "").replace(/,/g, "")) === want; },
    before,
    { timeout: 10_000 },
  ).then(() => check(true, `board reverted to ${before} (idempotent worker)`))
   .catch(async () => check(false, `board still shows ${await totalOf()} after 10 s (expected ${before})`));
  check(errors.length === 0, `page errors: ${errors.length}${errors.length ? " " + errors.join(" | ") : ""}`);
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
