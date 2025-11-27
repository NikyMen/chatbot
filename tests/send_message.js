const axios = require('axios');

const to = process.argv[2];
const text = process.argv[3] || 'Hola desde el bot';

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.PHONE_NUMBER_ID;

if (!to || !token || !phoneId) {
  console.error('Uso: node tests/send_message.js <numero_con_codigo_pais> "Texto"');
  process.exit(1);
}

(async () => {
  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
  const data = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text }
  };
  try {
    const resp = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(JSON.stringify(resp.data));
  } catch (e) {
    console.error(JSON.stringify(e.response?.data || { error: e.message }));
    process.exit(1);
  }
})();
