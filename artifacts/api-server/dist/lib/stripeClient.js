import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";
export async function getStripeCredentials() {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY
        ? "repl " + process.env.REPL_IDENTITY
        : process.env.WEB_REPL_RENEWAL
            ? "depl " + process.env.WEB_REPL_RENEWAL
            : null;
    if (!hostname || !xReplitToken) {
        throw new Error("Stripe integration not connected. Connect via the Integrations tab.");
    }
    const resp = await fetch(`https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`, {
        headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken },
        signal: AbortSignal.timeout(10_000),
    });
    if (!resp.ok)
        throw new Error(`Failed to fetch Stripe credentials: ${resp.status}`);
    const data = await resp.json();
    const settings = data.items?.[0]?.settings;
    if (!settings?.secret_key)
        throw new Error("Stripe integration missing secret key.");
    return {
        secretKey: settings.secret_key,
        publishableKey: settings.publishable_key,
        webhookSecret: settings.webhook_secret,
    };
}
export async function getUncachableStripeClient() {
    const { secretKey } = await getStripeCredentials();
    return new Stripe(secretKey);
}
export async function getStripeSync() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl)
        throw new Error("DATABASE_URL required");
    const { secretKey, webhookSecret } = await getStripeCredentials();
    return new StripeSync({
        poolConfig: { connectionString: databaseUrl },
        stripeSecretKey: secretKey,
        stripeWebhookSecret: webhookSecret ?? "",
    });
}
//# sourceMappingURL=stripeClient.js.map