/**
 * Centralized validation policy for Tekka player names.
 */

export interface ValidationResult {
  valid: boolean;
  normalized: string;
  sanitized: string;
  error?: string;
}

export const USERNAME_RULES = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  REGEX: /^[a-zA-Z0-9_]{3,20}$/,
};

/**
 * Validates a proposed Tekka player name according to platform policy:
 * - 3–20 characters
 * - Letters, numbers, underscore only
 * - No spaces, no special symbols
 * - Trim leading/trailing whitespace
 */
export function validateTekkaName(name: string): ValidationResult {
  const sanitized = name.trim();
  const normalized = sanitized.toLowerCase();

  if (!sanitized) {
    return {
      valid: false,
      normalized: '',
      sanitized: '',
      error: 'Please enter a Tekka player name.',
    };
  }

  if (sanitized.length < USERNAME_RULES.MIN_LENGTH) {
    return {
      valid: false,
      normalized,
      sanitized,
      error: `Tekka name must be at least ${USERNAME_RULES.MIN_LENGTH} characters.`,
    };
  }

  if (sanitized.length > USERNAME_RULES.MAX_LENGTH) {
    return {
      valid: false,
      normalized,
      sanitized,
      error: `Tekka name cannot exceed ${USERNAME_RULES.MAX_LENGTH} characters.`,
    };
  }

  if (/\s/.test(sanitized)) {
    return {
      valid: false,
      normalized,
      sanitized,
      error: 'Tekka names cannot contain spaces.',
    };
  }

  if (!USERNAME_RULES.REGEX.test(sanitized)) {
    return {
      valid: false,
      normalized,
      sanitized,
      error: 'Only letters, numbers, and underscores are allowed.',
    };
  }

  return {
    valid: true,
    normalized,
    sanitized,
  };
}

/**
 * Generates a clean suggested Tekka name from a Google display name or email.
 */
export function generateSuggestedTekkaName(displayName?: string | null, email?: string | null): string {
  if (displayName) {
    // Strip special characters and spaces, keep letters, numbers, underscores
    const cleaned = displayName.replace(/[^a-zA-Z0-9_]/g, '');
    if (cleaned.length >= USERNAME_RULES.MIN_LENGTH) {
      return cleaned.slice(0, USERNAME_RULES.MAX_LENGTH);
    }
  }

  if (email) {
    const prefix = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    if (prefix.length >= USERNAME_RULES.MIN_LENGTH) {
      return prefix.slice(0, USERNAME_RULES.MAX_LENGTH);
    }
  }

  return 'Player_' + Math.floor(1000 + Math.random() * 9000);
}
