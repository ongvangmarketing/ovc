import "server-only";

import { db } from "@/lib/db";
import { facebookProvider } from "@/modules/social-marketing/providers/facebook/provider";
import { decryptSocialToken, encryptSocialToken } from "@/modules/social-marketing/security/token-crypto";

export async function saveFacebookConnection(params: {
  organizationId: string;
  code: string;
  redirectUri: string;
}) {
  const grant = await facebookProvider.exchangeAuthorizationCode(params.code, params.redirectUri);
  const discovery = await facebookProvider.discoverAssets(grant.accessToken);
  const envelope = encryptSocialToken(grant.accessToken);

  return db.$transaction(async (tx) => {
    const connection = await tx.socialProviderConnection.upsert({
      where: {
        organizationId_provider_externalUserId: {
          organizationId: params.organizationId,
          provider: "FACEBOOK",
          externalUserId: discovery.user.id,
        },
      },
      update: {
        displayName: discovery.user.name,
        tokenCiphertext: envelope.ciphertext,
        tokenIv: envelope.iv,
        tokenAuthTag: envelope.authTag,
        tokenKeyVersion: envelope.keyVersion,
        tokenExpiresAt: grant.expiresAt,
        status: "ACTIVE",
        connectedAt: new Date(),
        deletedAt: null,
      },
      create: {
        organizationId: params.organizationId,
        provider: "FACEBOOK",
        externalUserId: discovery.user.id,
        displayName: discovery.user.name,
        tokenCiphertext: envelope.ciphertext,
        tokenIv: envelope.iv,
        tokenAuthTag: envelope.authTag,
        tokenKeyVersion: envelope.keyVersion,
        tokenExpiresAt: grant.expiresAt,
        status: "ACTIVE",
        connectedAt: new Date(),
      },
    });

    for (const page of discovery.pages) {
      await tx.socialProviderAsset.upsert({
        where: {
          organizationId_provider_assetType_externalId: {
            organizationId: params.organizationId,
            provider: "FACEBOOK",
            assetType: "PAGE",
            externalId: page.id,
          },
        },
        update: {
          connectionId: connection.id, name: page.name, avatarUrl: page.pictureUrl,
          category: page.category, url: page.link, followers: page.followers,
          likes: page.likes, deletedAt: null,
        },
        create: {
          organizationId: params.organizationId, connectionId: connection.id,
          provider: "FACEBOOK", assetType: "PAGE", externalId: page.id,
          name: page.name, avatarUrl: page.pictureUrl, category: page.category,
          url: page.link, followers: page.followers, likes: page.likes,
        },
      });
    }

    for (const account of discovery.adAccounts) {
      await tx.socialProviderAsset.upsert({
        where: {
          organizationId_provider_assetType_externalId: {
            organizationId: params.organizationId,
            provider: "FACEBOOK",
            assetType: "AD_ACCOUNT",
            externalId: account.id,
          },
        },
        update: {
          connectionId: connection.id, name: account.name, currency: account.currency,
          timezone: account.timezone, metadata: { accountId: account.accountId, status: account.status },
          deletedAt: null,
        },
        create: {
          organizationId: params.organizationId, connectionId: connection.id,
          provider: "FACEBOOK", assetType: "AD_ACCOUNT", externalId: account.id,
          name: account.name, currency: account.currency, timezone: account.timezone,
          metadata: { accountId: account.accountId, status: account.status },
        },
      });
    }

    await tx.socialMarketingReportSetting.upsert({
      where: { organizationId: params.organizationId },
      update: {},
      create: { organizationId: params.organizationId },
    });

    return connection;
  });
}

async function upsertFacebookDiscovery(params: {
  organizationId: string;
  accessToken: string;
  expiresAt?: Date;
  source: "oauth" | "manual_token";
}) {
  const discovery = await facebookProvider.discoverAssets(params.accessToken);
  const envelope = encryptSocialToken(params.accessToken);
  const status = discovery.pages.length || discovery.adAccounts.length ? "ACTIVE" : "ATTENTION_REQUIRED";

  return db.$transaction(async (tx) => {
    const connection = await tx.socialProviderConnection.upsert({
      where: {
        organizationId_provider_externalUserId: {
          organizationId: params.organizationId,
          provider: "FACEBOOK",
          externalUserId: discovery.user.id,
        },
      },
      update: {
        displayName: discovery.user.name,
        tokenCiphertext: envelope.ciphertext,
        tokenIv: envelope.iv,
        tokenAuthTag: envelope.authTag,
        tokenKeyVersion: envelope.keyVersion,
        tokenExpiresAt: params.expiresAt,
        status,
        connectedAt: new Date(),
        metadata: { source: params.source },
        deletedAt: null,
      },
      create: {
        organizationId: params.organizationId,
        provider: "FACEBOOK",
        externalUserId: discovery.user.id,
        displayName: discovery.user.name,
        tokenCiphertext: envelope.ciphertext,
        tokenIv: envelope.iv,
        tokenAuthTag: envelope.authTag,
        tokenKeyVersion: envelope.keyVersion,
        tokenExpiresAt: params.expiresAt,
        status,
        connectedAt: new Date(),
        metadata: { source: params.source },
      },
    });

    for (const page of discovery.pages) {
      await tx.socialProviderAsset.upsert({
        where: {
          organizationId_provider_assetType_externalId: {
            organizationId: params.organizationId,
            provider: "FACEBOOK",
            assetType: "PAGE",
            externalId: page.id,
          },
        },
        update: {
          connectionId: connection.id,
          name: page.name,
          avatarUrl: page.pictureUrl,
          category: page.category,
          url: page.link,
          followers: page.followers,
          likes: page.likes,
          deletedAt: null,
        },
        create: {
          organizationId: params.organizationId,
          connectionId: connection.id,
          provider: "FACEBOOK",
          assetType: "PAGE",
          externalId: page.id,
          name: page.name,
          avatarUrl: page.pictureUrl,
          category: page.category,
          url: page.link,
          followers: page.followers,
          likes: page.likes,
        },
      });
    }

    for (const account of discovery.adAccounts) {
      await tx.socialProviderAsset.upsert({
        where: {
          organizationId_provider_assetType_externalId: {
            organizationId: params.organizationId,
            provider: "FACEBOOK",
            assetType: "AD_ACCOUNT",
            externalId: account.id,
          },
        },
        update: {
          connectionId: connection.id,
          name: account.name,
          currency: account.currency,
          timezone: account.timezone,
          metadata: { accountId: account.accountId, status: account.status },
          deletedAt: null,
        },
        create: {
          organizationId: params.organizationId,
          connectionId: connection.id,
          provider: "FACEBOOK",
          assetType: "AD_ACCOUNT",
          externalId: account.id,
          name: account.name,
          currency: account.currency,
          timezone: account.timezone,
          metadata: { accountId: account.accountId, status: account.status },
        },
      });
    }

    await tx.socialMarketingReportSetting.upsert({
      where: { organizationId: params.organizationId },
      update: {},
      create: { organizationId: params.organizationId },
    });

    return { connection, discovery };
  });
}

export async function saveFacebookTokenConnection(params: {
  organizationId: string;
  accessToken: string;
}) {
  const token = params.accessToken.trim();
  if (!token || token.length < 40) {
    throw new Error("Access token không hợp lệ.");
  }

  return upsertFacebookDiscovery({
    organizationId: params.organizationId,
    accessToken: token,
    source: "manual_token",
  });
}

export async function getFacebookAccessToken(organizationId: string, connectionId: string) {
  const connection = await db.socialProviderConnection.findFirst({
    where: { id: connectionId, organizationId, provider: "FACEBOOK", status: "ACTIVE", deletedAt: null },
    select: { tokenCiphertext: true, tokenIv: true, tokenAuthTag: true, tokenKeyVersion: true },
  });
  if (!connection) throw new Error("Không tìm thấy kết nối Facebook đang hoạt động.");
  return decryptSocialToken({
    ciphertext: connection.tokenCiphertext,
    iv: connection.tokenIv,
    authTag: connection.tokenAuthTag,
    keyVersion: connection.tokenKeyVersion,
  });
}

export async function disconnectFacebook(organizationId: string, connectionId: string) {
  const updated = await db.socialProviderConnection.updateMany({
    where: { id: connectionId, organizationId, provider: "FACEBOOK" },
    data: { status: "DISCONNECTED", deletedAt: new Date(), tokenExpiresAt: new Date() },
  });
  if (!updated.count) throw new Error("Kết nối Facebook không thuộc tổ chức hiện tại.");
}
