export const MIN_PASSWORD_LENGTH = 8;

/**
 * Shared client-side password checks for sign-up and password change.
 * Returns an error message, or null when the pair is acceptable.
 */
export function validateNewPassword(password: string, confirmPassword: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password !== confirmPassword) {
    return "Passwords don't match.";
  }
  return null;
}
