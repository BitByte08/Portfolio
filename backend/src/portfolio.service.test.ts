import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { PortfolioService } from "./portfolio.service.js";

test("PortfolioService.getPortfolio reads the seeded sqlite document", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "portfolio-db-"));
  const dbPath = join(tempDir, "portfolio.sqlite");
  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_document (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const payload = {
    site: {
      name: "DB Seed Title",
      headline: "DB Headline",
      role: "Admin",
      location: "Seoul",
      summary: "From sqlite",
      phone: "010-0000-0000",
      school: "Seed School",
      email: "admin@example.com",
      education: {
        period: "2026.01. ~ 2026.12.",
        major: "Backend",
        school: "Seed School",
      },
      links: [],
    },
    intro: { contact: [], challenge: [] },
    techStack: [],
    awards: [],
    certificates: [],
    projects: [],
  };

  db.prepare(
    "INSERT INTO portfolio_document (id, payload, updated_at) VALUES (1, ?, ?)",
  ).run(JSON.stringify(payload), new Date("2026-07-02T00:00:00.000Z").toISOString());
  db.close();

  process.env.PORTFOLIO_DB_PATH = dbPath;

  const service = new PortfolioService();
  const portfolio = await service.getPortfolio();

  assert.equal(portfolio.site.name, "DB Seed Title");
});

test("PortfolioService.savePortfolio persists changes back to sqlite", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "portfolio-db-"));
  const dbPath = join(tempDir, "portfolio.sqlite");

  process.env.PORTFOLIO_DB_PATH = dbPath;

  const seedService = new PortfolioService();
  const saved = seedService.savePortfolio({
    site: {
      name: "Admin Saved Title",
      headline: "Admin Headline",
      role: "Admin",
      location: "Seoul",
      summary: "Updated from test",
      phone: "010-1111-2222",
      school: "Seed School",
      email: "admin@example.com",
      education: {
        period: "2026.01. ~ 2026.12.",
        major: "Backend",
        school: "Seed School",
      },
      links: [],
    },
    intro: { contact: [], challenge: [] },
    techStack: [],
    awards: [],
    certificates: [],
    projects: [],
  });

  assert.equal(saved.data.site.name, "Admin Saved Title");

  const reloadService = new PortfolioService();
  const portfolio = reloadService.getPortfolio();

  assert.equal(portfolio.site.name, "Admin Saved Title");
});
