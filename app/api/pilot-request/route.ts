import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { notifyFounderOfPilotRequest, sendPilotRequestAck } from '@/lib/email/pilot-request-emails';

const PilotRequestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  organization: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  region: z.string().trim().max(200).optional().default('Unspecified'),
  useCase: z.string().trim().max(2000).optional().default('District operational pilot'),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, detail: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = PilotRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, detail: 'Invalid pilot request payload' }, { status: 400 });
  }

  const payload = {
    name: parsed.data.name,
    organization: parsed.data.organization,
    email: parsed.data.email,
    region: parsed.data.region || 'Unspecified',
    useCase: parsed.data.useCase || 'District operational pilot',
  };

  const notify = await notifyFounderOfPilotRequest(payload);
  if (!notify.ok) {
    console.error('[pilot-request] notify failed', notify.detail);
    return NextResponse.json({ ok: false, detail: notify.detail }, { status: 502 });
  }

  const autoReply = process.env.PILOT_REQUEST_AUTO_REPLY !== 'false';
  if (autoReply) {
    const ack = await sendPilotRequestAck(payload);
    if (!ack.ok) {
      console.error('[pilot-request] auto-reply failed', ack.detail);
    }
  }

  const webhook = process.env.PILOT_REQUEST_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'modelearth-dashboard', payload }),
      });
    } catch (err) {
      console.error('[pilot-request] webhook failed', err);
    }
  }

  return NextResponse.json({ ok: true });
}
