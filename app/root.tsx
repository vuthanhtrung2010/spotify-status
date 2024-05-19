import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
import appStylesHref from "./styles.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>Trung's Spotify Status</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* HTML Meta Tags */}
        <meta name="description" content="A website which displays my spotify status." />
        <meta name="theme-color" content="#0096ff" />

        {/* Google / Search Engine Tags */}
        <meta itemProp="name" content="Trung" />
        <meta itemProp="description" content="A website which displays my spotify status." />
        <meta itemProp="image" content="/assets/banner.png" />

        {/* Facebook Meta Tags */}
        <meta property="og:url" content="https://spotify.trung.is-a.dev" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Trung" />
        <meta property="og:description" content="A website which displays my spotify status." />
        <meta property="og:image" content="/assets/banner.png" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Trung" />
        <meta name="twitter:description" content="A website which displays my spotify status." />
        <meta name="twitter:image" content="/assets/banner.png" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="container" className="container">
          <div className="user-info" id="user-info">
            <img
              src="/assets/avatar.png"
              alt="User Avatar"
              className="user-avatar"
            />
            <div className="user-name">Vũ Thành Trung</div>
          </div>

          <div className="credit" id="credit">
            Made by{" "}
            <a href="https://discord.gg/TR8k3MtjNZ" target="_blank">
              Vũ Thành Trung
            </a>{" "}
            |{" "}
            <a
              href="https://github.com/vuthanhtrung2010/spotify-status"
              target="_blank"
            >
              Github
            </a>
          </div>

          <div className="space-y-0">
            <p className="mt-8 text-base leading-8 text-center text-gray-400">
              &copy; 2024 Trung - All Rights Reserved.
            </p>
          </div>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
