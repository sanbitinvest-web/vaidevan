export declare function sendContactEmail(data: {
    nome: string;
    email?: string;
    telefone: string;
    mensagem: string;
    tipo?: string;
    origem?: string;
}): Promise<{
    sent: boolean;
    reason: string;
} | {
    sent: boolean;
    reason?: undefined;
}>;
export declare function sendOtpEmail(data: {
    email: string;
    name: string;
    code: string;
}): Promise<{
    sent: boolean;
    reason: string;
} | {
    sent: boolean;
    reason?: undefined;
}>;
export declare function sendReservationEmail(data: {
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
}): Promise<{
    sent: boolean;
    reason: string;
} | {
    sent: boolean;
    reason?: undefined;
}>;
export declare function sendNewInvestorEmail(data: {
    name: string;
    email: string;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    adminUrl?: string;
}): Promise<{
    sent: boolean;
    reason: string;
} | {
    sent: boolean;
    reason?: undefined;
}>;
export declare function sendInvestorWelcomeEmail(data: {
    name: string;
    email: string;
    unsubscribeToken?: string | null;
}): Promise<{
    sent: boolean;
    reason: string;
} | {
    sent: boolean;
    reason?: undefined;
}>;
export declare function sendInvestorStatusEmail(data: {
    name: string;
    email: string;
    status: "approved" | "rejected";
    rejectedReason?: string | null;
    portalUrl?: string;
    unsubscribeToken?: string | null;
}): Promise<{
    sent: boolean;
    reason: string;
} | {
    sent: boolean;
    reason?: undefined;
}>;
export declare function sendSimulationEmail(data: {
    investorName: string;
    investorEmail?: string;
    modality: string;
    amount: number;
    months: number;
    realistReturn: number;
    breakEven: number | null;
}): Promise<{
    sent: boolean;
    reason: string;
} | {
    sent: boolean;
    reason?: undefined;
}>;
export declare function sendAdminLockoutAlert(data: {
    ip: string;
    maxAttempts?: number;
    lockoutMinutes?: number;
}): Promise<{
    sent: boolean;
    reason: string;
} | {
    sent: boolean;
    reason?: undefined;
}>;
//# sourceMappingURL=mailer.d.ts.map