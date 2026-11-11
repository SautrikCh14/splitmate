export const DEFAULT_ICON = 'users';
export const DEFAULT_CURRENCY = 'INR';

// The server decides what is allowed; this list only drives the dropdown.
export const CURRENCY_OPTIONS = [
  { code: 'INR', label: 'Indian rupee (₹)' },
  { code: 'USD', label: 'US dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British pound (£)' },
  { code: 'AED', label: 'UAE dirham (AED)' },
  { code: 'SGD', label: 'Singapore dollar (S$)' },
  { code: 'AUD', label: 'Australian dollar (A$)' },
  { code: 'CAD', label: 'Canadian dollar (C$)' },
];

export const ROLE_LABELS = { OWNER: 'Owner', ADMIN: 'Admin', MEMBER: 'Member' };