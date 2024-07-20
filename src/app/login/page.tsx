import { redirect } from 'next/navigation';
import { spotifyApi } from '@/data';

export default function Login() {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-read-recently-played',
    'user-top-read',
    'playlist-read-private',
    'playlist-modify-public',
    'user-read-playback-state',
    'user-read-currently-playing',
  ];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state');
  redirect(authorizeURL);
}