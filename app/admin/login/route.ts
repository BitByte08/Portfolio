import { NextResponse } from "next/server";

function buildAccessLoginUrl(request: Request) {
  const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN?.trim() || "bitbyte08.cloudflareaccess.com";
  const audience = process.env.CF_ACCESS_AUDIENCE?.trim() || "portfolio-admin";

  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/admin", requestUrl.origin);
  const loginPath = `/cdn-cgi/access/login/${redirectUrl.hostname}`;
  const searchParams = new URLSearchParams({
    kid: audience,
    redirect_url: `${redirectUrl.pathname}${redirectUrl.search}`,
  });

  return new URL(`${loginPath}?${searchParams.toString()}`, `https://${teamDomain}`).toString();
}

export async function GET(request: Request) {
  const loginUrl = buildAccessLoginUrl(request);

  if (!loginUrl) {
    return NextResponse.redirect(new URL("/admin", request.url), { status: 302 });
  }

  return NextResponse.redirect(loginUrl, { status: 302 });
}
