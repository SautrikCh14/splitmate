// Takes "YYYY-MM-DD" and returns text like "6 Nov".
export function formatShortDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

// Takes a full timestamp such as "2026-11-06T10:15:00.000Z" and returns "6 Nov 2026".
export function formatLongDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}