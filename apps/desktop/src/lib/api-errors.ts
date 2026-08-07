import i18n from "@/i18n";

interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

function isApiErrorPayload(value: unknown): value is { errors: ApiError[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { errors?: unknown }).errors)
  );
}

function apiErrors(error: unknown): ApiError[] {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    isApiErrorPayload((error as { response: unknown }).response)
  ) {
    return (error as { response: { errors: ApiError[] } }).response.errors;
  }
  return [];
}

// The API always answers errors as { errors: [{ message, code? | field? }] }
// (VineJS 422s and domain 400s alike) — surface the first message.
export function extractApiErrorMessage(error: unknown): string {
  const first = apiErrors(error)[0];
  if (first?.message) return first.message;
  // translated at call time — never a module constant
  return i18n.t("errors.apiUnreachable");
}

// Domain errors carry a stable `code` — clients switch on it rather
// than on messages or transport status.
export function extractApiErrorCode(error: unknown): string | null {
  return apiErrors(error)[0]?.code ?? null;
}

// Validation errors carry a `field` — first message per field, for
// inline display under the matching input.
export function extractApiFieldErrors(error: unknown): Record<string, string> {
  const byField: Record<string, string> = {};
  for (const { field, message } of apiErrors(error)) {
    if (field && !(field in byField)) byField[field] = message;
  }
  return byField;
}
