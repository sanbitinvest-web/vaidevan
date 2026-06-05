import { pgTable, serial, text, timestamp, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { investorsTable } from "./investors";

export const investmentSimulationsTable = pgTable("investment_simulations", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").references(() => investorsTable.id),
  sessionId: text("session_id"),
  modality: text("modality").notNull(),
  modalityLabel: text("modality_label"),
  investmentAmount: numeric("investment_amount", { precision: 14, scale: 2 }).notNull(),
  months: integer("months").notNull(),
  pessimistReturn: numeric("pessimist_return", { precision: 14, scale: 2 }),
  realistReturn: numeric("realist_return", { precision: 14, scale: 2 }),
  optimistReturn: numeric("optimist_return", { precision: 14, scale: 2 }),
  pessimistYield: numeric("pessimist_yield", { precision: 8, scale: 4 }),
  realistYield: numeric("realist_yield", { precision: 8, scale: 4 }),
  optimistYield: numeric("optimist_yield", { precision: 8, scale: 4 }),
  breakEvenMonthPessimist: integer("break_even_month_pessimist"),
  breakEvenMonthRealist: integer("break_even_month_realist"),
  breakEvenMonthOptimist: integer("break_even_month_optimist"),
  monthlyProjection: jsonb("monthly_projection"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInvestmentSimulationSchema = createInsertSchema(investmentSimulationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertInvestmentSimulation = z.infer<typeof insertInvestmentSimulationSchema>;
export type InvestmentSimulation = typeof investmentSimulationsTable.$inferSelect;
