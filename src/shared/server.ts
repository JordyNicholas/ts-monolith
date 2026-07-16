import 'dotenv/config'; // Ensure variables are loaded before server start
import { app } from './infra/http/app.js'; // Import the instance, not the framework
import { env } from './infra/env/index.js';

async function bootstrap(): Promise<void> {
  try {
    // Host 0.0.0.0 is critical for Docker/Cloud deployments later
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Monolith Server running on http://localhost:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

await bootstrap();

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
for (const signal of signals) {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}. Initiating graceful shutdown...`);
    try {
      // This triggers Fastify to drain connections and fire onClose hooks, including Prisma disconnect
      await app.close();
      app.log.info(`Server gracefully shut down on ${signal}`);
      process.exit(0);
    } catch (error: unknown) {
      app.log.error(`Error during shutdown on ${signal}: ${error}`)
      process.exit(1);
    }
  });
}
