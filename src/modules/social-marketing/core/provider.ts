export type SocialProviderCode = "FACEBOOK";

export type FacebookAssetDiscovery = {
  user: { id: string; name: string };
  pages: Array<{
    id: string;
    name: string;
    category?: string;
    pictureUrl?: string;
    followers?: number;
    likes?: number;
    link?: string;
  }>;
  adAccounts: Array<{
    id: string;
    accountId?: string;
    name: string;
    currency?: string;
    timezone?: string;
    status?: number;
  }>;
};

export interface SocialReportProvider {
  readonly code: SocialProviderCode;
  exchangeAuthorizationCode(code: string, redirectUri: string): Promise<{ accessToken: string; expiresAt?: Date }>;
  discoverAssets(accessToken: string): Promise<FacebookAssetDiscovery>;
}

