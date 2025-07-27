// scheduler.js
const cron = require('node-cron');
const { pullHPSystem } = require('./controllers/pullHPSystem');

cron.schedule('0 * * * *', async () => {
  console.log(`[AUTO] Sync HPSystem: ${new Date().toLocaleString()}`);
  await pullHPSystem(null, null, true);
});