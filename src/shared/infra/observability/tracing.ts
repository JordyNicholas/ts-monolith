import { trace, SpanStatusCode } from '@opentelemetry/api';
import { env } from '../env/index.js';

const tracer = trace.getTracer(env.OTEL_SERVICE_NAME);

export function startSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
  if (!env.OTEL_ENABLED) {
    return fn();
  }

  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: unknown) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Stub for wiring a real OTLP exporter (Jaeger, Honeycomb, etc.).
 * Set OTEL_ENABLED=true and configure standard OTEL_* env vars in production.
 */
export function initTracing(): void {
  if (!env.OTEL_ENABLED) {
    return;
  }
  console.info(`[otel] tracing enabled for service: ${env.OTEL_SERVICE_NAME}`);
}
