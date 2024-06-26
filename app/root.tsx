import { Links, Meta, Outlet, Scripts, ScrollRestoration, MetaFunction, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
import appStylesHref from "./styles.css?url";
import { SpeedInsights } from "@vercel/speed-insights/remix"
import { Analytics } from "@vercel/analytics/react"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
  {
    rel: "icon",
    href: "/favicon.ico",
    type: "image/x-icon",
  },
];

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
              ? error.message
              : "Unknown Error"}
        </h1>
        <Scripts />
      </body>
    </html>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "Trung's Spotify Status" },
    {
      property: "og:title",
      content: "Vũ Thành Trung",
    },
    {
      name: "description",
      content: "A website which displays my Spotify status.",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      property: "og:image",
      content: "/assets/banner.png",
    },
    // Specify UTF-8 character encoding
    {
      charset: "UTF-8",
    },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
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
            <a href="https://discord.gg/TR8k3MtjNZ">
              Vũ Thành Trung
            </a>{" "}
            |{" "}
            <a
              href="https://github.com/vuthanhtrung2010/spotify-status"
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
