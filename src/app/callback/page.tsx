import { redirect } from 'next/navigation';
import { spotifyApi, prisma, caches } from '@/data';

export default async function Callback({
  searchParams,
}: {
  searchParams: { code: string | undefined };
}) {
  const { code } = searchParams;

  if (!code) {
    redirect('/');
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
      redirect(`/?error=invalidEmail&email=${email}`);
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
    redirect('/');
  } catch (error) {
    console.error('Error during callback:', error);
    redirect('/?error=callback');
  }

  return null;
}