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

// The API always answers errors as { errors: [{ message, code? | field? }] }
// (VineJS 422s and domain 400s alike) — surface the first message.
export function extractApiErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    isApiErrorPayload((error as { response: unknown }).response)
  ) {
    const first = (error as { response: { errors: ApiError[] } }).response
      .errors[0];
    if (first?.message) return first.message;
  }
  return "Something went wrong. Is the Atlas API running?";
}
