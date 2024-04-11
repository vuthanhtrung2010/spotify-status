# Support Server

<a href="https://discord.gg/5q6zxM5vnT"><img src="https://discord.com/api/guilds/1142287130526224404/widget.png"></a>


# Important notes and thank ❤️
First of all, thanks for using this Source Code, it was and is a ton of work to create and maintain it!
That's why I'm asking everyone to [**donate a little bit of money**](https://paypal.me/trungdev) or if that's not possible, then join my [Discord Server](https://discord.gg/5q6zxM5vnT)!

# Installation Guide 🔥

## ✅ Hosting Requirements

<details>
  <summary>Click to expand</summary>

  * [nodejs](https://nodejs.org) version 16.6 or higher, I recommend the latest STABLE version
  * A VPS would be advised, so you don't need to keep your PC/laptop/RasPi 24/7 online!

</details>

## 🤖 Website Requirements

<details>
  <summary>Click to expand</summary>
 
  1. Download the [Source Code](https://github.com/vuthanhtrung2010/spotify-status)
     * Either by: `git clone https://github.com/vuthanhtrung2010/spotify-status`
     * Or by downloading it as a zip from a branch
  
</details>

## 🤖 Configuration and Starting

<details>
  <summary>Click to expand</summary>

  **NOTE:** *You can do the exact same configuration inside of the `example.env` file, just make sure to rename it to `.env` or use environment variables!*
 
   1. Ensure that you have installed all node modules by running `npm i`
   2. Ensure that you have renamed `example.env` to `.env` and added environment variables
   3. Now run `node index.js` or `pm2 start index.js --name Spotify Status` if you using a VPS. Might add `npx` to the prefix of `pm2`!
  
</details>

## ❓ Where to get which Api-Key(s)

<details>
  <summary>Click to expand</summary>

  **NOTE:** *You can do the exact same configuration inside of the `example.env` file, just make sure to rename it to `.env` or use environment variables!*
 
  1. `./.env`
     * `clientSecret` you can get from: [Spotify-Developer](https://developer.spotify.com)
     * `clientID` you can get from: [Spotify-Developer](https://developer.spotify.com)
     * `redirectURL` whatever you set for your domain/website, route `/callback`
  
</details>

# Contributing

> If you want to help improve the code, fix spelling or design Errors or if possible even code errors, you may create PULL REQUESTS.
> Please create pull request compare to beta branch, else you will get instant close!
> Please consider, that [**Vũ Thành Trung**](https://github.com/vuthanhtrung2010) is the main Developer of this project!