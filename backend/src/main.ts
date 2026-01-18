import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { EnvDto } from "@/env/dto/envDto";

import { ValidationPipe } from "@nestjs/common";


import { HttpExceptionFilter } from "@/common/filters/http-exception.filter";

import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const doc = new DocumentBuilder()
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      "access-token",
    )
    .addSecurityRequirements("access-token")
    .setTitle("Hook Relay API")
    .setDescription("Hook Relay API")
    .setVersion("1.0")
    .addTag("Clients")
    .addTag("Webhooks")
    .addTag("Webhook Events")
    .build();

  const docFactory = SwaggerModule.createDocument(app, doc);
  // @ts-ignore
  docFactory.openapi = "3.1.0";

  const env = app.get(EnvDto);
  const port = env.PORT;
  const mode = env.NODE_ENV;

  if (mode === "development") {
    SwaggerModule.setup("swagger", app, docFactory, {
      jsonDocumentUrl: "swagger/json",
    });
  }

  console.log(`Configuration loaded, listening on port ${port}`);
  console.debug(env);

  await app.listen(port);
}

bootstrap();
