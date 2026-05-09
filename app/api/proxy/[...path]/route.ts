import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_UPSTREAM_TIMEOUT_MS } from '@/lib/config';

export const runtime = 'nodejs';

function upstreamErrorPayload(target: string, error: unknown) {
  const err = error as NodeJS.ErrnoException & { cause?: unknown };
  const message = error instanceof Error ? error.message : String(error);
  const code = typeof err.code === 'string' ? err.code : undefined;
  return {
    error: 'UPSTREAM_UNAVAILABLE',
    message,
    code,
    target,
    hint:
      'Next.js could not complete fetch() to the API. Typical causes: DNS failure, firewall/VPN, API down, wrong API_BASE_URL, or TLS issues. Set API_BASE_URL in .env.local and retry.',
  };
}

async function proxy(request: NextRequest, method: 'GET' | 'POST') {
  const pathParts = request.nextUrl.pathname.split('/').slice(3);
  const path = pathParts.join('/');
  const target = new URL(`${API_BASE_URL}/${path}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const targetStr = target.toString();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(targetStr, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'EarthStack-NextProxy/1.0',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (error) {
    const payload = upstreamErrorPayload(targetStr, error);
    console.error('[EarthStack Proxy Error]', { method, ...payload, raw: error });
    return NextResponse.json(payload, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  return proxy(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxy(request, 'POST');
}
