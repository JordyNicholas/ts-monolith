// src/shared/server.ts
import 'dotenv/config'; // Ensure variables are loaded before server start
import { app } from './infra/http/app.js'; // Import the instance, not the framework

const start = async () => {
  try {
    // Host 0.0.0.0 is critical for Docker/Cloud deployments later
    await app.listen({ port: 3333, host: '0.0.0.0' });
    console.log('🚀 HTTP Server running on http://localhost:3333');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

await start();
