// PII Redaction utilities for POPIA compliance

const PII_PATTERNS = {
  // South African ID number
  SA_ID: /\b\d{6}\s?\d{4}\s?\d{3}\s?\d{1}\b/g,
  
  // Email addresses
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Phone numbers (various formats)
  PHONE: /(\+27|0)[1-9]\d{8,9}|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  
  // Credit card numbers
  CREDIT_CARD: /\b(?:\d[ -]*?){13,19}\b/g,
  
  // Bank account numbers
  BANK_ACCOUNT: /\b\d{6,20}\b/g,
  
  // Passport numbers
  PASSPORT: /\b[A-Z]{1,2}\d{6,9}\b/g,
  
  // VAT numbers
  VAT_NUMBER: /\b\d{10}\b/g,
  
  // Physical addresses (simplified pattern)
  ADDRESS: /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|court|ct|place|pl|boulevard|blvd)/gi,
};

// Fields that should always be redacted
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'apiKey',
  'secret',
  'token',
  'authToken',
  'refreshToken',
  'bankAccount',
  'accountNumber',
  'routingNumber',
  'socialSecurityNumber',
  'idNumber',
  'passportNumber',
  'creditCardNumber',
  'cvv',
  'pin',
];

/**
 * Redact PII from a string
 */
export function redactString(input: string, preserveStructure: boolean = true): string {
  if (!input || typeof input !== 'string') {
    return input;
  }

  let redacted = input;

  // Apply PII patterns
  Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
    redacted = redacted.replace(pattern, (match) => {
      if (preserveStructure) {
        // Keep first and last characters for structure
        if (match.length <= 4) {
          return '[REDACTED]';
        }
        const firstChar = match[0];
        const lastChar = match[match.length - 1];
        return `${firstChar}[${type}]${lastChar}`;
      }
      return `[${type}]`;
    });
  });

  return redacted;
}

/**
 * Deep redact PII from an object
 */
export function redactObject<T = any>(obj: T, options?: {
  preserveStructure?: boolean;
  customPatterns?: Record<string, RegExp>;
  additionalFields?: string[];
}): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const {
    preserveStructure = true,
    customPatterns = {},
    additionalFields = []
  } = options || {};

  const sensitiveFields = [...SENSITIVE_FIELDS, ...additionalFields];

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item, options)) as T;
  }

  // Handle objects
  const redacted: any = {};
  
  for (const [key, value] of Object.entries(obj as any)) {
    // Check if field name is sensitive
    const fieldNameLower = key.toLowerCase();
    if (sensitiveFields.some(field => fieldNameLower.includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
      continue;
    }

    // Recursively handle nested objects
    if (value && typeof value === 'object') {
      redacted[key] = redactObject(value, options);
    } 
    // Redact string values
    else if (typeof value === 'string') {
      let redactedValue = redactString(value, preserveStructure);
      
      // Apply custom patterns
      Object.entries(customPatterns).forEach(([type, pattern]) => {
        redactedValue = redactedValue.replace(pattern, `[${type}]`);
      });
      
      redacted[key] = redactedValue;
    } 
    // Keep other types as-is
    else {
      redacted[key] = value;
    }
  }

  return redacted as T;
}

/**
 * Redact PII from AI prompt/response for logging
 */
export function redactForLogging(data: {
  prompt?: string;
  response?: string;
  context?: any;
}): {
  prompt?: string;
  response?: string;
  context?: any;
} {
  return {
    prompt: data.prompt ? redactString(data.prompt, false) : undefined,
    response: data.response ? redactString(data.response, false) : undefined,
    context: data.context ? redactObject(data.context, { preserveStructure: false }) : undefined,
  };
}

/**
 * Sanitize data before sending to AI
 */
export function sanitizeForAI(data: any): any {
  // Remove highly sensitive fields completely
  const sanitized = redactObject(data, {
    preserveStructure: true,
    additionalFields: [
      'twoFactorSecret',
      'backupCodes',
      'encryptionKey',
      'privateKey',
      'merchantKey',
      'passphrase'
    ]
  });

  return sanitized;
}

/**
 * Check if a string contains potential PII
 */
export function containsPII(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  for (const pattern of Object.values(PII_PATTERNS)) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

/**
 * Get a safe excerpt for logging (max length with PII redacted)
 */
export function getSafeExcerpt(text: string, maxLength: number = 100): string {
  if (!text) return '';
  
  const redacted = redactString(text, false);
  if (redacted.length <= maxLength) {
    return redacted;
  }
  
  return redacted.substring(0, maxLength) + '...';
}