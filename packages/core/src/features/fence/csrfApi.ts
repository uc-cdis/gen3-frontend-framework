import { buildFetchError  } from "./fenceApi";
import type { Gen3Response } from "../../dataAccess";

export interface CSRFToken {
  readonly csrfToken: string;
}


export const fetchCSRF = async (
  hostname: string,
): Promise<Gen3Response<string>> => {
  const res = await fetch(`https://${hostname}/_status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
      if (res.status < 200 || res.status > 210) {
        throw await buildFetchError(res, "fetchCSRF" );
      }
      const info = await res.json()
      if (!info.csrf) {
         throw await buildFetchError(res, 'Retrieved empty CSRF token');
      }
      return { data: info.csrf };
}
