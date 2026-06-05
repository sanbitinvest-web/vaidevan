import { pgTable, serial, text, timestamp, boolean, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const investorsTable = pgTable("investors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  cpf: text("cpf"),
  rg: text("rg"),
  nationality: text("nationality").default("Brasileira"),
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
  // Documentos obrigatórios
  cnhUrl: text("cnh_url"),
  cnhStatus: text("cnh_status").notNull().default("pendente"),
  addressProofUrl: text("address_proof_url"),
  addressProofStatus: text("address_proof_status").notNull().default("pendente"),
  // ── Gating de Aprovação ─────────────────────────────────────────────────────
  // "pending_kyc" → cadastro recebido, aguardando análise
  // "under_review" → em análise pela equipe VaideVan
  // "approved"     → aprovado, acesso liberado ao portal
  // "suspended"    → suspenso/recusado
  approvalStatus: text("approval_status").notNull().default("pending_kyc"),
  // Notas internas de KYC (jamais expostas ao investidor)
  kycNotes: text("kyc_notes"),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),       // nome/email de quem aprovou
  rejectedReason: text("rejected_reason"),
  // Vínculo com candidatura (tabela partners)
  partnerApplicationId: integer("partner_application_id"),
  // Auditoria de registro
  registrationIp: text("registration_ip"),
  registrationUserAgent: text("registration_user_agent"),
  // Status da conta
  active: boolean("active").notNull().default(true),
  // Preferências de e-mail (LGPD / CAN-SPAM)
  emailOptOut: boolean("email_opt_out").notNull().default(false),
  emailUnsubscribeToken: text("email_unsubscribe_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("investors_email_unsubscribe_token_idx").on(t.emailUnsubscribeToken),
]);

export const insertInvestorSchema = createInsertSchema(investorsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type Investor = typeof investorsTable.$inferSelect;
