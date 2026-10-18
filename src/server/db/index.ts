import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED;

if (!connectionString) {
  throw new Error("DATABASE_URL or DATABASE_URL_POOLED environment variable is missing.");
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

