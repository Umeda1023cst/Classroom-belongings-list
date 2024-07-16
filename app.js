const express = require('express');
const google = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5500;
app.use(express.json());
app.use(express.static("public"));

const from_address = ''; // Your Gmail address

const CREDENTIALS_PATH = path.join(__dirname, '/public/json/credentials.json');
const TOKEN_PATH = path.join(__dirname, '/public/json/token.json');
const SETTINGS_PATH = path.join(__dirname, '/public/json/setting.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH).toString('utf8'));
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.Auth.OAuth2Client(client_id, client_secret, redirect_uris[0]);

class InputObject {
    email;
    data;

    constructor(input) {
        this.email = input.email;
        this.data = { ...input };
        delete this.data.email;
    }
}

class OutputObject {
    email;
    school_times = {};
    notification_times = {};
    items_list = {};
    body_template = "Today's items:\n{items}";
    subject = "Today's Items List";

    constructor(input) {
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        this.email = input.email;
        daysOfWeek.forEach(day => {
            const lowerDay = day.toLowerCase();
            this.school_times[day] = input.data[`school_times-${lowerDay}`];
            this.notification_times[day] = input.data[`notification_times-${lowerDay}`];
            this.items_list[day] = input.data[`${lowerDay}Items`] ? input.data[`${lowerDay}Items`].split(', ') : [""];
        });
    }
}

// トークンを読み込む
fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client);
    oAuth2Client.setCredentials(JSON.parse(token.toString('utf8')));
});

// アクセストークンを取得する関数
function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
}

// Gmailでメールを送信する関数
async function sendMail(auth, to, subject, message) {
    const gmail = google.google.gmail({ version: 'v1', auth });
    if (from_address === '') {
        console.error(`'from_address' has no value.`);
        return;
    }
    const encodedMessage = Buffer.from(`From: ${from_address}\nTo: ${to}\nSubject: ${subject}\n\n${message}`)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    try {
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });
        console.log('Success! Your email sent successfully!');
    } catch (error) {
        console.error('Error:', error);
    }
}

// メール送信エンドポイント
app.post('/send-email', (req, res) => {
    const { to, subject, message } = req.body;
    sendMail(oAuth2Client, to, subject, message)
        .then(() => res.status(200).send('Email sent successfully'))
        .catch((error) => res.status(500).send(`Error sending email: ${error}`));
});

// ユーザ設定エンドポイント
app.post('/save', async (req, res) => {
    try {
        const filePath = path.join(__dirname, '/public/json/setting.json');
        const inputData = new InputObject(req.body);
        const formattedData = new OutputObject(inputData);
        try {
            const fd = fs.openSync(filePath, "w");
            fs.writeSync(fd, JSON.stringify(formattedData, null, 4));
            fs.closeSync(fd);
        } catch (error) {
        }
        res.json({ status: 'success' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// 初期表示画面のルート
app.get('/home', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// 定期的にメールを送信する
setInterval(() => {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH).toString('utf8'));
    const today = new Date();
    const day = today.toLocaleDateString('en-US', { weekday: 'long' });
    const time = today.toTimeString().slice(0, 5);
    if (time === settings.notification_times[day]) {
        const items_list = settings.items_list[day];
        let items = '';
        items_list.forEach((item) => {
            items += `${item}\n`;
        });
        const message = settings.body_template.replace('{items}', items);
        sendMail(oAuth2Client, settings.email, settings.subject, message);
    }
}, 60000);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
