import React from "react";
import type { Metadata, Viewport } from "next";
import "../styles.css";
import Image from "next/image";
import config from "../config.json";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || "https://spotify.trung.is-a.dev"),
  title: "Trung's Spotify Status",
  description: "A website which displays my Spotify status.",
  openGraph: {
    title: "Vũ Thành Trung",
    description: "A website which displays my Spotify status.",
    images: ["/assets/banner.png"],
  },
  twitter: {
    title: "Vũ Thành Trung",
    card: "summary_large_image",
    description: "A website which displays my Spotify status.",
    images: ["/assets/banner.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div id="container" className="container">
          <div className="user-info" id="user-info">
            <Image
              src={config.avatar ? config.avatar : "/assets/avatar.png"}
              alt="User Avatar"
              className="user-avatar"
              width={300}
              height={300}
            />
            <div className="user-name">{config.name}</div>
          </div>

          {children}

          <div className="credit" id="credit">
            Made by <a href="https://discord.gg/TR8k3MtjNZ">Vũ Thành Trung</a> |{" "}
            <a href="https://github.com/vuthanhtrung2010/spotify-status">
              Github
            </a>
          </div>

          <div className="space-y-0">
            <p className="mt-8 text-base leading-8 text-center text-gray-400">
              &copy; 2024 Trung - All Rights Reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
