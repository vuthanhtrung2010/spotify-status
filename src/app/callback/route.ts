import { NextRequest, NextResponse } from 'next/server';
import { spotifyApi, prisma, caches } from '../../data';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url).origin);
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    // Temp set access token and refresh
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    const user_data = await spotifyApi.getMe();
    const email = user_data.body.email;

    if (!email || email !== process.env.email) {
      spotifyApi.setAccessToken('');
      spotifyApi.setRefreshToken('');
      return NextResponse.redirect(new URL(`/?error=invalidEmail&email=${email}`, request.url).origin);
    }
    
    // If match then post it to db.
    await prisma.user.upsert({
      where: { email },
      update: {
        token: access_token,
        refreshToken: refresh_token,
      },
      create: {
        email,
        token: access_token,
        refreshToken: refresh_token,
      },
    });

    caches.set('token', access_token);
    caches.set('refresh_token', refresh_token);

    return NextResponse.redirect(new URL('/', request.url).origin);
  } catch (error) {
    console.error('Error during callback:', error);
    return NextResponse.redirect(new URL('/?error=callbackError', request.url).origin);
  }
}
