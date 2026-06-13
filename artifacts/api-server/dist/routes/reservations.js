import { Router } from "express";
import { db } from "@workspace/db";
import { reservationsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { publicFormLimiter, paymentLimiter } from "../middlewares/rateLimiter";
import { logger } from "../lib/logger";
import { sendReservationEmail } from "../lib/mailer";
const router = Router();
/* ── Público: criar reserva ── */
router.post("/reservations", publicFormLimiter, async (req, res) => {
    const { name, email, phone, cpf, vehicleType, passengerCount, startDate, endDate, departureTime, returnTime, originAddress, destinationAddress, useAtDestination, driveAtDestination, luggageInfo, eventType, priority, hasBudget, budgetPhotoUrls, coastalInfo, notes, paymentMethod, geoLat, geoLng, geoAccuracy, honeypot, } = req.body;
    if (honeypot && String(honeypot).trim().length > 0) {
        res.status(200).json({ success: true });
        return;
    }
    const required = { name, email, phone, vehicleType, passengerCount, startDate, endDate, departureTime, originAddress, destinationAddress, priority };
    const missing = Object.entries(required).filter(([, v]) => !v && v !== 0).map(([k]) => k);
    if (missing.length > 0) {
        res.status(400).json({ error: `Campos obrigatórios: ${missing.join(", ")}` });
        return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
        res.status(400).json({ error: "E-mail inválido." });
        return;
    }
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? req.ip ?? null;
    const ua = req.headers["user-agent"] ?? null;
    try {
        const [reservation] = await db.insert(reservationsTable).values({
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            phone: String(phone).trim(),
            cpf: cpf?.trim() || null,
            vehicleType: String(vehicleType),
            passengerCount: Number(passengerCount),
            startDate: String(startDate),
            endDate: String(endDate),
            departureTime: String(departureTime),
            returnTime: returnTime?.trim() || null,
            originAddress: String(originAddress).trim(),
            destinationAddress: String(destinationAddress).trim(),
            useAtDestination: Boolean(useAtDestination),
            driveAtDestination: Boolean(driveAtDestination),
            luggageInfo: luggageInfo?.trim() || null,
            eventType: eventType?.trim() || null,
            priority: String(priority),
            hasBudget: Boolean(hasBudget),
            budgetPhotoUrls: Array.isArray(budgetPhotoUrls) && budgetPhotoUrls.length ? budgetPhotoUrls : null,
            coastalInfo: coastalInfo?.trim() || null,
            notes: notes?.trim() || null,
            paymentMethod: paymentMethod?.trim() || null,
            status: "novo",
            paymentStatus: "pendente",
            geoLat: geoLat ? Number(geoLat) : null,
            geoLng: geoLng ? Number(geoLng) : null,
            geoAccuracy: geoAccuracy ? Number(geoAccuracy) : null,
            ipAddress: ip,
            userAgent: ua ? String(ua).slice(0, 500) : null,
        }).returning();
        sendReservationEmail({
            reservationId: reservation.id,
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            phone: String(phone).trim(),
            vehicleType: String(vehicleType),
            passengerCount: Number(passengerCount),
            startDate: String(startDate),
            endDate: String(endDate),
            departureTime: String(departureTime),
            originAddress: String(originAddress).trim(),
            destinationAddress: String(destinationAddress).trim(),
            priority: String(priority),
            paymentMethod: paymentMethod?.trim() || null,
            eventType: eventType?.trim() || null,
            notes: notes?.trim() || null,
        }).catch(err => req.log.error(err, "Erro ao enviar email de reserva"));
        res.status(201).json({ success: true, id: reservation.id });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao registrar reserva. Tente novamente." });
    }
});
/* ── Público: buscar reserva para pagamento ── */
router.get("/reservations/:id/pay", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [reservation] = await db.select({
            id: reservationsTable.id,
            name: reservationsTable.name,
            email: reservationsTable.email,
            cpf: reservationsTable.cpf,
            phone: reservationsTable.phone,
            vehicleType: reservationsTable.vehicleType,
            startDate: reservationsTable.startDate,
            endDate: reservationsTable.endDate,
            originAddress: reservationsTable.originAddress,
            destinationAddress: reservationsTable.destinationAddress,
            paymentAmount: reservationsTable.paymentAmount,
            paymentStatus: reservationsTable.paymentStatus,
            stripeCheckoutUrl: reservationsTable.stripeCheckoutUrl,
            mpCheckoutUrl: reservationsTable.mpCheckoutUrl,
            ipayCheckoutUrl: reservationsTable.ipayCheckoutUrl,
            status: reservationsTable.status,
        }).from(reservationsTable).where(eq(reservationsTable.id, id));
        if (!reservation) {
            res.status(404).json({ error: "Reserva não encontrada." });
            return;
        }
        if (reservation.paymentStatus === "pago") {
            res.json({ ...reservation, alreadyPaid: true });
            return;
        }
        res.json(reservation);
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao buscar reserva." });
    }
});
/* ── Público: criar link Mercado Pago ── */
router.post("/reservations/:id/pay/mercadopago", paymentLimiter, async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [reservation] = await db.select().from(reservationsTable).where(eq(reservationsTable.id, id));
        if (!reservation) {
            res.status(404).json({ error: "Reserva não encontrada." });
            return;
        }
        if (!reservation.paymentAmount || reservation.paymentAmount <= 0) {
            res.status(400).json({ error: "Valor da reserva não definido. Aguarde a confirmação do preço." });
            return;
        }
        if (reservation.status !== "aprovado") {
            res.status(400).json({ error: "Reserva ainda não aprovada para pagamento." });
            return;
        }
        const domain = process.env.REPLIT_DEV_DOMAIN
            ? `https://${process.env.REPLIT_DEV_DOMAIN}`
            : "https://vaidevan.com";
        const { createMpPreference } = await import("../lib/mercadoPago");
        const pref = await createMpPreference({
            reservationId: String(id),
            customerName: reservation.name,
            customerEmail: reservation.email,
            customerCpf: reservation.cpf ?? "00000000000",
            description: `VaideVan — Reserva #${id} (${reservation.vehicleType})`,
            amountBrl: reservation.paymentAmount,
            successUrl: `${domain}/reserva/${id}/sucesso?gateway=mp&status=success`,
            failureUrl: `${domain}/reserva/${id}/pagar?gateway=mp&status=failure`,
            pendingUrl: `${domain}/reserva/${id}/pagar?gateway=mp&status=pending`,
            notificationUrl: `${domain}/api/webhooks/mercadopago`,
        });
        await db.update(reservationsTable).set({
            mpPreferenceId: pref.preferenceId,
            mpCheckoutUrl: pref.checkoutUrl,
            paymentMethod: "mercadopago",
            updatedAt: new Date(),
        }).where(eq(reservationsTable.id, id));
        res.json({ checkoutUrl: pref.checkoutUrl });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao gerar link Mercado Pago. Verifique as credenciais MP_ACCESS_TOKEN." });
    }
});
/* ── Público: criar link InfinityPay ── */
router.post("/reservations/:id/pay/infinitepay", paymentLimiter, async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [reservation] = await db.select().from(reservationsTable).where(eq(reservationsTable.id, id));
        if (!reservation) {
            res.status(404).json({ error: "Reserva não encontrada." });
            return;
        }
        if (!reservation.paymentAmount || reservation.paymentAmount <= 0) {
            res.status(400).json({ error: "Valor da reserva não definido. Aguarde a confirmação do preço." });
            return;
        }
        if (reservation.status !== "aprovado") {
            res.status(400).json({ error: "Reserva ainda não aprovada para pagamento." });
            return;
        }
        const domain = process.env.REPLIT_DEV_DOMAIN
            ? `https://${process.env.REPLIT_DEV_DOMAIN}`
            : "https://vaidevan.com";
        const { createInfinityPayLink } = await import("../lib/infinityPay");
        const amountCents = Math.round(reservation.paymentAmount * 100);
        const link = await createInfinityPayLink({
            reservationId: String(id),
            customerName: reservation.name,
            customerEmail: reservation.email,
            customerPhone: reservation.phone,
            description: `VaideVan — Reserva #${id} (${reservation.vehicleType})`,
            amountCents,
            redirectUrl: `${domain}/reserva/${id}/sucesso?gateway=ip`,
            webhookUrl: `${domain}/api/webhooks/infinitepay`,
        });
        await db.update(reservationsTable).set({
            ipayOrderNsu: String(id),
            ipayCheckoutUrl: link.url,
            paymentMethod: "infinitepay",
            updatedAt: new Date(),
        }).where(eq(reservationsTable.id, id));
        res.json({ checkoutUrl: link.url });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao gerar link InfinityPay. Verifique a variável INFINITEPAY_HANDLE." });
    }
});
/* ── Público: criar sessão Stripe Checkout ── */
router.post("/reservations/:id/pay/stripe", paymentLimiter, async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [reservation] = await db.select().from(reservationsTable).where(eq(reservationsTable.id, id));
        if (!reservation) {
            res.status(404).json({ error: "Reserva não encontrada." });
            return;
        }
        if (!reservation.paymentAmount || reservation.paymentAmount <= 0) {
            res.status(400).json({ error: "Valor da reserva não definido. Aguarde a confirmação do preço." });
            return;
        }
        if (reservation.status !== "aprovado") {
            res.status(400).json({ error: "Reserva ainda não aprovada para pagamento." });
            return;
        }
        const domain = process.env.REPLIT_DEV_DOMAIN
            ? `https://${process.env.REPLIT_DEV_DOMAIN}`
            : "https://vaidevan.com";
        const { createStripeCheckoutSession } = await import("../lib/stripeCheckout");
        const session = await createStripeCheckoutSession({
            reservationId: String(id),
            customerEmail: reservation.email,
            description: `VaideVan — Reserva #${id} (${reservation.vehicleType})`,
            amountBrl: reservation.paymentAmount,
            successUrl: `${domain}/reserva/${id}/sucesso?gateway=stripe`,
            cancelUrl: `${domain}/reserva/${id}/pagar?gateway=stripe&status=failure`,
        });
        await db.update(reservationsTable).set({
            stripeSessionId: session.sessionId,
            stripeCheckoutUrl: session.checkoutUrl,
            paymentMethod: "stripe",
            updatedAt: new Date(),
        }).where(eq(reservationsTable.id, id));
        res.json({ checkoutUrl: session.checkoutUrl });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao gerar link Stripe. Verifique a integração Stripe no painel." });
    }
});
/* ── Webhook: Mercado Pago ── */
router.post("/webhooks/mercadopago", async (req, res) => {
    try {
        const { type, data } = req.body;
        if (type === "payment" && data?.id) {
            const { getMpPayment } = await import("../lib/mercadoPago");
            const payment = await getMpPayment(data.id);
            const reservationId = Number(payment.external_reference);
            if (!isNaN(reservationId)) {
                const newStatus = payment.status === "approved" ? "pago" : "pendente";
                await db.update(reservationsTable).set({
                    mpPaymentId: String(payment.id),
                    paymentStatus: newStatus,
                    updatedAt: new Date(),
                }).where(eq(reservationsTable.id, reservationId));
            }
        }
        res.sendStatus(200);
    }
    catch (err) {
        logger.warn({ err }, "MP webhook error");
        res.sendStatus(200);
    }
});
/* ── Webhook: InfinityPay ── */
router.post("/webhooks/infinitepay", async (req, res) => {
    try {
        const { order_nsu, paid } = req.body;
        if (order_nsu) {
            const reservationId = Number(order_nsu);
            if (!isNaN(reservationId)) {
                await db.update(reservationsTable).set({
                    paymentStatus: paid ? "pago" : "pendente",
                    updatedAt: new Date(),
                }).where(eq(reservationsTable.id, reservationId));
            }
        }
        res.sendStatus(200);
    }
    catch (err) {
        logger.warn({ err }, "InfinityPay webhook error");
        res.sendStatus(200);
    }
});
/* ── Admin: listar reservas ── */
router.get("/admin/reservations", requireAuth, async (req, res) => {
    try {
        const reservations = await db.select().from(reservationsTable).orderBy(desc(reservationsTable.createdAt));
        res.json(reservations);
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao buscar reservas." });
    }
});
/* ── Admin: atualizar status e valor ── */
router.patch("/admin/reservations/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const { status, paymentAmount, adminNotes, paymentMethod } = req.body;
    const validStatuses = ["novo", "em_analise", "aprovado", "recusado", "cancelado"];
    const updates = { updatedAt: new Date() };
    if (status && validStatuses.includes(status))
        updates.status = status;
    if (adminNotes !== undefined)
        updates.adminNotes = adminNotes;
    if (paymentAmount !== undefined)
        updates.paymentAmount = Number(paymentAmount);
    if (paymentMethod !== undefined)
        updates.paymentMethod = paymentMethod;
    try {
        const [updated] = await db.update(reservationsTable).set(updates).where(eq(reservationsTable.id, id)).returning();
        if (!updated) {
            res.status(404).json({ error: "Reserva não encontrada." });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao atualizar reserva." });
    }
});
/* ── Admin: gerar link de pagamento (Stripe, MP ou InfinityPay) ── */
router.post("/admin/reservations/:id/generate-payment-link", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const { gateway } = req.body;
    if (!["stripe", "mercadopago", "infinitepay"].includes(gateway)) {
        res.status(400).json({ error: "Gateway inválido. Use 'stripe', 'mercadopago' ou 'infinitepay'." });
        return;
    }
    try {
        const [reservation] = await db.select().from(reservationsTable).where(eq(reservationsTable.id, id));
        if (!reservation) {
            res.status(404).json({ error: "Reserva não encontrada." });
            return;
        }
        if (!reservation.paymentAmount || reservation.paymentAmount <= 0) {
            res.status(400).json({ error: "Defina o valor da reserva antes de gerar o link." });
            return;
        }
        const domain = process.env.REPLIT_DEV_DOMAIN
            ? `https://${process.env.REPLIT_DEV_DOMAIN}`
            : "https://vaidevan.com";
        if (gateway === "stripe") {
            const { createStripeCheckoutSession } = await import("../lib/stripeCheckout");
            const session = await createStripeCheckoutSession({
                reservationId: String(id),
                customerEmail: reservation.email,
                description: `VaideVan — Reserva #${id} (${reservation.vehicleType})`,
                amountBrl: reservation.paymentAmount,
                successUrl: `${domain}/reserva/${id}/sucesso?gateway=stripe`,
                cancelUrl: `${domain}/reserva/${id}/pagar?gateway=stripe&status=failure`,
            });
            await db.update(reservationsTable).set({
                stripeSessionId: session.sessionId,
                stripeCheckoutUrl: session.checkoutUrl,
                paymentMethod: "stripe",
                status: "aprovado",
                updatedAt: new Date(),
            }).where(eq(reservationsTable.id, id));
            res.json({ checkoutUrl: session.checkoutUrl, gateway: "stripe" });
        }
        else if (gateway === "mercadopago") {
            const { createMpPreference } = await import("../lib/mercadoPago");
            const pref = await createMpPreference({
                reservationId: String(id),
                customerName: reservation.name,
                customerEmail: reservation.email,
                customerCpf: reservation.cpf ?? "00000000000",
                description: `VaideVan — Reserva #${id} (${reservation.vehicleType})`,
                amountBrl: reservation.paymentAmount,
                successUrl: `${domain}/reserva/${id}/sucesso?gateway=mp&status=success`,
                failureUrl: `${domain}/reserva/${id}/pagar?gateway=mp&status=failure`,
                pendingUrl: `${domain}/reserva/${id}/pagar?gateway=mp&status=pending`,
                notificationUrl: `${domain}/api/webhooks/mercadopago`,
            });
            await db.update(reservationsTable).set({
                mpPreferenceId: pref.preferenceId,
                mpCheckoutUrl: pref.checkoutUrl,
                paymentMethod: "mercadopago",
                status: "aprovado",
                updatedAt: new Date(),
            }).where(eq(reservationsTable.id, id));
            res.json({ checkoutUrl: pref.checkoutUrl, gateway: "mercadopago" });
        }
        else {
            const { createInfinityPayLink } = await import("../lib/infinityPay");
            const link = await createInfinityPayLink({
                reservationId: String(id),
                customerName: reservation.name,
                customerEmail: reservation.email,
                customerPhone: reservation.phone,
                description: `VaideVan — Reserva #${id} (${reservation.vehicleType})`,
                amountCents: Math.round(reservation.paymentAmount * 100),
                redirectUrl: `${domain}/reserva/${id}/sucesso?gateway=ip`,
                webhookUrl: `${domain}/api/webhooks/infinitepay`,
            });
            await db.update(reservationsTable).set({
                ipayOrderNsu: String(id),
                ipayCheckoutUrl: link.url,
                paymentMethod: "infinitepay",
                status: "aprovado",
                updatedAt: new Date(),
            }).where(eq(reservationsTable.id, id));
            res.json({ checkoutUrl: link.url, gateway: "infinitepay" });
        }
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao gerar link de pagamento." });
    }
});
/* ── Admin: deletar reserva ── */
router.delete("/admin/reservations/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    try {
        await db.delete(reservationsTable).where(eq(reservationsTable.id, id));
        res.json({ message: "Reserva removida." });
    }
    catch (err) {
        req.log.error(err);
        res.status(500).json({ error: "Erro ao remover reserva." });
    }
});
export default router;
//# sourceMappingURL=reservations.js.map