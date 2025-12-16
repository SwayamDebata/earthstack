import { NextResponse } from 'next/server';
import predictData from '@/public/mock/predict.json';

export async function GET() {
    return NextResponse.json(predictData);
}
