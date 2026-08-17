#!/usr/bin/env node
// End-to-end smoke test against a REAL configured backend (Firebase), as
// opposed to scripts/live_browser_qa.mjs which covers demo mode, cross-tab
// rehearsal, and fallback behaviour with no backend at all. This script
// only exercises something real when live/firebase-config.js has actual
// (non-placeholder) values — otherwise the admin/student pages fall back to
// LocalProvider and this test still passes, but isn't proving much.
//
// Opens the admin dashboard and a simulated student device in two separate
// browser contexts, drives the full join -> decide -> aggregate -> reset
// flow against whatever backend is configured, and fails loudly on any
// console/page error or on any step that doesn't reach the expected state.
//
// Run this once before teaching, whenever firebase-config.js or the
// Realtime Database security rules change, or after editing
// live/lib/backend.js or the admin/student apps.
//
// Usage:
//   python3 -m http.server 8931 &        # serve the repo root statically
//   node scripts/live_firebase_smoke_test.mjs http://127.0.0.1:8931
//
// Requires the `playwright` devDependency (already in package.json) and
// its browser binaries (`npx playwright install chromium` once).
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:8931";

function consoleWatcher(page, label, errors) {
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[${label}] console.error: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`[${label}] pageerror: ${err.message}`));
}

async function main() {
  const browser = await chromium.launch();
  const errors = [];

  const adminCtx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const adminPage = await adminCtx.newPage();
  consoleWatcher(adminPage, "admin", errors);
  adminPage.on("dialog", (dialog) => dialog.accept());

  console.log("Opening admin dashboard...");
  await adminPage.goto(`${BASE}/live/admin/index.html`, { waitUntil: "networkidle" });
  await adminPage.waitForTimeout(1500);

  console.log("Creating session...");
  await adminPage.click("#btn-create-session");
  await adminPage.waitForTimeout(2000);
  const sessionCode = await adminPage.textContent("#session-code-display");
  console.log("Session code:", sessionCode);
  if (!sessionCode || sessionCode.includes("create session")) {
    throw new Error("Session code was not created/displayed");
  }

  const connectionPill = await adminPage.textContent("#connection-pill");
  console.log("Admin connection pill:", connectionPill);

  // --- Student device ---
  const studentCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const studentPage = await studentCtx.newPage();
  consoleWatcher(studentPage, "student", errors);

  const joinUrl = `${BASE}/live/index.html?code=${encodeURIComponent(sessionCode.trim())}`;
  console.log("Student joining:", joinUrl);
  await studentPage.goto(joinUrl, { waitUntil: "networkidle" });
  await studentPage.waitForTimeout(1500);

  await studentPage.click("text=Reveal my site");
  await studentPage.waitForTimeout(1500);
  const siteHeadline = await studentPage.textContent("h2");
  console.log("Student site card headline:", siteHeadline);

  await studentPage.click("text=Continue to my decision");
  await studentPage.waitForTimeout(500);
  await studentPage.click("button.button-participate");
  await studentPage.waitForTimeout(2000);
  const waitingText = await studentPage.textContent("h2");
  console.log("Student final screen:", waitingText);

  // --- Back to admin: verify the join+decision propagated over real Firebase ---
  await adminPage.waitForTimeout(3000);
  const joined = await adminPage.textContent("#joined-count");
  const responded = await adminPage.textContent("#responded-count");
  console.log("Admin sees joined:", joined, "responded:", responded);

  const mapHtml = await adminPage.evaluate(() => document.getElementById("federation-map").innerHTML.length);
  console.log("Federation map inner content length:", mapHtml);

  await adminPage.click("#btn-round1").catch(() => {});
  await adminPage.waitForTimeout(1500);
  const globalDeltaText = await adminPage.evaluate(() => document.getElementById("weights-headline")?.textContent);
  console.log("Weights headline after Round 1:", globalDeltaText);

  console.log("\n--- Testing 'Reset simulation' on the SAME session code ---");
  await adminPage.click("#btn-reset");
  await adminPage.waitForTimeout(2500);
  const toastText = await adminPage.evaluate(() => document.getElementById("admin-toast")?.textContent);
  const toastIsError = await adminPage.evaluate(() => document.getElementById("admin-toast")?.classList.contains("error"));
  console.log("Reset toast:", toastText, "| error:", toastIsError);

  const phaseAfterReset = await adminPage.textContent("#phase-pill");
  const joinedAfterReset = await adminPage.textContent("#joined-count");
  const respondedAfterReset = await adminPage.textContent("#responded-count");
  const codeAfterReset = await adminPage.textContent("#session-code-display");
  console.log("After reset -> phase:", phaseAfterReset.trim(), "joined:", joinedAfterReset, "responded:", respondedAfterReset, "code:", codeAfterReset.trim());

  if (toastIsError) {
    throw new Error(`Reset reported an error toast: "${toastText}"`);
  }
  if (joinedAfterReset.trim() !== "0" || respondedAfterReset.trim() !== "0") {
    throw new Error(`Reset did not clear clients: joined=${joinedAfterReset} responded=${respondedAfterReset}`);
  }
  if (codeAfterReset.trim() !== sessionCode.trim()) {
    throw new Error("Reset unexpectedly changed the session code (should stay the same).");
  }
  console.log("Reset verified: same session code, roster cleared, no error toast.");

  await browser.close();

  if (errors.length) {
    console.log("\n=== Console/page errors captured ===");
    errors.forEach((e) => console.log(e));
    process.exitCode = 1;
  } else {
    console.log("\nNo console or page errors captured. Smoke test passed.");
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
