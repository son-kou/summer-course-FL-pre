import test from "node:test";
import assert from "node:assert/strict";
import {
  mulberry32,
  hashString,
  generateClient,
  generateRoster,
  fedAvgWeights,
  equalClientWeights,
  clippedFedAvg,
  clipDelta,
  coordinateMedian,
  runAggregation,
  evaluateGlobalUpdate,
  injectGiantHospital,
  injectRareHospital,
  injectSuspiciousUpdate,
  summarizeParticipation,
  AGGREGATION_STRATEGIES,
  PREDICT_OPTIONS,
  summarizePoll,
  POLL_DESIGN_GROUPS,
  summarizePollByDesign,
} from "../lib/simulation.js";

test("mulberry32 is deterministic for a given seed", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  const seqA = [a(), a(), a()];
  const seqB = [b(), b(), b()];
  assert.deepEqual(seqA, seqB);
});

test("hashString is stable and differs for different strings", () => {
  assert.equal(hashString("FL-4821::client-3"), hashString("FL-4821::client-3"));
  assert.notEqual(hashString("FL-4821::client-3"), hashString("FL-4821::client-4"));
});

test("generateClient is deterministic given the same session seed and id", () => {
  const a = generateClient("FL-4821", "client-37");
  const b = generateClient("FL-4821", "client-37");
  assert.deepEqual(a, b);
});

test("generateClient differs across sessions and across client ids", () => {
  const a = generateClient("FL-4821", "client-37");
  const b = generateClient("FL-9999", "client-37");
  const c = generateClient("FL-4821", "client-38");
  assert.notDeepEqual(a, b);
  assert.notDeepEqual(a, c);
});

test("generateClient always returns a client without an assigned decision", () => {
  const client = generateClient("FL-4821", "client-1");
  assert.equal(client.decision, null);
  assert.equal(typeof client.updateNorm, "number");
  assert.equal(client.delta.length, 2);
});

test("generateRoster produces the requested count, all deterministic", () => {
  const roster = generateRoster("FL-1000", 60);
  assert.equal(roster.length, 60);
  const roster2 = generateRoster("FL-1000", 60);
  assert.deepEqual(roster, roster2);
  const ids = new Set(roster.map((c) => c.id));
  assert.equal(ids.size, 60);
});

function withDecisions(roster, decisionFn) {
  return roster.map((c, i) => ({ ...c, decision: decisionFn(c, i) }));
}

test("fedAvg weights sum to 1 and only include participating clients", () => {
  const roster = generateRoster("FL-2000", 10);
  const decided = withDecisions(roster, (c, i) => (i % 4 === 0 ? "hold" : i % 3 === 0 ? "flag" : "participate"));
  const { weights, included } = fedAvgWeights(decided);
  const total = [...weights.values()].reduce((s, v) => s + v, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  assert.ok(included.length < decided.length);
  included.forEach((id) => {
    const client = decided.find((c) => c.id === id);
    assert.notEqual(client.decision, "hold");
  });
});

test("equal-client weighting gives every participant identical weight", () => {
  const roster = generateRoster("FL-2001", 6);
  const decided = withDecisions(roster, () => "participate");
  const { weights } = equalClientWeights(decided);
  const values = [...weights.values()];
  values.forEach((v) => assert.ok(Math.abs(v - 1 / values.length) < 1e-9));
  const total = values.reduce((s, v) => s + v, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
});

test("a fully held-out roster produces zero participants and a zero vector", () => {
  const roster = generateRoster("FL-2002", 5);
  const decided = withDecisions(roster, () => "hold");
  const result = runAggregation("fedavg", decided);
  assert.equal(result.included.length, 0);
  assert.deepEqual(result.globalDelta, [0, 0]);
});

test("clipDelta never increases the norm and preserves direction", () => {
  const delta = [3, 4]; // norm 5
  const clipped = clipDelta(delta, 2);
  const norm = Math.hypot(clipped[0], clipped[1]);
  assert.ok(Math.abs(norm - 2) < 1e-6);
  assert.ok(Math.abs(clipped[0] / clipped[1] - delta[0] / delta[1]) < 1e-6);
  const untouched = clipDelta([1, 1], 5);
  assert.deepEqual(untouched, [1, 1]);
});

test("clipped FedAvg bounds every included client's contribution", () => {
  const roster = generateRoster("FL-2003", 20);
  const decided = withDecisions(roster, () => "participate");
  const result = clippedFedAvg(decided, 1.2);
  assert.ok(result.globalDelta[0] !== undefined);
  const plain = fedAvgWeights(decided);
  const plainDelta = decided.reduce(
    (acc, c) => {
      const w = plain.weights.get(c.id) || 0;
      return [acc[0] + w * c.delta[0], acc[1] + w * c.delta[1]];
    },
    [0, 0],
  );
  const plainNorm = Math.hypot(plainDelta[0], plainDelta[1]);
  const clippedNorm = Math.hypot(result.globalDelta[0], result.globalDelta[1]);
  // Clipping individual contributions should not make the aggregate larger
  // than the unclipped aggregate when an outlier dominates.
  assert.ok(clippedNorm <= plainNorm + 1e-6 || clippedNorm < 1.3);
});

test("coordinate median is robust to one extreme outlier", () => {
  const roster = generateRoster("FL-2004", 9);
  const decided = withDecisions(roster, () => "participate");
  const withOutlier = injectSuspiciousUpdate(decided, decided[0].id);
  const median = coordinateMedian(withOutlier);
  const fedavg = fedAvgWeights(withOutlier);
  const fedavgDelta = withOutlier.reduce(
    (acc, c) => {
      const w = fedavg.weights.get(c.id) || 0;
      return [acc[0] + w * c.delta[0], acc[1] + w * c.delta[1]];
    },
    [0, 0],
  );
  const medianNorm = Math.hypot(median.globalDelta[0], median.globalDelta[1]);
  const outlierNorm = withOutlier[0].updateNorm;
  assert.ok(medianNorm < outlierNorm);
  assert.ok(Number.isFinite(fedavgDelta[0]));
});

test("all four aggregation strategies are registered and runnable", () => {
  const roster = generateRoster("FL-2005", 12);
  const decided = withDecisions(roster, (c, i) => (i % 5 === 0 ? "hold" : "participate"));
  Object.keys(AGGREGATION_STRATEGIES).forEach((key) => {
    const result = runAggregation(key, decided);
    assert.ok(Array.isArray(result.globalDelta));
    assert.equal(result.globalDelta.length, 2);
  });
});

test("evaluateGlobalUpdate returns four environments within a sane clinical range", () => {
  const roster = generateRoster("FL-2006", 30);
  const decided = withDecisions(roster, () => "participate");
  const { globalDelta } = runAggregation("fedavg", decided);
  const evaluation = evaluateGlobalUpdate(globalDelta);
  assert.equal(evaluation.perEnvironment.length, 4);
  evaluation.perEnvironment.forEach((env) => {
    assert.ok(env.performance >= 0.3 && env.performance <= 0.97);
  });
  assert.ok(evaluation.mean >= 0.3 && evaluation.mean <= 0.97);
  assert.ok(evaluation.worst.performance <= evaluation.mean + 1e-9);
});

test("evaluateGlobalUpdate never treats mean as an average of local metrics", () => {
  // Regression guard: the evaluation panel takes the aggregated delta only,
  // never a list of local metrics, so it structurally cannot compute
  // global_metric = average(local_metric).
  assert.equal(evaluateGlobalUpdate.length, 1);
});

test("injectGiantHospital sets a large nTrain on exactly the targeted client", () => {
  const roster = generateRoster("FL-2007", 10);
  const updated = injectGiantHospital(roster, "client-3", 950);
  const target = updated.find((c) => c.id === "client-3");
  assert.equal(target.nTrain, 950);
  const others = updated.filter((c) => c.id !== "client-3");
  const originalOthers = roster.filter((c) => c.id !== "client-3");
  assert.deepEqual(
    others.map((c) => c.nTrain),
    originalOthers.map((c) => c.nTrain),
  );
});

test("injectRareHospital marks only the targeted client as a rare population", () => {
  const roster = generateRoster("FL-2008", 10);
  const updated = injectRareHospital(roster, "client-5");
  assert.equal(updated.find((c) => c.id === "client-5").rarePopulation, true);
  const others = updated.filter((c) => c.id !== "client-5");
  const originalOthers = roster.filter((c) => c.id !== "client-5");
  assert.deepEqual(others, originalOthers);
});

test("injectRareHospital shrinks the target's nTrain so its FedAvg weight becomes tiny", () => {
  // Regression: the event previously only set a cosmetic flag and never
  // touched nTrain/delta, so it had zero visible effect on aggregation —
  // the whole point of "under FedAvg its contribution becomes tiny".
  const roster = generateRoster("FL-2015", 12).map((c) => ({ ...c, decision: "participate" }));
  const before = fedAvgWeights(roster).weights.get("client-1");
  const updated = injectRareHospital(roster, "client-1");
  const target = updated.find((c) => c.id === "client-1");
  assert.ok(target.nTrain <= 20, `expected a deliberately small nTrain, got ${target.nTrain}`);
  const after = fedAvgWeights(updated).weights.get("client-1");
  assert.ok(after < before, `expected the rare hospital's weight to shrink (${before} -> ${after})`);
});

test("injectRareHospital points the target toward the rare-subgroup evaluation environment", () => {
  const roster = generateRoster("FL-2016", 10);
  const updated = injectRareHospital(roster, "client-3");
  const target = updated.find((c) => c.id === "client-3");
  const angle = (Math.atan2(target.delta[1], target.delta[0]) * 180) / Math.PI;
  assert.ok(Math.abs(angle - 130) < 1, `expected the event to point near 130°, got ${angle}`);
});

test("injectSuspiciousUpdate is deterministic and marks the client suspicious", () => {
  const roster = generateRoster("FL-2009", 10);
  const a = injectSuspiciousUpdate(roster, "client-2");
  const b = injectSuspiciousUpdate(roster, "client-2");
  assert.deepEqual(a, b);
  assert.equal(a.find((c) => c.id === "client-2").suspicious, true);
});

test("summarizeParticipation counts decisions correctly", () => {
  const roster = generateRoster("FL-2010", 8);
  const decided = withDecisions(roster, (c, i) => ["participate", "hold", "flag", null][i % 4]);
  const summary = summarizeParticipation(decided);
  assert.equal(summary.joined, 8);
  assert.equal(summary.responded, 6);
  assert.equal(summary.participate, 2);
  assert.equal(summary.hold, 2);
  assert.equal(summary.flag, 2);
});

test("summarizePoll tallies only clients who voted, across all five options", () => {
  const roster = generateRoster("FL-2011", 10);
  const keys = PREDICT_OPTIONS.map((o) => o.key);
  const voted = roster.map((c, i) => (i < 7 ? { ...c, predictVote: keys[i % keys.length] } : c));
  const summary = summarizePoll(voted);
  assert.equal(summary.total, 7);
  const totalCounted = Object.values(summary.counts).reduce((s, v) => s + v, 0);
  assert.equal(totalCounted, 7);
  Object.keys(summary.counts).forEach((key) => assert.ok(keys.includes(key)));
});

test("summarizePoll returns all-zero counts when nobody has voted yet", () => {
  const roster = generateRoster("FL-2012", 5);
  const summary = summarizePoll(roster);
  assert.equal(summary.total, 0);
  assert.deepEqual(
    Object.values(summary.counts),
    PREDICT_OPTIONS.map(() => 0),
  );
});

test("aggregation does not crash on a client that has voted in the opening poll but has no delta yet", () => {
  // Regression: a client can exist in this partial state (predictVote set,
  // decision/delta not set) between answering the poll and reaching the
  // site-reveal screen. It must be weighted 0 and skipped, not crash.
  const roster = generateRoster("FL-2013", 4);
  const partial = { id: "client-mid-flow", predictVote: "average", decision: null };
  const clients = [...roster.map((c) => ({ ...c, decision: "participate" })), partial];
  Object.keys(AGGREGATION_STRATEGIES).forEach((key) => {
    assert.doesNotThrow(() => runAggregation(key, clients));
  });
});

test("summarizePollByDesign covers every poll option exactly once across the four groups", () => {
  const coveredOptions = POLL_DESIGN_GROUPS.flatMap((g) => g.optionKeys);
  const allOptionKeys = PREDICT_OPTIONS.map((o) => o.key);
  assert.deepEqual([...coveredOptions].sort(), [...allOptionKeys].sort());
  const seen = new Set();
  coveredOptions.forEach((key) => {
    assert.ok(!seen.has(key), `option ${key} appears in more than one design group`);
    seen.add(key);
  });
});

test("summarizePollByDesign counts roll up correctly and every group has a pro and a con", () => {
  const roster = generateRoster("FL-2014", 20);
  const keys = PREDICT_OPTIONS.map((o) => o.key);
  const voted = roster.map((c, i) => ({ ...c, predictVote: keys[i % keys.length] }));
  const grouped = summarizePollByDesign(voted);
  assert.equal(grouped.length, POLL_DESIGN_GROUPS.length);
  const totalGrouped = grouped.reduce((s, g) => s + g.count, 0);
  assert.equal(totalGrouped, voted.length);
  grouped.forEach((g) => {
    assert.ok(g.pro && g.pro.length > 0);
    assert.ok(g.con && g.con.length > 0);
    assert.ok(g.count >= 0);
  });
});
