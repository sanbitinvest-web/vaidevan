import { pgTable, serial, text, timestamp, integer, doublePrecision, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { investorsTable } from "./investors";
import { operationsTable } from "./operations";

export const vehiclesTable = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investorsTable.id),
  operationId: integer("operation_id").references(() => operationsTable.id),
  plate: text("plate").notNull().unique(),
  model: text("model").notNull().default("Mercedes Sprinter"),
  year: text("year"),
  status: text("status").notNull().default("active"),
  lat: doublePrecision("lat").notNull().default(-23.5505),
  lng: doublePrecision("lng").notNull().default(-46.6333),
  lastUpdate: timestamp("last_update").notNull().defaultNow(),
  trackerUrl: text("tracker_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("vehicles_investor_id_idx").on(t.investorId),
]);

export const insertVehicleSchema = createInsertSchema(vehiclesTable).omit({ id: true, createdAt: true, lastUpdate: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehiclesTable.$inferSelect;
