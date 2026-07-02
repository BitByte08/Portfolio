import portfolio from "@/content/portfolio.json";

export type PortfolioData = typeof portfolio;

export const portfolioData = portfolio satisfies PortfolioData;

export async function getPortfolioData(): Promise<PortfolioData> {
  const backendUrl = (process.env.PORTFOLIO_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

  try {
    const response = await fetch(`${backendUrl}/portfolio`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Portfolio backend responded with ${response.status}`);
    }

    return (await response.json()) as PortfolioData;
  } catch {
    return portfolioData;
  }
}
