import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { investorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../middlewares/auth";
import { sendOtpEmail } from "../lib/mailer";
const router = Router();
const otpStore = new Map();
function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}
// Purge expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of otpStore.entries()) {
        if (entry.expiresAt < now)
            otpStore.delete(key);
    }
}, 60_000);
router.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email e senha obrigatórios" });
        return;
    }
    try {
        const [investor] = await db
            .select()
            .from(investorsTable)
            .where(eq(investorsTable.email, email))
            .limit(1);
        if (!investor || !investor.active) {
            res.status(401).json({ error: "Credenciais inválidas" });
            return;
        }
        const valid = await bcrypt.compare(password, investor.passwordHash);
        if (!valid) {
            res.status(401).json({ error: "Credenciais inválidas" });
            return;
        }
        const token = signToken(investor.id);
        res.json({
            token,
            investor: {
                id: investor.id,
                name: investor.name,
                email: investor.email,
                approvalStatus: investor.approvalStatus,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: "Erro interno" });
    }
});
router.get("/auth/me", requireAuth, async (req, res) => {
    try {
        const [investor] = await db
            .select({
            id: investorsTable.id,
            name: investorsTable.name,
            email: investorsTable.email,
            approvalStatus: investorsTable.approvalStatus,
        })
            .from(investorsTable)
            .where(eq(investorsTable.id, req.investorId))
            .limit(1);
        if (!investor) {
            res.status(404).json({ error: "Investidor não encontrado" });
            return;
        }
        res.json(investor);
    }
    catch {
        res.status(500).json({ error: "Erro interno" });
    }
});
// ── OTP: enviar código ──────────────────────────────────────────────────────
router.post("/auth/otp/send", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: "E-mail obrigatório" });
        return;
    }
    try {
        const [investor] = await db
            .select({ id: investorsTable.id, name: investorsTable.name, email: investorsTable.email, active: investorsTable.active })
            .from(investorsTable)
            .where(eq(investorsTable.email, email.toLowerCase().trim()))
            .limit(1);
        // Always return success to avoid e-mail enumeration
        if (!investor || !investor.active) {
            res.json({ sent: true });
            return;
        }
        const code = generateOtp();
        otpStore.set(investor.email, {
            code,
            expiresAt: Date.now() + 10 * 60 * 1000,
            investorId: investor.id,
            name: investor.name,
        });
        await sendOtpEmail({ email: investor.email, name: investor.name, code });
        res.json({ sent: true });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao enviar código" });
    }
});
// ── OTP: verificar código ───────────────────────────────────────────────────
router.post("/auth/otp/verify", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        res.status(400).json({ error: "E-mail e código obrigatórios" });
        return;
    }
    const key = email.toLowerCase().trim();
    const entry = otpStore.get(key);
    if (!entry || entry.code !== code.trim() || entry.expiresAt < Date.now()) {
        res.status(401).json({ error: "Código inválido ou expirado" });
        return;
    }
    otpStore.delete(key);
    try {
        const [investor] = await db
            .select({ id: investorsTable.id, name: investorsTable.name, email: investorsTable.email, approvalStatus: investorsTable.approvalStatus })
            .from(investorsTable)
            .where(eq(investorsTable.id, entry.investorId))
            .limit(1);
        if (!investor) {
            res.status(404).json({ error: "Usuário não encontrado" });
            return;
        }
        const token = signToken(investor.id);
        res.json({ token, investor: { id: investor.id, name: investor.name, email: investor.email, approvalStatus: investor.approvalStatus } });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro interno" });
    }
});
export default router;
//# sourceMappingURL=auth.js.map