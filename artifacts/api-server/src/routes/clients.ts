import { Router } from "express";
import { db } from "@workspace/db";
import { clientsTable } from "@workspace/db/schema";
import { eq, desc, ilike, or } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

// Lista todos os clientes
router.get("/admin/clients", requireAuth, async (_req: AuthRequest, res) => {
  try {
    const clients = await db
      .select()
      .from(clientsTable)
      .orderBy(desc(clientsTable.createdAt));
    res.json(clients);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// Busca cliente por ID
router.get("/admin/clients/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  try {
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, id));
    if (!client) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(client);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// Cria cliente
router.post("/admin/clients", requireAuth, async (req: AuthRequest, res) => {
  const { name, email, phone, cpf, rg, cnpj, companyName, type,
          cep, street, number, complement, neighborhood, city, state, notes } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
  try {
    const [created] = await db.insert(clientsTable).values({
      name, email, phone, cpf, rg, cnpj, companyName, type: type || "pessoa_fisica",
      cep, street, number, complement, neighborhood, city, state, notes,
    }).returning();
    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique")) return res.status(409).json({ error: "E-mail ou CPF/CNPJ já cadastrado" });
    res.status(500).json({ error: "Erro interno" });
  }
});

// Atualiza cliente
router.put("/admin/clients/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { name, email, phone, cpf, rg, cnpj, companyName, type,
          cep, street, number, complement, neighborhood, city, state, notes, active } = req.body;
  try {
    const [updated] = await db.update(clientsTable)
      .set({ name, email, phone, cpf, rg, cnpj, companyName, type,
             cep, street, number, complement, neighborhood, city, state, notes, active,
             updatedAt: new Date() })
      .where(eq(clientsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// Deleta cliente
router.delete("/admin/clients/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  try {
    await db.delete(clientsTable).where(eq(clientsTable.id, id));
    res.json({ message: "Cliente excluído" });
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// Verifica Gov.br (simulação — em produção integrar OAuth Gov.br)
router.patch("/admin/clients/:id/govbr-verify", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  try {
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, id));
    if (!client) return res.status(404).json({ error: "Cliente não encontrado" });
    if (!client.cpf) return res.status(400).json({ error: "CPF obrigatório para vincular Gov.br" });

    const [updated] = await db.update(clientsTable)
      .set({ govBrId: client.cpf, govBrVerified: true, govBrVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(clientsTable.id, id))
      .returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
