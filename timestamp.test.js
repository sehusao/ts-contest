// timestamp.test.js
'use strict';

// No external deps; simple, cross-platform test harness.
const { generateTimestamp48 } = require('./timestamp.js');

// Precompiled Base64URL validator (8 chars, A–Z a–z 0–9 - _)
const B64URL_RE = /^[A-Za-z0-9\-_]{8}$/;

/** Very small test registry */
const tests = [];
/**
 * @param {string} name
 * @param {() => (void|Promise<void>)} fn
 */
function test(name, fn) { tests.push({ name, fn }); }

/** Minimal assertion helper */
function assert(cond, message) {
  if (!cond) throw new Error(message || 'Assertion failed');
}

/**
 * Temporarily mock Date.now() within the callback. Always restores.
 * @param {number} fakeNowMs
 * @param {() => (void|Promise<void>)} fn
 */
async function withFakeNow(fakeNowMs, fn) {
  const originalNow = Date.now;
  try {
    Date.now = function () { return fakeNowMs; };
    await fn();
  } finally {
    Date.now = originalNow;
  }
}

/* ----------------------- Tests ----------------------- */

test('format: result is 8 chars and matches Base64URL alphabet', () => {
  for (let i = 0; i < 2_000; i++) {
    const s = generateTimestamp48();
    assert(s.length === 8, 'must be exactly 8 characters');
    assert(B64URL_RE.test(s), `must match Base64URL without padding: ${s}`);
  }
});

test('edge cases: epoch -> "AAAAAAAA", max48 -> "________", and a sanity check around "now"', async () => {
  await withFakeNow(0, () => {
    const s = generateTimestamp48();
    assert(s === 'AAAAAAAA', `epoch should be "AAAAAAAA", got "${s}"`);
  });

  const MAX48 = Number((1n << 48n) - 1n);
  await withFakeNow(MAX48, () => {
    const s = generateTimestamp48();
    assert(s === '________', `max48 should be "________", got "${s}"`);
  });

  await withFakeNow(Date.now(), () => {
    const s = generateTimestamp48();
    assert(s.length === 8 && B64URL_RE.test(s), 'now() encoding must be valid Base64URL');
  });
});

test('performance: sustained generation for ~10s (Promise.race) and print ops count', async () => {
  let ops = 0;

  const runner = (async () => {
    const end = Date.now() + 10_000; // 10 seconds
    while (Date.now() < end) {
      // Small unroll for speed while yielding occasionally
      generateTimestamp48(); ops++;
      generateTimestamp48(); ops++;
      generateTimestamp48(); ops++;
      generateTimestamp48(); ops++;

      if ((ops & 0xFFFF) === 0) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.resolve();
      }
    }
    return ops;
  })();

  const guard = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Benchmark exceeded 10 seconds')), 10_500)
  );

  const finishedOps = await Promise.race([runner, guard]);

  // Print the total number of generations performed in 10 seconds
  console.log(`performance: ${finishedOps} generations in 10s`);

  // Very conservative floor; adjust if your CI is extremely constrained.
  assert(finishedOps > 50_000, `too slow: only ${finishedOps} ops in 10s`);
});

/* ----------------------- Runner ----------------------- */

(async () => {
  let failed = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
    } catch (err) {
      failed++;
      console.error(`✗ ${name}\n  ${err && err.stack ? err.stack : err}`);
    }
  }
  if (failed) {
    console.error(`\n${failed} test(s) failed`);
    process.exitCode = 1;
  } else {
    console.log('\nAll tests passed');
  }
})();
