import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { investorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required. Set it in the Replit Secrets panel.");
}
const JWT_SECRET = process.env.SESSION_SECRET;
if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD environment variable is required. Set it in the Replit Secrets panel.");
}
const KNOWN_WEAK_PASSWORDS = ["vaidevan-admin-2024", "admin", "password", "123456", "vaidevan"];
if (KNOWN_WEAK_PASSWORDS.includes(process.env.ADMIN_PASSWORD)) {
    throw new Error("ADMIN_PASSWORD uses a known weak or default value. " +
        "Set a strong, unique password (min. 16 characters) in the Replit Secrets panel before starting the server.");
}
if (process.env.ADMIN_PASSWORD.length < 16) {
    throw new Error("ADMIN_PASSWORD must be at least 16 characters long. " +
        "Set a strong, unique password in the Replit Secrets panel before starting the server.");
}
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
/** Accepts investor JWT only (requires investorId claim). Does NOT grant admin access. */
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Não autorizado" });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (!payload.investorId) {
            res.status(401).json({ error: "Token inválido" });
            return;
        }
        req.investorId = payload.investorId;
        next();
    }
    catch {
        res.status(401).json({ error: "Token inválido" });
    }
}
/** Accepts admin JWT only (role = "admin"). */
export function requireAdminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Não autorizado" });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload.role !== "admin") {
            res.status(403).json({ error: "Acesso restrito ao administrador" });
            return;
        }
        req.isAdmin = true;
        next();
    }
    catch {
        res.status(401).json({ error: "Token inválido" });
    }
}
/**
 * Accepts either:
 * - Admin JWT (role = "admin"), OR
 * - Approved investor JWT (investorId + DB-backed approvalStatus check).
 * Used only for READ endpoints in admin_investors to preserve backward
 * compatibility with the investor portal's /portal/candidatos page.
 */
export async function requireAdminOrApprovedAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Não autorizado" });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload.role === "admin") {
            req.isAdmin = true;
            next();
            return;
        }
        if (!payload.investorId) {
            res.status(401).json({ error: "Token inválido" });
            return;
        }
        const [inv] = await db
            .select({ active: investorsTable.active, approvalStatus: investorsTable.approvalStatus })
            .from(investorsTable)
            .where(eq(investorsTable.id, payload.investorId))
            .limit(1);
        if (!inv || !inv.active) {
            res.status(403).json({ error: "Conta desativada", code: "ACCOUNT_INACTIVE" });
            return;
        }
        if (inv.approvalStatus !== "approved") {
            res.status(403).json({
                error: "Acesso pendente de aprovação interna",
                code: "PENDING_APPROVAL",
            });
            return;
        }
        req.investorId = payload.investorId;
        next();
    }
    catch {
        res.status(401).json({ error: "Token inválido" });
    }
}
export function signAdminToken() {
    return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
}
// Garante que o investidor está com aprovação ativa.
// Faz lookup em tempo real no banco para que a aprovação tenha efeito imediato.
export async function requireApproved(req, res, next) {
    if (!req.investorId) {
        res.status(401).json({ error: "Não autorizado" });
        return;
    }
    try {
        const [inv] = await db
            .select({ active: investorsTable.active, approvalStatus: investorsTable.approvalStatus })
            .from(investorsTable)
            .where(eq(investorsTable.id, req.investorId))
            .limit(1);
        if (!inv || !inv.active) {
            res.status(403).json({ error: "Conta desativada", code: "ACCOUNT_INACTIVE" });
            return;
        }
        if (inv.approvalStatus !== "approved") {
            res.status(403).json({
                error: "Acesso pendente de aprovação interna",
                code: "PENDING_APPROVAL",
                approvalStatus: inv.approvalStatus,
            });
            return;
        }
        next();
    }
    catch {
        res.status(500).json({ error: "Erro interno ao verificar aprovação" });
    }
}
export function signToken(investorId) {
    return jwt.sign({ investorId }, JWT_SECRET, { expiresIn: "7d" });
}
export function signDriverToken(driverId) {
    return jwt.sign({ driverId }, JWT_SECRET, { expiresIn: "12h" });
}
export function requireDriverAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Não autorizado" });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (!payload.driverId) {
            res.status(401).json({ error: "Token inválido para motorista" });
            return;
        }
        req.driverId = payload.driverId;
        next();
    }
    catch {
        res.status(401).json({ error: "Token inválido" });
    }
}
//# sourceMappingURL=auth.js.map