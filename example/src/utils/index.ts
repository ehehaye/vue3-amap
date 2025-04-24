export function toArray(val: string | string[] | null | undefined): string[] {
  if (val == null || val === '') return [];
  return Array.isArray(val) ? val : [val];
}
