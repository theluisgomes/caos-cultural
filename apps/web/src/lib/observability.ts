/** Lightweight client observability — forwards errors to console; wire to Cloud Error Reporting in prod. */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    at: new Date().toISOString(),
  };
  console.error('[CAOS]', payload);
}

export function reportEvent(name: string, data?: Record<string, unknown>): void {
  console.info('[CAOS event]', name, data ?? {});
}
