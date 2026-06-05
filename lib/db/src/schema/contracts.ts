import { pgTable, serial, text, timestamp, integer, jsonb, doublePrecision, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { investorsTable } from "./investors";
import { clientsTable } from "./clients";
import { contractTemplatesTable } from "./contract_templates";

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investorsTable.id),
  clientId: integer("client_id").references(() => clientsTable.id),
  templateId: integer("template_id").references(() => contractTemplatesTable.id),
  title: text("title").notNull(),
  type: text("type").notNull().default("locacao"),
  // JSON com os dados preenchidos nos campos do template: { [key]: value }
  filledData: jsonb("filled_data").notNull().default("{}"),
  // HTML final gerado após preenchimento do template
  renderedHtml: text("rendered_html"),
  status: text("status").notNull().default("pending"), // "pending" | "sent" | "signed" | "expired" | "cancelled"
  pdfUrl: text("pdf_url"),
  govBrUrl: text("gov_br_url"),
  govBrProtocol: text("gov_br_protocol"),
  signedAt: timestamp("signed_at"),
  expiresAt: timestamp("expires_at"),
  // Localização em tempo real capturada no momento da assinatura
  signatureGeoLat: doublePrecision("signature_geo_lat"),
  signatureGeoLng: doublePrecision("signature_geo_lng"),
  signatureGeoAccuracy: doublePrecision("signature_geo_accuracy"),
  signatureGeoAddress: text("signature_geo_address"),
  // Dados de vistoria: checklist + metadados de fotos (lat/lng/timestamp por foto)
  vistoriaData: jsonb("vistoria_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("contracts_investor_id_idx").on(t.investorId),
]);

export const insertContractSchema = createInsertSchema(contractsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
