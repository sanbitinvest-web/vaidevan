import { Router } from "express";
import { db } from "@workspace/db";
import { contactLeadsTable } from "@workspace/db/schema";
import { sendContactEmail } from "../lib/mailer";

const router = Router();

router.post("/contact", async (req, res) => {
  try {
    const { nome, telefone, mensagem, tipo, email, origem } = req.body;

    if (!nome || !telefone || !mensagem) {
      return res.status(400).json({ error: "Campos obrigatórios: nome, telefone, mensagem" });
    }

    let emailSent = false;
    try {
      const result = await sendContactEmail({ nome, telefone, mensagem, tipo, email, origem });
      emailSent = result.sent;
      if (!result.sent) {
        req.log?.warn({ reason: result.reason }, "Email não enviado — SMTP não configurado ou erro");
      }
    } catch (mailErr) {
      req.log?.error(mailErr, "Erro ao enviar e-mail de contato");
    }

    try {
      await db.insert(contactLeadsTable).values({
        nome,
        email: email || null,
        telefone,
        mensagem,
        tipo: tipo || "contato",
        origem: origem || "site",
        emailSent,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null,
      });
    } catch (dbErr) {
      req.log?.error(dbErr, "Erro ao salvar lead no banco");
    }

    return res.status(200).json({
      success: true,
      message: "Solicitação recebida. Nossa equipe entrará em contato em até 2 horas.",
    });
  } catch (err) {
    req.log?.error(err, "[CONTATO] Erro interno");
    return res.status(500).json({ error: "Erro interno. Tente novamente ou fale pelo WhatsApp." });
  }
});

export default router;
