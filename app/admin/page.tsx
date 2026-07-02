import type { Metadata } from "next";
import { headers } from "next/headers";

import { AdminPortfolioEditor } from "@/components/admin-portfolio-editor";

export const metadata: Metadata = {
  title: "Admin",
  description: "Portfolio database editor",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const accessAssertion = requestHeaders.get("cf-access-jwt-assertion");
  const hasAccessSession = typeof accessAssertion === "string" && accessAssertion.length > 0;

  if (!hasAccessSession) {
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
            이 페이지는 Cloudflare Access로 잠겨 있습니다. Access가 적용된 /admin 주소로 들어오면 로그인 후 문서를 볼 수
            있습니다.
          </p>
        </section>

        <div className="admin-panel">
          <p className="admin-copy">
            로그인 버튼은 앱 안에 두지 않았습니다. Cloudflare가 먼저 인증을 처리하고, 인증된 요청만 편집기를 볼 수 있게
            합니다.
          </p>
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
          Back home
        </a>
      </header>

      <section className="admin-hero">
        <p className="eyebrow">Admin</p>
        <h1>Database control panel</h1>
        <p className="hero-summary">
          포트폴리오의 모든 공개 데이터를 DB 한 줄 문서로 관리합니다. Cloudflare Access가 먼저 인증을 처리한 뒤 문서를
          불러오고 저장할 수 있습니다.
        </p>
      </section>

      <AdminPortfolioEditor />
    </main>
  );
}
