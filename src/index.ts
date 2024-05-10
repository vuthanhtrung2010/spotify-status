import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import session from "express-session";
import axios from "axios";
import SpotifyWebApi from "spotify-web-api-node";
import path from "path";
import { PrismaClient } from "@prisma/client";
import RateLimit from 'express-rate-limit';

var limiter = RateLimit({
  windowMs: 15 * 60 * 1000 as number, // 15 minutes
  max: 100 as number, // max 100 requests per windowMs
});

require("@dotenvx/dotenvx").config();

const app: express = express();
const PORT: number = Number(process.env.PORT) || 3000;
const prisma: PrismaClient = new PrismaClient();
const prisma_user_data = prisma.user;

interface TokenData {
  token: string | null;
  refreshToken: string | null;
}

async function getData(): Promise<TokenData> {
  const allTokenData = await prisma_user_data.findUnique({
    where: {
      email: process.env.email as string,
    },
  });
  if (!allTokenData) {
    return {
      token: null,
      refreshToken: null,
    };
  }
  const token: string = allTokenData.token;
  const refreshToken: string = allTokenData.refreshToken;
  return { token, refreshToken };
}

const refreshAccessToken = async (refreshToken: string | null) => {
  const clientId: string = process.env.client_id || "";
  const clientSecret: string = process.env.client_secret || "";
  if (!refreshToken) {
    console.log("skipping refresh token. Please login");
    return;
  }
  const url: string = "https://accounts.spotify.com/api/token";
  const payload = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken as string,
  });
  const headers = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`,
      ).toString("base64")}`,
    },
  };

  try {
    const response = await axios.post(url, payload, headers);
    const data = response.data;
    const newAccessToken: string = data.access_token;

    await prisma_user_data.update({
      where: {
        email: process.env.email as string,
      },
      data: {
        token: newAccessToken as string,
      },
    });

    spotifyApi.setAccessToken(newAccessToken);

    console.log("Access token refreshed:", newAccessToken);
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
};

async function ensureData() {
  try {
    const { token, refreshToken } = await getData();
    spotifyApi.setAccessToken(token);
  } catch (error) {
    console.error("Error ensuring data:", error);
  }
}
async function startServer() {
  try {
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.locals.spotifyApi = spotifyApi;
      next();
    });

    app.use(limiter)
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(
      session({
        secret: process.env.secret as string,
        resave: true as boolean,
        saveUninitialized: true as boolean,
      }),
    );

    app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://spotify.trung.is-a.dev https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https://i.scdn.co; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.tailwindcss.com; connect-src https://spotify.trung.is-a.dev",
      );
      next();
    });

    app.set("view engine", "ejs");
    app.set("views", "views");
    app.use(express.static("public"));

    app.get("/status-data", async (req: Request, res: Response) => {
      try {
        const { token } = await getData();
        spotifyApi.setAccessToken(token);

        const status = await spotifyApi.getMyCurrentPlayingTrack();

        res.json({ status });
      } catch (error) {
        console.error("Error retrieving status data:", error);
        res
          .status(500)
          .json({ error: "An error occurred while retrieving status data" });
      }
    });

    app.get("/dashboard", async (req: Request, res: Response) => {
      try {
        const allScopes: String[] = [
          "user-read-private",
          "user-read-email",
          "user-library-read",
          "user-read-recently-played",
          "user-top-read",
          "playlist-read-private",
          "playlist-modify-public",
          "user-read-playback-state",
          "user-read-currently-playing",
        ];
        const authorizeURL: string = spotifyApi.createAuthorizeURL(allScopes, "state");
        res.redirect(authorizeURL);
      } catch (error) {
        console.error("Error generating authorization URL:", error);
        res.status(500).send("Error occurred");
      }
    });

    app.get("/callback", async (req: Request, res: Response) => {
      const { code, email } = req.query;

      if (email !== process.env.EMAIL) {
        return res.status(403).send("Unauthorized");
      }

      try {
        const data = await spotifyApi.authorizationCodeGrant(code as string);
        const { access_token, refresh_token } = data.body;

        req.session.access_token = access_token;
        req.session.refresh_token = refresh_token;

        let user_data = await prisma_user_data.findUnique({
          where: {
            email: process.env.email as string,
          },
        });

        if (!user_data) {
          await prisma_user_data.create({
            data: {
              email: process.env.email as string,
              token: access_token as string,
              refreshToken: refresh_token as string,
            },
          });
        } else {
          await prisma_user_data.update({
            where: {
              email: process.env.email as string,
            },
            data: {
              token: access_token as string,
              refreshToken: refresh_token as string,
            },
          });
        }

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        res.redirect("/");
      } catch (err) {
        console.error("Error getting tokens:", err);
        res.status(500).send("Error occurred");
      }
    });

    app.get("/", async (req: Request, res: Response) => {
      try {
        const { token } = await getData();
        spotifyApi.setAccessToken(token);

        const status = await spotifyApi.getMyCurrentPlayingTrack();

        const artists = (status.body?.item?.artists || []).map(
          (artist: any) => {
            return {
              name: artist.name,
              link: `https://open.spotify.com/artist/${artist.id}`,
            };
          },
        );
        if (status.body.currently_playing_type === "ad") {
          const track = {
            image: "None",
            name: "None",
            artists: "None",
            album: "None",
            id: "None",
            current_process: 0,
            track_duration: 0,
            track_link: `https://trung.is-a.dev`,
          };

          if (
            !status.body?.is_playing ||
            typeof status.body?.is_playing === "undefined"
          ) {
            res.render("status", { data: { isPlaying: false, track } });
          } else {
            res.render("status", { data: { isPlaying: true, track } });
          }
        }
        if (
          !status.body?.is_playing ||
          typeof status.body?.is_playing === "undefined"
        ) {
          const track = {
            image: status.body?.item?.album?.images[0]?.url || "None",
            name: status.body?.item?.name || "None",
            artists: artists.map((artist) => artist.name).join(", ") || "None",
            album: status.body?.item?.album?.name || "None",
            id: status.body?.item?.id || "None",
            current_process: status.body?.item?.progress_ms || 0,
            track_duration: status.body?.item?.duration_ms || 0,
          };
          res.render("status", { data: { isPlaying: false, track } });
          return;
        }

        const track = {
          image:
            (status.body.item.album.images[0]?.url as string) ||
            ("None" as string),
          name: (status.body.item.name as string) || ("None" as string),
          artists: (status.body?.item?.artists || []).map((artist: any) => ({
            name: artist.name as string,
            link: `https://open.spotify.com/artist/${artist.id}` as string,
          })),
          album: {
            name: (status.body.item.album.name as string) || ("None" as string),
            link: `https://open.spotify.com/album/${status.body.item.album.id}`,
          },
          id: (status.body.item.id as string) || ("None" as string),
          current_progress: status.body.progress_ms as number,
          track_duration:
            (status.body.item.duration_ms as number) || (0 as number),
        };

        res.render("status", { data: { isPlaying: true, track } });
      } catch (err) {
        console.log(err);
        if (typeof err === 'object' && typeof err !== null && typeof (err as Error).message === 'string') {
          if ((err as Error).message.includes("The access token expired")) {
            res.redirect("/dashboard");
            return;
          }
        }
        res.status(500).send("Error occurred");
      }
    });
    const { token, refreshToken } = await getData();
    if (!refreshAccessToken || refreshAccessToken === null) {
      console.log("not refreshing token. please login on route /dashboard");
    } else {
      refreshAccessToken(refreshToken);
    }
    setInterval(
      () => {
        refreshAccessToken(refreshToken);
      },
      30 * 60 * 1000,
    );

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.client_id as string,
  clientSecret: process.env.client_secret as string,
  redirectUri: process.env.redirect_uri as string,
});

(async () => {
  await ensureData();
  await startServer();
})();

module.exports = app;
