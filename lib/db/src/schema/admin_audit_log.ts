import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const adminAuditLogTable = pgTable("admin_audit_log", {
  id: serial("id").primaryKey(),
  ip: text("ip").notNull(),
  userAgent: text("user_agent"),
  outcome: text("outcome").notNull(),
  totpVerified: boolean("totp_verified").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AdminAuditLog = typeof adminAuditLogTable.$inferSelect;
