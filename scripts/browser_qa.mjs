#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.argv[2] || "http://127.0.0.1:4173";
const outDir = process.argv[3] || "qa-screenshots";
const slideSizes = [
  { width: 1600, height: 900 },
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 }
];
const resourceWidths = [1440, 1024, 768, 390];

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

function safeName(value) {
  return value.replaceAll("/", "-").replaceAll("?", "-").replaceAll("=", "-");
}

async function waitForReveal(page) {
  await page.waitForFunction(() => window.Reveal && window.Reveal.isReady && window.Reveal.isReady(), null, { timeout: 20000 });
}

async function horizontalCount(page) {
  return page.evaluate(() => document.querySelectorAll(".reveal .slides > section").length);
}

async function activeSlideProblems(page) {
  return page.evaluate(() => {
    const slide = document.querySelector(".reveal .slides section.stack.present section.present") ||
      document.querySelector(".reveal .slides > section.present");
    if (!slide) return [{ kind: "missing-current-slide" }];
    const problems = [];
    const slideBox = slide.getBoundingClientRect();
    const text = (slide.textContent || "").replace(/\s+/g, " ").trim();
    const visibleImage = [...slide.querySelectorAll("img, svg, iframe")].some((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 12 && box.height > 12;
    });

    if (!text && !visibleImage) problems.push({ kind: "blank-slide" });
    if (slide.scrollWidth > slide.clientWidth + 3) {
      problems.push({ kind: "slide-horizontal", scrollWidth: slide.scrollWidth, clientWidth: slide.clientWidth });
    }
    if (slide.scrollHeight > slide.clientHeight + 3) {
      problems.push({ kind: "slide-vertical", scrollHeight: slide.scrollHeight, clientHeight: slide.clientHeight });
    }

    const children = [...slide.querySelectorAll("h1, h2, p, div, iframe, img, svg, table, ul, ol")]
      .filter((child) => {
        const style = getComputedStyle(child);
        return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0;
      });
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
          className: child.className || "",
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

    for (const iframe of slide.querySelectorAll("iframe")) {
      const doc = iframe.contentDocument;
      if (!doc || !doc.scrollingElement) {
        problems.push({ kind: "iframe-uninspectable", src: iframe.getAttribute("src") });
        continue;
      }
      const scroller = doc.scrollingElement;
      if (scroller.scrollWidth > scroller.clientWidth + 3 || scroller.scrollHeight > scroller.clientHeight + 3) {
        problems.push({
          kind: "iframe-scroll",
          src: iframe.getAttribute("src"),
          scrollWidth: scroller.scrollWidth,
          clientWidth: scroller.clientWidth,
          scrollHeight: scroller.scrollHeight,
          clientHeight: scroller.clientHeight
        });
      }
    }
    return problems;
  });
}

async function checkNoHorizontalScroll(page, label) {
  const problem = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    bodyText: document.body.innerText.trim().slice(0, 120)
  }));
  if (problem.scrollWidth > problem.innerWidth + 3) {
    errors.push(`horizontal page scroll on ${label}: ${JSON.stringify(problem)}`);
  }
  if (!problem.bodyText) {
    errors.push(`blank page body on ${label}`);
  }
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
  const normalPracticeUi = await page.locator("#rehearsal-toggle, #rehearsal-drawer").count();
  if (normalPracticeUi !== 0) {
    errors.push("normal deck exposes rehearsal UI without ?practice=1");
  }

  const finalQrOk = await page.evaluate(async () => {
    window.Reveal.slide(13, 0);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const img = document.querySelector('img[src*="site-qr.svg"]');
    if (!img) return false;
    if (!img.complete) await new Promise((resolve) => img.addEventListener("load", resolve, { once: true }));
    return img.naturalWidth > 80 && img.naturalHeight > 80;
  });
  if (!finalQrOk) {
    errors.push("final slide QR image did not load with useful dimensions");
  }

  for (const size of slideSizes) {
    await page.setViewportSize(size);
    for (let h = 0; h < count; h += 1) {
      await page.goto(urlFor(`index.html#/${h}`), { waitUntil: "networkidle" });
      await waitForReveal(page);
      await page.waitForTimeout(450);
      const problems = await activeSlideProblems(page);
      if (problems.length) {
        errors.push(`slide ${h + 1} at ${size.width}x${size.height}: ${JSON.stringify(problems.slice(0, 5))}`);
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

  await page.goto(urlFor("index.html?practice=1"), { waitUntil: "networkidle" });
  await waitForReveal(page);
  await page.locator("#rehearsal-toggle").waitFor({ timeout: 5000 });
  await page.locator("#rehearsal-toggle").click();
  await page.locator("#rehearsal-drawer:not([hidden])").waitFor({ timeout: 5000 });
  const openingTitle = await page.locator("#rehearsal-title").innerText();
  if (!openingTitle.includes("Federated Learning in Medical AI")) {
    errors.push(`practice drawer did not load title slide notes: ${openingTitle}`);
  }
  await page.locator('[data-tab="zh"]').click();
  const zhText = await page.locator(".rehearsal-content").innerText();
  if (!/中文讲稿|联邦学习/.test(zhText)) {
    errors.push("practice drawer Chinese tab did not render bilingual content");
  }
  await page.evaluate(() => window.Reveal.slide(3, 0));
  await page.waitForTimeout(350);
  await page.locator('[data-tab="interaction"]').click();
  const interactionText = await page.locator(".rehearsal-content").innerText();
  if (!/Fragments 1-7|FedAvg formula|动画片段|聚合/.test(interactionText)) {
    errors.push("practice drawer Interactions tab did not render parameter notes");
  }
  await page.evaluate(() => window.Reveal.slide(4, 0));
  await page.waitForTimeout(350);
  const updatedTitle = await page.locator("#rehearsal-title").innerText();
  if (!updatedTitle.includes("Reveal Your Simulated Hospital")) {
    errors.push(`practice drawer did not update on slidechanged: ${updatedTitle}`);
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  if (await page.locator("#rehearsal-drawer:not([hidden])").count()) {
    errors.push("Escape did not close the rehearsal drawer");
  }
  await page.keyboard.press("Alt+R");
  await page.locator("#rehearsal-drawer:not([hidden])").waitFor({ timeout: 5000 });
  await page.locator(".rehearsal-exit").click();
  await page.waitForURL((url) => !url.searchParams.has("practice"), { timeout: 5000 });
  if (await page.locator("#rehearsal-toggle").count()) {
    errors.push("Exit rehearsal did not remove the rehearsal UI");
  }

  for (const width of resourceWidths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(urlFor("resources.html"), { waitUntil: "networkidle" });
    await checkNoHorizontalScroll(page, `resources ${width}`);
    await page.screenshot({ path: path.join(outDir, `resources-${width}.png`), fullPage: true });
  }

  for (const lab of labs) {
    await page.setViewportSize({ width: 1180, height: 760 });
    await page.goto(urlFor(lab), { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await checkNoHorizontalScroll(page, lab);
    await page.screenshot({ path: path.join(outDir, `${safeName(lab)}.png`), fullPage: false });

    await page.goto(urlFor(`${lab}?embed=1`), { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const embedScroll = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight
    }));
    if (embedScroll.scrollWidth > embedScroll.clientWidth + 3 || embedScroll.scrollHeight > embedScroll.clientHeight + 3) {
      errors.push(`embed lab scroll on ${lab}: ${JSON.stringify(embedScroll)}`);
    }
  }

  await browser.close();

  if (errors.length) {
    console.error("Browser QA failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Browser QA passed. Captured ${count * slideSizes.length} slide screenshots, ${resourceWidths.length} resources screenshots, and ${labs.length} lab screenshots in ${outDir}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
