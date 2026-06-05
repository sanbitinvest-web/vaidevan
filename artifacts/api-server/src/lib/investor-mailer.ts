import { db } from "@workspace/db";
import { investorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { sendInvestorWelcomeEmail, sendInvestorStatusEmail } from "./mailer";

async function getInvestorEmailPrefs(investorId: number) {
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

export async function sendInvestorWelcomeEmailIfAllowed(
  investorId: number,
  data: { name: string; email: string },
) {
  const prefs = await getInvestorEmailPrefs(investorId);
  if (prefs?.emailOptOut) return { sent: false, reason: "opted-out" };
  return sendInvestorWelcomeEmail({
    ...data,
    unsubscribeToken: prefs?.emailUnsubscribeToken ?? undefined,
  });
}

export async function sendInvestorStatusEmailIfAllowed(
  investorId: number,
  data: {
    name: string;
    email: string;
    status: "approved" | "rejected";
    rejectedReason?: string | null;
    portalUrl?: string;
  },
) {
  const prefs = await getInvestorEmailPrefs(investorId);
  if (prefs?.emailOptOut) return { sent: false, reason: "opted-out" };
  return sendInvestorStatusEmail({
    ...data,
    unsubscribeToken: prefs?.emailUnsubscribeToken ?? undefined,
  });
}
