// Splitting an expense between people, in whole minor units (paise).
// No floating-point money maths anywhere: every amount is an integer, and the sum of the
// parts always equals the total exactly.

export const MAX_AMOUNT = 1_000_000_000; // 10,000,000.00 in major units; matches the database CHECK
export const MAX_PARTICIPANTS = 100;
export const MAX_SHARES = 1000;
export const BASIS_POINTS = 10_000; // 100.00% (percentages are stored in hundredths of a percent)

export class SplitError extends Error {
  // `fields` maps a field name (or a userId) to a message the screen can show next to it.
  constructor(message, fields = {}) {
    super(message);
    this.name = 'SplitError';
    this.fields = fields;
  }
}

// 9950 -> "99.50" (no currency symbol, because a group can use any currency)
export function formatMinorUnits(units) {
  const absolute = Math.abs(units);
  const text = `${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`;
  return units < 0 ? `-${text}` : text;
}

// 3333 -> "33.33"
function formatBasisPoints(points) {
  return `${Math.floor(points / 100)}.${String(points % 100).padStart(2, '0')}`;
}

// Divides `total` into whole parts in proportion to `weights` (non-negative integers with a
// positive sum). Largest-remainder method, so the parts add up to `total` exactly.
// Ties go to the earlier position. With total <= 1e9 and weights <= 1e4, every product below is
// under 2^53, so the integer arithmetic is exact.
export function allocateProportionally(total, weights) {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  const parts = weights.map((weight, index) => {
    const product = total * weight;
    const remainder = product % weightSum;
    return { index, whole: (product - remainder) / weightSum, remainder };
  });

  const amounts = parts.map((part) => part.whole);
  let leftover = total - amounts.reduce((sum, amount) => sum + amount, 0);

  const byLargestRemainder = [...parts].sort(
    (a, b) => b.remainder - a.remainder || a.index - b.index
  );
  for (const part of byLargestRemainder) {
    if (leftover === 0) break;
    amounts[part.index] += 1;
    leftover -= 1;
  }
  return amounts;
}

function checkTotal(total) {
  if (!Number.isInteger(total) || total < 1 || total > MAX_AMOUNT) {
    throw new SplitError(
      `The amount must be a whole number of paise between 1 and ${MAX_AMOUNT}`,
      { amount: `Enter an amount between 0.01 and ${formatMinorUnits(MAX_AMOUNT)}` }
    );
  }
}

function checkParticipants(participants) {
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new SplitError('Choose at least one person to split with', {
      participants: 'Choose at least one person to split with',
    });
  }
  if (participants.length > MAX_PARTICIPANTS) {
    throw new SplitError(`An expense can be split between at most ${MAX_PARTICIPANTS} people`, {
      participants: `Choose at most ${MAX_PARTICIPANTS} people`,
    });
  }
  const seen = new Set();
  for (const { userId } of participants) {
    if (seen.has(userId)) {
      throw new SplitError('Each person can appear only once', { participants: 'Each person can appear only once' });
    }
    seen.add(userId);
  }
}

const row = (userId, amount, percentage = null, shares = null) => ({ userId, amount, percentage, shares });

// participants: [{ userId, value }] in priority order (the group's join order).
//   EQUAL       value ignored
//   EXACT       value = amount in paise
//   PERCENTAGE  value = percentage in hundredths of a percent (3333 = 33.33%)
//   SHARES      value = a whole number of shares (2 means a double share)
// Returns [{ userId, amount, percentage, shares }] whose amounts add up to `total`.
export function computeSplits({ total, splitType, participants }) {
  checkTotal(total);
  checkParticipants(participants);

  if (splitType === 'EQUAL') {
    const amounts = allocateProportionally(total, participants.map(() => 1));
    return participants.map((person, index) => row(person.userId, amounts[index]));
  }

  // The other methods all need a valid whole-number value for each person.
  const problems = {};
  const values = participants.map(({ userId, value }) => {
    const isNumber = Number.isInteger(value);
    if (splitType === 'EXACT' && !(isNumber && value >= 0 && value <= MAX_AMOUNT)) {
      problems[userId] = 'Enter an amount of 0 or more';
    } else if (splitType === 'PERCENTAGE' && !(isNumber && value >= 0 && value <= BASIS_POINTS)) {
      problems[userId] = 'Enter a percentage between 0 and 100';
    } else if (splitType === 'SHARES' && !(isNumber && value >= 1 && value <= MAX_SHARES)) {
      problems[userId] = `Shares must be a whole number from 1 to ${MAX_SHARES}`;
    }
    return value;
  });

  if (!['EXACT', 'PERCENTAGE', 'SHARES'].includes(splitType)) {
    throw new SplitError('Choose how to split: equally, by exact amounts, by percentage or by shares', {
      splitType: 'Choose a split method',
    });
  }
  if (Object.keys(problems).length > 0) {
    throw new SplitError('Some values are not valid', problems);
  }

  if (splitType === 'EXACT') {
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum !== total) {
      const gap = Math.abs(total - sum);
      const direction = sum < total ? 'short of' : 'over';
      const message = `The amounts add up to ${formatMinorUnits(sum)}, which is ${formatMinorUnits(gap)} ${direction} the total of ${formatMinorUnits(total)}`;
      throw new SplitError(message, { split: message });
    }
    return participants.map((person, index) => row(person.userId, values[index]));
  }

  if (splitType === 'PERCENTAGE') {
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum !== BASIS_POINTS) {
      const message = `The percentages add up to ${formatBasisPoints(sum)}%, but they must add up to 100%`;
      throw new SplitError(message, { split: message });
    }
    const amounts = allocateProportionally(total, values);
    return participants.map((person, index) => row(person.userId, amounts[index], values[index], null));
  }

  // SHARES
  const amounts = allocateProportionally(total, values);
  return participants.map((person, index) => row(person.userId, amounts[index], null, values[index]));
}