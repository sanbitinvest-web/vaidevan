import { Router } from "express";
import { db } from "@workspace/db";
import { contractTemplatesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

// Lista templates
router.get("/admin/contract-templates", requireAuth, async (_req: AuthRequest, res) => {
  try {
    const templates = await db.select().from(contractTemplatesTable).orderBy(desc(contractTemplatesTable.createdAt));
    res.json(templates);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// Busca template por ID
router.get("/admin/contract-templates/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  try {
    const [tpl] = await db.select().from(contractTemplatesTable).where(eq(contractTemplatesTable.id, id));
    if (!tpl) return res.status(404).json({ error: "Modelo não encontrado" });
    res.json(tpl);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// Cria template
router.post("/admin/contract-templates", requireAuth, async (req: AuthRequest, res) => {
  const { name, type, description, body, fields } = req.body;
  if (!name || !body) return res.status(400).json({ error: "Nome e corpo são obrigatórios" });
  try {
    const [created] = await db.insert(contractTemplatesTable).values({
      name, type: type || "locacao", description, body,
      fields: fields || [],
    }).returning();
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// Atualiza template
router.put("/admin/contract-templates/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { name, type, description, body, fields, active } = req.body;
  try {
    const [updated] = await db.update(contractTemplatesTable)
      .set({ name, type, description, body, fields, active, updatedAt: new Date() })
      .where(eq(contractTemplatesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Modelo não encontrado" });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// Deleta template
router.delete("/admin/contract-templates/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  try {
    await db.delete(contractTemplatesTable).where(eq(contractTemplatesTable.id, id));
    res.json({ message: "Modelo excluído" });
  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
