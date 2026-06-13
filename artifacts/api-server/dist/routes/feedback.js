import { Router } from "express";
import { db } from "@workspace/db";
import { contactLeadsTable } from "@workspace/db/schema";
import { sendContactEmail } from "../lib/mailer";
const router = Router();
router.post("/feedback", async (req, res) => {
    try {
        const { mensagem, nome, email, tipo, origem } = req.body;
        if (!mensagem || !mensagem.trim()) {
            return res.status(400).json({ error: "Mensagem é obrigatória." });
        }
        const nomeFinal = nome?.trim() || "Anônimo";
        const tipoFinal = tipo || "Feedback";
        let emailSent = false;
        try {
            const result = await sendContactEmail({
                nome: nomeFinal,
                email: email?.trim() || undefined,
                telefone: "—",
                mensagem: mensagem.trim(),
                tipo: tipoFinal,
                origem: origem || "widget-feedback",
            });
            emailSent = result.sent;
            if (!result.sent) {
                req.log?.warn({ reason: result.reason }, "Feedback: email não enviado");
            }
        }
        catch (mailErr) {
            req.log?.error(mailErr, "Feedback: erro ao enviar e-mail");
        }
        try {
            await db.insert(contactLeadsTable).values({
                nome: nomeFinal,
                email: email?.trim() || null,
                telefone: "—",
                mensagem: mensagem.trim(),
                tipo: tipoFinal,
                origem: origem || "widget-feedback",
                emailSent,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"] || null,
            });
        }
        catch (dbErr) {
            req.log?.error(dbErr, "Feedback: erro ao salvar no banco");
        }
        return res.status(200).json({ success: true });
    }
    catch (err) {
        req.log?.error(err, "[FEEDBACK] Erro interno");
        return res.status(500).json({ error: "Erro interno. Tente novamente." });
    }
});
export default router;
//# sourceMappingURL=feedback.js.map