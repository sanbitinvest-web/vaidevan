import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { investorsTable, partnersTable } from "@workspace/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { requireAdminOrApprovedAuth, requireAdminAuth } from "../middlewares/auth";
import { sendInvestorStatusEmailIfAllowed } from "../lib/investor-mailer";
const router = Router();
/* ── Listar candidatos investidores para revisão ── */
router.get("/admin/investor-applications", requireAdminOrApprovedAuth, async (req, res) => {
    try {
        const investors = await db
            .select({
            id: investorsTable.id,
            name: investorsTable.name,
            email: investorsTable.email,
            phone: investorsTable.phone,
            cpf: investorsTable.cpf,
            city: investorsTable.city,
            state: investorsTable.state,
            approvalStatus: investorsTable.approvalStatus,
            kycNotes: investorsTable.kycNotes,
            approvedAt: investorsTable.approvedAt,
            approvedBy: investorsTable.approvedBy,
            rejectedReason: investorsTable.rejectedReason,
            partnerApplicationId: investorsTable.partnerApplicationId,
            registrationIp: investorsTable.registrationIp,
            registrationUserAgent: investorsTable.registrationUserAgent,
            cnhStatus: investorsTable.cnhStatus,
            addressProofStatus: investorsTable.addressProofStatus,
            govBrVerified: investorsTable.govBrVerified,
            active: investorsTable.active,
            createdAt: investorsTable.createdAt,
            updatedAt: investorsTable.updatedAt,
        })
            .from(investorsTable)
            .orderBy(desc(investorsTable.createdAt));
        // Busca dados da candidatura original (KYC aprofundado)
        const appIds = investors
            .map(i => i.partnerApplicationId)
            .filter((id) => id !== null && id !== undefined);
        const applications = appIds.length
            ? await db
                .select()
                .from(partnersTable)
                .where(inArray(partnersTable.id, appIds))
            : [];
        const appMap = Object.fromEntries(applications.map(a => [a.id, a]));
        const result = investors.map(inv => ({
            ...inv,
            application: inv.partnerApplicationId ? appMap[inv.partnerApplicationId] ?? null : null,
        }));
        res.json(result);
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao buscar candidatos." });
    }
});
/* ── Detalhe de um candidato ── */
router.get("/admin/investor-applications/:id", requireAdminOrApprovedAuth, async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [inv] = await db
            .select()
            .from(investorsTable)
            .where(eq(investorsTable.id, id))
            .limit(1);
        if (!inv) {
            res.status(404).json({ error: "Candidato não encontrado." });
            return;
        }
        const { passwordHash: _, ...safe } = inv;
        let application = null;
        if (inv.partnerApplicationId) {
            const [app] = await db
                .select()
                .from(partnersTable)
                .where(eq(partnersTable.id, inv.partnerApplicationId))
                .limit(1);
            application = app || null;
        }
        res.json({ ...safe, application });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao buscar candidato." });
    }
});
/* ── Mover para "em análise" ── */
router.patch("/admin/investor-applications/:id/review", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [updated] = await db
            .update(investorsTable)
            .set({ approvalStatus: "under_review", updatedAt: new Date() })
            .where(eq(investorsTable.id, id))
            .returning({ id: investorsTable.id, approvalStatus: investorsTable.approvalStatus });
        if (!updated) {
            res.status(404).json({ error: "Candidato não encontrado." });
            return;
        }
        // Atualiza candidatura parceira também
        await db
            .update(partnersTable)
            .set({ status: "contatado", updatedAt: new Date() })
            .where(eq(partnersTable.id, (await db.select({ pid: investorsTable.partnerApplicationId })
            .from(investorsTable).where(eq(investorsTable.id, id)).limit(1))[0]?.pid ?? -1));
        res.json(updated);
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao atualizar status." });
    }
});
/* ── Aprovar investidor — libera acesso ao portal ── */
router.patch("/admin/investor-applications/:id/approve", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const { approvedBy, kycNotes, temporaryPassword } = req.body;
    if (!approvedBy?.trim()) {
        res.status(400).json({ error: "Campo 'approvedBy' (responsável pela aprovação) é obrigatório." });
        return;
    }
    try {
        const patch = {
            approvalStatus: "approved",
            approvedAt: new Date(),
            approvedBy: approvedBy.trim(),
            updatedAt: new Date(),
        };
        if (kycNotes !== undefined)
            patch.kycNotes = kycNotes;
        // Se uma nova senha for fornecida pelo admin, redefine o hash
        if (temporaryPassword?.trim()) {
            patch.passwordHash = await bcrypt.hash(temporaryPassword.trim(), 12);
        }
        const [updated] = await db
            .update(investorsTable)
            .set(patch)
            .where(eq(investorsTable.id, id))
            .returning({
            id: investorsTable.id,
            name: investorsTable.name,
            email: investorsTable.email,
            approvalStatus: investorsTable.approvalStatus,
            approvedAt: investorsTable.approvedAt,
            approvedBy: investorsTable.approvedBy,
        });
        if (!updated) {
            res.status(404).json({ error: "Candidato não encontrado." });
            return;
        }
        // Sincroniza status na tabela de parceiros
        const [inv] = await db.select({ pid: investorsTable.partnerApplicationId })
            .from(investorsTable).where(eq(investorsTable.id, id)).limit(1);
        if (inv?.pid) {
            await db.update(partnersTable)
                .set({ status: "aprovado", updatedAt: new Date() })
                .where(eq(partnersTable.id, inv.pid));
        }
        // Notifica o investidor por e-mail (se não optou por sair — verificado no helper centralizado)
        sendInvestorStatusEmailIfAllowed(id, {
            name: updated.name,
            email: updated.email,
            status: "approved",
            portalUrl: `${process.env.APP_URL || "https://vaidevan.com"}/portal`,
        }).catch((err) => req.log.warn({ err }, "Falha ao enviar e-mail de aprovação ao investidor"));
        res.json({
            ...updated,
            message: `Investidor ${updated.name} aprovado com sucesso. Acesso ao portal liberado.`,
        });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao aprovar candidato." });
    }
});
/* ── Reprovar / suspender investidor ── */
router.patch("/admin/investor-applications/:id/reject", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const { rejectedReason, kycNotes } = req.body;
    try {
        const patch = {
            approvalStatus: "suspended",
            updatedAt: new Date(),
        };
        if (rejectedReason !== undefined)
            patch.rejectedReason = rejectedReason;
        if (kycNotes !== undefined)
            patch.kycNotes = kycNotes;
        const [updated] = await db
            .update(investorsTable)
            .set(patch)
            .where(eq(investorsTable.id, id))
            .returning({
            id: investorsTable.id,
            name: investorsTable.name,
            email: investorsTable.email,
            approvalStatus: investorsTable.approvalStatus,
        });
        if (!updated) {
            res.status(404).json({ error: "Candidato não encontrado." });
            return;
        }
        // Sincroniza na tabela de parceiros
        const [inv] = await db.select({ pid: investorsTable.partnerApplicationId })
            .from(investorsTable).where(eq(investorsTable.id, id)).limit(1);
        if (inv?.pid) {
            await db.update(partnersTable)
                .set({ status: "recusado", updatedAt: new Date() })
                .where(eq(partnersTable.id, inv.pid));
        }
        // Notifica o investidor por e-mail (se não optou por sair — verificado no helper centralizado)
        sendInvestorStatusEmailIfAllowed(id, {
            name: updated.name,
            email: updated.email,
            status: "rejected",
            rejectedReason: typeof rejectedReason === "string" ? rejectedReason : undefined,
        }).catch((err) => req.log.warn({ err }, "Falha ao enviar e-mail de reprovação ao investidor"));
        res.json(updated);
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao reprovar candidato." });
    }
});
/* ── Adicionar/atualizar notas internas de KYC ── */
router.patch("/admin/investor-applications/:id/notes", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const { kycNotes } = req.body;
    try {
        const [updated] = await db
            .update(investorsTable)
            .set({ kycNotes, updatedAt: new Date() })
            .where(eq(investorsTable.id, id))
            .returning({ id: investorsTable.id, kycNotes: investorsTable.kycNotes });
        if (!updated) {
            res.status(404).json({ error: "Candidato não encontrado." });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao salvar notas." });
    }
});
/* ── Redefinir senha do investidor aprovado ── */
router.patch("/admin/investor-applications/:id/reset-password", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword || String(newPassword).length < 8) {
        res.status(400).json({ error: "Senha deve ter pelo menos 8 caracteres." });
        return;
    }
    try {
        const passwordHash = await bcrypt.hash(String(newPassword), 12);
        const [updated] = await db
            .update(investorsTable)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(investorsTable.id, id))
            .returning({ id: investorsTable.id, email: investorsTable.email });
        if (!updated) {
            res.status(404).json({ error: "Candidato não encontrado." });
            return;
        }
        res.json({ message: "Senha redefinida com sucesso.", email: updated.email });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao redefinir senha." });
    }
});
export default router;
//# sourceMappingURL=admin_investors.js.map