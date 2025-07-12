export function isEmpty(value: unknown) {
  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  return false;
}
