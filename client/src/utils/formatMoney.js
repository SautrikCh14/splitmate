const CURRENCIES = {
  INR: { symbol: '₹', locale: 'en-IN' },
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'en-IE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  AED: { symbol: 'AED\u00a0', locale: 'en-US' },
  SGD: { symbol: 'S$', locale: 'en-SG' },
  AUD: { symbol: 'A$', locale: 'en-AU' },
  CAD: { symbol: 'C$', locale: 'en-CA' },
};

const numberFormats = {};

function getNumberFormat(locale) {
  numberFormats[locale] ??= new Intl.NumberFormat(locale);
  return numberFormats[locale];
}

// Takes an integer number of minor units (paise, cents) and returns text like "₹1,505.50".
// Pass { sign: true } to show "+" on positive amounts, and { currency: 'USD' } for another currency.
// Only integer arithmetic is used, so no rounding error can creep in.
export function formatMoney(minorUnits, { sign = false, currency = 'INR' } = {}) {
  const { symbol, locale } = CURRENCIES[currency] ?? CURRENCIES.INR;
  const negative = minorUnits < 0;
  const absolute = Math.abs(minorUnits);
  const major = Math.trunc(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, '0');
  const text = `${symbol}${getNumberFormat(locale).format(major)}.${fraction}`;

  if (negative) return `−${text}`;
  return sign && minorUnits > 0 ? `+${text}` : text;
}

// Short form for chart axes, from integer paise: "₹950", "₹4k", "₹1.2L".
export function formatCompactMoney(paise) {
  const rupees = Math.round(paise / 100);
  if (rupees >= 100000) return `₹${Number((rupees / 100000).toFixed(1))}L`;
  if (rupees >= 1000) return `₹${Number((rupees / 1000).toFixed(1))}k`;
  return `₹${rupees}`;
}