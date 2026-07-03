"use client";

import { useEffect, useMemo, useState } from "react";

import { MarkdownViewer } from "@/components/markdown-viewer";
import type { PortfolioData } from "@/lib/portfolio";

type PortfolioDocument = {
  data: PortfolioData;
  updatedAt: string;
};

type LoadState = "idle" | "loading" | "ready" | "saving" | "error";

const STORAGE_KEY = "portfolio-admin-session";
const API_BASE_URL = "/api";

type AdminSession = {
  adminToken: string;
};

function clonePortfolio(data: PortfolioData): PortfolioData {
  return JSON.parse(JSON.stringify(data)) as PortfolioData;
}

function createChallenge(): PortfolioData["intro"]["challenge"][number] {
  return {
    title: "새 항목",
    body: "설명을 입력하세요.",
  };
}

function createTechGroup(): PortfolioData["techStack"][number] {
  return {
    name: "New Group",
    items: ["Item"],
  };
}

function createAward(): PortfolioData["awards"][number] {
  return {
    year: "2025",
    status: "교내",
    issuer: "기관명",
    name: "수상명",
  };
}

function createProject(): PortfolioData["projects"][number] {
  return {
    title: "New Project",
    subtitle: "프로젝트 설명",
    meta: {
      period: "2025.01. ~ 2025.12.",
      role: "Role",
      stack: ["Next.js"],
      team: "Team",
      code: "",
    },
    summary: "프로젝트 요약을 입력하세요.",
    details: [
      {
        title: "Detail",
        body: "세부 설명을 입력하세요.",
      },
    ],
  };
}

function mapLoadError(status: number) {
  if (status === 401 || status === 403) {
    return "Cloudflare Access 인증이 필요합니다.";
  }

  return "문서를 불러오지 못했습니다.";
}

function mapSaveError(status: number) {
  if (status === 401 || status === 403) {
    return "Cloudflare Access 인증이 필요합니다.";
  }

  return "저장에 실패했습니다.";
}

export function AdminPortfolioEditor() {
  const [adminToken, setAdminToken] = useState("dev-admin");
  const [draft, setDraft] = useState<PortfolioData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("Access 세션을 확인한 뒤 문서를 불러오세요.");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLocalPreview, setIsLocalPreview] = useState(false);

  useEffect(() => {
    setIsLocalPreview(
      window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "::1",
    );

    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const session = JSON.parse(raw) as Partial<AdminSession>;

      if (typeof session.adminToken === "string" && session.adminToken.length > 0) {
        setAdminToken(session.adminToken);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const stats = useMemo(() => {
    if (!draft) {
      return null;
    }

    return {
      projectCount: draft.projects.length,
      awardCount: draft.awards.length,
      certificateCount: draft.certificates.length,
      stackGroups: draft.techStack.length,
    };
  }, [draft]);

  function mutateDraft(mutator: (next: PortfolioData) => void) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const next = clonePortfolio(current);
      mutator(next);
      return next;
    });
  }

  async function fetchDocument() {
    setLoadState("loading");
    setMessage(isLocalPreview ? "로컬 토큰으로 문서를 불러오는 중입니다." : "Cloudflare Access를 통해 문서를 불러오는 중입니다.");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/portfolio`, {
        credentials: "include",
        headers: {
          "x-admin-token": adminToken,
        },
      });

      if (!response.ok) {
        throw new Error(mapLoadError(response.status));
      }

      const document = (await response.json()) as PortfolioDocument;
      setDraft(document.data);
      setUpdatedAt(document.updatedAt);
      setLoadState("ready");
      setMessage("문서를 불러왔습니다. 카드 버튼으로 항목을 추가하거나 삭제할 수 있습니다.");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ adminToken } satisfies AdminSession));
    } catch (error) {
      setLoadState("error");
      setMessage(error instanceof Error ? error.message : "문서를 불러오지 못했습니다.");
    }
  }

  async function saveDocument() {
    if (!draft) {
      setLoadState("error");
      setMessage("먼저 문서를 불러오세요.");
      return;
    }

    setLoadState("saving");
    setMessage("문서를 저장하는 중입니다.");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/portfolio`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        throw new Error(mapSaveError(response.status));
      }

      const document = (await response.json()) as PortfolioDocument;
      setDraft(document.data);
      setUpdatedAt(document.updatedAt);
      setLoadState("ready");
      setMessage("저장이 완료되었습니다.");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ adminToken } satisfies AdminSession));
    } catch (error) {
      setLoadState("error");
      setMessage(error instanceof Error ? error.message : "저장에 실패했습니다.");
    }
  }

  return (
    <div className="admin-panel-grid">
      <section className="admin-panel admin-panel--summary">
        <div className="admin-panel__header">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>Portfolio editor</h2>
          </div>
          <span className={`admin-status admin-status--${loadState}`}>{loadState}</span>
        </div>

        <p className="admin-copy">
          Cloudflare Access로 인증한 뒤 문서를 불러오면, 아래 카드들에서 직접 항목을 추가하거나 삭제할 수 있습니다.
        </p>

        <div className="admin-field-grid">
          {isLocalPreview ? (
            <label className="admin-field">
              <span>Local dev token</span>
              <input
                value={adminToken}
                onChange={(event) => setAdminToken(event.target.value)}
                placeholder="dev-admin"
                spellCheck={false}
              />
              <p className="admin-note">프로덕션에서는 Cloudflare Access가 인증을 담당합니다.</p>
            </label>
          ) : (
            <div className="admin-field admin-field--info">
              <span>Access</span>
              <strong>Cloudflare Access 세션으로 인증됩니다.</strong>
              <p className="admin-note">별도 로그인 폼은 없습니다. 보호된 관리자 경로로 들어온 뒤 문서를 불러오세요.</p>
            </div>
          )}
        </div>

        <div className="admin-actions">
          <button type="button" className="button button-primary" onClick={() => void fetchDocument()}>
            문서 불러오기
          </button>
          <button type="button" className="button button-secondary" onClick={() => void saveDocument()} disabled={loadState === "saving" || !draft}>
            저장
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

        {!draft ? <p className="admin-note">아직 문서를 불러오지 않았습니다. 인증 후 데이터를 표시합니다.</p> : null}

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
        ) : null}
      </section>

      {draft ? (
        <section className="admin-panel admin-panel--editor">
          <div className="admin-panel__header">
            <div>
              <p className="eyebrow">Content</p>
              <h2>Card editor</h2>
            </div>
            <span className="admin-status admin-status--ready">editable</span>
          </div>

          <div className="admin-stack">
            <section className="admin-card">
              <div className="admin-card__header">
                <div>
                  <p className="eyebrow">Site</p>
                  <h3>Basic info</h3>
                </div>
              </div>
              <div className="admin-fields">
                <label className="admin-field">
                  <span>Name</span>
                  <input value={draft.site.name} onChange={(event) => mutateDraft((next) => { next.site.name = event.target.value; })} />
                </label>
                <label className="admin-field">
                  <span>Headline</span>
                  <input value={draft.site.headline} onChange={(event) => mutateDraft((next) => { next.site.headline = event.target.value; })} />
                </label>
                <label className="admin-field">
                  <span>Role</span>
                  <input value={draft.site.role} onChange={(event) => mutateDraft((next) => { next.site.role = event.target.value; })} />
                </label>
                <label className="admin-field">
                  <span>Location</span>
                  <input value={draft.site.location} onChange={(event) => mutateDraft((next) => { next.site.location = event.target.value; })} />
                </label>
                <label className="admin-field admin-field--wide">
                  <span>Summary</span>
                  <textarea
                    className="admin-textarea"
                    value={draft.site.summary}
                    onChange={(event) => mutateDraft((next) => { next.site.summary = event.target.value; })}
                  />
                </label>
                <label className="admin-field">
                  <span>Phone</span>
                  <input value={draft.site.phone} onChange={(event) => mutateDraft((next) => { next.site.phone = event.target.value; })} />
                </label>
                <label className="admin-field">
                  <span>Email</span>
                  <input value={draft.site.email} onChange={(event) => mutateDraft((next) => { next.site.email = event.target.value; })} />
                </label>
                <label className="admin-field">
                  <span>School</span>
                  <input value={draft.site.school} onChange={(event) => mutateDraft((next) => { next.site.school = event.target.value; })} />
                </label>
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card__header">
                <div>
                  <p className="eyebrow">Challenge</p>
                  <h3>Try, Challenge</h3>
                </div>
                <button type="button" className="button" onClick={() => mutateDraft((next) => { next.intro.challenge.push(createChallenge()); })}>
                  항목 추가
                </button>
              </div>
              <div className="admin-list">
                {draft.intro.challenge.map((item, index) => (
                  <article className="admin-list-item" key={`${item.title}-${index}`}>
                    <div className="admin-list-item__header">
                      <strong>항목 {index + 1}</strong>
                      <button
                        type="button"
                        className="button"
                        onClick={() =>
                          mutateDraft((next) => {
                            next.intro.challenge.splice(index, 1);
                          })
                        }
                      >
                        삭제
                      </button>
                    </div>
                    <div className="admin-fields">
                      <label className="admin-field">
                        <span>Title</span>
                        <input
                          value={item.title}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.intro.challenge[index].title = event.target.value;
                            })
                          }
                        />
                      </label>
                      <label className="admin-field admin-field--wide">
                        <span>Body</span>
                        <textarea
                          className="admin-textarea"
                          value={item.body}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.intro.challenge[index].body = event.target.value;
                            })
                          }
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card__header">
                <div>
                  <p className="eyebrow">Stack</p>
                  <h3>Tech stack</h3>
                </div>
                <button type="button" className="button" onClick={() => mutateDraft((next) => { next.techStack.push(createTechGroup()); })}>
                  그룹 추가
                </button>
              </div>
              <div className="admin-list">
                {draft.techStack.map((group, groupIndex) => (
                  <article className="admin-list-item" key={`${group.name}-${groupIndex}`}>
                    <div className="admin-list-item__header">
                      <strong>그룹 {groupIndex + 1}</strong>
                      <button
                        type="button"
                        className="button"
                        onClick={() =>
                          mutateDraft((next) => {
                            next.techStack.splice(groupIndex, 1);
                          })
                        }
                      >
                        삭제
                      </button>
                    </div>
                    <div className="admin-fields">
                      <label className="admin-field">
                        <span>Name</span>
                        <input
                          value={group.name}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.techStack[groupIndex].name = event.target.value;
                            })
                          }
                        />
                      </label>
                      <div className="admin-field admin-field--wide">
                        <span>Items</span>
                        <div className="admin-sublist">
                          {group.items.map((item, itemIndex) => (
                            <div className="admin-sublist__row" key={`${group.name}-${itemIndex}`}>
                              <input
                                value={item}
                                onChange={(event) =>
                                  mutateDraft((next) => {
                                    next.techStack[groupIndex].items[itemIndex] = event.target.value;
                                  })
                                }
                              />
                              <button
                                type="button"
                                className="button"
                                onClick={() =>
                                  mutateDraft((next) => {
                                    next.techStack[groupIndex].items.splice(itemIndex, 1);
                                  })
                                }
                              >
                                삭제
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="button"
                            onClick={() =>
                              mutateDraft((next) => {
                                next.techStack[groupIndex].items.push("New item");
                              })
                            }
                          >
                            아이템 추가
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card__header">
                <div>
                  <p className="eyebrow">Award</p>
                  <h3>Awards</h3>
                </div>
                <button type="button" className="button" onClick={() => mutateDraft((next) => { next.awards.push(createAward()); })}>
                  수상 추가
                </button>
              </div>
              <div className="admin-list">
                {draft.awards.map((award, awardIndex) => (
                  <article className="admin-list-item" key={`${award.year}-${awardIndex}`}>
                    <div className="admin-list-item__header">
                      <strong>수상 {awardIndex + 1}</strong>
                      <button
                        type="button"
                        className="button"
                        onClick={() =>
                          mutateDraft((next) => {
                            next.awards.splice(awardIndex, 1);
                          })
                        }
                      >
                        삭제
                      </button>
                    </div>
                    <div className="admin-fields">
                      <label className="admin-field">
                        <span>Year</span>
                        <input
                          value={award.year}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.awards[awardIndex].year = event.target.value;
                            })
                          }
                        />
                      </label>
                      <label className="admin-field">
                        <span>Status</span>
                        <input
                          value={award.status}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.awards[awardIndex].status = event.target.value;
                            })
                          }
                        />
                      </label>
                      <label className="admin-field">
                        <span>Issuer</span>
                        <input
                          value={award.issuer}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.awards[awardIndex].issuer = event.target.value;
                            })
                          }
                        />
                      </label>
                      <label className="admin-field admin-field--wide">
                        <span>Name</span>
                        <input
                          value={award.name}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.awards[awardIndex].name = event.target.value;
                            })
                          }
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card__header">
                <div>
                  <p className="eyebrow">Certificate</p>
                  <h3>Certificates</h3>
                </div>
                <button
                  type="button"
                  className="button"
                  onClick={() =>
                    mutateDraft((next) => {
                      next.certificates.push("새 자격증");
                    })
                  }
                >
                  자격증 추가
                </button>
              </div>
              <div className="admin-list">
                {draft.certificates.map((certificate, certificateIndex) => (
                  <div className="admin-sublist__row" key={`${certificate}-${certificateIndex}`}>
                    <input
                      value={certificate}
                      onChange={(event) =>
                        mutateDraft((next) => {
                          next.certificates[certificateIndex] = event.target.value;
                        })
                      }
                    />
                    <button
                      type="button"
                      className="button"
                      onClick={() =>
                        mutateDraft((next) => {
                          next.certificates.splice(certificateIndex, 1);
                        })
                      }
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card__header">
                <div>
                  <p className="eyebrow">Project</p>
                  <h3>Projects</h3>
                </div>
                <button type="button" className="button" onClick={() => mutateDraft((next) => { next.projects.push(createProject()); })}>
                  프로젝트 추가
                </button>
              </div>
              <div className="admin-list">
                {draft.projects.map((project, projectIndex) => (
                  <article className="admin-list-item" key={`${project.title}-${projectIndex}`}>
                    <div className="admin-list-item__header">
                      <strong>프로젝트 {projectIndex + 1}</strong>
                      <button
                        type="button"
                        className="button"
                        onClick={() =>
                          mutateDraft((next) => {
                            next.projects.splice(projectIndex, 1);
                          })
                        }
                      >
                        삭제
                      </button>
                    </div>

                    <div className="admin-fields">
                      <label className="admin-field">
                        <span>Title</span>
                        <input
                          value={project.title}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.projects[projectIndex].title = event.target.value;
                            })
                          }
                        />
                      </label>
                      <label className="admin-field">
                        <span>Subtitle</span>
                        <input
                          value={project.subtitle}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.projects[projectIndex].subtitle = event.target.value;
                            })
                          }
                        />
                      </label>
                      <label className="admin-field admin-field--wide">
                        <span>Summary</span>
                        <textarea
                          className="admin-textarea"
                          value={project.summary}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.projects[projectIndex].summary = event.target.value;
                            })
                          }
                        />
                      </label>
                    </div>

                    <div className="admin-fields">
                      <label className="admin-field">
                        <span>Period</span>
                        <input
                          value={project.meta.period}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.projects[projectIndex].meta.period = event.target.value;
                            })
                          }
                        />
                      </label>
                      <label className="admin-field">
                        <span>Role</span>
                        <input
                          value={project.meta.role}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.projects[projectIndex].meta.role = event.target.value;
                            })
                          }
                        />
                      </label>
                      <label className="admin-field">
                        <span>Team</span>
                        <input
                          value={project.meta.team}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.projects[projectIndex].meta.team = event.target.value;
                            })
                          }
                        />
                      </label>
                      <label className="admin-field admin-field--wide">
                        <span>Code link</span>
                        <input
                          value={project.meta.code}
                          onChange={(event) =>
                            mutateDraft((next) => {
                              next.projects[projectIndex].meta.code = event.target.value;
                            })
                          }
                        />
                      </label>
                    </div>

                    <div className="admin-field admin-field--wide">
                      <span>Stack</span>
                      <div className="admin-sublist">
                        {project.meta.stack.map((stackItem, stackIndex) => (
                          <div className="admin-sublist__row" key={`${project.title}-${stackIndex}`}>
                            <input
                              value={stackItem}
                              onChange={(event) =>
                                mutateDraft((next) => {
                                  next.projects[projectIndex].meta.stack[stackIndex] = event.target.value;
                                })
                              }
                            />
                            <button
                              type="button"
                              className="button"
                              onClick={() =>
                                mutateDraft((next) => {
                                  next.projects[projectIndex].meta.stack.splice(stackIndex, 1);
                                })
                              }
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="button"
                          onClick={() =>
                            mutateDraft((next) => {
                              next.projects[projectIndex].meta.stack.push("New stack");
                            })
                          }
                        >
                          스택 추가
                        </button>
                      </div>
                    </div>

                    <div className="admin-field admin-field--wide">
                      <div className="admin-card__header">
                        <div>
                          <p className="eyebrow">Details</p>
                          <h3>Expandable notes</h3>
                        </div>
                        <button
                          type="button"
                          className="button"
                          onClick={() =>
                            mutateDraft((next) => {
                              next.projects[projectIndex].details.push({
                                title: "새 상세 항목",
                                body: "세부 내용을 입력하세요.",
                              });
                            })
                          }
                        >
                          상세 추가
                        </button>
                      </div>

                      <div className="admin-list">
                        {project.details.map((detail, detailIndex) => (
                          <article className="admin-list-item" key={`${detail.title}-${detailIndex}`}>
                            <div className="admin-list-item__header">
                              <strong>상세 {detailIndex + 1}</strong>
                              <button
                                type="button"
                                className="button"
                                onClick={() =>
                                  mutateDraft((next) => {
                                    next.projects[projectIndex].details.splice(detailIndex, 1);
                                  })
                                }
                              >
                                삭제
                              </button>
                            </div>
                            <div className="admin-fields">
                              <label className="admin-field">
                                <span>Title</span>
                                <input
                                  value={detail.title}
                                  onChange={(event) =>
                                    mutateDraft((next) => {
                                      next.projects[projectIndex].details[detailIndex].title = event.target.value;
                                    })
                                  }
                                />
                              </label>
                              <label className="admin-field admin-field--wide">
                                <span>Markdown body</span>
                                <textarea
                                  className="admin-textarea"
                                  value={detail.body}
                                  onChange={(event) =>
                                    mutateDraft((next) => {
                                      next.projects[projectIndex].details[detailIndex].body = event.target.value;
                                    })
                                  }
                                />
                              </label>
                              <div className="admin-markdown-preview admin-field--wide" aria-label="Markdown preview">
                                <div className="admin-markdown-preview__header">
                                  <span>Preview</span>
                                </div>
                                <MarkdownViewer markdown={detail.body} />
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      ) : null}
    </div>
  );
}
