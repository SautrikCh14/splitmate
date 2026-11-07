// Takes "YYYY-MM-DD" and returns text like "6 Nov".
export function formatShortDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}