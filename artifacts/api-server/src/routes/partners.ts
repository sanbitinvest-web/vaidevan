import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@workspace/db";
import { partnersTable, investorsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { sendNewInvestorEmail, sendInvestorWelcomeEmail } from "../lib/mailer";

const router = Router();

/* ── Público: cadastro de parceiro/investidor ── */
router.post("/partners", async (req, res) => {
  const {
    type, name, email, phone, cpf, cnpj, companyName, city, state, message, howFound,
    cnhUrl, addressProofUrl, selfieUrl, crlvUrls, contratoSocialUrl, commercialRefs,
    registrationGeoLat, registrationGeoLng, registrationGeoAccuracy,
    // Novos campos KYC
    occupation, patrimony, sourceOfFunds, investmentIntent, competitorDeclaration,
  } = req.body;

  if (!name?.trim() || !email?.trim()) {
    res.status(400).json({ error: "Nome e e-mail são obrigatórios." });
    return;
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    res.status(400).json({ error: "E-mail inválido." });
    return;
  }

  // Captura IP e User-Agent para auditoria antifraude
  const registrationIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null;
  const registrationUserAgent = req.headers["user-agent"] || null;

  try {
    const [partner] = await db.insert(partnersTable).values({
      type: type || "investidor",
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      cpf: cpf?.trim() || null,
      cnpj: cnpj?.trim() || null,
      companyName: companyName?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      message: message?.trim() || null,
      howFound: howFound?.trim() || null,
      status: "novo",
      cnhUrl: cnhUrl?.trim() || null,
      addressProofUrl: addressProofUrl?.trim() || null,
      selfieUrl: selfieUrl?.trim() || null,
      crlvUrls: Array.isArray(crlvUrls) && crlvUrls.length ? crlvUrls : null,
      contratoSocialUrl: contratoSocialUrl?.trim() || null,
      commercialRefs: Array.isArray(commercialRefs) && commercialRefs.length ? commercialRefs : null,
      // KYC
      occupation: occupation?.trim() || null,
      patrimony: patrimony?.trim() || null,
      sourceOfFunds: sourceOfFunds?.trim() || null,
      investmentIntent: investmentIntent?.trim() || null,
      competitorDeclaration: competitorDeclaration === true,
      // Auditoria
      registrationIp,
      registrationUserAgent,
      registrationGeoLat: registrationGeoLat ? Number(registrationGeoLat) : null,
      registrationGeoLng: registrationGeoLng ? Number(registrationGeoLng) : null,
      registrationGeoAccuracy: registrationGeoAccuracy ? Number(registrationGeoAccuracy) : null,
    }).returning();

    // Para investidores: criar conta pendente no portal automaticamente
    // O acesso só será liberado após aprovação interna da VaideVan
    let investorCreated = false;
    if ((type || "investidor") === "investidor") {
      const normalizedEmail = email.trim().toLowerCase();

      // Verifica se já existe uma conta com esse e-mail
      const [existing] = await db
        .select({ id: investorsTable.id })
        .from(investorsTable)
        .where(eq(investorsTable.email, normalizedEmail))
        .limit(1);

      if (!existing) {
        // Senha temporária aleatória — será redefinida pela VaideVan no momento da aprovação
        const tempPassword = crypto.randomBytes(12).toString("base64url");
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        // Token único para o link de descadastramento de e-mails (LGPD / CAN-SPAM)
        const emailUnsubscribeToken = crypto.randomBytes(32).toString("hex");

        await db.insert(investorsTable).values({
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          phone: phone?.trim() || null,
          cpf: cpf?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          approvalStatus: "pending_kyc",
          partnerApplicationId: partner.id,
          registrationIp,
          registrationUserAgent,
          active: true,
          emailUnsubscribeToken,
        });
        investorCreated = true;

        // Notifica o admin por e-mail sobre o novo investidor
        sendNewInvestorEmail({
          name: name.trim(),
          email: normalizedEmail,
          phone: phone?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
        }).then((result) => {
          if (!result.sent) {
            req.log.warn({ reason: result.reason }, "Falha ao enviar e-mail de notificação ao admin");
          }
        }).catch((mailErr) => {
          req.log.warn({ err: mailErr }, "Erro inesperado ao enviar e-mail de notificação ao admin");
        });

        // Envia e-mail de confirmação de cadastro ao próprio investidor
        sendInvestorWelcomeEmail({
          name: name.trim(),
          email: normalizedEmail,
          unsubscribeToken: emailUnsubscribeToken,
        }).then((result) => {
          if (!result.sent) {
            req.log.warn({ reason: result.reason }, "Falha ao enviar e-mail de boas-vindas ao investidor");
          }
        }).catch((mailErr) => {
          req.log.warn({ err: mailErr }, "Erro inesperado ao enviar e-mail de boas-vindas ao investidor");
        });
      }
    }

    res.status(201).json({
      success: true,
      partner: { id: partner.id },
      investorCreated,
      message:
        (type || "investidor") === "investidor"
          ? "Cadastro recebido com sucesso. Sua solicitação passará por análise interna e você será notificado quando o acesso for liberado."
          : "Cadastro recebido. Nossa equipe entrará em contato em breve.",
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao salvar cadastro. Tente novamente." });
  }
});

/* ── Admin: listar parceiros ── */
router.get("/admin/partners", requireAuth, async (req, res) => {
  try {
    const partners = await db
      .select()
      .from(partnersTable)
      .orderBy(desc(partnersTable.createdAt));
    res.json(partners);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao buscar parceiros." });
  }
});

/* ── Admin: atualizar status do parceiro ── */
router.patch("/admin/partners/:id/status", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const validStatuses = ["novo", "contatado", "aprovado", "recusado"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Status inválido." });
    return;
  }
  try {
    const [updated] = await db
      .update(partnersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(partnersTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Parceiro não encontrado." }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao atualizar status." });
  }
});

/* ── Admin: atualizar status de documento do parceiro ── */
router.patch("/admin/partners/:id/doc-status", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { field, status } = req.body;
  const validFields = ["cnhStatus", "addressProofStatus", "selfieStatus"];
  const validStatuses = ["pendente", "aprovado", "rejeitado"];
  if (!validFields.includes(field) || !validStatuses.includes(status)) {
    res.status(400).json({ error: "Campo ou status inválido." });
    return;
  }
  try {
    const [updated] = await db.update(partnersTable)
      .set({ [field]: status, updatedAt: new Date() })
      .where(eq(partnersTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Parceiro não encontrado." }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao atualizar status do documento." });
  }
});

/* ── Admin: deletar parceiro ── */
router.delete("/admin/partners/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await db.delete(partnersTable).where(eq(partnersTable.id, id));
    res.json({ message: "Parceiro removido." });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao remover parceiro." });
  }
});

export default router;
