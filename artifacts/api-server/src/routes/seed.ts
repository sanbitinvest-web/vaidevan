import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  investorsTable,
  operationsTable,
  vehiclesTable,
  financialsTable,
  contractsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/seed", async (_req, res) => {
  try {
    const hash = await bcrypt.hash("vaidevan123", 10);

    // Try inserting the demo investor; if already exists, update approval status
    const existing = await db
      .select({ id: investorsTable.id, approvalStatus: investorsTable.approvalStatus })
      .from(investorsTable)
      .where(eq(investorsTable.email, "investidor@vaidevan.com"))
      .limit(1);

    if (existing.length > 0) {
      res.json({ message: "Seed já executado anteriormente.", investorEmail: "investidor@vaidevan.com", password: "vaidevan123" });
      return;
    }

    const [inv] = await db
      .insert(investorsTable)
      .values({
        name: "João Silva",
        email: "investidor@vaidevan.com",
        passwordHash: hash,
        phone: "+5511999294694",
        cpf: "123.456.789-00",
        active: true,
        approvalStatus: "approved",
        approvedAt: new Date(),
        approvedBy: "sistema",
      })
      .returning();

    if (!inv) {
      res.json({ message: "Seed já executado anteriormente." });
      return;
    }

    const [op1] = await db
      .insert(operationsTable)
      .values({ investorId: inv.id, name: "Operação SP Norte", city: "São Paulo", state: "SP", status: "active" })
      .returning();

    const [op2] = await db
      .insert(operationsTable)
      .values({ investorId: inv.id, name: "Operação Campinas", city: "Campinas", state: "SP", status: "active" })
      .returning();

    await db.insert(vehiclesTable).values([
      { investorId: inv.id, operationId: op1.id, plate: "ABC-1234", model: "Mercedes Sprinter 415", year: "2022", status: "active", lat: -23.5505, lng: -46.6333 },
      { investorId: inv.id, operationId: op1.id, plate: "DEF-5678", model: "Mercedes Sprinter 415", year: "2023", status: "active", lat: -23.5481, lng: -46.6418 },
      { investorId: inv.id, operationId: op2.id, plate: "GHI-9012", model: "Mercedes Sprinter 516", year: "2023", status: "active", lat: -22.9056, lng: -47.0608 },
    ]);

    const now = new Date();
    const months = [-5, -4, -3, -2, -1, 0].map(m => {
      const d = new Date(now);
      d.setMonth(d.getMonth() + m);
      return d;
    });

    for (const m of months) {
      await db.insert(financialsTable).values([
        { investorId: inv.id, operationId: op1.id, type: "income", category: "Fretamento", description: "Receita mensal fretamento", amount: "12500.00", date: m },
        { investorId: inv.id, operationId: op1.id, type: "income", category: "Traslado Aeroporto", description: "Receita traslados", amount: "4200.00", date: m },
        { investorId: inv.id, operationId: op1.id, type: "expense", category: "Combustível", description: "Abastecimento mensal", amount: "3100.00", date: m },
        { investorId: inv.id, operationId: op1.id, type: "expense", category: "Manutenção", description: "Revisão preventiva", amount: "800.00", date: m },
        { investorId: inv.id, operationId: op2.id, type: "income", category: "Transfer Corporativo", description: "Contratos corporativos", amount: "9800.00", date: m },
        { investorId: inv.id, operationId: op2.id, type: "expense", category: "Motorista", description: "Salário motorista", amount: "3500.00", date: m },
        { investorId: inv.id, operationId: op2.id, type: "expense", category: "Seguro", description: "Seguro frota", amount: "650.00", date: m },
      ]);
    }

    await db.insert(contractsTable).values([
      {
        investorId: inv.id,
        title: "Contrato de Locação de Van — Operação SP Norte",
        type: "locacao",
        status: "pending",
        pdfUrl: "/contratos/contrato-locacao-sp-norte.pdf",
      },
      {
        investorId: inv.id,
        title: "Aditivo Contratual — Ampliação de Frota",
        type: "aditivo",
        status: "pending",
        pdfUrl: "/contratos/aditivo-ampliacao.pdf",
      },
    ]);

    res.json({ message: "Seed executado com sucesso!", investorEmail: "investidor@vaidevan.com", password: "vaidevan123" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no seed", details: String(err) });
  }
});

export default router;
