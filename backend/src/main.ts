import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

function readAllowedOrigins(): string[] {
  return (process.env.PORTFOLIO_WEB_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: readAllowedOrigins(),
    },
  });

  const port = Number(process.env.PORT ?? 8000);
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
