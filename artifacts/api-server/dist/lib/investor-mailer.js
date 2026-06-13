import { db } from "@workspace/db";
import { investorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { sendInvestorWelcomeEmail, sendInvestorStatusEmail } from "./mailer";
async function getInvestorEmailPrefs(investorId) {
    const [row] = await db
        .select({
        emailOptOut: investorsTable.emailOptOut,
        emailUnsubscribeToken: investorsTable.emailUnsubscribeToken,
    })
        .from(investorsTable)
        .where(eq(investorsTable.id, investorId))
        .limit(1);
    return row ?? null;
}
export async function sendInvestorWelcomeEmailIfAllowed(investorId, data) {
    const prefs = await getInvestorEmailPrefs(investorId);
    if (prefs?.emailOptOut)
        return { sent: false, reason: "opted-out" };
    return sendInvestorWelcomeEmail({
        ...data,
        unsubscribeToken: prefs?.emailUnsubscribeToken ?? undefined,
    });
}
export async function sendInvestorStatusEmailIfAllowed(investorId, data) {
    const prefs = await getInvestorEmailPrefs(investorId);
    if (prefs?.emailOptOut)
        return { sent: false, reason: "opted-out" };
    return sendInvestorStatusEmail({
        ...data,
        unsubscribeToken: prefs?.emailUnsubscribeToken ?? undefined,
    });
}
//# sourceMappingURL=investor-mailer.js.map