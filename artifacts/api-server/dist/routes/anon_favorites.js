import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "@workspace/db";
import { anonymousFavoritesTable } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
const router = Router();
const COOKIE_NAME = "vdv_anon";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;
function getOrCreateToken(req, res) {
    let token = req.cookies?.[COOKIE_NAME];
    if (!token || typeof token !== "string" || token.length < 8) {
        token = randomUUID();
        res.cookie(COOKIE_NAME, token, {
            maxAge: COOKIE_MAX_AGE,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
    }
    return token;
}
router.get("/favorites/anon", async (req, res) => {
    const token = getOrCreateToken(req, res);
    try {
        const favorites = await db
            .select()
            .from(anonymousFavoritesTable)
            .where(eq(anonymousFavoritesTable.token, token));
        res.json(favorites.map(f => ({
            id: f.id,
            label: f.label,
            lat: f.lat,
            lon: f.lon,
            ...(f.nickname ? { nickname: f.nickname } : {}),
        })));
    }
    catch (err) {
        req.log.error(err, "Erro ao buscar favoritos anônimos");
        res.status(500).json({ error: "Erro interno" });
    }
});
router.post("/favorites/anon", async (req, res) => {
    const token = getOrCreateToken(req, res);
    const { label, lat, lon, nickname } = req.body;
    if (!label || !lat || !lon) {
        res.status(400).json({ error: "label, lat e lon são obrigatórios" });
        return;
    }
    if (String(label).length > 500 || String(lat).length > 32 || String(lon).length > 32) {
        res.status(400).json({ error: "Valor de campo inválido ou muito longo" });
        return;
    }
    if (nickname && String(nickname).length > 100) {
        res.status(400).json({ error: "Apelido muito longo (máx. 100 caracteres)" });
        return;
    }
    try {
        const existing = await db
            .select({ id: anonymousFavoritesTable.id })
            .from(anonymousFavoritesTable)
            .where(and(eq(anonymousFavoritesTable.token, token), eq(anonymousFavoritesTable.label, String(label))))
            .limit(1);
        if (existing.length > 0) {
            res.status(409).json({ error: "Favorito já existe" });
            return;
        }
        const [fav] = await db.insert(anonymousFavoritesTable).values({
            token,
            label: String(label),
            lat: String(lat),
            lon: String(lon),
            nickname: nickname ? String(nickname) : null,
        }).returning();
        res.status(201).json({
            id: fav.id,
            label: fav.label,
            lat: fav.lat,
            lon: fav.lon,
            ...(fav.nickname ? { nickname: fav.nickname } : {}),
        });
    }
    catch (err) {
        req.log.error(err, "Erro ao adicionar favorito anônimo");
        res.status(500).json({ error: "Erro interno" });
    }
});
router.delete("/favorites/anon/:label", async (req, res) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
        res.json({ ok: true });
        return;
    }
    const label = String(req.params.label);
    try {
        await db.delete(anonymousFavoritesTable)
            .where(and(eq(anonymousFavoritesTable.token, token), eq(anonymousFavoritesTable.label, label)));
        res.json({ ok: true });
    }
    catch (err) {
        req.log.error(err, "Erro ao remover favorito anônimo");
        res.status(500).json({ error: "Erro interno" });
    }
});
router.put("/favorites/anon", async (req, res) => {
    const token = getOrCreateToken(req, res);
    const items = req.body;
    if (!Array.isArray(items)) {
        res.status(400).json({ error: "Array de favoritos esperado" });
        return;
    }
    if (items.length > 100) {
        res.status(400).json({ error: "Máximo de 100 favoritos permitido" });
        return;
    }
    for (const item of items) {
        if (!item.label || !item.lat || !item.lon) {
            res.status(400).json({ error: "Cada favorito deve ter label, lat e lon" });
            return;
        }
        if (String(item.label).length > 500 || String(item.lat).length > 32 || String(item.lon).length > 32) {
            res.status(400).json({ error: "Valor de campo inválido ou muito longo" });
            return;
        }
    }
    try {
        await db.delete(anonymousFavoritesTable)
            .where(eq(anonymousFavoritesTable.token, token));
        if (items.length > 0) {
            await db.insert(anonymousFavoritesTable).values(items.map(item => ({
                token,
                label: String(item.label),
                lat: String(item.lat),
                lon: String(item.lon),
                nickname: item.nickname ? String(item.nickname) : null,
            })));
        }
        res.json({ ok: true });
    }
    catch (err) {
        req.log.error(err, "Erro ao substituir favoritos anônimos");
        res.status(500).json({ error: "Erro interno" });
    }
});
export default router;
//# sourceMappingURL=anon_favorites.js.map