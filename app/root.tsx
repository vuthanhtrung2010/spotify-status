import { Links, Meta, Outlet, Scripts, ScrollRestoration, MetaFunction } from "@remix-run/react";
import { LinksFunction } from "@remix-run/node";
import appStylesHref from "./styles.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Trung's Spotify Status" },
    {
      property: "og:title",
      content: "A website which displays my spotify status.",
    },
    {
      name: "description",
      content: "A website which displays my spotify status.",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      rel: "icon",
      href: "/favicon.ico",
      type: "image/x-icon",
    },
    {
      property: "og:image",
      content: "/assets/banner.png",
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
