#!/usr/bin/env node
// End-to-end smoke test for the live federation activity (student app +
// instructor dashboard). Complements live/tests/simulation.test.mjs, which
// covers the pure math; this covers the browser wiring: demo mode, the
// student decision flow, cross-tab rehearsal sync with no backend, graceful
// fallback when Firebase is not configured, and mobile viewports.
import { chromium } from "playwright";

const baseUrl = process.argv[2] || "http://127.0.0.1:4173";
const errors = [];

function urlFor(relative) {
  return new URL(relative, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

function trackErrors(page, label) {
  page.on("pageerror", (e) => errors.push(`[${label}] pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[${label}] console.error: ${msg.text()}`);
  });
}

// The opening prediction poll is screen 0, shown before "Reveal my site" on
// every student visit that has a session code.
async function answerPredictPoll(page) {
  await page.waitForSelector("text=You already trained different models", { timeout: 10000 });
  await page.click("text=Weight each model by how much data it was trained on");
}

async function checkNoOverflow(page, label) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  if (scrollWidth > clientWidth + 3) {
    errors.push(`${label}: horizontal overflow, scrollWidth=${scrollWidth} clientWidth=${clientWidth}`);
  }
}

async function main() {
  const browser = await chromium.launch();

  // --- Student flow in demo mode: join -> site card -> flag a concern -> waiting ---
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    trackErrors(page, "student-demo");
    await page.goto(urlFor("live/index.html?demo=1"));
    await answerPredictPoll(page);
    await page.waitForSelector("text=Reveal my site", { timeout: 10000 });
    await page.click("text=Reveal my site");
    await page.waitForSelector("text=Continue to my decision", { timeout: 5000 });
    await page.click("text=Continue to my decision");
    await page.waitForSelector(".button-flag", { timeout: 5000 });
    await page.click(".button-flag");
    await page.waitForSelector("text=Distribution shift", { timeout: 5000 });
    await page.click("text=Distribution shift");
    await page.click("text=Send update with this concern");
    await page.waitForSelector("text=Look at the main screen", { timeout: 5000 });
    await page.close();
  }

  // --- Reload resumes progress instead of restarting at the opening poll ---
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    trackErrors(page, "student-resume");
    const code = "FL-RESUME";
    await page.goto(urlFor(`live/index.html?code=${code}&local=1`));
    await answerPredictPoll(page);
    await page.waitForSelector("text=Reveal my site", { timeout: 10000 });
    await page.click("text=Reveal my site");
    await page.waitForSelector("text=Continue to my decision", { timeout: 5000 });

    await page.reload({ waitUntil: "networkidle" });
    const resumedToPoll = await page.locator("text=You already trained different models").count();
    if (resumedToPoll > 0) {
      errors.push("student-resume: reload sent an already-progressed student back to the opening poll");
    }
    await page.waitForSelector("text=Continue to my decision", { timeout: 5000 });
    await page.click("text=Continue to my decision");
    await page.click("button.button-participate");
    await page.waitForSelector("text=Look at the main screen", { timeout: 5000 });

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("text=Look at the main screen", { timeout: 5000 });
    await page.close();
  }

  // --- Student flow with no ?code=: manual entry fallback ---
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    trackErrors(page, "student-nocode");
    await page.goto(urlFor("live/index.html"));
    await page.waitForSelector("text=Enter your session code", { timeout: 10000 });
    await page.close();
  }

  // --- Admin dashboard: demo populate, respond, aggregation switch, events, session controls, QR, rehearsal ---
  {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    trackErrors(page, "admin-demo");
    await page.goto(urlFor("live/admin/index.html?demo=1"));
    await page.waitForSelector("#session-code-display", { timeout: 10000 });

    await page.click("#btn-demo-populate");
    await page.waitForFunction(() => document.getElementById("joined-count").textContent === "60", { timeout: 10000 });

    await page.click("#btn-demo-respond");
    await page.waitForTimeout(1500);
    const responded = Number(await page.textContent("#responded-count"));
    if (!(responded > 0)) errors.push(`admin-demo: expected responded > 0 after simulate, got ${responded}`);

    await page.click('[data-strategy="fedavg"]');
    await page.waitForTimeout(200);

    const beforeRound1 = await page.textContent("#weights-headline");
    if (!/—/.test(beforeRound1)) errors.push(`admin-demo: weights headline should be a placeholder before Start Round 1, got: ${beforeRound1}`);

    // The weights/vectors/evaluation panels are intentionally blank
    // ("Waiting for Start Round 1…") until aggregation actually starts —
    // otherwise clicking "Start Round 1" would visibly do nothing, since
    // they'd already have been rendering continuously beforehand. So an
    // event's effect on the aggregate is only checkable once Round 1 has
    // begun.
    await page.click("#btn-toggle-join");
    await page.waitForTimeout(150);
    await page.click("#btn-round1");
    await page.waitForTimeout(150);
    if ((await page.textContent("#phase-pill")) !== "round1") errors.push("admin-demo: phase did not advance to round1");

    const before = await page.textContent("#weights-headline");
    if (/—/.test(before)) errors.push(`admin-demo: weights headline still showed a placeholder after Start Round 1: ${before}`);
    await page.click("#btn-event-giant");
    await page.waitForTimeout(300);
    const after = await page.textContent("#weights-headline");
    if (before === after) errors.push("admin-demo: giant-hospital event did not change the largest client weight");

    await page.click("#btn-event-rare");
    await page.waitForTimeout(200);
    await page.click("#btn-event-suspicious");
    await page.waitForTimeout(200);
    await page.click("#btn-round2");
    await page.waitForTimeout(150);
    if ((await page.textContent("#phase-pill")) !== "stress") errors.push("admin-demo: phase did not advance to stress");

    await page.click("#btn-show-qr");
    const qrBox = await page.locator("#qr-target svg").boundingBox({ timeout: 5000 }).catch(() => null);
    if (!qrBox || qrBox.width < 50) errors.push("admin-demo: JOIN QR did not render");

    // The QR overlay covers the whole screen, so it must be closable more
    // than one way: Escape, clicking the dark backdrop, and the visible
    // Close button.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    if (!(await page.evaluate(() => document.getElementById("qr-overlay").hidden))) {
      errors.push("admin-demo: Escape did not close the JOIN QR overlay");
    }
    await page.click("#btn-show-qr");
    await page.waitForTimeout(150);
    await page.click("#qr-overlay", { position: { x: 5, y: 5 } });
    await page.waitForTimeout(150);
    if (!(await page.evaluate(() => document.getElementById("qr-overlay").hidden))) {
      errors.push("admin-demo: clicking the backdrop did not close the JOIN QR overlay");
    }
    await page.click("#btn-show-qr");
    await page.waitForTimeout(150);
    await page.click("#qr-close");
    if (!(await page.evaluate(() => document.getElementById("qr-overlay").hidden))) {
      errors.push("admin-demo: the Close button did not close the JOIN QR overlay");
    }

    await page.click("#btn-rehearsal");
    await page.waitForSelector("#rehearsal-strip:not([hidden])", { timeout: 5000 });
    const step1 = await page.textContent("#rehearsal-step-label");
    await page.click("#btn-rehearsal-next");
    const step2 = await page.textContent("#rehearsal-step-label");
    if (step1 === step2) errors.push("admin-demo: rehearsal step did not advance");
    await page.click("#btn-rehearsal-exit");

    await page.close();
  }

  // --- Cross-tab rehearsal (no backend): admin + student sharing one browser context via BroadcastChannel ---
  {
    const context = await browser.newContext();
    const adminPage = await context.newPage();
    const studentPage = await context.newPage();
    trackErrors(adminPage, "crosstab-admin");
    trackErrors(studentPage, "crosstab-student");

    await adminPage.goto(urlFor("live/admin/index.html?local=1"));
    await adminPage.waitForSelector("#session-code-display", { timeout: 10000 });
    const code = await adminPage.textContent("#session-code-display");

    await studentPage.goto(urlFor(`live/index.html?code=${encodeURIComponent(code)}&local=1`));
    await answerPredictPoll(studentPage);
    await adminPage
      .waitForFunction(() => document.getElementById("joined-count").textContent === "1", { timeout: 5000 })
      .catch(() => errors.push("crosstab: poll vote did not propagate to admin via BroadcastChannel/localStorage"));

    // Move the admin off the predict-only view so responded-count reflects
    // decisions (not poll votes) for the rest of this test.
    await adminPage.click("#btn-reveal-federation");
    await adminPage.waitForSelector("#admin-stage:not([hidden])", { timeout: 5000 });

    await studentPage.waitForSelector("text=Reveal my site", { timeout: 10000 });
    await studentPage.click("text=Reveal my site");
    await studentPage.click("text=Continue to my decision");
    await studentPage.click(".button-participate");
    await adminPage
      .waitForFunction(() => document.getElementById("responded-count").textContent === "1", { timeout: 5000 })
      .catch(() => errors.push("crosstab: decision did not propagate to admin via BroadcastChannel/localStorage"));

    await context.close();
  }

  // --- Backend resolution must always settle to a known state, never hang
  // on "checking connection" or throw. With a real firebase-config.js this
  // exercises the actual Firebase handshake (anonymous sign-in + dynamic
  // module load), which is a genuine network round trip — unlike the
  // synchronous LocalProvider fallback, so this needs to wait for the
  // connection pill to leave its initial "checking connection" state
  // rather than merely wait for the (always-present) DOM element. ---
  {
    const page = await browser.newPage();
    trackErrors(page, "no-backend-fallback");
    await page.goto(urlFor("live/admin/index.html"));
    await page
      .waitForFunction(() => !document.getElementById("connection-pill")?.textContent.includes("checking"), null, {
        timeout: 15000,
      })
      .catch(() => errors.push("no-backend-fallback: connection pill never left 'checking connection'"));
    await page.waitForFunction(() => document.getElementById("session-code-display")?.textContent !== "— create session —", null, {
      timeout: 15000,
    });
    const pill = await page.textContent("#connection-pill");
    if (!/local rehearsal|demo mode|live backend connected/.test(pill)) {
      errors.push(`no-backend-fallback: unexpected connection pill text: ${pill}`);
    }
    await page.close();
  }

  // --- Mobile viewports: no horizontal overflow on the student app ---
  for (const [name, width, height] of [
    ["iphone-se", 375, 667],
    ["iphone-modern", 390, 844],
    ["android-ish", 412, 915],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    trackErrors(page, `mobile-${name}`);
    await page.goto(urlFor("live/index.html?demo=1"));
    await page.waitForSelector("text=You already trained different models", { timeout: 10000 });
    await checkNoOverflow(page, `mobile-${name}-predict`);
    await page.click("text=Weight each model by how much data it was trained on");
    await page.waitForSelector("text=Reveal my site", { timeout: 10000 });
    await page.click("text=Reveal my site");
    await checkNoOverflow(page, `mobile-${name}-site`);
    await page.close();
  }

  // --- Playground: no session needed, all three tabs interactive, no errors, no overflow ---
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    trackErrors(page, "playground");
    await page.goto(urlFor("live/playground/index.html"));
    await page.waitForSelector("text=Node vs Center", { timeout: 10000 });
    await checkNoOverflow(page, "playground-security");

    await page.click("#tg-logs");
    await page.click("#tg-release");
    await page.waitForSelector("text=membership inference", { timeout: 5000 });

    await page.click('[data-tab="heterogeneity"]');
    await page.$eval("#sl-heterogeneity", (input) => {
      input.value = "90";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForSelector("text=strongly disagree", { timeout: 5000 });
    await checkNoOverflow(page, "playground-heterogeneity");

    await page.click('[data-tab="fairness"]');
    await page.$eval("#sl-fairness", (input) => {
      input.value = "2000";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const rareWeightText = await page.textContent("#fair-node-weight");
    if (!/%/.test(rareWeightText)) errors.push(`playground-fairness: unexpected weight readout "${rareWeightText}"`);
    await checkNoOverflow(page, "playground-fairness");

    await page.close();
  }

  await browser.close();

  if (errors.length) {
    console.error("Live activity QA failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log("Live activity QA passed (student flow, admin dashboard, cross-tab rehearsal, fallback, mobile).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
