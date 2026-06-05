import { pgTable, serial, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { investorsTable } from "./investors";

export const operationsTable = pgTable("operations", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investorsTable.id),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  status: text("status").notNull().default("active"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
}, (t) => [
  index("operations_investor_id_idx").on(t.investorId),
]);

export const insertOperationSchema = createInsertSchema(operationsTable).omit({ id: true, startedAt: true });
export type InsertOperation = z.infer<typeof insertOperationSchema>;
export type Operation = typeof operationsTable.$inferSelect;
