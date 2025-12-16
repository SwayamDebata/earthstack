import { NextResponse } from 'next/server';
import riversData from '@/public/mock/rivers.json';

export async function GET() {
    return NextResponse.json(riversData);
}
