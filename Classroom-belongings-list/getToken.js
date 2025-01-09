const { readFile, writeFile } = require('fs');
const { createInterface } = require('readline');
const { google } = require('googleapis');

// OAuth2クライアントをセットアップするために認証情報を読み込む
const CREDENTIALS_PATH = 'C:/College/3rd/ソフトウェア工学/gmail/dist/public/model/credentials.json';
const TOKEN_PATH = 'C:/College/3rd/ソフトウェア工学/gmail/dist/public/model/token.json';

readFile(CREDENTIALS_PATH, (err, content) => {
    if (err) return console.error('Error loading client secret file:', err);
    authorize(JSON.parse(content), getAccessToken);
});

/**
 * OAuth2クライアントを作成し、指定されたコールバック関数を実行します。
 * @param {Object} credentials 認証情報。
 * @param {function} callback コールバック関数。
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // トークンを読み込む
    readFile(TOKEN_PATH, (err, token) => {
        if (err) return callback(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * ユーザーに認証URLを提供し、認証コードを入力させてから新しいトークンを取得します。
 * @param {google.auth.OAuth2} oAuth2Client OAuth2クライアント。
 */
function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.send'],
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // トークンを保存する
            writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error('Error storing token', err);
                console.log('Token stored to', TOKEN_PATH);
            });
        });
    });
}
