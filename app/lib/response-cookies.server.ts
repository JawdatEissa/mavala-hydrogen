/**
 * Append Set-Cookie header lines to a Remix/Response init object.
 */

export function mergeSetCookieHeaders(
  init: ResponseInit | undefined,
  setCookieHeaderValues: string[],
): ResponseInit | undefined {
  if (setCookieHeaderValues.length === 0) return init;
  const headers = new Headers(init?.headers ?? undefined);
  for (const value of setCookieHeaderValues) {
    headers.append("Set-Cookie", value);
  }
  return { ...init, headers };
}

/** Copy Set-Cookie lines from a Headers object (e.g. another merge) onto init. */
export function appendSetCookieFromHeaders(
  init: ResponseInit | undefined,
  source: Headers,
): ResponseInit | undefined {
  const values: string[] = [];
  source.forEach((v, k) => {
    if (k.toLowerCase() === "set-cookie") {
      values.push(v);
    }
  });
  return mergeSetCookieHeaders(init, values);
}
