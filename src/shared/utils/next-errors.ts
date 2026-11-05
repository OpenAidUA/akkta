/**
 * Next.js implements redirect() / notFound() by throwing errors whose
 * `digest` starts with "NEXT_". Such errors are control flow, not failures:
 * a catch block must rethrow them instead of showing an error message.
 */
export function isNextControlFlowError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('digest' in error)) {
    return false;
  }
  const { digest } = error as { digest?: unknown };
  return typeof digest === 'string' && digest.startsWith('NEXT_');
}
