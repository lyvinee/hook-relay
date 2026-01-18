import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as fs from "fs";
import * as path from "path";

async function generateOpenApi() {
    try {
        const app = await NestFactory.create(AppModule, { logger: ['error'] });

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

        const document = SwaggerModule.createDocument(app, doc);
        // @ts-ignore
        document.openapi = "3.1.0";

        // We'll write to a standard location that the mcp-server can pick up, 
        // or just locally in backend for now and the Makefile can move it.
        // The plan said "Writes to ../mcp-server/openapi.json"

        const frontEndPath = path.resolve(__dirname, "../../frontend");
        const openApiPath = path.join(frontEndPath, "openapi.json");

        // Ensure directory exists
        if (!fs.existsSync(path.dirname(openApiPath))) {
            fs.mkdirSync(path.dirname(openApiPath), { recursive: true });
        }

        fs.writeFileSync(openApiPath, JSON.stringify(document, null, 2));
        console.log(`OpenAPI spec generated at ${openApiPath}`);

        await app.close();
        process.exit(0);
    } catch (error) {
        console.error("Error generating OpenAPI spec:", error);
        process.exit(1);
    }
}

generateOpenApi();
