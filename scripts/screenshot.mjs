// Kiosk layout check: at 1080p and 4K the page must not scroll and all ten rows must be on screen.
// Usage: MOCK_FREEZE_AT=2026-10-29T00:12:00.000Z npm run build && npm start   (in one terminal)
//        npm run shots                                                        (in another)
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const sizes = [
  [1920, 1080],
  [3840, 2160],
];

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
await mkdir("docs/shots", { recursive: true });
let failed = false;

for (const [width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-row]");
  await page.waitForTimeout(1800); // fonts, entrance animation, first poll

  const m = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("[data-row]")];
    return {
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
      rows: rows.length,
      maxBottom: Math.max(...rows.map((r) => r.getBoundingClientRect().bottom)),
      maxRight: Math.max(...rows.map((r) => r.getBoundingClientRect().right)),
    };
  });
  const ok =
    m.scrollHeight <= m.innerHeight &&
    m.scrollWidth <= m.innerWidth &&
    m.rows === 10 &&
    m.maxBottom <= m.innerHeight + 0.5 &&
    m.maxRight <= m.innerWidth + 0.5 &&
    errors.length === 0;
  const file = `docs/shots/board-${width}x${height}.png`;
  await page.screenshot({ path: file });
  console.log(`${width}x${height} ${ok ? "OK  " : "FAIL"} rows=${m.rows} scroll=${m.scrollWidth}x${m.scrollHeight} inner=${m.innerWidth}x${m.innerHeight} maxBottom=${Math.round(m.maxBottom)} errors=${errors.length} → ${file}`);
  if (errors.length) console.log("  page errors:", errors);
  if (!ok) failed = true;
  await page.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
