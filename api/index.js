// Vercel serverless entry — exposes the Express web panel / pairing API.
// NOTE: Vercel cannot keep a WhatsApp (Baileys) socket alive. Host the bot itself
// on Render / Heroku / Railway / Docker and use Vercel only for the web panel.
const { app } = require('../index.js');
module.exports = app;
