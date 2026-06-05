import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default("pessoa_fisica"), // "pessoa_fisica" | "pessoa_juridica"
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  cpf: text("cpf").unique(),
  rg: text("rg"),
  cnpj: text("cnpj").unique(),
  companyName: text("company_name"),
  // Endereço
  cep: text("cep"),
  street: text("street"),
  number: text("number"),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  // Gov.br
  govBrId: text("gov_br_id"),
  govBrVerified: boolean("gov_br_verified").notNull().default(false),
  govBrVerifiedAt: timestamp("gov_br_verified_at"),
  // Misc
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClientSchema = createInsertSchema(clientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clientsTable.$inferSelect;
