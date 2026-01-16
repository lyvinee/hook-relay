import { Global, Module } from "@nestjs/common";
import "dotenv/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";
import { sql } from "drizzle-orm";

export const DRIZZLE = "DRIZZLE";

export type DbType = NodePgDatabase<typeof schema> & {
  $client: Pool;
};

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DRIZZLE,
      useFactory: async () => {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
          throw new Error("DATABASE_URL is not set");
        }

        const pool = new Pool({ connectionString: dbUrl });
        const d = drizzle(pool, { schema });

        console.log("Connecting to database...");
        await d.execute(sql`SELECT 1`);
        console.log("Connected to database");
        return d;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {
  constructor() {}
}
