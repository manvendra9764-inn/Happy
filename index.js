const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const LOG_FILE = path.join(__dirname, 'clicks.log');
const DESTINATION = process.env.DESTINATION_URL || 'https://example.com';

function appendLog(obj){
  try{
    fs.appendFileSync(LOG_FILE, JSON.stringify(obj) + '\n');
  }catch(e){
    console.error('Failed to write log', e);
  }
}

app.get('/', (req, res) => {
  res.send('Happy tracker running. Use /t/:id');
});

// Serve the tracking page. The page will collect client-side info then post to /collect
app.get('/t/:id', (req, res) => {
  const id = req.params.id;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  const serverRecord = {
    time: new Date().toISOString(),
    id,
    ip,
    headers: req.headers
  };
  appendLog({phase: 'server', ...serverRecord});
  // Serve the static HTML. The client-side script will extract the id from the URL.
  res.sendFile(path.join(__dirname, 'public', 'track.html'));
});

app.post('/collect', (req, res) => {
  const payload = req.body || {};
  payload.time = new Date().toISOString();
  payload.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  appendLog({phase: 'client', ...payload});
  res.json({ok:true, redirect: DESTINATION});
});

// Simple health
app.get('/healthz', (req, res) => res.json({ok:true}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Tracker listening on ${PORT}. Destination: ${DESTINATION}`));
