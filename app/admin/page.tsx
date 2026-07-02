import type { Metadata } from "next";

import { AdminPortfolioEditor } from "@/components/admin-portfolio-editor";

export const metadata: Metadata = {
  title: "Admin",
  description: "Portfolio database editor",
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
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
          포트폴리오의 모든 공개 데이터를 DB 한 줄 문서로 관리합니다. Cloudflare Access로 보호된 관리자 주소로 들어오면
          인증이 먼저 처리되고, 그 다음에 문서를 불러오고 저장할 수 있습니다.
        </p>
      </section>

      <AdminPortfolioEditor />
    </main>
  );
}
