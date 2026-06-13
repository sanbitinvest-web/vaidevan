export declare function sendInvestorWelcomeEmailIfAllowed(investorId: number, data: {
    name: string;
    email: string;
}): Promise<{
    sent: boolean;
    reason: string;
} | {
    sent: boolean;
    reason?: undefined;
}>;
export declare function sendInvestorStatusEmailIfAllowed(investorId: number, data: {
    name: string;
    email: string;
    status: "approved" | "rejected";
    rejectedReason?: string | null;
    portalUrl?: string;
}): Promise<{
    sent: boolean;
    reason: string;
} | {
    sent: boolean;
    reason?: undefined;
}>;
//# sourceMappingURL=investor-mailer.d.ts.map