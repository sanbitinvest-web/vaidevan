import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";
type StripeCredentials = {
    secretKey: string;
    publishableKey?: string;
    webhookSecret?: string;
};
export declare function getStripeCredentials(): Promise<StripeCredentials>;
export declare function getUncachableStripeClient(): Promise<Stripe>;
export declare function getStripeSync(): Promise<StripeSync>;
export {};
//# sourceMappingURL=stripeClient.d.ts.map