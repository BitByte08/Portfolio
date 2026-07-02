import assert from "node:assert/strict";
import type { IncomingHttpHeaders } from "node:http";
import test from "node:test";

import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";

import { assertAdminAccessWithOptions, verifyCloudflareAccessAssertion } from "./access-auth.js";

function setEnv(name: string, value: string | undefined): () => void {
  const previous = process.env[name];

  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }

  return () => {
    if (previous === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = previous;
    }
  };
}

test("assertAdminAccessWithOptions accepts the local dev token when development fallback is enabled", async (t) => {
  const restoreNodeEnv = setEnv("NODE_ENV", "test");
  const restoreToken = setEnv("PORTFOLIO_ADMIN_TOKEN", "local-token");
  t.after(restoreNodeEnv);
  t.after(restoreToken);

  const headers = { "x-admin-token": "local-token" } satisfies IncomingHttpHeaders;
  const identity = await assertAdminAccessWithOptions(headers);

  assert.equal(identity.kind, "local-dev-token");
});

test("verifyCloudflareAccessAssertion accepts a signed Cloudflare Access JWT for an allowed email", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  const keyResolver = createLocalJWKSet({
    keys: [{ ...publicJwk, alg: "RS256", kid: "test-kid", use: "sig" }],
  });

  const assertion = await new SignJWT({ email: "admin@example.com" })
    .setProtectedHeader({ alg: "RS256", kid: "test-kid" })
    .setIssuer("https://portfolio.cloudflareaccess.com")
    .setAudience("portfolio-admin")
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(privateKey);

  const email = await verifyCloudflareAccessAssertion(assertion, {
    audience: "portfolio-admin",
    keyResolver,
    teamDomain: "portfolio.cloudflareaccess.com",
  });

  assert.equal(email, "admin@example.com");
});

test("assertAdminAccessWithOptions rejects Access JWTs from emails outside the allowlist", async (t) => {
  const restoreNodeEnv = setEnv("NODE_ENV", "production");
  const restoreTeam = setEnv("CF_ACCESS_TEAM_DOMAIN", "portfolio.cloudflareaccess.com");
  const restoreAudience = setEnv("CF_ACCESS_AUDIENCE", "portfolio-admin");
  const restoreAllowed = setEnv("CF_ACCESS_ALLOWED_EMAILS", "owner@example.com");
  t.after(restoreNodeEnv);
  t.after(restoreTeam);
  t.after(restoreAudience);
  t.after(restoreAllowed);

  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  const keyResolver = createLocalJWKSet({
    keys: [{ ...publicJwk, alg: "RS256", kid: "test-kid", use: "sig" }],
  });

  const assertion = await new SignJWT({ email: "other@example.com" })
    .setProtectedHeader({ alg: "RS256", kid: "test-kid" })
    .setIssuer("https://portfolio.cloudflareaccess.com")
    .setAudience("portfolio-admin")
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(privateKey);

  const headers = { "cf-access-jwt-assertion": assertion } satisfies IncomingHttpHeaders;

  await assert.rejects(
    async () => {
      await assertAdminAccessWithOptions(headers, { keyResolver });
    },
    ForbiddenException,
  );
});

test("assertAdminAccessWithOptions rejects requests without Cloudflare Access when production config is present", async (t) => {
  const restoreNodeEnv = setEnv("NODE_ENV", "production");
  const restoreTeam = setEnv("CF_ACCESS_TEAM_DOMAIN", "portfolio.cloudflareaccess.com");
  const restoreAudience = setEnv("CF_ACCESS_AUDIENCE", "portfolio-admin");
  t.after(restoreNodeEnv);
  t.after(restoreTeam);
  t.after(restoreAudience);

  await assert.rejects(
    async () => {
      await assertAdminAccessWithOptions({});
    },
    UnauthorizedException,
  );
});
