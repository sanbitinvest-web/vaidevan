import { pgTable, serial, text, timestamp, boolean, bigint } from "drizzle-orm/pg-core";

export const webauthnCredentialsTable = pgTable("webauthn_credentials", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userType: text("user_type").notNull(),
  userName: text("user_name").notNull(),
  credentialId: text("credential_id").notNull(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: bigint("counter", { mode: "number" }).notNull().default(0),
  credentialDeviceType: text("credential_device_type"),
  credentialBackedUp: boolean("credential_backed_up").default(false),
  transports: text("transports").default("[]"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

export type WebauthnCredential = typeof webauthnCredentialsTable.$inferSelect;
