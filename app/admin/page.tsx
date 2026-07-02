import type { Metadata } from "next";
import { headers } from "next/headers";

import { AdminPortfolioEditor } from "@/components/admin-portfolio-editor";

export const metadata: Metadata = {
  title: {
    absolute: "Admin",
  },
  description: "Portfolio database editor",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const accessAssertion = requestHeaders.get("cf-access-jwt-assertion");
  const host = requestHeaders.get("host") ?? "bitworkspace.kr";
  const isLocalhost =
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host === "127.0.0.1" ||
    host.startsWith("127.0.0.1:") ||
    host === "[::1]" ||
    host.startsWith("[::1]:");
  const hasAccessSession = typeof accessAssertion === "string" && accessAssertion.length > 0;

  if (!hasAccessSession && !isLocalhost) {
    return (
      <main className="admin-shell">
        <header className="portfolio-header admin-header">
          <a className="portfolio-brand" href="/">
            Portfolio
          </a>
        </header>

        <section className="admin-hero">
          <p className="eyebrow">Admin</p>
          <h1>Access required</h1>
          <p className="hero-summary">
            Cloudflare Access로 잠긴 관리자 화면입니다. 아래 버튼을 누르면 Access 로그인 창으로 이동합니다.
          </p>
        </section>

        <div className="admin-panel">
          <p className="admin-copy">로그인은 Cloudflare가 먼저 처리합니다. 앱 안에 별도 로그인 폼은 두지 않았습니다.</p>
          <div className="admin-actions">
            <a className="button button-primary" href="/admin/login">
              Cloudflare Access 로그인
            </a>
            <a className="button button-secondary" href="/">
              홈으로
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="portfolio-header admin-header">
        <a className="portfolio-brand" href="/">
          Portfolio
        </a>
        <a className="button button-secondary" href="/">
          홈으로
        </a>
      </header>

      <section className="admin-hero">
        <p className="eyebrow">Admin</p>
        <h1>Database control panel</h1>
        <p className="hero-summary">
          포트폴리오 데이터를 DB에서 직접 확인하고 수정하는 관리자 화면입니다. Cloudflare Access 인증이 먼저 필요합니다.
        </p>
      </section>

      <AdminPortfolioEditor />
    </main>
  );
}
