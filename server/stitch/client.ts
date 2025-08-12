/**
 * Stitch GraphQL Client
 * Handles authentication and GraphQL requests to Stitch API
 */

interface StitchConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  environment: 'sandbox' | 'live';
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: any;
  }>;
}

export class StitchGraphQLClient {
  private config: StitchConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.config = {
      clientId: process.env.STITCH_CLIENT_ID || '',
      clientSecret: process.env.STITCH_CLIENT_SECRET || '',
      baseUrl: process.env.STITCH_BASE_URL || 'https://api.stitch.money',
      environment: (process.env.STITCH_ENV as 'sandbox' | 'live') || 'sandbox',
    };

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('Stitch client credentials not configured. Please set STITCH_CLIENT_ID and STITCH_CLIENT_SECRET');
    }
  }

  /**
   * Get access token for client credentials flow
   */
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid (with 5 minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
      return this.accessToken;
    }

    const tokenUrl = `${this.config.baseUrl}/oauth/token`;
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=transactions accounts',
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    this.accessToken = tokenData.access_token;
    this.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000);

    return this.accessToken;
  }

  /**
   * Execute GraphQL query/mutation
   */
  async query<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    const token = await this.getAccessToken();
    const graphqlUrl = `${this.config.baseUrl}/graphql`;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Stitch-Version': '2024-01-01', // Use stable API version
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map(err => err.message).join(', ');
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }

    if (!result.data) {
      throw new Error('No data returned from GraphQL query');
    }

    return result.data;
  }

  /**
   * Create a client token for Link flow
   */
  async createClientToken(options: {
    userId: string;
    permissions: string[];
    redirectUri?: string;
  }): Promise<string> {
    const query = `
      mutation CreateClientToken($input: CreateClientTokenInput!) {
        createClientToken(input: $input) {
          clientToken
        }
      }
    `;

    const variables = {
      input: {
        userId: options.userId,
        permissions: options.permissions,
        redirectUri: options.redirectUri,
      },
    };

    const result = await this.query<{ createClientToken: { clientToken: string } }>(query, variables);
    return result.createClientToken.clientToken;
  }

  /**
   * Get accounts for a user
   */
  async getAccounts(userId: string): Promise<StitchAccount[]> {
    const query = `
      query GetAccounts($userId: String!) {
        user(id: $userId) {
          accounts {
            id
            name
            officialName
            accountType
            accountNumber
            currency
            balance {
              currency
              quantity
            }
            institution {
              id
              name
              logo
            }
          }
        }
      }
    `;

    const result = await this.query<{ user: { accounts: StitchAccount[] } }>(query, { userId });
    return result.user.accounts;
  }

  /**
   * Get transactions for an account
   */
  async getTransactions(accountId: string, options?: {
    cursor?: string;
    limit?: number;
    from?: string;
    to?: string;
  }): Promise<{
    transactions: StitchTransaction[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor?: string;
    };
  }> {
    const query = `
      query GetTransactions($accountId: String!, $cursor: String, $limit: Int, $from: DateTime, $to: DateTime) {
        account(id: $accountId) {
          transactions(first: $limit, after: $cursor, from: $from, to: $to) {
            nodes {
              id
              amount {
                currency
                quantity
              }
              date
              description
              reference
              runningBalance {
                currency
                quantity
              }
              status
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const variables = {
      accountId,
      cursor: options?.cursor,
      limit: options?.limit || 100,
      from: options?.from,
      to: options?.to,
    };

    const result = await this.query<{
      account: {
        transactions: {
          nodes: StitchTransaction[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor?: string;
          };
        };
      };
    }>(query, variables);

    return {
      transactions: result.account.transactions.nodes,
      pageInfo: result.account.transactions.pageInfo,
    };
  }

  /**
   * Get single account details
   */
  async getAccount(accountId: string): Promise<StitchAccount> {
    const query = `
      query GetAccount($accountId: String!) {
        account(id: $accountId) {
          id
          name
          officialName
          accountType
          accountNumber
          currency
          balance {
            currency
            quantity
          }
          institution {
            id
            name
            logo
          }
        }
      }
    `;

    const result = await this.query<{ account: StitchAccount }>(query, { accountId });
    return result.account;
  }
}

// Stitch API Types
export interface StitchAccount {
  id: string;
  name: string;
  officialName: string;
  accountType: string;
  accountNumber: string;
  currency: string;
  balance: {
    currency: string;
    quantity: string;
  };
  institution: {
    id: string;
    name: string;
    logo?: string;
  };
}

export interface StitchTransaction {
  id: string;
  amount: {
    currency: string;
    quantity: string;
  };
  date: string;
  description: string;
  reference?: string;
  runningBalance: {
    currency: string;
    quantity: string;
  };
  status: string;
}

export interface StitchLinkSuccess {
  userId: string;
  accounts: StitchAccount[];
}

// Create singleton instance
export const stitchClient = new StitchGraphQLClient();