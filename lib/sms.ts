import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const enabled = Boolean(accountSid && authToken && fromNumber);

const client = enabled ? twilio(accountSid!, authToken!) : null;

export type SmsResult =
  | { mode: "sent"; sid: string }
  | { mode: "mocked"; preview: string }
  | { mode: "error"; error: string };

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  if (!enabled || !client) {
    console.log(`[sms:mock] → ${to}\n${body}\n`);
    return { mode: "mocked", preview: body };
  }
  try {
    const msg = await client.messages.create({
      to,
      from: fromNumber!,
      body,
    });
    return { mode: "sent", sid: msg.sid };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[sms:error]", error);
    return { mode: "error", error };
  }
}

export function discountMessage(opts: {
  restaurantName: string;
  code: string;
  discountPct: number;
}) {
  return (
    `Grazie from ${opts.restaurantName} — your feedback is in. ` +
    `Show this on your next visit for ${opts.discountPct}% off: ${opts.code}. ` +
    `One-time use, valid 30 days. Reply STOP to opt out.`
  );
}
