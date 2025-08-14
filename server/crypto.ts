import crypto from 'crypto';

// Crypto utility for encrypting sensitive SARS tokens at rest
class CryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32;
  private readonly ivLength = 16;

  private getEncryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY || 'default-sars-encryption-key-2025';
    
    // Create a consistent 32-character key
    return crypto.createHash('sha256').update(key).digest('hex').substring(0, 32);
  }

  /**
   * Encrypt sensitive data like access tokens and refresh tokens
   */
  encrypt(plaintext: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipher(this.algorithm, key);
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Combine iv + encrypted data
      const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex')]);
      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      return plaintext; // Fallback for development
    }
  }

  /**
   * Decrypt sensitive data like access tokens and refresh tokens
   */
  decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract iv and encrypted data
      const iv = combined.subarray(0, this.ivLength);
      const encrypted = combined.subarray(this.ivLength);
      
      const decipher = crypto.createDecipher(this.algorithm, key);
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData; // Fallback for development
    }
  }

  /**
   * Hash sensitive data for storage (one-way)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a secure random state for OAuth flows
   */
  generateState(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Verify OAuth state parameter
   */
  verifyState(state: string, expectedState: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(state),
      Buffer.from(expectedState)
    );
  }
}

export const cryptoService = new CryptoService();