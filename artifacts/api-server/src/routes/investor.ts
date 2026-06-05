import { Router } from "express";
import { db } from "@workspace/db";
import {
  investorsTable, operationsTable, vehiclesTable,
  financialsTable, contractsTable, clientsTable, contractTemplatesTable,
  investmentSimulationsTable, investorFavoritesTable,
} from "@workspace/db/schema";
import { eq, and, desc, count, sum, sql, gte } from "drizzle-orm";
import { requireAuth, requireApproved, AuthRequest } from "../middlewares/auth";

const router = Router();

// Middleware combinado: autenticado + aprovado
// Aplicado em todas as rotas de dados sensíveis
const authAndApproved = [requireAuth, requireApproved];

// ───── Dashboard Unificado (1 round-trip, SQL agregado) ─────
router.get("/investor/dashboard", ...authAndApproved, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      [{ total: opsCount }],
      vehicleRows,
      [incomeRow, expenseRow],
      monthlyRows,
      contracts,
      [investor],
    ] = await Promise.all([
      // COUNT de operações
      db.select({ total: count() }).from(operationsTable)
        .where(eq(operationsTable.investorId, investorId)),

      // COUNT veículos por status
      db.select({ status: vehiclesTable.status, total: count() })
        .from(vehiclesTable)
        .where(eq(vehiclesTable.investorId, investorId))
        .groupBy(vehiclesTable.status),

      // SUM receita e despesa (2 linhas)
      db.select({ type: financialsTable.type, total: sum(financialsTable.amount) })
        .from(financialsTable)
        .where(eq(financialsTable.investorId, investorId))
        .groupBy(financialsTable.type)
        .orderBy(financialsTable.type),

      // Mensal — últimos 6 meses com GROUP BY no BD
      db.select({
        month: sql<string>`to_char("date", 'YYYY-MM')`,
        type: financialsTable.type,
        total: sum(financialsTable.amount),
      })
        .from(financialsTable)
        .where(and(
          eq(financialsTable.investorId, investorId),
          gte(financialsTable.date, sixMonthsAgo),
        ))
        .groupBy(sql`to_char("date", 'YYYY-MM')`, financialsTable.type)
        .orderBy(sql`to_char("date", 'YYYY-MM')`),

      // Contratos (resumo leve, sem renderedHtml)
      db.select({
        id: contractsTable.id,
        title: contractsTable.title,
        status: contractsTable.status,
        createdAt: contractsTable.createdAt,
      })
        .from(contractsTable)
        .where(eq(contractsTable.investorId, investorId))
        .orderBy(desc(contractsTable.createdAt))
        .limit(20),

      // Perfil do investidor
      db.select().from(investorsTable).where(eq(investorsTable.id, investorId)).limit(1),
    ]);

    // Totais financeiros
    const totalIncome  = Number((incomeRow?.type  === "income"  ? incomeRow.total  : expenseRow?.type === "income"  ? expenseRow.total  : null) ?? 0);
    const totalExpense = Number((expenseRow?.type === "expense" ? expenseRow.total : incomeRow?.type  === "expense" ? incomeRow.total   : null) ?? 0);

    // Veículos
    const totalVehicles  = vehicleRows.reduce((s, r) => s + Number(r.total), 0);
    const activeVehicles = Number(vehicleRows.find(r => r.status === "active")?.total ?? 0);

    // Mensal → objeto
    const monthly: Record<string, { income: number; expense: number }> = {};
    for (const r of monthlyRows) {
      if (!monthly[r.month]) monthly[r.month] = { income: 0, expense: 0 };
      if (r.type === "income")  monthly[r.month].income  = Number(r.total ?? 0);
      else                       monthly[r.month].expense = Number(r.total ?? 0);
    }

    const { passwordHash: _ph, kycNotes: _kn, ...profile } = investor ?? {};

    res.json({
      overview: {
        operations:       Number(opsCount),
        vehicles:         totalVehicles,
        activeVehicles,
        totalIncome,
        totalExpense,
        netResult:        totalIncome - totalExpense,
        pendingContracts: contracts.filter(c => c.status === "pending").length,
      },
      monthly,
      contracts,
      profile,
    });
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ───── Visão Geral ─────
router.get("/investor/overview", ...authAndApproved, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  try {
    const [operations, vehicles, financials, contracts] = await Promise.all([
      db.select().from(operationsTable).where(eq(operationsTable.investorId, investorId)),
      db.select().from(vehiclesTable).where(eq(vehiclesTable.investorId, investorId)),
      db.select().from(financialsTable).where(eq(financialsTable.investorId, investorId)),
      db.select().from(contractsTable).where(eq(contractsTable.investorId, investorId)),
    ]);
    const totalIncome = financials.filter(f => f.type === "income").reduce((s, f) => s + Number(f.amount), 0);
    const totalExpense = financials.filter(f => f.type === "expense").reduce((s, f) => s + Number(f.amount), 0);
    res.json({
      operations: operations.length,
      vehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === "active").length,
      totalIncome, totalExpense,
      netResult: totalIncome - totalExpense,
      pendingContracts: contracts.filter(c => c.status === "pending").length,
    });
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ───── Financeiro ─────
router.get("/investor/financials", ...authAndApproved, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  try {
    const records = await db.select().from(financialsTable)
      .where(eq(financialsTable.investorId, investorId))
      .orderBy(desc(financialsTable.date)).limit(100);
    const byCategory: Record<string, { income: number; expense: number }> = {};
    const monthly: Record<string, { income: number; expense: number }> = {};
    for (const r of records) {
      if (!byCategory[r.category]) byCategory[r.category] = { income: 0, expense: 0 };
      if (!monthly[new Date(r.date).toISOString().slice(0, 7)])
        monthly[new Date(r.date).toISOString().slice(0, 7)] = { income: 0, expense: 0 };
      const mk = new Date(r.date).toISOString().slice(0, 7);
      if (r.type === "income") { byCategory[r.category].income += Number(r.amount); monthly[mk].income += Number(r.amount); }
      else { byCategory[r.category].expense += Number(r.amount); monthly[mk].expense += Number(r.amount); }
    }
    res.json({ records, byCategory, monthly });
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ───── Veículos ─────
router.get("/investor/vehicles", ...authAndApproved, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  try {
    const vehicles = await db.select().from(vehiclesTable).where(eq(vehiclesTable.investorId, investorId));
    res.json(vehicles);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ───── Contratos ─────
router.get("/investor/contracts", ...authAndApproved, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  try {
    const contracts = await db.select({
      id: contractsTable.id,
      title: contractsTable.title,
      type: contractsTable.type,
      status: contractsTable.status,
      pdfUrl: contractsTable.pdfUrl,
      govBrUrl: contractsTable.govBrUrl,
      govBrProtocol: contractsTable.govBrProtocol,
      signedAt: contractsTable.signedAt,
      expiresAt: contractsTable.expiresAt,
      createdAt: contractsTable.createdAt,
      filledData: contractsTable.filledData,
      clientId: contractsTable.clientId,
      templateId: contractsTable.templateId,
      clientName: clientsTable.name,
      clientEmail: clientsTable.email,
      clientCpf: clientsTable.cpf,
      clientGovBrVerified: clientsTable.govBrVerified,
    })
      .from(contractsTable)
      .leftJoin(clientsTable, eq(contractsTable.clientId, clientsTable.id))
      .where(eq(contractsTable.investorId, investorId))
      .orderBy(desc(contractsTable.createdAt));
    res.json(contracts);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/investor/contracts", ...authAndApproved, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  const { templateId, clientId, title, filledData, expiresAt, vistoriaData } = req.body;
  if (!title) return res.status(400).json({ error: "Título obrigatório" });
  try {
    let renderedHtml: string | undefined;
    let type = "locacao";

    if (templateId) {
      const [tpl] = await db.select().from(contractTemplatesTable).where(eq(contractTemplatesTable.id, Number(templateId)));
      if (tpl) {
        type = tpl.type;
        let html = tpl.body;
        const data = filledData || {};
        for (const [key, val] of Object.entries(data)) {
          html = html.replaceAll(`{{${key}}}`, String(val));
        }
        if (investorId) {
          const [inv] = await db.select().from(investorsTable).where(eq(investorsTable.id, investorId));
          if (inv) {
            html = html.replaceAll("{{investidor_nome}}", inv.name || "")
              .replaceAll("{{investidor_email}}", inv.email || "")
              .replaceAll("{{investidor_cpf}}", inv.cpf || "")
              .replaceAll("{{investidor_cidade}}", inv.city || "")
              .replaceAll("{{investidor_estado}}", inv.state || "");
          }
        }
        if (clientId) {
          const [cli] = await db.select().from(clientsTable).where(eq(clientsTable.id, Number(clientId)));
          if (cli) {
            html = html.replaceAll("{{cliente_nome}}", cli.name || "")
              .replaceAll("{{cliente_email}}", cli.email || "")
              .replaceAll("{{cliente_cpf}}", cli.cpf || "")
              .replaceAll("{{cliente_cidade}}", cli.city || "")
              .replaceAll("{{cliente_estado}}", cli.state || "");
          }
        }
        renderedHtml = html;
      }
    }

    const [contract] = await db.insert(contractsTable).values({
      investorId,
      clientId: clientId ? Number(clientId) : undefined,
      templateId: templateId ? Number(templateId) : undefined,
      title,
      type,
      filledData: filledData || {},
      renderedHtml,
      status: "pending",
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      vistoriaData: vistoriaData || null,
    }).returning();
    res.status(201).json(contract);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.patch("/investor/contracts/:id/sign", ...authAndApproved, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  const contractId = Number(req.params.id);
  const { geoLat, geoLng, geoAccuracy } = req.body;
  try {
    const protocol = `GOVBR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const [updated] = await db.update(contractsTable)
      .set({
        status: "signed",
        signedAt: new Date(),
        govBrProtocol: protocol,
        signatureGeoLat: geoLat ? Number(geoLat) : null,
        signatureGeoLng: geoLng ? Number(geoLng) : null,
        signatureGeoAccuracy: geoAccuracy ? Number(geoAccuracy) : null,
        updatedAt: new Date(),
      })
      .where(and(eq(contractsTable.id, contractId), eq(contractsTable.investorId, investorId)))
      .returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.patch("/investor/contracts/:id/cancel", ...authAndApproved, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  const contractId = Number(req.params.id);
  try {
    const [updated] = await db.update(contractsTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(and(eq(contractsTable.id, contractId), eq(contractsTable.investorId, investorId)))
      .returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ───── Perfil do Investidor ─────
// NOTA: perfil acessível mesmo para pending_kyc / under_review
// para que o investidor possa acompanhar sua situação
router.get("/investor/profile", requireAuth, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  try {
    const [inv] = await db.select().from(investorsTable).where(eq(investorsTable.id, investorId));
    if (!inv) return res.status(404).json({ error: "Não encontrado" });
    const { passwordHash: _, kycNotes: __, ...profile } = inv;
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.put("/investor/profile", requireAuth, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  const { name, phone, cpf, rg, nationality, cep, street, number, complement, neighborhood, city, state } = req.body;
  try {
    const [updated] = await db.update(investorsTable)
      .set({ name, phone, cpf, rg, nationality, cep, street, number, complement, neighborhood, city, state, updatedAt: new Date() })
      .where(eq(investorsTable.id, investorId))
      .returning();
    const { passwordHash: _, kycNotes: __, ...profile } = updated;
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.patch("/investor/profile/govbr-verify", requireAuth, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  try {
    const [inv] = await db.select().from(investorsTable).where(eq(investorsTable.id, investorId));
    if (!inv) return res.status(404).json({ error: "Não encontrado" });
    if (!inv.cpf) return res.status(400).json({ error: "CPF obrigatório para vincular Gov.br" });
    const [updated] = await db.update(investorsTable)
      .set({ govBrId: inv.cpf, govBrVerified: true, govBrVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(investorsTable.id, investorId))
      .returning();
    const { passwordHash: _, kycNotes: __, ...profile } = updated;
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.patch("/investor/documents", requireAuth, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  const { cnhUrl, addressProofUrl } = req.body;
  try {
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (cnhUrl !== undefined) { patch.cnhUrl = cnhUrl || null; patch.cnhStatus = "pendente"; }
    if (addressProofUrl !== undefined) { patch.addressProofUrl = addressProofUrl || null; patch.addressProofStatus = "pendente"; }
    const [updated] = await db.update(investorsTable).set(patch).where(eq(investorsTable.id, investorId)).returning();
    const { passwordHash: _, kycNotes: __, ...profile } = updated;
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ───── Simulações de Investimento ─────
router.post("/investor/simulations", requireAuth, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  const {
    modality, modalityLabel, investmentAmount, months,
    pessimistReturn, realistReturn, optimistReturn,
    pessimistYield, realistYield, optimistYield,
    breakEvenMonthPessimist, breakEvenMonthRealist, breakEvenMonthOptimist,
  } = req.body;

  if (!modality || !investmentAmount || !months) {
    return res.status(400).json({ error: "modality, investmentAmount, months são obrigatórios" });
  }

  try {
    const [sim] = await db.insert(investmentSimulationsTable).values({
      investorId,
      modality,
      modalityLabel: modalityLabel || null,
      investmentAmount: String(investmentAmount),
      months: Number(months),
      pessimistReturn: pessimistReturn != null ? String(pessimistReturn) : null,
      realistReturn: realistReturn != null ? String(realistReturn) : null,
      optimistReturn: optimistReturn != null ? String(optimistReturn) : null,
      pessimistYield: pessimistYield != null ? String(pessimistYield) : null,
      realistYield: realistYield != null ? String(realistYield) : null,
      optimistYield: optimistYield != null ? String(optimistYield) : null,
      breakEvenMonthPessimist: breakEvenMonthPessimist || null,
      breakEvenMonthRealist: breakEvenMonthRealist || null,
      breakEvenMonthOptimist: breakEvenMonthOptimist || null,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || null,
    }).returning();

    // Enviar e-mail de notificação (não bloqueia resposta)
    try {
      const { sendSimulationEmail } = await import("../lib/mailer");
      const [inv] = await db.select().from(investorsTable).where(eq(investorsTable.id, investorId));
      if (inv) {
        sendSimulationEmail({
          investorName: inv.name || "Investidor",
          investorEmail: inv.email || undefined,
          modality: modalityLabel || modality,
          amount: Number(investmentAmount),
          months: Number(months),
          realistReturn: Number(realistReturn) || Number(investmentAmount),
          breakEven: breakEvenMonthRealist || null,
        }).catch((e: Error) => req.log?.warn({ err: e.message }, "Email simulação não enviado"));
      }
    } catch (mailErr) {
      req.log?.warn({ err: mailErr }, "Email simulação não enviado");
    }

    res.status(201).json(sim);
  } catch (err) {
    req.log?.error(err, "Erro ao salvar simulação");
    res.status(500).json({ error: "Erro interno" });
  }
});

// ───── Endereços Favoritos ─────
router.get("/investor/favorites", requireAuth, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  try {
    const favorites = await db.select()
      .from(investorFavoritesTable)
      .where(eq(investorFavoritesTable.investorId, investorId))
      .orderBy(desc(investorFavoritesTable.createdAt));
    res.json(favorites.map(f => ({ id: f.id, label: f.label, lat: f.lat, lon: f.lon })));
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/investor/favorites", requireAuth, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  const { label, lat, lon } = req.body;
  if (!label || !lat || !lon) {
    return res.status(400).json({ error: "label, lat e lon são obrigatórios" });
  }
  try {
    const existing = await db.select({ id: investorFavoritesTable.id })
      .from(investorFavoritesTable)
      .where(and(
        eq(investorFavoritesTable.investorId, investorId),
        eq(investorFavoritesTable.label, String(label)),
      ))
      .limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Favorito já existe" });
    }
    const [fav] = await db.insert(investorFavoritesTable).values({
      investorId,
      label: String(label),
      lat: String(lat),
      lon: String(lon),
    }).returning();
    res.status(201).json({ id: fav.id, label: fav.label, lat: fav.lat, lon: fav.lon });
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.delete("/investor/favorites/:label", requireAuth, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  const label = String(req.params.label);
  try {
    await db.delete(investorFavoritesTable)
      .where(and(
        eq(investorFavoritesTable.investorId, investorId),
        eq(investorFavoritesTable.label, label),
      ));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/investor/simulations", ...authAndApproved, async (req: AuthRequest, res) => {
  const investorId = req.investorId!;
  try {
    const sims = await db.select()
      .from(investmentSimulationsTable)
      .where(eq(investmentSimulationsTable.investorId, investorId))
      .orderBy(desc(investmentSimulationsTable.createdAt))
      .limit(50);
    res.json(sims);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
