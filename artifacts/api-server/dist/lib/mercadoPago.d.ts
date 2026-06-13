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
export declare function createMpPreference(input: MpPreferenceInput): Promise<{
    preferenceId: string | undefined;
    checkoutUrl: string | undefined;
    sandboxUrl: string | undefined;
}>;
export declare function getMpPayment(paymentId: string | number): Promise<import("mercadopago/dist/clients/payment/commonTypes").PaymentResponse>;
//# sourceMappingURL=mercadoPago.d.ts.map