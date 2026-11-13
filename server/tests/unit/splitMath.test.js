import { describe, it, expect } from 'vitest';
import {
  allocateProportionally,
  computeSplits,
  formatMinorUnits,
  MAX_AMOUNT,
  MAX_PARTICIPANTS,
  SplitError,
} from '../../src/utils/splitMath.js';

const people = (...names) => names.map((userId) => ({ userId }));
const withValues = (names, values) => names.map((userId, index) => ({ userId, value: values[index] }));
const amountsOf = (splits) => splits.map((split) => split.amount);
const sum = (numbers) => numbers.reduce((a, b) => a + b, 0);
const expectSplitError = (fn) => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(SplitError);
    return error;
  }
  throw new Error('expected a SplitError, but nothing was thrown');
};

describe('equal split', () => {
  it('splits ₹100 three ways as 33.34, 33.33, 33.33 (the example from the spec)', () => {
    const splits = computeSplits({ total: 10000, splitType: 'EQUAL', participants: people('a', 'b', 'c') });
    expect(amountsOf(splits)).toEqual([3334, 3333, 3333]);
  });

  it('hands the leftover paise to the first people in order, one each', () => {
    const three = (total) => amountsOf(computeSplits({ total, splitType: 'EQUAL', participants: people('a', 'b', 'c') }));
    expect(three(10001)).toEqual([3334, 3334, 3333]);
    expect(three(10002)).toEqual([3334, 3334, 3334]);
    expect(three(10003)).toEqual([3335, 3334, 3334]);
    expect(amountsOf(computeSplits({ total: 7, splitType: 'EQUAL', participants: people('a', 'b', 'c', 'd') }))).toEqual([2, 2, 2, 1]);
  });

  it('gives the leftover to whoever is first, so reordering the people moves it', () => {
    const forward = computeSplits({ total: 100, splitType: 'EQUAL', participants: people('a', 'b', 'c') });
    const backward = computeSplits({ total: 100, splitType: 'EQUAL', participants: people('c', 'b', 'a') });
    expect(forward.find((s) => s.userId === 'a').amount).toBe(34);
    expect(backward.find((s) => s.userId === 'c').amount).toBe(34);
    expect(backward.find((s) => s.userId === 'a').amount).toBe(33);
  });

  it('handles an exact division, one person, and fewer paise than people', () => {
    expect(amountsOf(computeSplits({ total: 10000, splitType: 'EQUAL', participants: people('a', 'b', 'c', 'd') }))).toEqual([2500, 2500, 2500, 2500]);
    expect(amountsOf(computeSplits({ total: 12345, splitType: 'EQUAL', participants: people('a') }))).toEqual([12345]);
    expect(amountsOf(computeSplits({ total: 1, splitType: 'EQUAL', participants: people('a', 'b', 'c') }))).toEqual([1, 0, 0]);
    expect(amountsOf(computeSplits({ total: 2, splitType: 'EQUAL', participants: people('a', 'b', 'c') }))).toEqual([1, 1, 0]);
  });

  it('stores no percentage or shares for an equal split', () => {
    const [first] = computeSplits({ total: 100, splitType: 'EQUAL', participants: people('a', 'b') });
    expect(first).toEqual({ userId: 'a', amount: 50, percentage: null, shares: null });
  });
});

describe('exact amounts', () => {
  const names = ['a', 'b', 'c'];

  it('accepts amounts that add up to the total, and keeps them as entered', () => {
    const splits = computeSplits({ total: 10000, splitType: 'EXACT', participants: withValues(names, [6000, 2550, 1450]) });
    expect(amountsOf(splits)).toEqual([6000, 2550, 1450]);
    expect(splits[0]).toEqual({ userId: 'a', amount: 6000, percentage: null, shares: null });
  });

  it('allows someone to owe nothing', () => {
    expect(amountsOf(computeSplits({ total: 500, splitType: 'EXACT', participants: withValues(['a', 'b'], [500, 0]) }))).toEqual([500, 0]);
  });

  it('rejects amounts that fall short, saying by how much', () => {
    const error = expectSplitError(() => computeSplits({ total: 10000, splitType: 'EXACT', participants: withValues(names, [6000, 2550, 1400]) }));
    expect(error.message).toBe('The amounts add up to 99.50, which is 0.50 short of the total of 100.00');
    expect(error.fields.split).toBe(error.message);
  });

  it('rejects amounts that go over, even by a single paisa', () => {
    const error = expectSplitError(() => computeSplits({ total: 10000, splitType: 'EXACT', participants: withValues(names, [3334, 3334, 3333]) }));
    expect(error.message).toBe('The amounts add up to 100.01, which is 0.01 over the total of 100.00');
  });

  it('rejects negative, fractional, missing and absurd values, naming the person', () => {
    for (const bad of [-1, 33.5, undefined, null, '100', NaN, MAX_AMOUNT + 1]) {
      const error = expectSplitError(() =>
        computeSplits({ total: 200, splitType: 'EXACT', participants: withValues(['a', 'b'], [100, bad]) })
      );
      expect(Object.keys(error.fields)).toEqual(['b']);
    }
  });
});

describe('percentage split', () => {
  it('splits 33.33% / 33.33% / 33.34% of ₹100 exactly', () => {
    const splits = computeSplits({ total: 10000, splitType: 'PERCENTAGE', participants: withValues(['a', 'b', 'c'], [3333, 3333, 3334]) });
    expect(amountsOf(splits)).toEqual([3333, 3333, 3334]);
    expect(splits.map((s) => s.percentage)).toEqual([3333, 3333, 3334]);
    expect(splits[0].shares).toBeNull();
  });

  it('rounds by largest remainder: ₹9.99 at 33.33 / 33.33 / 33.34 gives 3.33 each', () => {
    const splits = computeSplits({ total: 999, splitType: 'PERCENTAGE', participants: withValues(['a', 'b', 'c'], [3333, 3333, 3334]) });
    expect(amountsOf(splits)).toEqual([333, 333, 333]);
  });

  it('breaks a tie in favour of the earlier person', () => {
    expect(amountsOf(computeSplits({ total: 10001, splitType: 'PERCENTAGE', participants: withValues(['a', 'b'], [5000, 5000]) }))).toEqual([5001, 5000]);
  });

  it('handles uneven percentages and a person at 0% or 100%', () => {
    expect(amountsOf(computeSplits({ total: 10000, splitType: 'PERCENTAGE', participants: withValues(['a', 'b', 'c'], [5000, 3000, 2000]) }))).toEqual([5000, 3000, 2000]);
    expect(amountsOf(computeSplits({ total: 777, splitType: 'PERCENTAGE', participants: withValues(['a', 'b'], [10000, 0]) }))).toEqual([777, 0]);
    expect(amountsOf(computeSplits({ total: 777, splitType: 'PERCENTAGE', participants: withValues(['a', 'b', 'c'], [0, 0, 10000]) }))).toEqual([0, 0, 777]);
  });

  it('rejects percentages that do not add up to exactly 100, even by 0.01', () => {
    const short = expectSplitError(() => computeSplits({ total: 10000, splitType: 'PERCENTAGE', participants: withValues(['a', 'b', 'c'], [3333, 3333, 3333]) }));
    expect(short.message).toBe('The percentages add up to 99.99%, but they must add up to 100%');
    const over = expectSplitError(() => computeSplits({ total: 10000, splitType: 'PERCENTAGE', participants: withValues(['a', 'b'], [5000, 5001]) }));
    expect(over.message).toBe('The percentages add up to 100.01%, but they must add up to 100%');
  });

  it('rejects out-of-range or fractional percentages', () => {
    for (const bad of [-1, 10001, 33.333, undefined]) {
      expectSplitError(() => computeSplits({ total: 100, splitType: 'PERCENTAGE', participants: withValues(['a', 'b'], [5000, bad]) }));
    }
  });
});

describe('shares split', () => {
  it('splits ₹1,500 in the ratio 2 : 1 : 1', () => {
    const splits = computeSplits({ total: 150000, splitType: 'SHARES', participants: withValues(['alex', 'rahul', 'aman'], [2, 1, 1]) });
    expect(amountsOf(splits)).toEqual([75000, 37500, 37500]);
    expect(splits.map((s) => s.shares)).toEqual([2, 1, 1]);
    expect(splits[0].percentage).toBeNull();
  });

  it('with equal shares gives exactly the same answer as an equal split', () => {
    const shares = computeSplits({ total: 10001, splitType: 'SHARES', participants: withValues(['a', 'b', 'c'], [1, 1, 1]) });
    const equal = computeSplits({ total: 10001, splitType: 'EQUAL', participants: people('a', 'b', 'c') });
    expect(amountsOf(shares)).toEqual(amountsOf(equal));
  });

  it('rounds by largest remainder', () => {
    expect(amountsOf(computeSplits({ total: 100, splitType: 'SHARES', participants: withValues(['a', 'b', 'c'], [2, 1, 1]) }))).toEqual([50, 25, 25]);
    expect(amountsOf(computeSplits({ total: 1, splitType: 'SHARES', participants: withValues(['a', 'b'], [3, 2]) }))).toEqual([1, 0]);
    expect(amountsOf(computeSplits({ total: 1, splitType: 'SHARES', participants: withValues(['a', 'b'], [2, 3]) }))).toEqual([0, 1]);
    expect(amountsOf(computeSplits({ total: 10, splitType: 'SHARES', participants: withValues(['a', 'b', 'c'], [1, 2, 4]) }))).toEqual([1, 3, 6]);
  });

  it('rejects zero, negative, fractional, missing and huge share counts', () => {
    for (const bad of [0, -2, 1.5, undefined, 1001]) {
      const error = expectSplitError(() => computeSplits({ total: 100, splitType: 'SHARES', participants: withValues(['a', 'b'], [1, bad]) }));
      expect(Object.keys(error.fields)).toEqual(['b']);
    }
  });
});

describe('input checks shared by every method', () => {
  it('rejects an amount that is not a whole number of paise in range', () => {
    for (const bad of [0, -5, 1.5, NaN, Infinity, '100', null, undefined, MAX_AMOUNT + 1]) {
      const error = expectSplitError(() => computeSplits({ total: bad, splitType: 'EQUAL', participants: people('a') }));
      expect(error.fields).toHaveProperty('amount');
    }
  });

  it('accepts the largest allowed amount, split between the most allowed people', () => {
    const names = Array.from({ length: MAX_PARTICIPANTS }, (_, i) => `u${i}`);
    const splits = computeSplits({ total: MAX_AMOUNT, splitType: 'EQUAL', participants: people(...names) });
    expect(sum(amountsOf(splits))).toBe(MAX_AMOUNT);
  });

  it('rejects nobody, too many people, and the same person twice', () => {
    expectSplitError(() => computeSplits({ total: 100, splitType: 'EQUAL', participants: [] }));
    expectSplitError(() => computeSplits({ total: 100, splitType: 'EQUAL', participants: undefined }));
    const tooMany = Array.from({ length: MAX_PARTICIPANTS + 1 }, (_, i) => ({ userId: `u${i}` }));
    expectSplitError(() => computeSplits({ total: 100, splitType: 'EQUAL', participants: tooMany }));
    const duplicate = expectSplitError(() => computeSplits({ total: 100, splitType: 'EQUAL', participants: people('a', 'b', 'a') }));
    expect(duplicate.fields).toHaveProperty('participants');
  });

  it('rejects an unknown split method', () => {
    for (const bad of ['SPLIT_IT', 'equal', undefined, null]) {
      const error = expectSplitError(() => computeSplits({ total: 100, splitType: bad, participants: people('a') }));
      expect(error.fields).toHaveProperty('splitType');
    }
  });

  it('does not change the input it is given', () => {
    const participants = withValues(['a', 'b', 'c'], [2, 1, 1]);
    const copy = JSON.parse(JSON.stringify(participants));
    computeSplits({ total: 10001, splitType: 'SHARES', participants });
    expect(participants).toEqual(copy);
  });
});

describe('formatMinorUnits', () => {
  it('formats with two decimals and no symbol', () => {
    expect(formatMinorUnits(0)).toBe('0.00');
    expect(formatMinorUnits(5)).toBe('0.05');
    expect(formatMinorUnits(9950)).toBe('99.50');
    expect(formatMinorUnits(10000)).toBe('100.00');
    expect(formatMinorUnits(123456789)).toBe('1234567.89');
    expect(formatMinorUnits(-250)).toBe('-2.50');
  });
});

// ---------------------------------------------------------------------------------------
// Property tests: thousands of random cases, checked against an independent reference
// that uses exact BigInt arithmetic and a different way of choosing who gets the leftover.
// ---------------------------------------------------------------------------------------

// A small seeded random generator, so a failure can always be reproduced.
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Reference: for each person compute the exact share as a fraction, floor it, then rank people
// by (fraction, position) and give the leftover units to the top of that ranking.
function referenceAllocate(total, weights) {
  const T = BigInt(total);
  const W = weights.reduce((a, b) => a + BigInt(b), 0n);
  const exact = weights.map((w) => (T * BigInt(w)) / W);
  const fraction = weights.map((w) => (T * BigInt(w)) % W);
  let leftover = Number(T - exact.reduce((a, b) => a + b, 0n));
  const ranking = weights
    .map((_, index) => index)
    .sort((i, j) => (fraction[j] > fraction[i] ? 1 : fraction[j] < fraction[i] ? -1 : i - j));
  const result = exact.map(Number);
  for (const index of ranking) {
    if (leftover === 0) break;
    result[index] += 1;
    leftover -= 1;
  }
  return result;
}

describe('property tests', () => {
  const random = makeRandom(20261112);
  const int = (low, high) => low + Math.floor(random() * (high - low + 1));
  const interestingTotals = [1, 2, 3, 99, 100, 101, 9999, 10000, 10001, 999999999, MAX_AMOUNT - 1, MAX_AMOUNT];

  function randomCase(kind) {
    const count = int(1, kind === 'big' ? MAX_PARTICIPANTS : 8);
    const total = random() < 0.25 ? interestingTotals[int(0, interestingTotals.length - 1)] : int(1, random() < 0.5 ? 100000 : MAX_AMOUNT);
    return { count, total };
  }

  it('equal splits: always add up, never differ by more than one paisa, and match the reference', () => {
    for (let run = 0; run < 3000; run += 1) {
      const { count, total } = randomCase(run % 4 === 0 ? 'big' : 'small');
      const names = Array.from({ length: count }, (_, i) => `u${i}`);
      const amounts = amountsOf(computeSplits({ total, splitType: 'EQUAL', participants: people(...names) }));

      expect(sum(amounts)).toBe(total);
      expect(Math.max(...amounts) - Math.min(...amounts)).toBeLessThanOrEqual(1);
      expect(amounts.every((a) => Number.isInteger(a) && a >= 0)).toBe(true);
      expect(amounts).toEqual(referenceAllocate(total, names.map(() => 1)));
      // the extra paise sit at the front, never after a person who got less
      for (let i = 1; i < amounts.length; i += 1) expect(amounts[i]).toBeLessThanOrEqual(amounts[i - 1]);
    }
  });

  it('shares splits: add up, stay within one paisa of the exact share, and match the reference', () => {
    for (let run = 0; run < 3000; run += 1) {
      const { count, total } = randomCase(run % 5 === 0 ? 'big' : 'small');
      const weights = Array.from({ length: count }, () => int(1, random() < 0.3 ? 1000 : 6));
      const names = weights.map((_, i) => `u${i}`);
      const amounts = amountsOf(computeSplits({ total, splitType: 'SHARES', participants: withValues(names, weights) }));

      expect(sum(amounts)).toBe(total);
      const W = weights.reduce((a, b) => a + BigInt(b), 0n);
      amounts.forEach((amount, i) => {
        const floor = (BigInt(total) * BigInt(weights[i])) / W;
        expect(BigInt(amount) === floor || BigInt(amount) === floor + 1n).toBe(true);
      });
      expect(amounts).toEqual(referenceAllocate(total, weights));
    }
  });

  it('percentage splits: add up and match the reference for any split of 100%', () => {
    for (let run = 0; run < 3000; run += 1) {
      const { count, total } = randomCase('small');
      // build random basis points that add up to exactly 10000
      const cuts = Array.from({ length: count - 1 }, () => int(0, 10000)).sort((a, b) => a - b);
      const points = [...cuts, 10000].map((cut, i) => cut - (i === 0 ? 0 : [...cuts, 10000][i - 1]));
      const names = points.map((_, i) => `u${i}`);
      const splits = computeSplits({ total, splitType: 'PERCENTAGE', participants: withValues(names, points) });

      expect(sum(amountsOf(splits))).toBe(total);
      expect(amountsOf(splits)).toEqual(referenceAllocate(total, points));
      expect(splits.map((s) => s.percentage)).toEqual(points);
    }
  });

  it('exact splits: valid ones come back untouched, and any single-paisa error is caught', () => {
    for (let run = 0; run < 2000; run += 1) {
      const { count, total } = randomCase('small');
      const parts = allocateProportionally(total, Array.from({ length: count }, () => int(1, 20)));
      const names = parts.map((_, i) => `u${i}`);
      expect(amountsOf(computeSplits({ total, splitType: 'EXACT', participants: withValues(names, parts) }))).toEqual(parts);

      const tweaked = [...parts];
      tweaked[int(0, count - 1)] += random() < 0.5 ? 1 : -1;
      if (tweaked.every((value) => value >= 0)) {
        expectSplitError(() => computeSplits({ total, splitType: 'EXACT', participants: withValues(names, tweaked) }));
      }
    }
  });

  it('is deterministic: the same input always gives the same answer', () => {
    const input = { total: 10007, splitType: 'SHARES', participants: withValues(['a', 'b', 'c', 'd'], [3, 5, 1, 2]) };
    const first = computeSplits(input);
    for (let i = 0; i < 50; i += 1) expect(computeSplits(input)).toEqual(first);
  });
});