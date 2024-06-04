import { LoaderFunction, redirect } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { spotifyApi } from "~/data";

const prisma = new PrismaClient();

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/");
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, email } = data.body;
    if (!email || !email === process.env.email) {
      return redirect("/")
    }
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

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    return redirect("/");
  } catch (error) {
    console.error("Error during callback:", error);
    return redirect("/?error=callback");
  }
};

export default function Callback() {
  return null;
}
