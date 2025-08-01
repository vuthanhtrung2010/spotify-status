# Support Server

<a href="https://discord.gg/5q6zxM5vnT"><img src="https://discord.com/api/guilds/1142287130526224404/widget.png"></a>

# Important notes and thank ❤️

First of all, thanks for using this Source Code, it was and is a ton of work to create and maintain it!
That's why I'm asking everyone to [**donate a little bit of money**](https://ko-fi.com/devtrung) (via Paypal through ko-fi) or if that's not possible, then join my [Discord Server](https://discord.gg/5q6zxM5vnT)!

**NOTE:** If you are gonna deploy on Cloudflare workers/pages please use [this repo](https://github.com/vuthanhtrung2010/spotify-status-cloudflare-d1)

# Installation Guide 🔥

## ✅ Hosting Requirements

<details>
  <summary>Click to expand</summary>

- [nodejs](https://nodejs.org) version 20 or higher, I recommend the latest STABLE version
- A VPS would be advised, so you don't need to keep your PC/Laptop/RasPi 24/7 online!
- At least 2GB of RAM & 0.5 - 0.75vCPU with 2GB storage.

</details>

## 🤖 Website Requirements

<details>
  <summary>Click to expand</summary>

1. Download the [Source Code](https://github.com/vuthanhtrung2010/spotify-status)
   - Either by: `git clone https://github.com/vuthanhtrung2010/spotify-status`
   - Or by downloading it as a zip from a branch

</details>

## 🤖 Configuration and Starting

<details>
  <summary>Click to expand</summary>

**NOTE:** _You can do the exact same configuration inside of the `.env.example` file, just make sure to rename it to `.env` or use environment variables!_

1.  Ensure that you have installed all node modules by running `pnpm i`
2.  Ensure that you have renamed `.env.example` to `.env` and added environment variables
3.  Now run `pnpm run build` then run `pnpm start` or `pnpm start` or `pm2 start pnpm --name Status -- start` if you using a VPS to run the website as production mode. You can also run the website as developer mode by `pnpm run dev` or `pm2 start "pnpm run dev" --name Status`. Might add `npx` to the prefix of `pm2` if you are not using the runtime version!
4.  Now go to the `/login` route and login to your Spotify Account!
5.  Enjoy!

</details>

## ❓ Where to get which Api-Key(s)

<details>
  <summary>Click to expand</summary>

**NOTE:** _You can do the exact same configuration inside of the `.env.example` file, just make sure to rename it to `.env` or use environment variables!_

1. `./.env`
   - `client_secret` you can get from: [Spotify Developer Dashboard](https://developer.spotify.com)
   - `client_id` you can get from: [Spotify Developer Dashboard](https://developer.spotify.com)
   - `redirect_uri` whatever you set for your domain/website, route `/callback`. Eg: `https://spotify.trunghsgs.edu.vn/callback`
   - `DATABASE_URL` get from your self hosted database. PostgreSQL. See the list of supported versions by Prisma [here](https://www.prisma.io/docs/orm/reference/supported-databases)
   - `email` is email that you use to register to Spotify platform.
   - `PORT` is your port number the website listening to. Default listening port will be 3000.
   - `BASE_URL` your base URL. Eg: `https://spotify.trunghsgs.edu.vn`

</details>

# Contributing

> If you want to help improve the code, fix spelling or design Errors or if possible even code errors, you may create PULL REQUESTS.
> Please create pull request compare to beta branch, else you will get instant close!
> Please consider, that [**Vũ Thành Trung**](https://github.com/vuthanhtrung2010) is the main Developer of this project!
