import { pgTable, serial, text, timestamp, integer, numeric, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { investorsTable } from "./investors";
import { operationsTable } from "./operations";

export const financialsTable = pgTable("financials", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investorsTable.id),
  operationId: integer("operation_id").references(() => operationsTable.id),
  type: text("type").notNull(), // "income" | "expense"
  category: text("category").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("financials_investor_id_idx").on(t.investorId),
  index("financials_investor_date_idx").on(t.investorId, t.date),
]);

export const insertFinancialSchema = createInsertSchema(financialsTable).omit({ id: true, createdAt: true });
export type InsertFinancial = z.infer<typeof insertFinancialSchema>;
export type Financial = typeof financialsTable.$inferSelect;
