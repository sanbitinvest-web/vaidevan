import { pgTable, serial, text, timestamp, boolean, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const partnersTable = pgTable("partners", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default("investidor"), // "investidor" | "cliente" | "revendedor" | "motorista"
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  cpf: text("cpf"),
  cnpj: text("cnpj"),
  companyName: text("company_name"),
  city: text("city"),
  state: text("state"),
  message: text("message"),
  howFound: text("how_found"),
  status: text("status").notNull().default("novo"), // "novo" | "contatado" | "aprovado" | "recusado"
  active: boolean("active").notNull().default(true),
  // Documentos obrigatórios
  cnhUrl: text("cnh_url"),
  cnhStatus: text("cnh_status").notNull().default("pendente"),
  addressProofUrl: text("address_proof_url"),
  addressProofStatus: text("address_proof_status").notNull().default("pendente"),
  selfieUrl: text("selfie_url"),
  selfieStatus: text("selfie_status").notNull().default("pendente"),
  // Apenas para tipo parceiro/locatário
  crlvUrls: jsonb("crlv_urls").$type<string[]>(),
  contratoSocialUrl: text("contrato_social_url"),
  commercialRefs: jsonb("commercial_refs").$type<Array<{ name: string; phone: string; email: string }>>(),
  // ── Perfil KYC aprofundado ──────────────────────────────────────────────────
  occupation: text("occupation"),           // Profissão / cargo
  patrimony: text("patrimony"),             // Faixa: "ate_100k" | "100k_500k" | "500k_1m" | "acima_1m"
  sourceOfFunds: text("source_of_funds"),   // Origem: "renda_emprego" | "renda_empresa" | "investimentos" | "heranca" | "imoveis" | "outro"
  investmentIntent: text("investment_intent"), // O que pretende com o investimento (texto livre)
  competitorDeclaration: boolean("competitor_declaration").notNull().default(false), // Declara não ser concorrente
  // Auditoria de registro
  registrationIp: text("registration_ip"),
  registrationUserAgent: text("registration_user_agent"),
  registrationGeoLat: doublePrecision("registration_geo_lat"),
  registrationGeoLng: doublePrecision("registration_geo_lng"),
  registrationGeoAccuracy: doublePrecision("registration_geo_accuracy"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPartnerSchema = createInsertSchema(partnersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partnersTable.$inferSelect;
