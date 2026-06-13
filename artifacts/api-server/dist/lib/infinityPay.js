const IP_BASE = "https://api.infinitepay.io/invoices/public/checkout";
export async function createInfinityPayLink(input) {
    const handle = process.env.INFINITEPAY_HANDLE;
    if (!handle)
        throw new Error("INFINITEPAY_HANDLE não configurado.");
    const body = {
        handle,
        redirect_url: input.redirectUrl,
        webhook_url: input.webhookUrl,
        order_nsu: input.reservationId,
        items: [{ quantity: 1, price: input.amountCents, description: input.description }],
    };
    if (input.customerName || input.customerEmail || input.customerPhone) {
        body.customer = {
            name: input.customerName,
            email: input.customerEmail,
            phone_number: input.customerPhone,
        };
    }
    const resp = await fetch(`${IP_BASE}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
    });
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`InfinityPay error ${resp.status}: ${text}`);
    }
    const data = await resp.json();
    if (!data.url)
        throw new Error("InfinityPay não retornou URL de pagamento.");
    return { url: data.url };
}
export async function checkInfinityPayment(handle, orderNsu, transactionNsu, slug) {
    const resp = await fetch(`${IP_BASE}/payment_check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, order_nsu: orderNsu, transaction_nsu: transactionNsu, slug }),
        signal: AbortSignal.timeout(10_000),
    });
    if (!resp.ok)
        throw new Error(`InfinityPay check error ${resp.status}`);
    return resp.json();
}
//# sourceMappingURL=infinityPay.js.map