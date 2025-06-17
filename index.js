dotenv.config();const fs = require('fs');
if (!fs.existsSync('service_account.json') && process.env.SERVICE_ACCOUNT_JSON_BASE64) {
  const json = Buffer.from(process.env.SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8');
  fs.writeFileSync('service_account.json', json);
}

const express = require('express');
const bodyParser = require('body-parser');
const { extractEvent } = require('./parser');
const { addEventToCalendar } = require('./calendar');
const { scheduleReminder } = require('./reminder');

const app = express();

// ✅ Add both middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
