import { LoaderFunction, redirect } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { spotifyApi } from "~/data";

const prisma = new PrismaClient();

export let loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const email = url.searchParams.get("email");

  if (!code || !email || email !== process.env.email) {
    return redirect("/");
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

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
