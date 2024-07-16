import axios from "axios";
import SpotifyWebApi from "spotify-web-api-node";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export const caches = new Map();

// Define spotify api everywhere
export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.client_id,
  clientSecret: process.env.client_secret,
  redirectUri: process.env.redirect_url,
});

interface TokenData {
  token: string | null;
  refreshToken: string | null;
}

export const getTokenData = async (): Promise<TokenData> => {
  let token;
  let refresh_token;
  if (caches.has("token") && caches.has("refresh_token")) {
    token = caches.get("token");
    refresh_token = caches.get("refresh_token");
  } else {
    const user = await prisma.user.findUnique({
      where: { email: process.env.email! },
    });
    token = user?.token;
    refresh_token = user?.refreshToken;
    caches.set("token", token);
    caches.set("refresh_token", refresh_token);
  }

  return { token: token, refreshToken: refresh_token };
};

export const refreshAccessToken = async (refreshToken: string | null) => {
  if (!refreshToken) return;
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.client_id}:${process.env.client_secret!}`
          ).toString("base64")}`,
        },
      }
    );
    const { access_token } = response.data;

    // Set token everywhere
    await prisma.user.update({
      where: { email: process.env.email },
      data: { token: access_token },
    });
    caches.set("token", access_token);
    spotifyApi.setAccessToken(access_token);
    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
};

export const ensureData = async () => {
  const { token, refreshToken } = await getTokenData();
  if (token) spotifyApi.setAccessToken(token);
  if (refreshToken) await refreshAccessToken(refreshToken);
};

export const getCurrentPlayingTrack = () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const { token, refreshToken } = await getTokenData();
      if (token) {
        spotifyApi.setAccessToken(token);
        try {
          const status = await spotifyApi.getMyCurrentPlayingTrack();

          if (status.body.currently_playing_type === "ad") {
            resolve({ ...status.body, is_playing: false });
            return;
          }

          if (
            !status.body?.is_playing ||
            typeof status.body?.is_playing === "undefined"
          ) {
            resolve({ ...status.body, is_playing: false });
            return;
          }

          resolve(status.body);
        } catch (error) {
          console.error("Error fetching current track:", error);
          if (
            error instanceof Error &&
            error.message.includes("The access token expired")
          ) {
            await refreshAccessToken(refreshToken);
            const refreshedStatus = await getCurrentPlayingTrack();
            resolve(refreshedStatus);
          } else {
            reject(new Error(error as string));
          }
        }
      } else {
        resolve(null);
      }
    } catch (e) {
      reject(new Error(e as string));
    }
  });
};
