import { getUncachableStripeClient } from "./stripeClient";
export async function createStripeCheckoutSession(input) {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: input.customerEmail,
        line_items: [
            {
                price_data: {
                    currency: "brl",
                    product_data: {
                        name: input.description,
                        metadata: { reservation_id: input.reservationId },
                    },
                    unit_amount: Math.round(input.amountBrl * 100),
                },
                quantity: 1,
            },
        ],
        metadata: { reservation_id: input.reservationId },
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        locale: "pt-BR",
        payment_intent_data: {
            metadata: { reservation_id: input.reservationId },
            statement_descriptor_suffix: "VAIDEVAN",
        },
    });
    if (!session.url)
        throw new Error("Stripe não retornou URL de checkout.");
    return {
        sessionId: session.id,
        checkoutUrl: session.url,
    };
}
//# sourceMappingURL=stripeCheckout.js.map