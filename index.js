import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import fetch from "node-fetch";
import SpotifyWebApi from "spotify-web-api-node";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.mongoURI, {});

const Token = mongoose.model("token", {
  token: String,
  refreshToken: String,
});

async function getData() {
  const allTokenData = await Token.findOne();
  const token = allTokenData.token;
  const refreshToken = allTokenData.refreshToken;
  return { token, refreshToken };
}

const refreshAccessToken = async (refreshToken) => {
  const clientId = process.env.client_id;
  const clientSecret = process.env.client_secret;

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  };

  try {
    const response = await fetch(url, payload);
    const data = await response.json();
    const newAccessToken = data.access_token;

    await Token.updateOne({}, { token: newAccessToken });

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
    app.use((req, res, next) => {
      res.locals.spotifyApi = spotifyApi;
      next();
    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(
      session({
        secret: "86e3c8f0ae954893967ce6a7d2403e6d",
        resave: true,
        saveUninitialized: true,
      }),
    );

    app.use((req, res, next) => {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://spotify.trung.is-a.dev https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https://i.scdn.co; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.tailwindcss.com; connect-src https://spotify.trung.is-a.dev",
      );
      next();
    });

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.static(path.join(__dirname, "public")));

    app.get("/status-data", async (req, res) => {
      try {
        const { token } = await getData();
        spotifyApi.setAccessToken(token);

        const status = await spotifyApi.getMyCurrentPlayingTrack();

        // Process the status data and send it to the client
        // You may need to format the data according to your requirements
        res.json({ status });
      } catch (error) {
        console.error("Error retrieving status data:", error);
        res
          .status(500)
          .json({ error: "An error occurred while retrieving status data" });
      }
    });

    app.get("/dashboard", async (req, res) => {
      try {
        const allScopes = [
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
        const authorizeURL = spotifyApi.createAuthorizeURL(allScopes, "state");
        res.redirect(authorizeURL);
      } catch (error) {
        console.error("Error generating authorization URL:", error);
        res.status(500).send("Error occurred");
      }
    });

    app.get("/callback", async (req, res) => {
      const { code, email } = req.query;

      // Email check
      if (email !== process.env.EMAIL) {
        return res.status(403).send("Unauthorized");
      }

      try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;

        req.session.access_token = access_token;
        req.session.refresh_token = refresh_token;

        // Set token global network
        await Token.deleteMany();
        await Token.create({
          token: access_token,
          refreshToken: refresh_token,
        });

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        res.redirect("/");
      } catch (err) {
        console.error("Error getting tokens:", err);
        res.status(500).send("Error occurred");
      }
    });

    app.get("/", async (req, res) => {
      try {
        const { token } = await getData();
        spotifyApi.setAccessToken(token);

        const status = await spotifyApi.getMyCurrentPlayingTrack();
        
        const artists = (status.body?.item?.artists || []).map((artist) => {
          return {
            name: artist.name,
            link: `https://open.spotify.com/artist/${artist.id}`,
          };
        });
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
          image: status.body.item.album.images[0]?.url || "None",
          name: status.body.item.name || "None",
          artists: (status.body?.item?.artists || []).map((artist) => ({
            name: artist.name,
            link: `https://open.spotify.com/artist/${artist.id}`,
          })),
          album: {
            name: status.body.item.album.name || "None",
            link: `https://open.spotify.com/album/${status.body.item.album.id}`,
          },
          id: status.body.item.id || "None",
          current_progress: status.body.progress_ms,
          track_duration: status.body.item.duration_ms || 0,
        };

        res.render("status", { data: { isPlaying: true, track } });
      } catch (err) {
        console.log(err);
        if (err.message.includes("The access token expired")) {
          res.redirect("/dashboard");
          return;
        }
        res.status(500).send("Error occurred");
      }
    });
    const { token, refreshToken } = await getData();

    refreshAccessToken(refreshToken);

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
  clientId: process.env.client_id,
  clientSecret: process.env.client_secret,
  redirectUri: process.env.redirect_uri,
});

(async () => {
  await ensureData();
  await startServer();
})();
