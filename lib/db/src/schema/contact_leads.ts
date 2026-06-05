import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactLeadsTable = pgTable("contact_leads", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email"),
  telefone: text("telefone").notNull(),
  mensagem: text("mensagem").notNull(),
  tipo: text("tipo").default("contato"),
  origem: text("origem").default("site"),
  emailSent: boolean("email_sent").default(false),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContactLeadSchema = createInsertSchema(contactLeadsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertContactLead = z.infer<typeof insertContactLeadSchema>;
export type ContactLead = typeof contactLeadsTable.$inferSelect;
