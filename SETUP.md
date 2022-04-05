# CryptoShare Setup Instructions

This document will explain how to set up CryptoShare's API, and how to install the app on each platform.

### User Accounts

Please note that you must create a user called "Admin" in order to access and modify admin settings (such as disabling user registration). Once you've created the "Admin" user, you can then create a new account with whatever name you want and disable user registration and only use the admin account to change server-side settings.

### Stock API

The admin can switch between two stock API modes: Internal and External. Internal tells the CryptoShare API to directly fetch data from the Yahoo Finance API. This is useful when the admin is the only user, or if they're hosting CryptoShare for a few friends at most. However, since the host device is sending requests to the Yahoo Finance API from the admin's IP, eventually Yahoo Finance might block the IP if there are too many requests. As such, it is recommended that admins swtich to the "External" option, which uses a third-party API that also fetches data from Yahoo Finance. In this case, however, each CryptoShare user would have to provide an API key, and the admin's IP wouldn't get blocked. **Stock market data is cached for 24 hours**, and is shared between users. So if one user views the market data of AAPL for example, other users who view the data on the same day won't be triggering the CryptoShare API to make a request to the third-party API or even Yahoo Finance directly. You can imagine it as crowdsourcing market data basically. This was the best compromise as free stock market APIs don't really exist.

### Docker

If you use Docker, then simply follow the instructions on the [Docker Hub repository](https://hub.docker.com/r/xtrendence/cryptoshare).

Use `docker pull xtrendence/cryptoshare:latest` to quickly pull the latest image.

### API

Before you can set up the API, you will need to download and install [Node.js](https://nodejs.org/en/download/) (LTS). In order to set up the API, download the `API-And-Website.zip` file from the latest [release](https://github.com/Xtrendence/CryptoShare/releases). Once downloaded, extract the content, and place the `CryptoShare` folder wherever you want. Using a CLI such as Git Bash, Terminal or Powershell, `cd` into the `CryptoShare/api/` directory and run the `npm install` command to install the Node modules that CryptoShare's API uses. Once done, run the `npm start` command to start the server. The API will try to get the local IP of your device and output it, but if it fails to do so, you might have to find the IP address on your own in order to use CryptoShare on other devices.

By default, port 3190 is used, but you may modify this in `CryptoShare/api/src/utils/Utils.ts`.

### Web App

After following the instructions above, you should be able to use the web app immediately by simply going to the IP address of the host device (or http://127.0.0.1:3190 / http://localhost:3190 if using the host device itself to access it).

### Desktop App

Download the latest version of the desktop app for the platform of your choice from the [Releases](https://github.com/Xtrendence/CryptoShare/releases) section, and install it. Once installed, open the app, and enter the API URL, which would be the IP address of the host device followed by `:3190/graphql`. So if your host device's IP address is `192.168.1.50`, then the API URL would be `http://192.168.1.50:3190/graphql`. 

### Mobile App

Download the latest version of the mobile app from the [Releases](https://github.com/Xtrendence/CryptoShare/releases) section, and install it. Once installed, open the app, and enter the API URL, which would be the IP address of the host device followed by `:3190/graphql`. So if your host device's IP address is `192.168.1.50`, then the API URL would be `http://192.168.1.50:3190/graphql`. Optionally, you may use the web or desktop app to generate a login QR code from the "Settings" page, and scan the QR code using the mobile app. This would automatically log you in without having to enter any details. Please note that this doesn't work if you're accessing the web or desktop app using `127.0.0.1` or `localhost`, you must use the device's local IP address.

### Additional Information

#### Reverse Proxy

If you wish to use a reverse proxy to access CryptoShare (for example, you may want to access it through your domain, and have Apache forward requests to the Node.js server), please keep in mind that I cannot help, as the app wasn't meant to be accessed that way, and doing so can be a hassle. This is mostly because the chat bot uses Socket.IO, which has a tedious [process](https://socket.io/docs/v3/reverse-proxy/) when it comes to getting it to work behind a reverse proxy as Apache would have to forward requests using `ws://` (WebSocket protocol) to the Node.js server.