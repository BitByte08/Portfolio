import { Body, Controller, Get, Headers, Post, Put } from "@nestjs/common";

import { assertAdminToken } from "./admin-auth.js";
import { PortfolioService } from "./portfolio.service.js";
import { ContactDto } from "./contact.dto.js";

@Controller()
export class AppController {
  private readonly portfolioService = new PortfolioService();

  @Get("/health")
  health(): { status: string } {
    return { status: "ok" };
  }

  @Get("/portfolio")
  portfolio() {
    return this.portfolioService.getPortfolio();
  }

  @Get("/admin/portfolio")
  adminPortfolio(@Headers("x-admin-token") token: string | undefined) {
    assertAdminToken(token);
    return this.portfolioService.getAdminPortfolio();
  }

  @Put("/admin/portfolio")
  updatePortfolio(@Headers("x-admin-token") token: string | undefined, @Body() payload: unknown) {
    assertAdminToken(token);
    return this.portfolioService.savePortfolio(payload);
  }

  @Post("/contact")
  contact(@Body() _payload: ContactDto): { status: string } {
    return { status: "received" };
  }
}
