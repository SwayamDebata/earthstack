import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, detail: 'Invalid JSON' }, { status: 400 });
  }

  const webhook = process.env.PILOT_REQUEST_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'modelearth-dashboard', payload: body }),
      });
    } catch (err) {
      console.error('[pilot-request] webhook failed', err);
    }
  } else {
    console.info('[pilot-request]', JSON.stringify(body));
  }

  return NextResponse.json({ ok: true });
}
