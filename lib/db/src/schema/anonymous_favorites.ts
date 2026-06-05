import { pgTable, serial, text, timestamp, index, unique } from "drizzle-orm/pg-core";

export const anonymousFavoritesTable = pgTable("anonymous_favorites", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  label: text("label").notNull(),
  lat: text("lat").notNull(),
  lon: text("lon").notNull(),
  nickname: text("nickname"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("anonymous_favorites_token_idx").on(t.token),
  unique("anonymous_favorites_token_label_unique").on(t.token, t.label),
]);

export type AnonymousFavorite = typeof anonymousFavoritesTable.$inferSelect;
