import { pgTable, serial, text, timestamp, integer, doublePrecision, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vehicleListingsTable = pgTable("vehicle_listings", {
  id: serial("id").primaryKey(),

  // Identificação
  brand: text("brand").notNull(),          // Ex: Mercedes-Benz
  model: text("model").notNull(),          // Ex: Sprinter 415 CDI
  year: integer("year").notNull(),
  color: text("color").notNull(),
  plate: text("plate"),                    // Opcional — placa pode ser omitida

  // Técnico
  fuelType: text("fuel_type").notNull().default("diesel"),     // diesel | flex | elétrico | híbrido
  transmission: text("transmission").notNull().default("manual"), // manual | automático
  mileage: integer("mileage").notNull().default(0),            // km rodados
  passengerCapacity: integer("passenger_capacity"),             // capacidade de passageiros
  cargoCapacity: text("cargo_capacity"),                       // Ex: "1.5 toneladas"
  enginePower: text("engine_power"),                           // Ex: "150 cv"

  // Acessórios e benefícios
  accessories: jsonb("accessories").$type<string[]>().default([]),
  // Ex: ["Ar-condicionado", "Câmera de ré", "GPS", "Wi-Fi", "Tomadas USB"]
  benefits: jsonb("benefits").$type<string[]>().default([]),
  // Ex: ["Alta valorização", "Baixo custo de manutenção", "Retorno em 18 meses"]

  // Mídia
  photos: jsonb("photos").$type<string[]>().default([]),       // URLs das fotos
  coverPhoto: text("cover_photo"),                              // Foto principal (thumbnail)

  // Financeiro
  price: doublePrecision("price"),                             // Preço de venda
  priceNegotiable: boolean("price_negotiable").notNull().default(true),
  expectedReturnMonths: integer("expected_return_months"),     // Prazo de retorno estimado (meses)
  monthlyReturn: doublePrecision("monthly_return"),            // Retorno mensal estimado (R$)
  monthlyReturnPercent: doublePrecision("monthly_return_percent"), // % retorno mensal

  // Descrição
  description: text("description"),
  condition: text("condition").notNull().default("usado"),     // novo | seminovo | usado
  location: text("location"),                                  // Ex: "São Paulo, SP"

  // Status de venda
  status: text("status").notNull().default("disponivel"),
  // "disponivel" | "reservado" | "vendido" | "manutencao"

  // Destaque
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVehicleListingSchema = createInsertSchema(vehicleListingsTable)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVehicleListing = z.infer<typeof insertVehicleListingSchema>;
export type VehicleListing = typeof vehicleListingsTable.$inferSelect;
