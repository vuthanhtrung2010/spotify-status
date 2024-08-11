"use client";

import React, { useEffect, useState } from "react";
import { CurrentTrackData } from "../types";
import Image from "next/image";

export default function SpotifyStatus({
  initialTrackData,
}: Readonly<{ initialTrackData: CurrentTrackData | null }>) {
  const [trackData, setTrackData] = useState<CurrentTrackData | null>(
    initialTrackData,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/current-track?t=${Date.now()}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const newTrackData = await res.json();
        setTrackData(newTrackData);
      } catch (error) {
        console.error("Error fetching track data:", error);
      }
    };

    fetchData(); // Fetch immediately on mount
    const id = setInterval(fetchData, 1000);
    return () => clearInterval(id);
  }, []);

  if (!trackData?.is_playing) {
    return (
      <div className="container" id="container">
        <div className="status" id="status">
          <p className="not-playing">Currently not playing any track?</p>
        </div>
      </div>
    );
  }

  const track = trackData.item;

  return (
    <div className="container" id="container">
      <div className="status" id="status">
        <div className="track-info-container">
          <Image
            src={track?.album?.images[0].url as string}
            alt="Track Image"
            className="track-image"
            width={300}
            height={300}
          />
          <div className="track-details">
            <h2 className="track-name">
              <a href={track?.external_urls.spotify}>{track?.name}</a>
            </h2>
            <div className="progress-bar-container">
              <div className="progress-bar" id="progress-bar">
                <div className="progress-bar-background"></div>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${
                      ((trackData.progress_ms as number) /
                        (track?.duration_ms as number)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="time-display">
              <span className="start-time">00:00</span>
              <span className="end-time">
                {new Date(track?.duration_ms as number)
                  .toISOString()
                  .slice(14, 19)}
              </span>
            </div>
            <p className="artist-name">
              by{" "}
              <span className="artists">
                {track?.artists?.map((artist, index) => (
                  <span key={artist.id}>
                    <a href={artist.external_urls.spotify}>{artist.name}</a>
                    {index < (track?.artists?.length as number) - 1 && ", "}
                  </span>
                ))}
              </span>
            </p>
            <p className="album-name">
              on{" "}
              <a href={track?.album?.external_urls.spotify}>
                {track?.album?.name}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
