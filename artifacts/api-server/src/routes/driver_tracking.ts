import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  driversTable, tripsTable, driverLocationsTable, vehiclesTable,
} from "@workspace/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import {
  requireAuth, requireDriverAuth, signDriverToken,
  AuthRequest,
} from "../middlewares/auth";

const router = Router();

// ─── Motorista: Login ──────────────────────────────────────────────────────────
router.post("/driver/login", async (req, res) => {
  const { phone, pin } = req.body;
  if (!phone || !pin) {
    res.status(400).json({ error: "Telefone e PIN obrigatórios" });
    return;
  }
  try {
    const normalized = phone.replace(/\D/g, "");
    const [driver] = await db
      .select()
      .from(driversTable)
      .where(eq(driversTable.phone, normalized))
      .limit(1);

    if (!driver || !driver.active) {
      res.status(401).json({ error: "Motorista não encontrado ou inativo" });
      return;
    }
    const valid = await bcrypt.compare(String(pin), driver.pinHash);
    if (!valid) {
      res.status(401).json({ error: "PIN incorreto" });
      return;
    }
    const token = signDriverToken(driver.id);
    res.json({
      token,
      driver: { id: driver.id, name: driver.name, phone: driver.phone, trackerUrl: driver.trackerUrl },
    });
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ─── Motorista: Meu perfil ─────────────────────────────────────────────────────
router.get("/driver/me", requireDriverAuth, async (req: AuthRequest, res) => {
  try {
    const [driver] = await db
      .select({ id: driversTable.id, name: driversTable.name, phone: driversTable.phone, trackerUrl: driversTable.trackerUrl })
      .from(driversTable)
      .where(eq(driversTable.id, req.driverId!))
      .limit(1);
    if (!driver) { res.status(404).json({ error: "Motorista não encontrado" }); return; }
    const [activeTrip] = await db
      .select()
      .from(tripsTable)
      .where(and(eq(tripsTable.driverId, req.driverId!), eq(tripsTable.status, "active")))
      .limit(1);
    res.json({ driver, activeTrip: activeTrip ?? null });
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ─── Motorista: Iniciar viagem ─────────────────────────────────────────────────
router.post("/driver/trip/start", requireDriverAuth, async (req: AuthRequest, res) => {
  const { vehiclePlate, vehicleModel, trackerUrl } = req.body;
  try {
    await db
      .update(tripsTable)
      .set({ status: "ended", endedAt: new Date() })
      .where(and(eq(tripsTable.driverId, req.driverId!), eq(tripsTable.status, "active")));

    const [trip] = await db
      .insert(tripsTable)
      .values({
        driverId: req.driverId!,
        vehiclePlate: vehiclePlate ?? null,
        vehicleModel: vehicleModel ?? null,
        trackerUrl: trackerUrl ?? null,
        status: "active",
      })
      .returning();
    res.status(201).json({ trip });
  } catch {
    res.status(500).json({ error: "Erro ao iniciar viagem" });
  }
});

// ─── Motorista: Encerrar viagem ────────────────────────────────────────────────
router.post("/driver/trip/end", requireDriverAuth, async (req: AuthRequest, res) => {
  try {
    const [trip] = await db
      .update(tripsTable)
      .set({ status: "ended", endedAt: new Date() })
      .where(and(eq(tripsTable.driverId, req.driverId!), eq(tripsTable.status, "active")))
      .returning();
    if (!trip) { res.status(404).json({ error: "Nenhuma viagem ativa" }); return; }
    res.json({ trip });
  } catch {
    res.status(500).json({ error: "Erro ao encerrar viagem" });
  }
});

// ─── Motorista: Enviar localização GPS ────────────────────────────────────────
router.post("/driver/location", requireDriverAuth, async (req: AuthRequest, res) => {
  const { tripId, lat, lng, accuracy, speed, heading } = req.body;
  if (!tripId || lat == null || lng == null) {
    res.status(400).json({ error: "tripId, lat e lng obrigatórios" });
    return;
  }
  try {
    const [loc] = await db
      .insert(driverLocationsTable)
      .values({
        tripId: Number(tripId),
        driverId: req.driverId!,
        lat: Number(lat),
        lng: Number(lng),
        accuracy: accuracy != null ? Number(accuracy) : null,
        speed: speed != null ? Number(speed) : null,
        heading: heading != null ? Number(heading) : null,
      })
      .returning();

    await db
      .update(vehiclesTable)
      .set({ lat: Number(lat), lng: Number(lng), lastUpdate: new Date() })
      .where(eq(vehiclesTable.plate, req.body.vehiclePlate ?? ""))
      .catch(() => null);

    res.json({ ok: true, locationId: loc.id });
  } catch {
    res.status(500).json({ error: "Erro ao salvar localização" });
  }
});

// ─── Motorista: Última localização de viagem ativa ────────────────────────────
router.get("/driver/location/latest", requireDriverAuth, async (req: AuthRequest, res) => {
  try {
    const [activeTrip] = await db
      .select()
      .from(tripsTable)
      .where(and(eq(tripsTable.driverId, req.driverId!), eq(tripsTable.status, "active")))
      .limit(1);
    if (!activeTrip) { res.json({ location: null, trip: null }); return; }

    const [latest] = await db
      .select()
      .from(driverLocationsTable)
      .where(eq(driverLocationsTable.tripId, activeTrip.id))
      .orderBy(desc(driverLocationsTable.timestamp))
      .limit(1);

    res.json({ location: latest ?? null, trip: activeTrip });
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ─── Admin: Listar motoristas ativos em tempo real ────────────────────────────
router.get("/admin/tracking/active", requireAuth, async (_req, res) => {
  try {
    const activeTrips = await db
      .select()
      .from(tripsTable)
      .where(eq(tripsTable.status, "active"))
      .orderBy(desc(tripsTable.startedAt));

    const result = await Promise.all(
      activeTrips.map(async (trip) => {
        const [driver] = await db
          .select({ id: driversTable.id, name: driversTable.name, phone: driversTable.phone })
          .from(driversTable)
          .where(eq(driversTable.id, trip.driverId))
          .limit(1);

        const [latest] = await db
          .select()
          .from(driverLocationsTable)
          .where(eq(driverLocationsTable.tripId, trip.id))
          .orderBy(desc(driverLocationsTable.timestamp))
          .limit(1);

        return { trip, driver: driver ?? null, lastLocation: latest ?? null };
      })
    );

    res.json(result);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ─── Admin: Histórico de localizações de uma viagem ───────────────────────────
router.get("/admin/tracking/trips/:tripId/locations", requireAuth, async (req, res) => {
  try {
    const locations = await db
      .select()
      .from(driverLocationsTable)
      .where(eq(driverLocationsTable.tripId, Number(req.params.tripId)))
      .orderBy(desc(driverLocationsTable.timestamp));
    res.json(locations);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ─── Admin: Listar motoristas ─────────────────────────────────────────────────
router.get("/admin/tracking/drivers", requireAuth, async (_req, res) => {
  try {
    const drivers = await db.select({
      id: driversTable.id,
      name: driversTable.name,
      phone: driversTable.phone,
      trackerUrl: driversTable.trackerUrl,
      status: driversTable.status,
      notes: driversTable.notes,
      active: driversTable.active,
      createdAt: driversTable.createdAt,
    }).from(driversTable).orderBy(desc(driversTable.createdAt));
    res.json(drivers);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ─── Admin: Criar motorista ───────────────────────────────────────────────────
router.post("/admin/tracking/drivers", requireAuth, async (req, res) => {
  const { name, phone, pin, trackerUrl, notes } = req.body;
  if (!name || !phone || !pin) {
    res.status(400).json({ error: "Nome, telefone e PIN obrigatórios" });
    return;
  }
  try {
    const pinHash = await bcrypt.hash(String(pin), 10);
    const normalized = String(phone).replace(/\D/g, "");
    const [driver] = await db
      .insert(driversTable)
      .values({ name, phone: normalized, pinHash, trackerUrl: trackerUrl ?? null, notes: notes ?? null })
      .returning();
    const { pinHash: _ph, ...safe } = driver;
    res.status(201).json(safe);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "Telefone já cadastrado" });
    } else {
      res.status(500).json({ error: "Erro ao criar motorista" });
    }
  }
});

// ─── Admin: Atualizar motorista ───────────────────────────────────────────────
router.put("/admin/tracking/drivers/:id", requireAuth, async (req, res) => {
  const { name, phone, pin, trackerUrl, notes, active } = req.body;
  try {
    const updates: Partial<typeof driversTable.$inferInsert> = {};
    if (name != null) updates.name = name;
    if (phone != null) updates.phone = String(phone).replace(/\D/g, "");
    if (trackerUrl !== undefined) updates.trackerUrl = trackerUrl ?? null;
    if (notes !== undefined) updates.notes = notes ?? null;
    if (active !== undefined) updates.active = Boolean(active);
    if (pin) updates.pinHash = await bcrypt.hash(String(pin), 10);
    updates.updatedAt = new Date();

    const [driver] = await db
      .update(driversTable)
      .set(updates)
      .where(eq(driversTable.id, Number(req.params.id)))
      .returning();
    if (!driver) { res.status(404).json({ error: "Motorista não encontrado" }); return; }
    const { pinHash: _ph, ...safe } = driver;
    res.json(safe);
  } catch {
    res.status(500).json({ error: "Erro ao atualizar motorista" });
  }
});

// ─── Admin: Remover motorista ─────────────────────────────────────────────────
router.delete("/admin/tracking/drivers/:id", requireAuth, async (req, res) => {
  try {
    await db.update(driversTable).set({ active: false }).where(eq(driversTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erro ao remover motorista" });
  }
});

// ─── Admin: Definir tracker URL de veículo ────────────────────────────────────
router.patch("/admin/tracking/vehicles/:id/tracker-url", requireAuth, async (req, res) => {
  const { trackerUrl } = req.body;
  try {
    const [v] = await db
      .update(vehiclesTable)
      .set({ trackerUrl: trackerUrl ?? null })
      .where(eq(vehiclesTable.id, Number(req.params.id)))
      .returning();
    if (!v) { res.status(404).json({ error: "Veículo não encontrado" }); return; }
    res.json(v);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
