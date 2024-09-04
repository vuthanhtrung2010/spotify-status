import React from "react";
import { getCurrentPlayingTrack } from "@/data";
import { CurrentTrackData } from "@/types";
import SpotifyStatus from "../components/SpotifyStatus";

async function getTrackData(): Promise<CurrentTrackData | null> {
  const trackData = await getCurrentPlayingTrack();
  return trackData;
}

export default async function Home() {
  const trackData = await getTrackData();

  return <SpotifyStatus initialTrackData={trackData} />;
}
