import { Router } from "express";
import { db } from "@workspace/db";
import { vehicleListingsTable } from "@workspace/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { requireAuth, requireApproved, AuthRequest } from "../middlewares/auth";

const router = Router();

// ── Investidor: listar veículos disponíveis para compra/investimento ──────────
// Rota protegida — apenas investidores aprovados têm acesso ao catálogo
router.get("/investor/vehicle-listings", requireAuth, requireApproved, async (req, res) => {
  try {
    const listings = await db
      .select()
      .from(vehicleListingsTable)
      .orderBy(desc(vehicleListingsTable.featured), asc(vehicleListingsTable.sortOrder), desc(vehicleListingsTable.createdAt));
    res.json(listings);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao buscar catálogo de veículos." });
  }
});

// ── Admin: listar todos (incluindo vendidos/inativos) ─────────────────────────
router.get("/admin/vehicle-listings", requireAuth, async (req, res) => {
  try {
    const listings = await db
      .select()
      .from(vehicleListingsTable)
      .orderBy(desc(vehicleListingsTable.featured), asc(vehicleListingsTable.sortOrder), desc(vehicleListingsTable.createdAt));
    res.json(listings);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao buscar veículos." });
  }
});

// ── Admin: detalhe de um veículo ──────────────────────────────────────────────
router.get("/admin/vehicle-listings/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [listing] = await db
      .select()
      .from(vehicleListingsTable)
      .where(eq(vehicleListingsTable.id, id))
      .limit(1);
    if (!listing) { res.status(404).json({ error: "Veículo não encontrado." }); return; }
    res.json(listing);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao buscar veículo." });
  }
});

// ── Admin: criar veículo ──────────────────────────────────────────────────────
router.post("/admin/vehicle-listings", requireAuth, async (req: AuthRequest, res) => {
  const {
    brand, model, year, color, plate,
    fuelType, transmission, mileage, passengerCapacity, cargoCapacity, enginePower,
    accessories, benefits, photos, coverPhoto,
    price, priceNegotiable, expectedReturnMonths, monthlyReturn, monthlyReturnPercent,
    description, condition, location, status, featured, sortOrder,
  } = req.body;

  if (!brand?.trim() || !model?.trim() || !year || !color?.trim()) {
    res.status(400).json({ error: "Marca, modelo, ano e cor são obrigatórios." });
    return;
  }

  try {
    const [listing] = await db.insert(vehicleListingsTable).values({
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      color: color.trim(),
      plate: plate?.trim() || null,
      fuelType: fuelType || "diesel",
      transmission: transmission || "manual",
      mileage: Number(mileage) || 0,
      passengerCapacity: passengerCapacity ? Number(passengerCapacity) : null,
      cargoCapacity: cargoCapacity?.trim() || null,
      enginePower: enginePower?.trim() || null,
      accessories: Array.isArray(accessories) ? accessories : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      photos: Array.isArray(photos) ? photos : [],
      coverPhoto: coverPhoto?.trim() || null,
      price: price ? Number(price) : null,
      priceNegotiable: priceNegotiable !== false,
      expectedReturnMonths: expectedReturnMonths ? Number(expectedReturnMonths) : null,
      monthlyReturn: monthlyReturn ? Number(monthlyReturn) : null,
      monthlyReturnPercent: monthlyReturnPercent ? Number(monthlyReturnPercent) : null,
      description: description?.trim() || null,
      condition: condition || "usado",
      location: location?.trim() || null,
      status: status || "disponivel",
      featured: featured === true,
      sortOrder: Number(sortOrder) || 0,
    }).returning();
    res.status(201).json(listing);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao criar veículo." });
  }
});

// ── Admin: atualizar veículo ──────────────────────────────────────────────────
router.put("/admin/vehicle-listings/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const {
    brand, model, year, color, plate,
    fuelType, transmission, mileage, passengerCapacity, cargoCapacity, enginePower,
    accessories, benefits, photos, coverPhoto,
    price, priceNegotiable, expectedReturnMonths, monthlyReturn, monthlyReturnPercent,
    description, condition, location, status, featured, sortOrder,
  } = req.body;

  try {
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (brand !== undefined) patch.brand = brand.trim();
    if (model !== undefined) patch.model = model.trim();
    if (year !== undefined) patch.year = Number(year);
    if (color !== undefined) patch.color = color.trim();
    if (plate !== undefined) patch.plate = plate?.trim() || null;
    if (fuelType !== undefined) patch.fuelType = fuelType;
    if (transmission !== undefined) patch.transmission = transmission;
    if (mileage !== undefined) patch.mileage = Number(mileage);
    if (passengerCapacity !== undefined) patch.passengerCapacity = passengerCapacity ? Number(passengerCapacity) : null;
    if (cargoCapacity !== undefined) patch.cargoCapacity = cargoCapacity?.trim() || null;
    if (enginePower !== undefined) patch.enginePower = enginePower?.trim() || null;
    if (accessories !== undefined) patch.accessories = Array.isArray(accessories) ? accessories : [];
    if (benefits !== undefined) patch.benefits = Array.isArray(benefits) ? benefits : [];
    if (photos !== undefined) patch.photos = Array.isArray(photos) ? photos : [];
    if (coverPhoto !== undefined) patch.coverPhoto = coverPhoto?.trim() || null;
    if (price !== undefined) patch.price = price ? Number(price) : null;
    if (priceNegotiable !== undefined) patch.priceNegotiable = priceNegotiable;
    if (expectedReturnMonths !== undefined) patch.expectedReturnMonths = expectedReturnMonths ? Number(expectedReturnMonths) : null;
    if (monthlyReturn !== undefined) patch.monthlyReturn = monthlyReturn ? Number(monthlyReturn) : null;
    if (monthlyReturnPercent !== undefined) patch.monthlyReturnPercent = monthlyReturnPercent ? Number(monthlyReturnPercent) : null;
    if (description !== undefined) patch.description = description?.trim() || null;
    if (condition !== undefined) patch.condition = condition;
    if (location !== undefined) patch.location = location?.trim() || null;
    if (status !== undefined) patch.status = status;
    if (featured !== undefined) patch.featured = featured;
    if (sortOrder !== undefined) patch.sortOrder = Number(sortOrder);

    const [updated] = await db
      .update(vehicleListingsTable)
      .set(patch)
      .where(eq(vehicleListingsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Veículo não encontrado." }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao atualizar veículo." });
  }
});

// ── Admin: atualizar status (disponivel/reservado/vendido) ────────────────────
router.patch("/admin/vehicle-listings/:id/status", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const valid = ["disponivel", "reservado", "vendido", "manutencao"];
  if (!valid.includes(status)) {
    res.status(400).json({ error: "Status inválido." });
    return;
  }
  try {
    const [updated] = await db
      .update(vehicleListingsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(vehicleListingsTable.id, id))
      .returning({ id: vehicleListingsTable.id, status: vehicleListingsTable.status });
    if (!updated) { res.status(404).json({ error: "Veículo não encontrado." }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao atualizar status." });
  }
});

// ── Admin: deletar veículo ────────────────────────────────────────────────────
router.delete("/admin/vehicle-listings/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  try {
    await db.delete(vehicleListingsTable).where(eq(vehicleListingsTable.id, id));
    res.json({ message: "Veículo removido do catálogo." });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao remover veículo." });
  }
});

export default router;
