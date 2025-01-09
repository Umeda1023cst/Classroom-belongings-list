
# Classroom-belongings-list

## Description

This app displays a list of items to bring to class and notifies you via Gmail.

## Preparation

### Installation

Install [node.js](https://nodejs.jp/) from its official website. npm should be installed along with node.js.

Run the following command in your command line or terminal.

```cmd
npm install --save-dev @types/node @types/node-forge @types/express googleapis fs readline path
```

Download all the files from [my github repository](https://github.com/Umeda1023cst/Classroom-belongings-list/tree/main) and move them to a directory of your choice.

### Get Gmail API token

Create a new project in the Google Cloud Console, enable the Gmail API, create a new OAuth 2.0 client ID for the Gmail API, and obtain credentials.json.

Create a new project in the Google Cloud Console, enable the Gmail API, and create a new OAuth 2.0 client ID for the Gmail API. Select "Web Application" from "Application Type", add "https://script.google.com/a/g.nihon-u.ac.jp/oauthcallback" or "https://script.google.com/a/nihon-u.ac.jp/oauthcallback" to the redirect URL, and click the "Create" button. Download the JSON file for the newly created OAuth 2.0 client ID and paste the contents into "credentials.json".

Run the following command to get the Gmail API access token. The access token will be saved in "token.json".

```cmd
node getToken.js
```

## Running

Run the following command to start the app.

```cmd
node app.js
```

If you see the message "Server is running on http://localhost:5500" printed to your command line or terminal screen, open your favorite web browser (I recommend Google Chrome) and type "http://localhost:5500/home" in the address bar to open the web app.
