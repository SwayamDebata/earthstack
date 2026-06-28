import { sendResendEmail } from '@/lib/email/resend';

export type PilotRequestInput = {
  name: string;
  organization: string;
  email: string;
  region: string;
  useCase: string;
};

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function notifyFounderOfPilotRequest(payload: PilotRequestInput) {
  const to = process.env.PILOT_NOTIFY_EMAIL?.trim();
  if (!to) return { ok: false as const, detail: 'PILOT_NOTIFY_EMAIL not configured' };

  const html = `
    <h2>New district pilot request</h2>
    <p><strong>Name:</strong> ${esc(payload.name)}</p>
    <p><strong>Organization:</strong> ${esc(payload.organization)}</p>
    <p><strong>Email:</strong> <a href="mailto:${esc(payload.email)}">${esc(payload.email)}</a></p>
    <p><strong>Region:</strong> ${esc(payload.region)}</p>
    <p><strong>Use case:</strong></p>
    <p>${esc(payload.useCase).replace(/\n/g, '<br/>')}</p>
    <hr/>
    <p style="color:#64748b;font-size:12px;">To approve: reply with your pilot unlock code, or share <code>NEXT_PUBLIC_PILOT_UNLOCK_CODE</code> privately after briefing.</p>
  `;

  return sendResendEmail({
    to,
    subject: `[ModelEarth] Pilot request · ${payload.organization}`,
    html,
    replyTo: payload.email,
  });
}

export async function sendPilotRequestAck(payload: PilotRequestInput) {
  const html = `
    <p>Hi ${esc(payload.name)},</p>
    <p>Thanks for requesting a ModelEarth district pilot briefing.</p>
    <p>We received your details for <strong>${esc(payload.organization)}</strong> (${esc(payload.region)}). Our team will review and reach out shortly.</p>
    <p>Meanwhile you can continue the live command preview and historical replay on the site.</p>
    <p style="color:#64748b;font-size:12px;">ModelEarth · Climate intelligence</p>
  `;

  return sendResendEmail({
    to: payload.email,
    subject: 'ModelEarth pilot request received',
    html,
  });
}
