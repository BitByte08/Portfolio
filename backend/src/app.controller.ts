import { Body, Controller, Get, Post, Put, Req } from "@nestjs/common";
import type { Request } from "express";

import { assertAdminAccess } from "./access-auth.js";
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
  async adminPortfolio(@Req() request: Request) {
    await assertAdminAccess(request.headers);
    return this.portfolioService.getAdminPortfolio();
  }

  @Put("/admin/portfolio")
  async updatePortfolio(@Req() request: Request, @Body() payload: unknown) {
    await assertAdminAccess(request.headers);
    return this.portfolioService.savePortfolio(payload);
  }

  @Post("/contact")
  contact(@Body() _payload: ContactDto): { status: string } {
    return { status: "received" };
  }
}
