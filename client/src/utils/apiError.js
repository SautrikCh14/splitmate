// Turns an Axios error into text that is safe to show the user.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response) return error.response.data?.message || fallback;
  if (error?.request) return 'Cannot reach the server. Check your connection and try again.';
  return fallback;
}

// The server sends per-field messages as { errors: { email: '...' } }.
export function getFieldErrors(error) {
  const errors = error?.response?.data?.errors;
  return errors && typeof errors === 'object' ? errors : {};
}