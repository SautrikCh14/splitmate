const rupeeFormat = new Intl.NumberFormat('en-IN');

// Takes an integer number of paise and returns text like "₹1,505.50".
// Pass { sign: true } to show "+" on positive amounts.
export function formatMoney(paise, { sign = false } = {}) {
  const negative = paise < 0;
  const absolute = Math.abs(paise);
  const rupees = Math.trunc(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, '0');
  const text = `₹${rupeeFormat.format(rupees)}.${fraction}`;

  if (negative) return `−${text}`;
  return sign && paise > 0 ? `+${text}` : text;
}