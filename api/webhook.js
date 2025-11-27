const axios = require('axios');

// Variables de entorno que debes configurar en Vercel
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

module.exports = async (req, res) => {
  // Verificación del webhook (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Token de verificación inválido');
  }

  // Recepción de mensajes (POST)
  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        const entries = body.entry;

        for (const entry of entries) {
          const changes = entry.changes;
          
          for (const change of changes) {
            if (change.field === 'messages') {
              const value = change.value;
              
              if (value.messages) {
                const message = value.messages[0];
                const from = message.from;
                const messageText = message.text?.body;
                
                console.log(`Mensaje de ${from}: ${messageText}`);
                
                // Respuesta automática
                await sendMessage(from, generateResponse(messageText));
              }
            }
          }
        }
        
        return res.status(200).json({ status: 'success' });
      }
      
      return res.status(404).json({ status: 'not_found' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
};

// Función para generar respuestas
function generateResponse(messageText) {
  const text = messageText?.toLowerCase() || '';
  
  // Respuestas personalizadas
  if (text.includes('hola') || text.includes('buenos') || text.includes('buenas')) {
    return '¡Hola! 👋 Bienvenido/a. ¿En qué puedo ayudarte hoy?';
  }
  
  if (text.includes('precio') || text.includes('costo') || text.includes('cuanto')) {
    return 'Para información sobre precios, por favor escribe "PRECIOS" o contáctanos al 📞 +54 xxx xxx xxxx';
  }
  
  if (text.includes('horario') || text.includes('abierto')) {
    return '🕐 Nuestro horario de atención es:\nLunes a Viernes: 9:00 - 18:00\nSábados: 9:00 - 13:00';
  }
  
  if (text.includes('ubicacion') || text.includes('dirección') || text.includes('donde')) {
    return '📍 Estamos ubicados en Rosario, Santa Fe, Argentina.\n¿Necesitas la dirección exacta?';
  }
  
  if (text.includes('ayuda') || text.includes('menu') || text.includes('opciones')) {
    return '📋 *Menú de opciones:*\n\n1️⃣ Precios\n2️⃣ Horarios\n3️⃣ Ubicación\n4️⃣ Contacto\n5️⃣ Productos/Servicios\n\nEscribe el número o palabra clave.';
  }
  
  // Respuesta por defecto
  return 'Gracias por tu mensaje. Un representante te responderá pronto. Para opciones rápidas, escribe "MENU". 😊';
}

// Función para enviar mensajes
async function sendMessage(to, text) {
  try {
    const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
    
    const data = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text }
    };
    
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Mensaje enviado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error enviando mensaje:', error.response?.data || error.message);
    throw error;
  }
}
