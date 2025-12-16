import { NextResponse } from 'next/server';
import weatherData from '@/public/mock/weather.json';

export async function GET() {
    return NextResponse.json(weatherData);
}
