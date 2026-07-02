const DEFAULT_BACKEND_URL = "http://localhost:8000";

function backendBaseUrl() {
  return process.env.PORTFOLIO_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL;
}

function copyUpstreamHeaders(upstream: Response) {
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  return headers;
}

async function proxy(request: Request, method: string) {
  const targetUrl = new URL("/admin/portfolio", backendBaseUrl());
  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  const adminToken = request.headers.get("x-admin-token");

  if (cookie) {
    headers.set("cookie", cookie);
  }

  if (adminToken) {
    headers.set("x-admin-token", adminToken);
  }

  const body = method === "PUT" ? await request.text() : undefined;

  if (body !== undefined) {
    headers.set("content-type", request.headers.get("content-type") ?? "application/json");
  }

  const upstream = await fetch(targetUrl, {
    body,
    headers,
    method,
  });

  return new Response(await upstream.arrayBuffer(), {
    headers: copyUpstreamHeaders(upstream),
    status: upstream.status,
  });
}

export async function GET(request: Request) {
  return proxy(request, "GET");
}

export async function PUT(request: Request) {
  return proxy(request, "PUT");
}
