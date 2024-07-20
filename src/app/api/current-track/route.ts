import { NextResponse } from 'next/server';
import { getCurrentPlayingTrack } from '@/data';

export const revalidate = 0;

export async function GET() {
  try {
    const trackData = await getCurrentPlayingTrack();
    return NextResponse.json(trackData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch track data' }, { status: 500 });
  }
}
