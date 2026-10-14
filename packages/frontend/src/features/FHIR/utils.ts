// prefixes the origin to a relative url, leave absolute one as is.
export const toAbsoluteUrl = (url: string, origin: string): string =>
  /^https?:\/\//.test(url) ? url : `${origin}${url}`;

// returns the host, including any port of the url
export const hostOf = (url: string): string =>
  url.replace(/^https?:\/\//, '').split('/')[0];

// For display only: shows FHIR's separators (, | : / $) as typed. Characters
// that change how the URL splits, like & and =, stay encoded.
export const readableUrl = (url: string): string =>
  url.replace(/%(2C|7C|3A|2F|24)/gi, (code) => decodeURIComponent(code));
