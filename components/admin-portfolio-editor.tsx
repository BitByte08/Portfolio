"use client";

import { useEffect, useMemo, useState } from "react";

import { portfolioData, type PortfolioData } from "@/lib/portfolio";

type PortfolioDocument = {
  data: PortfolioData;
  updatedAt: string;
};

type LoadState = "idle" | "loading" | "ready" | "saving" | "error";

const STORAGE_KEY = "portfolio-admin-session";
const DEFAULT_BACKEND_URL = "http://localhost:8000";

type AdminSession = {
  backendUrl: string;
  adminToken: string;
};

function safeParsePortfolio(json: string): { ok: true; value: PortfolioData } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(json) as PortfolioData };
  } catch {
    return { ok: false, error: "JSON 파싱에 실패했습니다." };
  }
}

export function AdminPortfolioEditor() {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [adminToken, setAdminToken] = useState("dev-admin");
  const [draft, setDraft] = useState(() => JSON.stringify(portfolioData, null, 2));
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("토큰을 입력하고 현재 DB 문서를 불러오세요.");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const session = JSON.parse(raw) as Partial<AdminSession>;

      if (typeof session.backendUrl === "string" && session.backendUrl.length > 0) {
        setBackendUrl(session.backendUrl);
      }

      if (typeof session.adminToken === "string" && session.adminToken.length > 0) {
        setAdminToken(session.adminToken);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const parsedDraft = useMemo(() => safeParsePortfolio(draft), [draft]);
  const stats = useMemo(() => {
    if (!parsedDraft.ok) {
      return null;
    }

    return {
      projectCount: parsedDraft.value.projects.length,
      awardCount: parsedDraft.value.awards.length,
      certificateCount: parsedDraft.value.certificates.length,
      stackGroups: parsedDraft.value.techStack.length,
    };
  }, [parsedDraft]);

  async function fetchDocument() {
    setLoadState("loading");
    setMessage("DB 문서를 읽는 중입니다.");

    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/admin/portfolio`, {
        headers: {
          "x-admin-token": adminToken,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `문서 조회에 실패했습니다. (${response.status})`);
      }

      const document = (await response.json()) as PortfolioDocument;
      setDraft(JSON.stringify(document.data, null, 2));
      setUpdatedAt(document.updatedAt);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ backendUrl, adminToken } satisfies AdminSession));
      setLoadState("ready");
      setMessage("DB 문서를 불러왔습니다. 수정 후 저장하세요.");
    } catch (error) {
      setLoadState("error");
      setMessage(error instanceof Error ? error.message : "문서를 불러오지 못했습니다.");
    }
  }

  async function saveDocument() {
    const parsed = safeParsePortfolio(draft);

    if (!parsed.ok) {
      setLoadState("error");
      setMessage(parsed.error);
      return;
    }

    setLoadState("saving");
    setMessage("DB에 저장하는 중입니다.");

    try {
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/admin/portfolio`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(parsed.value),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `저장에 실패했습니다. (${response.status})`);
      }

      const document = (await response.json()) as PortfolioDocument;
      setDraft(JSON.stringify(document.data, null, 2));
      setUpdatedAt(document.updatedAt);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ backendUrl, adminToken } satisfies AdminSession));
      setLoadState("ready");
      setMessage("저장 완료. DB 문서가 갱신되었습니다.");
    } catch (error) {
      setLoadState("error");
      setMessage(error instanceof Error ? error.message : "저장에 실패했습니다.");
    }
  }

  return (
    <div className="admin-panel-grid">
      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>Portfolio DB Editor</h2>
          </div>
          <span className={`admin-status admin-status--${loadState}`}>{loadState}</span>
        </div>

        <p className="admin-copy">
          이 화면은 DB에 저장된 포트폴리오 문서를 직접 편집합니다. 저장 버튼을 누르면 공용 홈과 백엔드가 같은 데이터를 보게 됩니다.
        </p>

        <div className="admin-field-grid">
          <label className="admin-field">
            <span>Backend URL</span>
            <input
              value={backendUrl}
              onChange={(event) => setBackendUrl(event.target.value)}
              placeholder="http://localhost:8000"
              spellCheck={false}
            />
          </label>

          <label className="admin-field">
            <span>Admin Token</span>
            <input
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="dev-admin"
              spellCheck={false}
            />
          </label>
        </div>

        <div className="admin-actions">
          <button type="button" className="button button-secondary" onClick={() => void fetchDocument()}>
            Load from DB
          </button>
          <button type="button" className="button button-primary" onClick={() => void saveDocument()} disabled={loadState === "saving"}>
            Save to DB
          </button>
        </div>

        <div className="admin-metadata">
          <div>
            <span>Status</span>
            <strong>{message}</strong>
          </div>
          <div>
            <span>Last updated</span>
            <strong>{updatedAt ?? "not loaded"}</strong>
          </div>
        </div>

        {stats ? (
          <div className="admin-stat-grid" aria-label="document summary">
            <div>
              <span>Projects</span>
              <strong>{stats.projectCount}</strong>
            </div>
            <div>
              <span>Awards</span>
              <strong>{stats.awardCount}</strong>
            </div>
            <div>
              <span>Certificates</span>
              <strong>{stats.certificateCount}</strong>
            </div>
            <div>
              <span>Stack groups</span>
              <strong>{stats.stackGroups}</strong>
            </div>
          </div>
        ) : (
          <p className="admin-error">문서가 유효한 JSON이 아니어서 요약을 만들 수 없습니다.</p>
        )}
      </section>

      <section className="admin-panel admin-panel--editor">
        <div className="admin-panel__header">
          <div>
            <p className="eyebrow">Document</p>
            <h2>JSON source</h2>
          </div>
          <span className="admin-status admin-status--ready">editable</span>
        </div>

        <textarea
          className="admin-editor"
          value={draft}
          spellCheck={false}
          onChange={(event) => setDraft(event.target.value)}
          aria-label="Portfolio JSON editor"
        />

        {!parsedDraft.ok ? <p className="admin-error">{parsedDraft.error}</p> : null}
      </section>
    </div>
  );
}
