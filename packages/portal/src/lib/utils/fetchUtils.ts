
/**
 * Soon the CSRF cookie will not be readable, as
 * verracode cannot deal with cookies that are not http only.
 *
 * @return the csrf token, and set headers.x-csrf-token as a side effect
 */
export async function fetchAndSetCsrfToken(hostname: string, headers: Record<string, string>) {
  return fetch(`${hostname}_status`).then(
    (res) => {
      if (res.status < 200 || res.status > 210) {
        throw new Error('Failed to retrieve CSRF token');
      }
      return res.json();
    },
  ).then(
    (info) => {
      if (!info.csrf) {
        throw new Error('Retrieved empty CSRF token');
      }
      headers['x-csrf-token'] = info.csrf;
      return info.csrf;
    },
  );
}
