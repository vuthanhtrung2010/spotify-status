import { LoaderFunction, redirect } from "@remix-run/node";
import { spotifyApi } from "~/data";

export const loader: LoaderFunction = async () => {
  const scopes = [
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
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state");
  return redirect(authorizeURL);
};

export default function Login() {
  return null;
}
