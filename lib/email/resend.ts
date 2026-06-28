type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

function formatFromAddress(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes('<')) return trimmed;
  return `ModelEarth <${trimmed}>`;
}

export async function sendResendEmail(input: SendEmailInput): Promise<{ ok: true } | { ok: false; detail: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromRaw = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey) return { ok: false, detail: 'RESEND_API_KEY not configured' };
  if (!fromRaw) return { ok: false, detail: 'RESEND_FROM_EMAIL not configured' };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: formatFromAddress(fromRaw),
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      reply_to: input.replyTo,
    }),
  });

  if (!res.ok) {
    let detail = `Resend HTTP ${res.status}`;
    try {
      const json = (await res.json()) as { message?: string };
      if (json.message) detail = json.message;
    } catch {
      /* ignore */
    }
    return { ok: false, detail };
  }

  return { ok: true };
}
