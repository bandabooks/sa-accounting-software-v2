import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, or } from 'drizzle-orm';
import { generateSessionToken } from '../auth';

export interface OAuthProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
  provider: 'google' | 'microsoft';
}

export class OAuthService {
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;

    this.setupGoogleStrategy();
    this.setupMicrosoftStrategy();
    this.setupPassportSerialization();
    
    this.isInitialized = true;
  }

  private setupGoogleStrategy() {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback';

    if (clientID && clientSecret) {
      passport.use(new GoogleStrategy({
        clientID,
        clientSecret,
        callbackURL,
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await this.handleOAuthLogin({
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails,
            photos: profile.photos,
            provider: 'google',
          });
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }));
    }
  }

  private setupMicrosoftStrategy() {
    const clientID = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const callbackURL = process.env.MICROSOFT_CALLBACK_URL || '/api/auth/microsoft/callback';

    if (clientID && clientSecret) {
      passport.use(new MicrosoftStrategy({
        clientID,
        clientSecret,
        callbackURL,
        scope: ['user.read'],
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await this.handleOAuthLogin({
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails,
            photos: profile.photos,
            provider: 'microsoft',
          });
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }));
    }
  }

  private setupPassportSerialization() {
    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
      try {
        const [user] = await db.select()
          .from(users)
          .where(eq(users.id, id));
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
  }

  private async handleOAuthLogin(profile: OAuthProfile) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('No email found in OAuth profile');
    }

    // Check if user exists by OAuth ID or email
    const [existingUser] = await db.select()
      .from(users)
      .where(or(
        profile.provider === 'google' ? eq(users.googleId, profile.id) : eq(users.microsoftId, profile.id),
        eq(users.email, email)
      ));

    if (existingUser) {
      // Update OAuth ID if not set
      const updateData: any = {
        lastLogin: new Date(),
      };

      if (profile.provider === 'google' && !existingUser.googleId) {
        updateData.googleId = profile.id;
      } else if (profile.provider === 'microsoft' && !existingUser.microsoftId) {
        updateData.microsoftId = profile.id;
      }

      // Update OAuth providers list
      const oauthProviders = (existingUser.oauthProviders as string[]) || [];
      if (!oauthProviders.includes(profile.provider)) {
        updateData.oauthProviders = [...oauthProviders, profile.provider];
      }

      await db.update(users)
        .set(updateData)
        .where(eq(users.id, existingUser.id));

      return existingUser;
    } else {
      // Create new user
      const [newUser] = await db.insert(users).values({
        username: this.generateUsernameFromEmail(email),
        password: '', // OAuth users don't have passwords
        name: profile.displayName,
        email,
        role: 'employee',
        googleId: profile.provider === 'google' ? profile.id : null,
        microsoftId: profile.provider === 'microsoft' ? profile.id : null,
        oauthProviders: [profile.provider],
        isActive: true,
        lastLogin: new Date(),
      }).returning();

      return newUser;
    }
  }

  private generateUsernameFromEmail(email: string): string {
    const baseUsername = email.split('@')[0].toLowerCase();
    // Add random suffix to avoid conflicts
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${baseUsername}_${suffix}`;
  }

  // Link OAuth account to existing user
  async linkOAuthAccount(userId: number, provider: 'google' | 'microsoft', oauthId: string) {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    const updateData: any = {};
    const oauthProviders = (user.oauthProviders as string[]) || [];

    if (provider === 'google') {
      updateData.googleId = oauthId;
    } else if (provider === 'microsoft') {
      updateData.microsoftId = oauthId;
    }

    if (!oauthProviders.includes(provider)) {
      updateData.oauthProviders = [...oauthProviders, provider];
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    return true;
  }

  // Unlink OAuth account
  async unlinkOAuthAccount(userId: number, provider: 'google' | 'microsoft') {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    const updateData: any = {};
    const oauthProviders = (user.oauthProviders as string[]) || [];

    if (provider === 'google') {
      updateData.googleId = null;
    } else if (provider === 'microsoft') {
      updateData.microsoftId = null;
    }

    updateData.oauthProviders = oauthProviders.filter(p => p !== provider);

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    return true;
  }

  // Get user's OAuth accounts
  async getUserOAuthAccounts(userId: number) {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return [];
    }

    return {
      google: !!user.googleId,
      microsoft: !!user.microsoftId,
      providers: user.oauthProviders as string[] || [],
    };
  }

  // Check if OAuth is configured
  isGoogleConfigured(): boolean {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }

  isMicrosoftConfigured(): boolean {
    return !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
  }
}

export const oauthService = new OAuthService();