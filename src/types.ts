export interface Artist {
  external_urls: {
    spotify: string;
  };
  name: string;
  id: string;
}

export interface Album {
  external_urls: {
    spotify: string;
  };
  images: Image[];
  name: string;
}

export interface Image {
  url: string;
  // Add other properties as needed
}

export interface TrackItem {
  album?: Album;
  artists?: Artist[];
  name: string;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

export interface CurrentTrackData {
  is_playing: boolean;
  is_pausing?: boolean;
  item: TrackItem | null;
  progress_ms: number | null;
}
