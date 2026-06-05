import { Router } from "express";
import { db } from "@workspace/db";
import { investorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

const page = (title: string, heading: string, body: string, color: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title} — VaideVan</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0a0a0a;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#141414;border-radius:16px;max-width:480px;width:100%;padding:48px 40px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.4)}
    .logo{font-size:26px;font-weight:900;letter-spacing:0.05em;color:#F5E642;margin-bottom:32px}
    .icon{font-size:48px;margin-bottom:20px}
    h1{font-size:22px;font-weight:700;margin-bottom:12px;color:${color}}
    p{color:rgba(255,255,255,0.65);font-size:15px;line-height:1.6}
    a{color:#F5E642;text-decoration:none;font-weight:600}
    a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">VaideVan</div>
    <div class="icon">${heading}</div>
    ${body}
  </div>
</body>
</html>`;

/* ── GET /api/unsubscribe?token=... ── */
router.get("/unsubscribe", async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== "string" || token.length < 32) {
    res.status(400).send(page(
      "Link inválido",
      "⚠️",
      `<h1>Link inválido</h1><p>O link de descadastramento é inválido ou já expirou.<br/>Se precisar de ajuda, entre em contato pelo <a href="https://wa.me/5511999294694">WhatsApp</a>.</p>`,
      "#F59E0B",
    ));
    return;
  }

  try {
    const [investor] = await db
      .select({ id: investorsTable.id, emailOptOut: investorsTable.emailOptOut })
      .from(investorsTable)
      .where(eq(investorsTable.emailUnsubscribeToken, token))
      .limit(1);

    if (!investor) {
      res.status(404).send(page(
        "Link não encontrado",
        "🔍",
        `<h1>Link não encontrado</h1><p>Não foi possível localizar sua conta com este link.<br/>Se precisar de ajuda, entre em contato pelo <a href="https://wa.me/5511999294694">WhatsApp</a>.</p>`,
        "#F59E0B",
      ));
      return;
    }

    if (investor.emailOptOut) {
      res.send(page(
        "Já descadastrado",
        "✅",
        `<h1 style="color:#6EE7B7">Você já está descadastrado</h1><p>Seu e-mail já foi removido da nossa lista de comunicações.<br/><br/>Se mudar de ideia, fale conosco pelo <a href="https://wa.me/5511999294694">WhatsApp</a>.</p>`,
        "#6EE7B7",
      ));
      return;
    }

    await db
      .update(investorsTable)
      .set({ emailOptOut: true, updatedAt: new Date() })
      .where(eq(investorsTable.id, investor.id));

    req.log?.info({ investorId: investor.id }, "Investidor optou por não receber e-mails");

    res.send(page(
      "Descadastrado com sucesso",
      "✅",
      `<h1 style="color:#6EE7B7">Descadastramento realizado</h1><p>Seu e-mail foi removido com sucesso da nossa lista de comunicações.<br/><br/>Você não receberá mais e-mails automáticos da VaideVan.<br/><br/>Se mudar de ideia ou tiver dúvidas, fale conosco pelo <a href="https://wa.me/5511999294694">WhatsApp</a>.</p>`,
      "#6EE7B7",
    ));
  } catch (err) {
    req.log?.error(err);
    res.status(500).send(page(
      "Erro interno",
      "❌",
      `<h1>Erro interno</h1><p>Não foi possível processar sua solicitação agora. Tente novamente em alguns instantes ou entre em contato pelo <a href="https://wa.me/5511999294694">WhatsApp</a>.</p>`,
      "#EF4444",
    ));
  }
});

export default router;
