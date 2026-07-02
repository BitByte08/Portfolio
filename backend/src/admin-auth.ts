import { UnauthorizedException } from "@nestjs/common";

const DEFAULT_ADMIN_TOKEN = "dev-admin";

export function assertAdminToken(token: string | undefined): void {
  const expectedToken = process.env.PORTFOLIO_ADMIN_TOKEN ?? DEFAULT_ADMIN_TOKEN;

  if (token === expectedToken) {
    return;
  }

  throw new UnauthorizedException("Invalid admin token");
}
