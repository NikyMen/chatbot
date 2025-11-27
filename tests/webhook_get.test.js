process.env.VERIFY_TOKEN = 'token_prueba';
const webhook = require('../api/webhook');

const req = {
  method: 'GET',
  query: {
    'hub.mode': 'subscribe',
    'hub.verify_token': 'token_prueba',
    'hub.challenge': 'CHALLENGE'
  }
};

const result = { status: null, body: null };

const res = {
  status(code) { result.status = code; return this; },
  send(body) { result.body = body; console.log(body); },
  json(obj) { console.log(JSON.stringify(obj)); return this; }
};

(async () => {
  await webhook(req, res);
  if (result.status === 200 && result.body === 'CHALLENGE') {
    console.log('OK');
    process.exit(0);
  } else {
    console.error('FAILED', result);
    process.exit(1);
  }
})();
