/**
 * Prepares a URL for downloading by appending '/download' to the provided apiUrl.
 *
 * @param {string} apiUrl - The base URL to be used for preparing the download URL.
 * @returns {URL} - The prepared download URL as a URL object.
 */
export const prepareUrl = (apiUrl: string) => new URL(apiUrl + '/download');
