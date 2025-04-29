/**
 * Determines the correct separator to append additional parameters to a URL
 * @param {string} url - The URL to examine
 * @returns {string} - Either '?' or '&' depending on whether the URL already has parameters
 */
export const getUrlSeparator = (url: string) => {
  // Check if the URL already contains a question mark
  return url.includes('?') ? '&' : '?';
};

/**
 * Adds a parameter to a URL using the correct separator
 * @param {string} url - The URL to add the parameter to
 * @param {string} paramName - The parameter name
 * @param {string} paramValue - The parameter value
 * @returns {string} - The URL with the added parameter
 */
export const appendParameterToUrl = (
  url: string,
  paramName: string,
  paramValue: string,
) => {
  if (!url || !paramName) {
    return url;
  }

  // Extract hash fragment if present
  const [baseUrl, hash] = url.split('#');
  const hashFragment = hash ? `#${hash}` : '';

  // Determine separator and append parameter
  const separator = getUrlSeparator(baseUrl);
  const encodedParamName = encodeURIComponent(paramName);
  const encodedParamValue = encodeURIComponent(paramValue);

  // Construct the final URL with parameter and hash fragment
  return `${baseUrl}${separator}${encodedParamName}=${encodedParamValue}${hashFragment}`;
};
