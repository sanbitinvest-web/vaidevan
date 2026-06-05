import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

function getClient(): MercadoPagoConfig {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado.");
  return new MercadoPagoConfig({ accessToken: token, options: { timeout: 10_000 } });
}

export interface MpPreferenceInput {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  description: string;
  amountBrl: number;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
  notificationUrl: string;
}

export async function createMpPreference(input: MpPreferenceInput) {
  const client = getClient();
  const pref = new Preference(client);

  const result = await pref.create({
    body: {
      external_reference: input.reservationId,
      items: [
        {
          id: input.reservationId,
          title: input.description,
          quantity: 1,
          unit_price: input.amountBrl,
          currency_id: "BRL",
        },
      ],
      payer: {
        name: input.customerName.split(" ")[0] ?? input.customerName,
        surname: input.customerName.split(" ").slice(1).join(" ") || undefined,
        email: input.customerEmail,
        identification: { type: "CPF", number: input.customerCpf.replace(/\D/g, "") },
      },
      payment_methods: {
        installments: 12,
        default_installments: 1,
      },
      back_urls: {
        success: input.successUrl,
        failure: input.failureUrl,
        pending: input.pendingUrl,
      },
      auto_return: "approved",
      notification_url: input.notificationUrl,
      statement_descriptor: "VAIDEVAN",
    },
  });

  return {
    preferenceId: result.id,
    checkoutUrl: result.init_point,
    sandboxUrl: result.sandbox_init_point,
  };
}

export async function getMpPayment(paymentId: string | number) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: String(paymentId) });
}
