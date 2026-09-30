export type ClassValue = string | number | boolean | null | undefined;

/** Joins truthy class names with a space. */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}
