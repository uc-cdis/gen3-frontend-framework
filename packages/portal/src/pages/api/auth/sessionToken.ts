import type { NextApiRequest, NextApiResponse } from "next";
import { getCookies, getCookie, setCookie, deleteCookie } from "cookies-next";
import { decodeJwt, JWTPayload } from "jose";

export interface JWTUser {
  name: string;
  is_admin: boolean;
}

export interface JWTTokenData {
  issued?: number;
  expires?: number;
  user?: JWTUser;
  status: "not present" | "issued";
}

export const isExpired = (value: number) => Date.now() - value > 0;

export interface JWTPayloadAndUser extends JWTPayload {
  context: Record<string, string>;
}

/**
 * returns the access_token experation and other data
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const access_token = getCookie("access_token", { req, res });
  getCookies({ req, res });

  if (access_token && typeof access_token === "string") {
    const decodedAccessToken = (await decodeJwt(
      access_token,
    )) as unknown as JWTPayloadAndUser;
    return res.status(200).json({
      issued: decodedAccessToken.iat,
      expires: decodedAccessToken.exp,
      user: decodedAccessToken.context.user,
      status: "issued",
    });
  }

  return res.status(200).json({
    status: "not present",
  });
}
