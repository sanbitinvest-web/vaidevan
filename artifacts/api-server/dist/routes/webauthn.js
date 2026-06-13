import { Router } from "express";
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse, } from "@simplewebauthn/server";
import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";
import { db } from "@workspace/db";
import { webauthnCredentialsTable, investorsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { signToken, requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";
const router = Router();
// ── Helpers ────────────────────────────────────────────────────────────────
const challenges = new Map();
function setChallenge(key, challenge) {
    challenges.set(key, { challenge, expires: Date.now() + 5 * 60 * 1000 });
    // Clean expired entries
    for (const [k, v] of challenges) {
        if (Date.now() > v.expires)
            challenges.delete(k);
    }
}
function getAndDeleteChallenge(key) {
    const entry = challenges.get(key);
    challenges.delete(key);
    if (!entry || Date.now() > entry.expires)
        return null;
    return entry.challenge;
}
function getRpId(req) {
    if (process.env.NODE_ENV === "production")
        return "vaidevan.com";
    const origin = req.headers.origin;
    if (origin) {
        try {
            return new URL(origin).hostname;
        }
        catch { /* */ }
    }
    const devDomain = process.env.REPLIT_DEV_DOMAIN;
    if (devDomain)
        return devDomain;
    return "localhost";
}
function getExpectedOrigins(req) {
    if (process.env.NODE_ENV === "production") {
        return ["https://vaidevan.com", "https://www.vaidevan.com"];
    }
    const origins = [];
    const origin = req.headers.origin;
    if (origin)
        origins.push(origin);
    const devDomain = process.env.REPLIT_DEV_DOMAIN;
    if (devDomain && !origins.includes(`https://${devDomain}`))
        origins.push(`https://${devDomain}`);
    if (origins.length === 0)
        origins.push("http://localhost:3000", "http://localhost:5173");
    return origins;
}
// ── Portal (Investor) — Registration ───────────────────────────────────────
router.post("/webauthn/register/options", requireAuth, async (req, res) => {
    try {
        const [investor] = await db.select().from(investorsTable).where(eq(investorsTable.id, req.investorId));
        if (!investor) {
            res.status(404).json({ error: "Usuário não encontrado." });
            return;
        }
        const userId = String(investor.id);
        const existing = await db.select({ credentialId: webauthnCredentialsTable.credentialId, transports: webauthnCredentialsTable.transports })
            .from(webauthnCredentialsTable)
            .where(and(eq(webauthnCredentialsTable.userId, userId), eq(webauthnCredentialsTable.userType, "investor")));
        const options = await generateRegistrationOptions({
            rpName: "VaideVan",
            rpID: getRpId(req),
            userID: isoUint8Array.fromUTF8String(userId),
            userName: investor.email,
            userDisplayName: investor.name,
            attestationType: "none",
            excludeCredentials: existing.map(c => ({
                id: c.credentialId,
                transports: JSON.parse(c.transports ?? "[]"),
            })),
            authenticatorSelection: {
                residentKey: "preferred",
                userVerification: "required",
                authenticatorAttachment: "platform",
            },
        });
        setChallenge(`inv_${userId}_reg`, options.challenge);
        res.json(options);
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao gerar opções de cadastro biométrico." });
    }
});
router.post("/webauthn/register/verify", requireAuth, async (req, res) => {
    try {
        const [investor] = await db.select().from(investorsTable).where(eq(investorsTable.id, req.investorId));
        if (!investor) {
            res.status(404).json({ error: "Usuário não encontrado." });
            return;
        }
        const userId = String(investor.id);
        const expectedChallenge = getAndDeleteChallenge(`inv_${userId}_reg`);
        if (!expectedChallenge) {
            res.status(400).json({ error: "Sessão de cadastro expirada. Tente novamente." });
            return;
        }
        const verification = await verifyRegistrationResponse({
            response: req.body,
            expectedChallenge,
            expectedOrigin: getExpectedOrigins(req),
            expectedRPID: getRpId(req),
            requireUserVerification: true,
        });
        if (!verification.verified || !verification.registrationInfo) {
            res.status(400).json({ error: "Verificação biométrica falhou." });
            return;
        }
        const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
        // Remove existing credentials for this user/type to avoid duplicates on same device
        const existing = await db.select().from(webauthnCredentialsTable)
            .where(and(eq(webauthnCredentialsTable.userId, userId), eq(webauthnCredentialsTable.userType, "investor")));
        if (existing.length >= 5) {
            // Keep only the 4 most recent + delete oldest
            const sorted = [...existing].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            await db.delete(webauthnCredentialsTable).where(eq(webauthnCredentialsTable.id, sorted[0].id));
        }
        await db.insert(webauthnCredentialsTable).values({
            userId,
            userType: "investor",
            userName: investor.email,
            credentialId: credential.id,
            credentialPublicKey: isoBase64URL.fromBuffer(credential.publicKey),
            counter: credential.counter,
            credentialDeviceType: credentialDeviceType ?? null,
            credentialBackedUp: credentialBackedUp ?? false,
            transports: JSON.stringify(credential.transports ?? []),
        }).onConflictDoUpdate({
            target: webauthnCredentialsTable.credentialId,
            set: {
                counter: credential.counter,
                lastUsedAt: new Date(),
            },
        });
        res.json({ verified: true, message: "Face ID cadastrado com sucesso!" });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao verificar cadastro biométrico." });
    }
});
// ── Portal (Investor) — Authentication ─────────────────────────────────────
router.post("/webauthn/auth/options", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "E-mail obrigatório." });
            return;
        }
        const [investor] = await db.select({ id: investorsTable.id, email: investorsTable.email })
            .from(investorsTable).where(eq(investorsTable.email, email.toLowerCase().trim()));
        if (!investor) {
            // Don't reveal if email exists, just return empty credentials
            const options = await generateAuthenticationOptions({
                rpID: getRpId(req),
                userVerification: "required",
                allowCredentials: [],
            });
            setChallenge(`inv_auth_${email}`, options.challenge);
            res.json(options);
            return;
        }
        const userId = String(investor.id);
        const creds = await db.select({ credentialId: webauthnCredentialsTable.credentialId, transports: webauthnCredentialsTable.transports })
            .from(webauthnCredentialsTable)
            .where(and(eq(webauthnCredentialsTable.userId, userId), eq(webauthnCredentialsTable.userType, "investor")));
        const options = await generateAuthenticationOptions({
            rpID: getRpId(req),
            userVerification: "required",
            allowCredentials: creds.map(c => ({
                id: c.credentialId,
                transports: JSON.parse(c.transports ?? "[]"),
            })),
        });
        setChallenge(`inv_auth_${email}`, options.challenge);
        res.json({ ...options, hasCredentials: creds.length > 0 });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao gerar opções de autenticação." });
    }
});
router.post("/webauthn/auth/verify", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "E-mail obrigatório." });
            return;
        }
        const [investor] = await db.select().from(investorsTable)
            .where(eq(investorsTable.email, email.toLowerCase().trim()));
        if (!investor || !investor.active) {
            res.status(401).json({ error: "Usuário não encontrado ou inativo." });
            return;
        }
        const expectedChallenge = getAndDeleteChallenge(`inv_auth_${email}`);
        if (!expectedChallenge) {
            res.status(400).json({ error: "Sessão expirada. Tente novamente." });
            return;
        }
        const userId = String(investor.id);
        const credentialIdFromResponse = req.body.id;
        const [storedCred] = await db.select().from(webauthnCredentialsTable)
            .where(and(eq(webauthnCredentialsTable.credentialId, credentialIdFromResponse), eq(webauthnCredentialsTable.userId, userId), eq(webauthnCredentialsTable.userType, "investor")));
        if (!storedCred) {
            res.status(401).json({ error: "Credencial biométrica não encontrada." });
            return;
        }
        const verification = await verifyAuthenticationResponse({
            response: req.body,
            expectedChallenge,
            expectedOrigin: getExpectedOrigins(req),
            expectedRPID: getRpId(req),
            requireUserVerification: true,
            credential: {
                id: storedCred.credentialId,
                publicKey: isoBase64URL.toBuffer(storedCred.credentialPublicKey),
                counter: storedCred.counter,
                transports: JSON.parse(storedCred.transports ?? "[]"),
            },
        });
        if (!verification.verified) {
            res.status(401).json({ error: "Autenticação biométrica falhou." });
            return;
        }
        await db.update(webauthnCredentialsTable).set({
            counter: verification.authenticationInfo.newCounter,
            lastUsedAt: new Date(),
        }).where(eq(webauthnCredentialsTable.id, storedCred.id));
        const token = signToken(investor.id);
        res.json({
            token,
            investor: { id: investor.id, name: investor.name, email: investor.email, approvalStatus: investor.approvalStatus },
        });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao verificar autenticação biométrica." });
    }
});
// ── Listagem de credenciais (portal) ───────────────────────────────────────
router.get("/webauthn/credentials", requireAuth, async (req, res) => {
    try {
        const userId = String(req.investorId);
        const creds = await db.select({
            id: webauthnCredentialsTable.id,
            credentialDeviceType: webauthnCredentialsTable.credentialDeviceType,
            createdAt: webauthnCredentialsTable.createdAt,
            lastUsedAt: webauthnCredentialsTable.lastUsedAt,
        }).from(webauthnCredentialsTable)
            .where(and(eq(webauthnCredentialsTable.userId, userId), eq(webauthnCredentialsTable.userType, "investor")));
        res.json(creds);
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao listar credenciais." });
    }
});
router.delete("/webauthn/credentials/:id", requireAuth, async (req, res) => {
    try {
        const credId = Number(req.params.id);
        const userId = String(req.investorId);
        await db.delete(webauthnCredentialsTable).where(and(eq(webauthnCredentialsTable.id, credId), eq(webauthnCredentialsTable.userId, userId)));
        res.json({ message: "Credencial removida." });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao remover credencial." });
    }
});
// ── Público — parceiros e locatários ───────────────────────────────────────
router.post("/webauthn/public/register/options", async (req, res) => {
    try {
        const { email, name, userType } = req.body;
        if (!email || !userType) {
            res.status(400).json({ error: "E-mail e tipo de usuário obrigatórios." });
            return;
        }
        if (!["partner", "client"].includes(userType)) {
            res.status(400).json({ error: "Tipo inválido." });
            return;
        }
        const userId = `${userType}_${email.toLowerCase().trim()}`;
        const existing = await db.select({ credentialId: webauthnCredentialsTable.credentialId, transports: webauthnCredentialsTable.transports })
            .from(webauthnCredentialsTable).where(eq(webauthnCredentialsTable.userId, userId));
        const options = await generateRegistrationOptions({
            rpName: "VaideVan",
            rpID: getRpId(req),
            userID: isoUint8Array.fromUTF8String(userId),
            userName: email.toLowerCase().trim(),
            userDisplayName: name ?? email,
            attestationType: "none",
            excludeCredentials: existing.map(c => ({
                id: c.credentialId,
                transports: JSON.parse(c.transports ?? "[]"),
            })),
            authenticatorSelection: {
                residentKey: "preferred",
                userVerification: "required",
                authenticatorAttachment: "platform",
            },
        });
        setChallenge(`pub_${userId}_reg`, options.challenge);
        res.json(options);
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao gerar opções de cadastro biométrico." });
    }
});
router.post("/webauthn/public/register/verify", async (req, res) => {
    try {
        const { email, name, userType, registrationResponse } = req.body;
        if (!email || !userType || !registrationResponse) {
            res.status(400).json({ error: "Dados incompletos." });
            return;
        }
        const userId = `${userType}_${email.toLowerCase().trim()}`;
        const expectedChallenge = getAndDeleteChallenge(`pub_${userId}_reg`);
        if (!expectedChallenge) {
            res.status(400).json({ error: "Sessão expirada. Tente novamente." });
            return;
        }
        const verification = await verifyRegistrationResponse({
            response: registrationResponse,
            expectedChallenge,
            expectedOrigin: getExpectedOrigins(req),
            expectedRPID: getRpId(req),
            requireUserVerification: true,
        });
        if (!verification.verified || !verification.registrationInfo) {
            res.status(400).json({ error: "Verificação biométrica falhou." });
            return;
        }
        const { credential, credentialDeviceType: pubDeviceType, credentialBackedUp: pubBackedUp } = verification.registrationInfo;
        await db.insert(webauthnCredentialsTable).values({
            userId,
            userType,
            userName: email.toLowerCase().trim(),
            credentialId: credential.id,
            credentialPublicKey: isoBase64URL.fromBuffer(credential.publicKey),
            counter: credential.counter,
            credentialDeviceType: pubDeviceType ?? null,
            credentialBackedUp: pubBackedUp ?? false,
            transports: JSON.stringify(credential.transports ?? []),
        }).onConflictDoUpdate({
            target: webauthnCredentialsTable.credentialId,
            set: { counter: credential.counter, lastUsedAt: new Date() },
        });
        res.json({ verified: true, message: "Identidade verificada com Face ID!" });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao verificar cadastro biométrico." });
    }
});
router.get("/webauthn/public/status", async (req, res) => {
    try {
        const { email, userType } = req.query;
        if (!email || !userType) {
            res.status(400).json({ error: "E-mail e tipo obrigatórios." });
            return;
        }
        const userId = `${userType}_${email.toLowerCase().trim()}`;
        const [cred] = await db.select({ id: webauthnCredentialsTable.id, createdAt: webauthnCredentialsTable.createdAt })
            .from(webauthnCredentialsTable).where(eq(webauthnCredentialsTable.userId, userId));
        res.json({ enrolled: !!cred, enrolledAt: cred?.createdAt ?? null });
    }
    catch (err) {
        logger.warn({ err }, "webauthn status error");
        res.json({ enrolled: false });
    }
});
export default router;
//# sourceMappingURL=webauthn.js.map