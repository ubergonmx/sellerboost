import { drizzle, PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ExtractTablesWithRelations, sql } from "drizzle-orm";
import * as schema from "./schema";
import { PgTransaction } from "drizzle-orm/pg-core";
import { Txid } from "@tanstack/electric-db-collection";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

/**
 * Get the current transaction ID for Electric SQL sync.
 * Used to track mutations and ensure proper sync ordering.
 */
type Transaction = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

export const getTxId = async (tx: Transaction) : Promise<Txid> => {
  const result = await tx.execute<{ txid: number }>(
    sql`SELECT pg_current_xact_id()::xid::text::int as txid`
  );
  const txid = result[0].txid;

  if(txid === undefined) {
    throw new Error("Failed to get transaction ID");
  }

  return txid;
};
