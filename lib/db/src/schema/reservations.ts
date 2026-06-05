import { pgTable, serial, text, timestamp, boolean, integer, doublePrecision, jsonb } from "drizzle-orm/pg-core";

export const reservationsTable = pgTable("reservations", {
  id: serial("id").primaryKey(),

  // Contato
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  cpf: text("cpf"),

  // Veículo e viagem
  vehicleType: text("vehicle_type").notNull(),
  passengerCount: integer("passenger_count").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  departureTime: text("departure_time").notNull(),
  returnTime: text("return_time"),
  originAddress: text("origin_address").notNull(),
  destinationAddress: text("destination_address").notNull(),
  useAtDestination: boolean("use_at_destination").notNull().default(false),
  driveAtDestination: boolean("drive_at_destination").notNull().default(false),
  luggageInfo: text("luggage_info"),
  eventType: text("event_type"),
  priority: text("priority").notNull(),
  hasBudget: boolean("has_budget").notNull().default(false),
  budgetPhotoUrls: jsonb("budget_photo_urls").$type<string[]>(),
  coastalInfo: text("coastal_info"),
  notes: text("notes"),

  // Status
  status: text("status").notNull().default("novo"),
  adminNotes: text("admin_notes"),

  // Pagamento
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").notNull().default("pendente"),
  paymentAmount: doublePrecision("payment_amount"),

  // Stripe
  stripeSessionId: text("stripe_payment_intent_id"),
  stripeCheckoutUrl: text("stripe_checkout_url"),

  // Mercado Pago
  mpPreferenceId: text("mp_preference_id"),
  mpPaymentId: text("mp_payment_id"),
  mpCheckoutUrl: text("mp_checkout_url"),

  // InfinityPay
  ipayOrderNsu: text("ipay_order_nsu"),
  ipayCheckoutUrl: text("ipay_checkout_url"),

  // Antifraude
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  honeypot: text("honeypot"),

  // GPS
  geoLat: doublePrecision("geo_lat"),
  geoLng: doublePrecision("geo_lng"),
  geoAccuracy: doublePrecision("geo_accuracy"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Reservation = typeof reservationsTable.$inferSelect;
export type InsertReservation = typeof reservationsTable.$inferInsert;
