import axios from "axios";
import SpotifyWebApi from "spotify-web-api-node";
import { PrismaClient } from "@prisma/client";
import { CurrentTrackData } from "./types";
import "dotenv/config";

export const prisma = new PrismaClient();
export const caches = new Map();

// Define spotify API everywhere
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

export const refreshAccessToken = async (
  refreshToken: string | null,
): Promise<string | null> => {
  if (!refreshToken) return null;

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
            `${process.env.client_id}:${process.env.client_secret!}`,
          ).toString("base64")}`,
        },
      },
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
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      if (error.response.data.error === "invalid_grant") {
        console.log(
          "Refresh token is invalid or revoked. User needs to re-authenticate.",
        );
        // Clear stored tokens
        await prisma.user.update({
          where: { email: process.env.email },
          data: { token: null, refreshToken: null },
        });
        caches.delete("token");
        caches.delete("refresh_token");
        // Here, you would typically redirect the user to re-authenticate
        // This depends on your application structure
        // For example: throw a custom error that your app can catch and use to redirect the user
        throw new Error("REAUTHENTICATION_REQUIRED");
      }
    }
    return null;
  }
};

export const ensureData = async () => {
  const { token, refreshToken } = await getTokenData();
  if (token) spotifyApi.setAccessToken(token);
  if (refreshToken) await refreshAccessToken(refreshToken);
};

export const getCurrentPlayingTrack = (): Promise<CurrentTrackData | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { token, refreshToken } = await getTokenData();
      if (!token) {
        resolve(null);
        return;
      }

      spotifyApi.setAccessToken(token);

      try {
        const status = await spotifyApi.getMyCurrentPlayingTrack();

        if (status.body?.currently_playing_type === "ad") {
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
          (error.message.includes("The access token expired") ||
            error.stack?.includes("The access token expired") ||
            //eslint-disable-next-line
            (error as any).body?.error?.message === "The access token expired")
        ) {
          console.log("Token expired, refreshing...");
          const newToken = await refreshAccessToken(refreshToken);
          if (newToken) {
            console.log("Token refreshed, retrying...");
            spotifyApi.setAccessToken(newToken);
            const refreshedStatus = await spotifyApi.getMyCurrentPlayingTrack();
            resolve(refreshedStatus.body);
          } else {
            reject(new Error("Failed to refresh token"));
          }
        } else {
          reject(error as Error);
        }
      }
    } catch (e) {
      reject(e as Error);
    }
  });
};
