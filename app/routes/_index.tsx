import { useEffect } from "react";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { getCurrentPlayingTrack } from "../data";
import { CurrentTrackData } from "~/types";
import { cacheAssets } from "remix-utils/cache-assets";

export const loader: LoaderFunction = async () => {
  const trackData = await getCurrentPlayingTrack();
  return json(trackData);
};

cacheAssets({ cacheName: "assets", buildPath: "/build/" }).catch((error) => {
  // do something with the error, or not
});

export default function Index() {
  const trackData: CurrentTrackData = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  useEffect(() => {
    const id = setInterval(revalidate, 1000);
    return () => clearInterval(id);
  }, [revalidate]);

  // Check if playing or nah
  if (!trackData.is_playing) {
    return (
      <div className="container" id="container">
        <div className="status" id="status">
          <p>Currently not playing any track.</p>
        </div>
      </div>
    );
  }

  const track = trackData.item;

  return (
    <div className="container" id="container">
      <div className="status" id="status">
        <div className="track-info-container">
          <img
            src={track.album.images[0].url}
            alt="Track Image"
            className="track-image"
          />
          <div className="track-details">
            <h2 className="track-name">
              <a href={track.external_urls.spotify}>{track.name}</a>
            </h2>
            <div className="progress-bar-container">
              <div className="progress-bar" id="progress-bar">
                <div className="progress-bar-background"></div>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${
                      (trackData.progress_ms / track.duration_ms) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="time-display">
              <span className="start-time">00:00</span>
              <span className="end-time">
                {new Date(track.duration_ms).toISOString().substring(14, 5)}
              </span>
            </div>
            <p className="artist-name">
              by{" "}
              <span className="artists">
                {track.artists.map((artist, index) => (
                  <span key={artist.id}>
                    <a href={artist.external_urls.spotify}>{artist.name}</a>
                    {index < track.artists.length - 1 && ", "}
                  </span>
                ))}
              </span>
            </p>
            <p className="album-name">
              on{" "}
              <a href={track.album.external_urls.spotify}>{track.album.name}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
