import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

export function collectErrorPaths(errors: unknown, prefix = ''): string[] {
  if (!errors || typeof errors !== 'object') return [];
  const node = errors as Record<string, unknown>;

  // Leaf: RHF field error ({ type, message, ref })
  if (typeof node.type === 'string') return prefix ? [prefix] : [];

  return Object.entries(node).flatMap(([key, value]) =>
    key === 'ref'
      ? []
      : collectErrorPaths(value, prefix ? `${prefix}.${key}` : key),
  );
}

/** True if an error path belongs to a step field (parent/child/equal). */
function pathBelongsToField(path: string, field: string): boolean {
  return (
    path === field ||
    path.startsWith(`${field}.`) ||
    field.startsWith(`${path}.`)
  );
}

/** Index of the first step that owns at least one of the error paths, or -1. */
export function findStepWithError(
  paths: readonly string[],
  steps: ReadonlyArray<{ fields: readonly string[] }>,
): number {
  return steps.findIndex((step) =>
    step.fields.some((field) =>
      paths.some((path) => pathBelongsToField(path, field)),
    ),
  );
}

export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  errors: unknown,
): string[] {
  if (!errors || typeof errors !== 'object') return [];

  const applied: string[] = [];
  for (const [path, raw] of Object.entries(errors)) {
    const message = Array.isArray(raw) ? raw[0] : raw;
    if (!path || typeof message !== 'string') continue;
    setError(path as FieldPath<T>, { type: 'server', message });
    applied.push(path);
  }
  return applied;
}
