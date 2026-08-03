export function getApiErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  const anyErr = err as any;
  const data = anyErr?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  const validationErrors = data?.errors;
  if (validationErrors && typeof validationErrors === "object") {
    const messages = Object.values(validationErrors)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (typeof data?.title === "string" && data.title.trim()) {
    return data.title;
  }

  if (typeof anyErr?.message === "string" && anyErr.message.trim()) {
    return anyErr.message;
  }

  return fallback;
}
