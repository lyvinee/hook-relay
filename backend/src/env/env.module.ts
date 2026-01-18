import { DRIZZLE } from "@/database/database.module";
import { EnvDto, saneDefaults } from "@/env/dto/envDto";
import { validateSync } from "class-validator";
import { plainToClass } from "class-transformer";
import { Module } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

@Module({
  providers: [
    {
      provide: EnvDto,
      inject: [DRIZZLE],
      useFactory: async (db: NodePgDatabase<typeof schema>) => {
        try {
          const rows = await db.select().from(schema.appConfig);
          console.log("Rows from database", rows);
          const activeCfg = rows
            .filter((r) => r.isActive)
            .reduce(
              (acc, curr) => {
                acc[curr.key] = curr.value as string;
                return acc;
              },
              {} as Record<string, string>,
            );

          const finalCfg = Object.entries(saneDefaults).reduce(
            (acc, [key, defaultVal]) => {
              if (activeCfg[key]) {
                acc[key] = activeCfg[key];
              } else {
                acc[key] = defaultVal;
              }
              return acc;
            },
            {} as Record<string, any>,
          );

          if (Object.keys(finalCfg).length === 0) {
            console.warn("No active configs found in database.");
          }

          const parsed = plainToClass(EnvDto, finalCfg);
          const errors = validateSync(parsed);
          if (errors.length > 0) {
            console.error("Env validation errors:", errors);
            throw new Error("Env validation failed");
          }

          await db.insert(schema.appConfig)
            .values(
              Object.entries(parsed)
                .map(([key, value]) => ({ key, value: String(value), isActive: true })
                )
            ).onConflictDoNothing({ target: schema.appConfig.key });

          return parsed;

        } catch (error) {
          console.error("Error fetching env from database, exiting...", error);
          process.exit(1);
        }
      },
    },
  ],
  exports: [EnvDto],
})
export class EnvModule { }
