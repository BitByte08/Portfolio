import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from "jose";
import type { IncomingHttpHeaders } from "node:http";

type AdminIdentity = {
  readonly kind: "cloudflare-access" | "local-dev-token";
  readonly email?: string;
};

type AccessConfig = {
  readonly teamDomain: string;
  readonly audience: string;
  readonly allowedEmails: readonly string[];
  readonly allowLocalDevToken: boolean;
  readonly localDevToken: string;
};

type AccessJwtPayload = JWTPayload & {
  readonly email?: unknown;
};

const jwksCache = new Map<string, JWTVerifyGetKey>();

function readHeader(headers: IncomingHttpHeaders, name: string): string | undefined {
  const value = headers[name.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function readCommaSeparated(value: string | undefined): readonly string[] {
  return value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0) ?? [];
}

function readAccessConfig(): AccessConfig {
  return {
    teamDomain: process.env.CF_ACCESS_TEAM_DOMAIN?.trim() ?? "",
    audience: process.env.CF_ACCESS_AUDIENCE?.trim() ?? "",
    allowedEmails: readCommaSeparated(process.env.CF_ACCESS_ALLOWED_EMAILS),
    allowLocalDevToken: process.env.NODE_ENV !== "production",
    localDevToken: process.env.PORTFOLIO_ADMIN_TOKEN ?? "dev-admin",
  };
}

function getJwks(teamDomain: string): JWTVerifyGetKey {
  const cached = jwksCache.get(teamDomain);

  if (cached) {
    return cached;
  }

  const jwks = createRemoteJWKSet(new URL("/cdn-cgi/access/certs", `https://${teamDomain}`));
  jwksCache.set(teamDomain, jwks);
  return jwks;
}

export async function verifyCloudflareAccessAssertion(
  assertion: string,
  options: {
    readonly teamDomain: string;
    readonly audience: string;
    readonly keyResolver?: JWTVerifyGetKey;
  },
): Promise<string> {
  const { payload } = await jwtVerify(assertion, options.keyResolver ?? getJwks(options.teamDomain), {
    audience: options.audience,
    issuer: `https://${options.teamDomain}`,
  });

  const email = (payload as AccessJwtPayload).email;

  if (typeof email !== "string" || email.length === 0) {
    throw new UnauthorizedException("Cloudflare Access token did not include an email claim");
  }

  return email;
}

export async function assertAdminAccess(headers: IncomingHttpHeaders): Promise<AdminIdentity> {
  return assertAdminAccessWithOptions(headers);
}

export async function assertAdminAccessWithOptions(
  headers: IncomingHttpHeaders,
  options?: {
    readonly keyResolver?: JWTVerifyGetKey;
  },
): Promise<AdminIdentity> {
  const config = readAccessConfig();
  const localDevToken = readHeader(headers, "x-admin-token");

  if (config.allowLocalDevToken && localDevToken === config.localDevToken) {
    return { kind: "local-dev-token" };
  }

  if (config.teamDomain.length === 0 || config.audience.length === 0) {
    throw new UnauthorizedException("Cloudflare Access is not configured for admin access");
  }

  const assertion = readHeader(headers, "cf-access-jwt-assertion");

  if (assertion === undefined || assertion.length === 0) {
    throw new UnauthorizedException("Cloudflare Access login is required");
  }

  const email = await verifyCloudflareAccessAssertion(assertion, {
    audience: config.audience,
    keyResolver: options?.keyResolver,
    teamDomain: config.teamDomain,
  });

  if (config.allowedEmails.length > 0 && !config.allowedEmails.includes(email)) {
    throw new ForbiddenException("This email is not allowed to manage the portfolio");
  }

  return {
    kind: "cloudflare-access",
    email,
  };
}
