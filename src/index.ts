
export function isNullOrEmpty(str: string | null | undefined) {
  return !str || str === null || str.trim().length === 0;
}