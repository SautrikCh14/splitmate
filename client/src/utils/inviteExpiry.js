const DAY_MS = 24 * 60 * 60 * 1000;

export const EXPIRY_CHOICES = [
  { value: 0, label: 'Never expires' },
  { value: 1, label: '1 day' },
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
];

// Turns an expiry timestamp (or null) into a short sentence for the invite panel.
export function describeInviteExpiry(inviteExpiresAt, now = Date.now()) {
  if (!inviteExpiresAt) return 'Never expires';

  const remaining = new Date(inviteExpiresAt).getTime() - now;
  if (remaining <= 0) return 'Expired. Create a new code.';

  const days = Math.ceil(remaining / DAY_MS);
  return days <= 1 ? 'Expires within a day' : `Expires in ${days} days`;
}