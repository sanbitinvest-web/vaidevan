export interface IpLinkInput {
    reservationId: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    description: string;
    amountCents: number;
    redirectUrl: string;
    webhookUrl: string;
}
export interface IpLinkResult {
    url: string;
}
export declare function createInfinityPayLink(input: IpLinkInput): Promise<IpLinkResult>;
export declare function checkInfinityPayment(handle: string, orderNsu: string, transactionNsu: string, slug: string): Promise<{
    success: boolean;
    paid: boolean;
    amount: number;
    capture_method: string;
}>;
//# sourceMappingURL=infinityPay.d.ts.map