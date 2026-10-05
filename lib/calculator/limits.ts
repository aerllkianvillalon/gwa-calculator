/**
 * Single source of truth for input limits. Used by the calculation engine,
 * the form parser, and the zod schemas so client and server never drift apart.
 */
export const MAX_UNITS = 60; // guards against absurd/overflow input for a single subject
export const MAX_SUBJECTS = 100;
export const MAX_SUBJECT_NAME_LENGTH = 120;
