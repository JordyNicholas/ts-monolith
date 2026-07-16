import 'dotenv/config';
import { buildApp } from './infra/http/app.js';
import { env } from './infra/env/index.js';

const app = await buildApp();

async function bootstrap(): Promise<void> {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Monolith Server running on http://localhost:${env.PORT}`);
    app.log.info(`OpenAPI docs available at http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

await bootstrap();

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
for (const signal of signals) {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}. Initiating graceful shutdown...`);
    try {
      await app.close();
      app.log.info(`Server gracefully shut down on ${signal}`);
      process.exit(0);
    } catch (error: unknown) {
      app.log.error(`Error during shutdown on ${signal}: ${error}`);
      process.exit(1);
    }
  });
}
