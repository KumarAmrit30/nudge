function singleParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value.at(-1);
  }
  return value;
}

export function parseNumberParam(
  value: string | string[] | undefined,
): number | undefined {
  const raw = singleParam(value);
  if (raw == null || raw === "") {
    return undefined;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseBooleanParam(
  value: string | string[] | undefined,
): boolean | undefined {
  const raw = singleParam(value);
  if (raw == null || raw === "") {
    return undefined;
  }
  if (raw === "1" || raw === "true") {
    return true;
  }
  if (raw === "0" || raw === "false") {
    return false;
  }
  return undefined;
}

export function parseStringParam(
  value: string | string[] | undefined,
): string | undefined {
  const raw = singleParam(value)?.trim();
  return raw ? raw : undefined;
}
