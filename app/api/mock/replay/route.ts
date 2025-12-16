import { NextResponse } from 'next/server';
import replayData from '@/public/mock/replay.json';

export async function GET() {
    return NextResponse.json(replayData);
}
