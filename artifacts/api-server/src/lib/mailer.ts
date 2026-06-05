import nodemailer from "nodemailer";

const PRIMARY = "contato@vaidevan.com";

function makeTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

function t() {
  return makeTransporter();
}

const brand = `
  <div style="background:#0A0A0A;padding:20px 24px;border-radius:8px 8px 0 0">
    <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:900;color:#F5E642;letter-spacing:0.05em">VaideVan</span>
    <span style="font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.4);margin-left:8px">Transporte Executivo</span>
  </div>
`;
const waBtn = (phone: string, name: string) =>
  `<a href="https://wa.me/${phone}?text=Ol%C3%A1%20${encodeURIComponent(name)}" style="display:inline-block;background:#25d366;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:20px">💬 Responder via WhatsApp</a>`;

export async function sendContactEmail(data: {
  nome: string;
  email?: string;
  telefone: string;
  mensagem: string;
  tipo?: string;
  origem?: string;
}) {
  const tp = t();
  if (!tp) return { sent: false, reason: "SMTP_USER/SMTP_PASS não configurados" };

  const subject = `[VaideVan] ${data.tipo || "Contato"} — ${data.nome}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.12)">
      ${brand}
      <div style="background:#fff;padding:28px 24px">
        <h2 style="margin:0 0 20px;color:#0A0A0A;font-size:20px">Novo contato via site</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;width:110px;font-size:13px"><b>Nome</b></td><td style="padding:10px 0;font-size:14px">${data.nome}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Telefone</b></td><td style="padding:10px 0;font-size:14px"><a href="tel:${data.telefone}" style="color:#0A0A0A">${data.telefone}</a></td></tr>
          ${data.email ? `<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>E-mail</b></td><td style="padding:10px 0;font-size:14px"><a href="mailto:${data.email}" style="color:#0A0A0A">${data.email}</a></td></tr>` : ""}
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Assunto</b></td><td style="padding:10px 0;font-size:14px">${data.tipo || "Geral"}</td></tr>
          <tr><td style="padding:10px 0;color:#666;font-size:13px"><b>Origem</b></td><td style="padding:10px 0;font-size:14px">${data.origem || "Site vaidevan.com"}</td></tr>
        </table>
        <div style="margin-top:20px;padding:16px 20px;background:#f8f8f8;border-left:4px solid #F5E642;border-radius:0 8px 8px 0">
          <b style="font-size:13px;color:#666;display:block;margin-bottom:8px">Mensagem:</b>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#333">${data.mensagem.replace(/\n/g, "<br/>")}</p>
        </div>
        <div style="text-align:center">
          ${waBtn("5511999294694", data.nome)}
        </div>
      </div>
      <div style="background:#f8f8f8;padding:12px 24px;text-align:center;font-size:11px;color:#aaa">
        Este e-mail foi enviado automaticamente pelo sistema VaideVan.com &nbsp;•&nbsp; Não responda diretamente a esta mensagem.
      </div>
    </div>
  </body></html>`;

  try {
    await tp.sendMail({
      from: `VaideVan Site <${process.env.SMTP_USER}>`,
      to: PRIMARY,
      cc: "vaidevan@icloud.com",
      replyTo: data.email || undefined,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}

export async function sendOtpEmail(data: {
  email: string;
  name: string;
  code: string;
}) {
  const tp = t();
  if (!tp) return { sent: false, reason: "SMTP não configurado" };

  const subject = `[VaideVan] Seu código de acesso: ${data.code}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif">
    <div style="max-width:480px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.12)">
      ${brand}
      <div style="background:#fff;padding:32px 24px;text-align:center">
        <h2 style="margin:0 0 8px;color:#0A0A0A;font-size:20px">Código de Acesso</h2>
        <p style="margin:0 0 24px;color:#666;font-size:14px">Olá, <strong>${data.name}</strong>! Use o código abaixo para entrar no Portal do Investidor.</p>
        <div style="background:#0A0A0A;border-radius:12px;padding:24px;margin-bottom:24px;display:inline-block;min-width:220px">
          <p style="margin:0;font-family:monospace;font-size:42px;font-weight:900;letter-spacing:12px;color:#F5E642">${data.code}</p>
        </div>
        <p style="margin:0 0 8px;color:#999;font-size:13px">Este código expira em <strong>10 minutos</strong>.</p>
        <p style="margin:0;color:#bbb;font-size:12px">Se você não solicitou este código, ignore este e-mail.</p>
      </div>
      <div style="background:#f8f8f8;padding:12px 24px;text-align:center;font-size:11px;color:#aaa">
        Portal do Investidor VaideVan &nbsp;•&nbsp; vaidevan.com
      </div>
    </div>
  </body></html>`;

  try {
    await tp.sendMail({
      from: `VaideVan Portal <${process.env.SMTP_USER}>`,
      to: data.email,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}

export async function sendReservationEmail(data: {
  reservationId: number;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  passengerCount: number;
  startDate: string;
  endDate: string;
  departureTime: string;
  originAddress: string;
  destinationAddress: string;
  priority: string;
  paymentMethod: string | null;
  eventType?: string | null;
  notes?: string | null;
}) {
  const tp = t();
  if (!tp) return { sent: false, reason: "SMTP_USER/SMTP_PASS não configurados" };

  const subject = `[VaideVan] Nova Reserva #${data.reservationId} — ${data.name}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.12)">
      ${brand}
      <div style="background:#fff;padding:28px 24px">
        <h2 style="margin:0 0 4px;color:#0A0A0A;font-size:20px">Nova Solicitação de Reserva</h2>
        <p style="margin:0 0 20px;color:#888;font-size:13px">Protocolo <strong>#${data.reservationId}</strong></p>
        <table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;width:140px;font-size:13px"><b>Nome</b></td><td style="padding:10px 0;font-size:14px">${data.name}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Telefone</b></td><td style="padding:10px 0;font-size:14px"><a href="tel:${data.phone}" style="color:#0A0A0A">${data.phone}</a></td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>E-mail</b></td><td style="padding:10px 0;font-size:14px"><a href="mailto:${data.email}" style="color:#0A0A0A">${data.email}</a></td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Veículo</b></td><td style="padding:10px 0;font-size:14px;font-weight:600">${data.vehicleType.replace(/_/g, " ")}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Passageiros</b></td><td style="padding:10px 0;font-size:14px">${data.passengerCount} pessoas</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Saída</b></td><td style="padding:10px 0;font-size:14px">${data.startDate} às ${data.departureTime}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Retorno</b></td><td style="padding:10px 0;font-size:14px">${data.endDate}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Origem</b></td><td style="padding:10px 0;font-size:14px">${data.originAddress}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Destino</b></td><td style="padding:10px 0;font-size:14px">${data.destinationAddress}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Prioridade</b></td><td style="padding:10px 0;font-size:14px">${data.priority}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Pagamento</b></td><td style="padding:10px 0;font-size:14px">${data.paymentMethod || "Não informado"}</td></tr>
          ${data.eventType ? `<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Evento</b></td><td style="padding:10px 0;font-size:14px">${data.eventType}</td></tr>` : ""}
          ${data.notes ? `<tr><td style="padding:10px 0;color:#666;font-size:13px"><b>Obs.</b></td><td style="padding:10px 0;font-size:14px">${data.notes}</td></tr>` : ""}
        </table>
        <div style="text-align:center">
          ${waBtn("5511999294694", data.name)}
        </div>
      </div>
      <div style="background:#f8f8f8;padding:12px 24px;text-align:center;font-size:11px;color:#aaa">
        Este e-mail foi enviado automaticamente pelo sistema VaideVan.com &nbsp;•&nbsp; Não responda diretamente a esta mensagem.
      </div>
    </div>
  </body></html>`;

  try {
    await tp.sendMail({
      from: `VaideVan Reservas <${process.env.SMTP_USER}>`,
      to: PRIMARY,
      replyTo: data.email,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}

export async function sendNewInvestorEmail(data: {
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  adminUrl?: string;
}) {
  const tp = t();
  if (!tp) return { sent: false, reason: "SMTP não configurado" };

  const adminEmail = process.env.ADMIN_EMAIL || PRIMARY;
  const adminUrl = data.adminUrl || "https://vaidevan.com/admin";

  const subject = `[VaideVan] Novo investidor aguardando aprovação — ${data.name}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.12)">
      ${brand}
      <div style="background:#fff;padding:28px 24px">
        <h2 style="margin:0 0 6px;color:#0A0A0A;font-size:20px">Novo Investidor Cadastrado</h2>
        <p style="margin:0 0 20px;color:#888;font-size:13px">Um novo candidato preencheu o formulário e aguarda análise KYC.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;width:120px;font-size:13px"><b>Nome</b></td><td style="padding:10px 0;font-size:14px">${data.name}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>E-mail</b></td><td style="padding:10px 0;font-size:14px"><a href="mailto:${data.email}" style="color:#0A0A0A">${data.email}</a></td></tr>
          ${data.phone ? `<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Telefone</b></td><td style="padding:10px 0;font-size:14px"><a href="tel:${data.phone}" style="color:#0A0A0A">${data.phone}</a></td></tr>` : ""}
          ${(data.city || data.state) ? `<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Localidade</b></td><td style="padding:10px 0;font-size:14px">${[data.city, data.state].filter(Boolean).join(" — ")}</td></tr>` : ""}
          <tr><td style="padding:10px 0;color:#666;font-size:13px"><b>Status</b></td><td style="padding:10px 0;font-size:14px"><span style="background:#FEF3C7;color:#92400E;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:700">Pendente KYC</span></td></tr>
        </table>
        <div style="text-align:center;margin-top:28px">
          <a href="${adminUrl}" style="display:inline-block;background:#0A0A0A;color:#F5E642;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.03em">Ver no Painel Admin →</a>
        </div>
      </div>
      <div style="background:#f8f8f8;padding:12px 24px;text-align:center;font-size:11px;color:#aaa">
        Este e-mail foi enviado automaticamente pelo sistema VaideVan.com &nbsp;•&nbsp; Não responda diretamente a esta mensagem.
      </div>
    </div>
  </body></html>`;

  try {
    await tp.sendMail({
      from: `VaideVan Portal <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}

export async function sendInvestorWelcomeEmail(data: {
  name: string;
  email: string;
  unsubscribeToken?: string | null;
}) {
  const tp = t();
  if (!tp) return { sent: false, reason: "SMTP não configurado" };

  const firstName = data.name.split(" ")[0];
  const baseUrl = process.env.APP_URL || "https://vaidevan.com";
  const unsubscribeUrl = data.unsubscribeToken
    ? `${baseUrl}/api/unsubscribe?token=${data.unsubscribeToken}`
    : null;
  const subject = `[VaideVan] Cadastro recebido — aguardando análise, ${firstName}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.12)">
      ${brand}
      <div style="background:#fff;padding:36px 28px">
        <h2 style="margin:0 0 8px;color:#0A0A0A;font-size:22px">Olá, ${firstName}!</h2>
        <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.6">
          Recebemos o seu cadastro como investidor da <strong>VaideVan</strong> e estamos muito felizes com o seu interesse.<br/>
          Sua solicitação foi registrada com sucesso e passará por nossa análise interna de qualificação (KYC).
        </p>

        <div style="background:#0A0A0A;border-radius:10px;padding:24px 28px;margin-bottom:28px">
          <p style="margin:0 0 16px;color:#F5E642;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Próximas etapas</p>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:10px 0;vertical-align:top;width:32px">
                <span style="display:inline-block;background:#F5E642;color:#0A0A0A;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-weight:900;font-size:12px">1</span>
              </td>
              <td style="padding:10px 0 10px 10px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5;border-bottom:1px solid rgba(255,255,255,0.08)">
                <strong style="color:#fff">Análise documental</strong><br/>Nossa equipe revisará os documentos e informações enviadas.
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;vertical-align:top;width:32px">
                <span style="display:inline-block;background:#F5E642;color:#0A0A0A;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-weight:900;font-size:12px">2</span>
              </td>
              <td style="padding:10px 0 10px 10px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5;border-bottom:1px solid rgba(255,255,255,0.08)">
                <strong style="color:#fff">Contato de um especialista</strong><br/>Um de nossos consultores entrará em contato para esclarecer dúvidas e apresentar as modalidades disponíveis.
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;vertical-align:top;width:32px">
                <span style="display:inline-block;background:#F5E642;color:#0A0A0A;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-weight:900;font-size:12px">3</span>
              </td>
              <td style="padding:10px 0 10px 10px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5">
                <strong style="color:#fff">Liberação do Portal</strong><br/>Após a aprovação, você receberá acesso completo ao Portal do Investidor com relatórios, rastreamento e contratos.
              </td>
            </tr>
          </table>
        </div>

        <div style="background:#FEF9E7;border-left:4px solid #F5E642;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px">
          <p style="margin:0;color:#78350F;font-size:14px;line-height:1.6">
            <strong>Prazo estimado:</strong> a análise KYC leva normalmente <strong>2 a 5 dias úteis</strong>. Você será notificado por e-mail assim que o processo for concluído.
          </p>
        </div>

        <p style="margin:0 0 8px;color:#444;font-size:14px;line-height:1.6">
          Ficou com alguma dúvida? Fale diretamente com a nossa equipe pelo WhatsApp:
        </p>
        <div style="text-align:center">
          <a href="https://wa.me/5511999294694?text=Ol%C3%A1%2C%20acabei%20de%20me%20cadastrar%20como%20investidor%20VaideVan%20e%20tenho%20uma%20d%C3%BAvida." style="display:inline-block;background:#25d366;color:#fff;padding:13px 30px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px">💬 Falar com a equipe VaideVan</a>
        </div>
      </div>
      <div style="background:#f8f8f8;padding:14px 24px;text-align:center;font-size:11px;color:#aaa;line-height:1.6">
        VaideVan — Transporte Executivo &nbsp;•&nbsp; vaidevan.com<br/>
        Este e-mail foi enviado automaticamente. Se você não realizou este cadastro, por favor ignore-o.
        ${unsubscribeUrl ? `<br/>Para não receber mais comunicações, <a href="${unsubscribeUrl}" style="color:#aaa;text-decoration:underline">cancele sua inscrição aqui</a>.` : ""}
      </div>
    </div>
  </body></html>`;

  try {
    await tp.sendMail({
      from: `VaideVan Portal <${process.env.SMTP_USER}>`,
      to: data.email,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}

export async function sendInvestorStatusEmail(data: {
  name: string;
  email: string;
  status: "approved" | "rejected";
  rejectedReason?: string | null;
  portalUrl?: string;
  unsubscribeToken?: string | null;
}) {
  const tp = t();
  if (!tp) return { sent: false, reason: "SMTP não configurado" };

  const firstName = data.name.split(" ")[0];
  const portalUrl = data.portalUrl || "https://vaidevan.com/portal";

  const isApproved = data.status === "approved";

  const subject = isApproved
    ? `[VaideVan] Parabéns, ${firstName}! Seu cadastro foi aprovado`
    : `[VaideVan] Atualização sobre o seu cadastro de investidor`;

  const bodyHtml = isApproved
    ? `
      <h2 style="margin:0 0 8px;color:#0A0A0A;font-size:22px">Olá, ${firstName}! Seu cadastro foi <span style="color:#059669">aprovado</span> ✅</h2>
      <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.6">
        Temos o prazer de informar que sua análise KYC foi concluída com sucesso e sua conta está liberada no <strong>Portal do Investidor VaideVan</strong>.
      </p>

      <div style="background:#0A0A0A;border-radius:10px;padding:24px 28px;margin-bottom:28px">
        <p style="margin:0 0 16px;color:#F5E642;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">O que você pode fazer agora</p>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:32px">
              <span style="display:inline-block;background:#F5E642;color:#0A0A0A;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-weight:900;font-size:12px">1</span>
            </td>
            <td style="padding:10px 0 10px 10px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5;border-bottom:1px solid rgba(255,255,255,0.08)">
              <strong style="color:#fff">Acesse o portal</strong><br/>Entre com o seu e-mail e senha cadastrados para ver seus relatórios financeiros e operações.
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:32px">
              <span style="display:inline-block;background:#F5E642;color:#0A0A0A;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-weight:900;font-size:12px">2</span>
            </td>
            <td style="padding:10px 0 10px 10px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5;border-bottom:1px solid rgba(255,255,255,0.08)">
              <strong style="color:#fff">Explore o simulador</strong><br/>Simule cenários de investimento em nossas 6 modalidades e salve os resultados.
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:32px">
              <span style="display:inline-block;background:#F5E642;color:#0A0A0A;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-weight:900;font-size:12px">3</span>
            </td>
            <td style="padding:10px 0 10px 10px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5">
              <strong style="color:#fff">Assine seu contrato</strong><br/>Acesse a seção de contratos para assinar digitalmente seu CCB via Gov.br.
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin-bottom:28px">
        <a href="${portalUrl}" style="display:inline-block;background:#059669;color:#fff;padding:15px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.03em">Acessar o Portal do Investidor →</a>
      </div>

      <p style="margin:0 0 8px;color:#444;font-size:14px;line-height:1.6">
        Ficou com alguma dúvida? Nosso time está à disposição:
      </p>
      <div style="text-align:center">
        <a href="https://wa.me/5511999294694?text=Ol%C3%A1%2C%20meu%20cadastro%20foi%20aprovado%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es." style="display:inline-block;background:#25d366;color:#fff;padding:13px 30px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px">💬 Falar com a equipe VaideVan</a>
      </div>
    `
    : `
      <h2 style="margin:0 0 8px;color:#0A0A0A;font-size:22px">Olá, ${firstName}</h2>
      <p style="margin:0 0 20px;color:#444;font-size:15px;line-height:1.6">
        Agradecemos o seu interesse em fazer parte da <strong>VaideVan</strong>.<br/>
        Após análise cuidadosa do seu cadastro, não conseguimos prosseguir com a aprovação neste momento.
      </p>

      ${data.rejectedReason ? `
      <div style="background:#FEF2F2;border-left:4px solid #EF4444;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 6px;color:#991B1B;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Motivo informado</p>
        <p style="margin:0;color:#7F1D1D;font-size:14px;line-height:1.6">${data.rejectedReason}</p>
      </div>
      ` : ""}

      <div style="background:#0A0A0A;border-radius:10px;padding:24px 28px;margin-bottom:28px">
        <p style="margin:0 0 16px;color:#F5E642;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Próximas etapas</p>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:32px">
              <span style="display:inline-block;background:#F5E642;color:#0A0A0A;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-weight:900;font-size:12px">1</span>
            </td>
            <td style="padding:10px 0 10px 10px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5;border-bottom:1px solid rgba(255,255,255,0.08)">
              <strong style="color:#fff">Verifique os documentos</strong><br/>Certifique-se de que todas as informações e documentos enviados estão corretos e atualizados.
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:32px">
              <span style="display:inline-block;background:#F5E642;color:#0A0A0A;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-weight:900;font-size:12px">2</span>
            </td>
            <td style="padding:10px 0 10px 10px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5;border-bottom:1px solid rgba(255,255,255,0.08)">
              <strong style="color:#fff">Entre em contato</strong><br/>Fale com nossa equipe pelo WhatsApp para entender como podemos ajudá-lo a se qualificar.
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:32px">
              <span style="display:inline-block;background:#F5E642;color:#0A0A0A;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-weight:900;font-size:12px">3</span>
            </td>
            <td style="padding:10px 0 10px 10px;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5">
              <strong style="color:#fff">Solicite uma nova análise</strong><br/>Após adequar os documentos, você pode solicitar uma nova avaliação da sua candidatura.
            </td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 8px;color:#444;font-size:14px;line-height:1.6">
        Nossa equipe está pronta para esclarecer dúvidas e orientá-lo sobre os próximos passos:
      </p>
      <div style="text-align:center">
        <a href="https://wa.me/5511999294694?text=Ol%C3%A1%2C%20recebi%20o%20retorno%20sobre%20meu%20cadastro%20de%20investidor%20e%20gostaria%20de%20mais%20orienta%C3%A7%C3%B5es." style="display:inline-block;background:#25d366;color:#fff;padding:13px 30px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px">💬 Falar com a equipe VaideVan</a>
      </div>
    `;

  const baseUrl = process.env.APP_URL || "https://vaidevan.com";
  const unsubscribeUrl = data.unsubscribeToken
    ? `${baseUrl}/api/unsubscribe?token=${data.unsubscribeToken}`
    : null;

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.12)">
      ${brand}
      <div style="background:#fff;padding:36px 28px">
        ${bodyHtml}
      </div>
      <div style="background:#f8f8f8;padding:14px 24px;text-align:center;font-size:11px;color:#aaa;line-height:1.6">
        VaideVan — Transporte Executivo &nbsp;•&nbsp; vaidevan.com<br/>
        Este e-mail foi enviado automaticamente. Se você não realizou este cadastro, por favor ignore-o.
        ${unsubscribeUrl ? `<br/>Para não receber mais comunicações, <a href="${unsubscribeUrl}" style="color:#aaa;text-decoration:underline">cancele sua inscrição aqui</a>.` : ""}
      </div>
    </div>
  </body></html>`;

  try {
    await tp.sendMail({
      from: `VaideVan Portal <${process.env.SMTP_USER}>`,
      to: data.email,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}

export async function sendSimulationEmail(data: {
  investorName: string;
  investorEmail?: string;
  modality: string;
  amount: number;
  months: number;
  realistReturn: number;
  breakEven: number | null;
}) {
  const tp = t();
  if (!tp) return { sent: false, reason: "SMTP não configurado" };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const roi = (((data.realistReturn - data.amount) / data.amount) * 100).toFixed(1);

  const subject = `[VaideVan Investidor] Simulação: ${data.modality} — ${fmt(data.amount)} por ${data.months}m`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.12)">
      ${brand}
      <div style="background:#fff;padding:28px 24px">
        <h2 style="margin:0 0 6px;color:#0A0A0A">Nova Simulação de Investimento</h2>
        <p style="margin:0 0 20px;color:#888;font-size:13px">Investidor acessou o simulador e salvou os resultados</p>
        <table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;width:160px;font-size:13px"><b>Investidor</b></td><td style="padding:10px 0;font-size:14px">${data.investorName}</td></tr>
          ${data.investorEmail ? `<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>E-mail</b></td><td style="padding:10px 0;font-size:14px">${data.investorEmail}</td></tr>` : ""}
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Modalidade</b></td><td style="padding:10px 0;font-size:14px;font-weight:600;color:#0A0A0A">${data.modality}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Valor Investido</b></td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#059669">${fmt(data.amount)}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Horizonte</b></td><td style="padding:10px 0;font-size:14px">${data.months} meses</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#666;font-size:13px"><b>Retorno Realista</b></td><td style="padding:10px 0;font-size:14px;font-weight:700;color:#059669">${fmt(data.realistReturn)} <span style="color:#888;font-size:12px">(+${roi}%)</span></td></tr>
          <tr><td style="padding:10px 0;color:#666;font-size:13px"><b>Mês de Break-even</b></td><td style="padding:10px 0;font-size:14px">${data.breakEven ? `${data.breakEven}º mês` : "Após período"}</td></tr>
        </table>
        <div style="text-align:center">
          ${waBtn("5511999294694", data.investorName)}
        </div>
      </div>
    </div>
  </body></html>`;

  try {
    await tp.sendMail({
      from: `VaideVan Portal <${process.env.SMTP_USER}>`,
      to: PRIMARY,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}

export async function sendAdminLockoutAlert(data: { ip: string; maxAttempts?: number; lockoutMinutes?: number }) {
  const tp = t();
  if (!tp) return { sent: false, reason: "SMTP não configurado" };

  const adminEmail = process.env.ADMIN_EMAIL || PRIMARY;
  const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const attempts = data.maxAttempts ?? 5;
  const lockMins = data.lockoutMinutes ?? 15;

  const subject = `[VaideVan] ⚠️ Alerta de segurança — tentativas de login admin bloqueadas`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.12)">
      ${brand}
      <div style="background:#fff;padding:28px 24px">
        <div style="background:#FEF2F2;border-left:4px solid #EF4444;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0 0 4px;color:#991B1B;font-size:14px;font-weight:700">Acesso ao painel admin bloqueado</p>
          <p style="margin:0;color:#7F1D1D;font-size:13px;line-height:1.6">
            Foram detectadas ${attempts} tentativas de login com senha incorreta. O endereço IP foi bloqueado temporariamente por <strong>${lockMins} minuto(s)</strong>.
          </p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#666;width:130px;font-size:13px"><b>IP</b></td>
            <td style="padding:10px 0;font-size:14px;font-family:monospace">${data.ip}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#666;font-size:13px"><b>Data/Hora</b></td>
            <td style="padding:10px 0;font-size:14px">${now} (horário de Brasília)</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#666;font-size:13px"><b>Desbloqueio</b></td>
            <td style="padding:10px 0;font-size:14px">Automático após 15 minutos</td>
          </tr>
        </table>
        <p style="margin:24px 0 0;color:#666;font-size:13px;line-height:1.6">
          Se este acesso não foi feito por você ou sua equipe, recomendamos verificar os logs do servidor e considerar atualizar a senha de administrador.
        </p>
      </div>
      <div style="background:#f8f8f8;padding:12px 24px;text-align:center;font-size:11px;color:#aaa">
        Este e-mail foi enviado automaticamente pelo sistema VaideVan.com &nbsp;•&nbsp; Não responda diretamente a esta mensagem.
      </div>
    </div>
  </body></html>`;

  try {
    await tp.sendMail({
      from: `VaideVan Segurança <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}

