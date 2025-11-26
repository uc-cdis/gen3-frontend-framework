// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getRouteConfig } from '../../../lib/auth/arboristConfig';
// import { ARBORIST_COOKIE_NAME, RESOURCES_TTL_SECONDS } from '../../../lib/auth/constants';
// import { fetchArboristResources } from '@gen3/core/server';
//
//
// interface ArboristCookiePayload {
//   expires: number;
//   resources: string[];
//   userKey: string;
// }
//
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   const { enableAuthz, routes: routeConfig } = getRouteConfig();
//
//
//   // If authz is disabled, just return that fact to the client.
//   if (!enableAuthz) {
//     return res.status(200).json({
//       disabled: true,
//       resources: [],
//       routeConfig,
//     });
//   }
//
//   const cacheValid =
//     cookiePayload &&
//     cookiePayload.expires > now &&
//     cookiePayload.userKey === currentUserKey;
//
//   let resources: string[];
//   if (cacheValid) {
//     resources = cookiePayload!.resources;
//   } else {
//     resources = await fetchArboristResources(null);
//
//     const newPayload: ArboristCookiePayload = {
//       expires: now + RESOURCES_TTL_SECONDS * 1000,
//       resources,
//       userKey: currentUserKey,
//     };
//
//     res.setHeader(
//       'Set-Cookie',
//       `${ARBORIST_COOKIE_NAME}=${encodeURIComponent(
//         JSON.stringify(newPayload),
//       )}; Max-Age=${RESOURCES_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${
//         process.env.NODE_ENV === 'production' ? '; Secure' : ''
//       }`,
//     );
//   }
//
//   res.status(200).json({
//     disabled: false,
//     resources,
//     routeConfig,
//   });
// }
