import { LoaderFunction, redirect } from "@remix-run/node";
import { caches, prisma, spotifyApi } from "~/data";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/");
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
      spotifyApi.setAccessToken("");
      spotifyApi.setRefreshToken("");
      return redirect(`/?error=invalidEmail&email=${email}`);
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

    caches.set("token", access_token);
    caches.set("refresh_token", refresh_token);
    return redirect(`/`);
  } catch (error) {
    console.error("Error during callback:", error);
    return redirect("/?error=callback");
  }
};

export default function Callback() {
  return null;
}
