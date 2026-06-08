import { parse } from 'cookie';

export const getAccessTokenWorkspace = (
  cookie?: string,
): string | undefined => {
  const cookies = cookie ? parse(cookie) : {};

  let accessToken = cookies.access_token;
  // in development mode we support "credentials login"
  if (!accessToken && process.env.NODE_ENV === 'development') {
    // NOTE: This cookie can only be accessed from the client side
    // in development mode. Otherwise, the cookie is set as httpOnly
    accessToken = cookies.credentials_token;
    console.log(
      '> [workspace-api] Using credentials_token cookie',
      accessToken,
    );
  }
  console.log('> [workspace-api] Access token:', accessToken);
  return accessToken;
};
