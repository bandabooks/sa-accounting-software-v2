import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export class TwoFactorService {
  // Generate a new 2FA secret for a user
  async generateSecret(userId: number, userEmail: string, companyName: string = 'Think MyBiz') {
    const secret = speakeasy.generateSecret({
      name: `${companyName} (${userEmail})`,
      issuer: 'Think MyBiz Accounting',
      length: 32,
    });

    // Store the temporary secret (not yet confirmed)
    await db.update(users)
      .set({ twoFactorSecret: secret.base32 })
      .where(eq(users.id, userId));

    // Generate QR code for easy setup
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeUrl,
      manualEntryKey: secret.base32,
    };
  }

  // Verify a TOTP token
  verifyToken(secret: string, token: string, window: number = 1): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window, // Allow 1 step before/after for clock drift
    });
  }

  // Enable 2FA for a user after verifying the setup token
  async enable2FA(userId: number, verificationToken: string): Promise<{ success: boolean; backupCodes?: string[] }> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.twoFactorSecret) {
      return { success: false };
    }

    // Verify the setup token
    if (!this.verifyToken(user.twoFactorSecret, verificationToken)) {
      return { success: false };
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Enable 2FA and store backup codes
    await db.update(users)
      .set({
        twoFactorEnabled: true,
        twoFactorBackupCodes: backupCodes,
      })
      .where(eq(users.id, userId));

    return { success: true, backupCodes };
  }

  // Disable 2FA for a user
  async disable2FA(userId: number, verificationToken?: string, backupCode?: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    // Verify either a TOTP token or backup code
    let isValid = false;
    
    if (verificationToken) {
      isValid = this.verifyToken(user.twoFactorSecret, verificationToken);
    }
    
    if (!isValid && backupCode) {
      isValid = this.verifyBackupCode(user.twoFactorBackupCodes as string[], backupCode);
    }

    if (!isValid) {
      return false;
    }

    // Disable 2FA and clear secrets
    await db.update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      })
      .where(eq(users.id, userId));

    return true;
  }

  // Verify a user's 2FA token during login
  async verifyLogin2FA(userId: number, token: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    return this.verifyToken(user.twoFactorSecret, token);
  }

  // Verify and consume a backup code
  async verifyAndConsumeBackupCode(userId: number, backupCode: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.twoFactorEnabled) {
      return false;
    }

    const backupCodes = user.twoFactorBackupCodes as string[];
    const codeIndex = backupCodes.indexOf(backupCode);

    if (codeIndex === -1) {
      return false;
    }

    // Remove the used backup code
    const updatedCodes = backupCodes.filter((_, index) => index !== codeIndex);

    await db.update(users)
      .set({ twoFactorBackupCodes: updatedCodes })
      .where(eq(users.id, userId));

    return true;
  }

  // Generate new backup codes (replacing old ones)
  async regenerateBackupCodes(userId: number, verificationToken: string): Promise<{ success: boolean; backupCodes?: string[] }> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return { success: false };
    }

    // Verify the TOTP token
    if (!this.verifyToken(user.twoFactorSecret, verificationToken)) {
      return { success: false };
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes();

    await db.update(users)
      .set({ twoFactorBackupCodes: backupCodes })
      .where(eq(users.id, userId));

    return { success: true, backupCodes };
  }

  // Private helper methods
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  private verifyBackupCode(backupCodes: string[], code: string): boolean {
    return backupCodes.includes(code);
  }

  // Check if user has 2FA enabled
  async is2FAEnabled(userId: number): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    return user?.twoFactorEnabled || false;
  }

  // Get 2FA status and backup code count
  async get2FAStatus(userId: number) {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return null;
    }

    return {
      enabled: user.twoFactorEnabled,
      backupCodesRemaining: user.twoFactorEnabled ? (user.twoFactorBackupCodes as string[]).length : 0,
    };
  }
}

export const twoFactorService = new TwoFactorService();