import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { Injectable } from "@nestjs/common";

import { parsePortfolioData, type PortfolioData, type PortfolioDocument } from "./portfolio.types.js";

type PortfolioRow = {
  payload: string;
  updated_at: string;
};

const DEFAULT_DB_PATH = join(process.cwd(), "data", "portfolio.sqlite");
const SCHEMA_PATH = join(process.cwd(), "data", "schema.sql");
const SEED_PATH = join(process.cwd(), "..", "content", "portfolio.json");

@Injectable()
export class PortfolioService {
  private readonly db: DatabaseSync;

  constructor() {
    const dbPath = process.env.PORTFOLIO_DB_PATH ?? DEFAULT_DB_PATH;
    mkdirSync(join(process.cwd(), "data"), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec(readFileSync(SCHEMA_PATH, "utf8"));
    this.seedIfNeeded();
  }

  getPortfolio(): PortfolioData {
    return this.getPortfolioDocument().data;
  }

  getAdminPortfolio(): PortfolioDocument {
    return this.getPortfolioDocument();
  }

  savePortfolio(payload: unknown): PortfolioDocument {
    const data = parsePortfolioData(payload);
    return this.writePortfolioDocument(data);
  }

  private seedIfNeeded(): void {
    const row = this.db.prepare("SELECT payload FROM portfolio_document WHERE id = 1").get() as PortfolioRow | undefined;

    if (row !== undefined) {
      return;
    }

    this.writePortfolioDocument(parsePortfolioData(JSON.parse(readFileSync(SEED_PATH, "utf8"))));
  }

  private getPortfolioDocument(): PortfolioDocument {
    const row = this.db.prepare("SELECT payload, updated_at FROM portfolio_document WHERE id = 1").get() as
      | PortfolioRow
      | undefined;

    if (row === undefined) {
      throw new Error("Portfolio document is missing from the database");
    }

    try {
      return {
        data: parsePortfolioData(JSON.parse(row.payload)),
        updatedAt: row.updated_at,
      };
    } catch {
      const repaired = parsePortfolioData(JSON.parse(readFileSync(SEED_PATH, "utf8")));
      return this.writePortfolioDocument(repaired);
    }
  }

  private writePortfolioDocument(data: PortfolioData): PortfolioDocument {
    const updatedAt = new Date().toISOString();
    this.db
      .prepare(
        `
        INSERT INTO portfolio_document (id, payload, updated_at)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          payload = excluded.payload,
          updated_at = excluded.updated_at
      `,
      )
      .run(JSON.stringify(data), updatedAt);

    return { data, updatedAt };
  }
}
