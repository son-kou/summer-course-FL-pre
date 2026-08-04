#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.argv[2] || "http://127.0.0.1:4173";
const outDir = process.argv[3] || "qa-screenshots";
const sizes = [
  { width: 1600, height: 900 },
  { width: 1920, height: 1080 }
];

const labs = [
  "labs/aggregation/index.html",
  "labs/mri-domain-shift/index.html",
  "labs/personalization/index.html",
  "labs/missing-modality/index.html",
  "labs/privacy-threat-model/index.html",
  "labs/evaluation-shift/index.html"
];

const errors = [];

function urlFor(relative) {
  return new URL(relative, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

async function waitForReveal(page) {
  await page.waitForFunction(() => window.Reveal && window.Reveal.isReady && window.Reveal.isReady(), null, { timeout: 20000 });
}

async function horizontalCount(page) {
  return page.evaluate(() => document.querySelectorAll(".reveal .slides > section").length);
}

async function activeSlideOverflow(page) {
  return page.evaluate(() => {
    const slide = document.querySelector(".reveal .slides section.stack.present section.present") ||
      document.querySelector(".reveal .slides > section.present");
    if (!slide) return [{ kind: "missing-current-slide" }];
    const problems = [];
    if (slide.scrollWidth > slide.clientWidth + 3) {
      problems.push({ kind: "slide-horizontal", scrollWidth: slide.scrollWidth, clientWidth: slide.clientWidth });
    }
    if (slide.scrollHeight > slide.clientHeight + 3) {
      problems.push({ kind: "slide-vertical", scrollHeight: slide.scrollHeight, clientHeight: slide.clientHeight });
    }
    const slideBox = slide.getBoundingClientRect();
    const children = [...slide.querySelectorAll("h1, h2, p, div, iframe, img, svg, table, ul, ol")];
    for (const child of children) {
      const box = child.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      const outside =
        box.left < slideBox.left - 6 ||
        box.top < slideBox.top - 6 ||
        box.right > slideBox.right + 6 ||
        box.bottom > slideBox.bottom + 6;
      if (outside) {
        problems.push({
          kind: "child-outside-slide",
          tag: child.tagName.toLowerCase(),
          text: (child.textContent || "").trim().slice(0, 80),
          box: {
            left: Math.round(box.left),
            top: Math.round(box.top),
            right: Math.round(box.right),
            bottom: Math.round(box.bottom)
          }
        });
      }
    }
    return problems;
  });
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      errors.push(`console ${message.type()} on ${page.url()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => errors.push(`pageerror on ${page.url()}: ${error.message}`));
  page.on("requestfailed", (request) => {
    const failure = request.failure();
    errors.push(`request failed on ${page.url()}: ${request.url()} ${failure ? failure.errorText : ""}`);
  });

  await page.goto(urlFor("index.html"), { waitUntil: "networkidle" });
  await waitForReveal(page);
  const count = await horizontalCount(page);
  if (count !== 16) {
    errors.push(`expected 16 horizontal main slides, found ${count}`);
  }

  for (const size of sizes) {
    await page.setViewportSize(size);
    for (let h = 0; h < count; h += 1) {
      await page.goto(urlFor(`index.html#/${h}`), { waitUntil: "networkidle" });
      await waitForReveal(page);
      await page.waitForTimeout(350);
      const overflow = await activeSlideOverflow(page);
      if (overflow.length) {
        errors.push(`overflow on slide ${h + 1} at ${size.width}x${size.height}: ${JSON.stringify(overflow.slice(0, 4))}`);
      }
      const filename = path.join(outDir, `slide-${String(h + 1).padStart(2, "0")}-${size.width}x${size.height}.png`);
      await page.screenshot({ path: filename, fullPage: false });
    }
  }

  await page.goto(urlFor("index.html"), { waitUntil: "networkidle" });
  await waitForReveal(page);
  const popupPromise = page.waitForEvent("popup", { timeout: 5000 }).catch(() => null);
  await page.keyboard.press("s");
  const popup = await popupPromise;
  if (!popup) {
    errors.push("speaker view did not open with the S keyboard shortcut");
  } else {
    await popup.waitForLoadState("domcontentloaded");
    await popup.close();
  }

  for (const lab of labs) {
    await page.goto(urlFor(lab), { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const bodyText = await page.locator("body").innerText();
    if (!bodyText.trim()) {
      errors.push(`blank lab body: ${lab}`);
    }
    await page.screenshot({ path: path.join(outDir, `${lab.replaceAll("/", "-")}.png`), fullPage: false });
  }

  await browser.close();

  if (errors.length) {
    console.error("Browser QA failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Browser QA passed. Captured ${count * sizes.length} slide screenshots and ${labs.length} lab screenshots in ${outDir}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
