/**
 * Lightweight in-process counters for boilerplate observability.
 * Swap for Prometheus/OpenTelemetry exporters in production.
 */
class HttpMetrics {
  private totalRequests = 0;
  private totalErrors = 0;
  private readonly startedAt = new Date();

  incrementRequests(): void {
    this.totalRequests += 1;
  }

  incrementErrors(): void {
    this.totalErrors += 1;
  }

  snapshot() {
    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      uptimeSeconds: Math.floor((Date.now() - this.startedAt.getTime()) / 1000),
      startedAt: this.startedAt.toISOString(),
    };
  }
}

export const httpMetrics = new HttpMetrics();
