import { pgTable, serial, text, timestamp, boolean, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const driversTable = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  pinHash: text("pin_hash").notNull(),
  trackerUrl: text("tracker_url"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tripsTable = pgTable("trips", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => driversTable.id),
  vehiclePlate: text("vehicle_plate"),
  vehicleModel: text("vehicle_model"),
  trackerUrl: text("tracker_url"),
  status: text("status").notNull().default("active"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const driverLocationsTable = pgTable("driver_locations", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => tripsTable.id),
  driverId: integer("driver_id").notNull().references(() => driversTable.id),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  accuracy: doublePrecision("accuracy"),
  speed: doublePrecision("speed"),
  heading: doublePrecision("heading"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertDriverSchema = createInsertSchema(driversTable).omit({ id: true, createdAt: true, updatedAt: true, pinHash: true });
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof driversTable.$inferSelect;
export type Trip = typeof tripsTable.$inferSelect;
export type DriverLocation = typeof driverLocationsTable.$inferSelect;
