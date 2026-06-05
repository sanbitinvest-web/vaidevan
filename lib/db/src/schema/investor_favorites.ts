import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { investorsTable } from "./investors";

export const investorFavoritesTable = pgTable("investor_favorites", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => investorsTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  lat: text("lat").notNull(),
  lon: text("lon").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  unique("investor_favorites_investor_id_label_unique").on(t.investorId, t.label),
]);

export type InvestorFavorite = typeof investorFavoritesTable.$inferSelect;
