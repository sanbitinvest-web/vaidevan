export interface StripeCheckoutInput {
    reservationId: string;
    description: string;
    amountBrl: number;
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
}
export declare function createStripeCheckoutSession(input: StripeCheckoutInput): Promise<{
    sessionId: string;
    checkoutUrl: string;
}>;
//# sourceMappingURL=stripeCheckout.d.ts.map