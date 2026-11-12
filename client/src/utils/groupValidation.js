export function validateGroupForm({ name, description }) {
  const errors = {};
  const trimmedName = name.trim();

  if (trimmedName.length < 2) errors.name = 'Group name must be at least 2 characters';
  else if (trimmedName.length > 50) errors.name = 'Group name is too long (50 characters maximum)';

  if (description.trim().length > 200) errors.description = 'Description is too long (200 characters maximum)';
  return errors;
}

export function validateJoinCode(code) {
  return code.trim() ? {} : { code: 'Enter an invite code' };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  const value = email.trim();
  if (!value) return 'Enter an email address';
  if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address';
  return '';
}