// import {
//   buildCreateApi,
//   coreModule,
//   reactHooksModule,
//   CreateApi,
//   ApiModules,
// } from '@reduxjs/toolkit/query/react';
// import {
//   createDispatchHook,
//   createSelectorHook,
//   createStoreHook,
// } from 'react-redux';
// import { CoreContext } from './hooks';
//
// /**
//  * Creates a custom Redux Toolkit core API
//  * See: https://redux-toolkit.js.org/rtk-query/usage/customizing-create-api
//  * @returns: created core API.
//  */
// const coreCreateApi: CreateApi<keyof ApiModules<any, any, any, any>> =
//   buildCreateApi(
//     coreModule(),
//     reactHooksModule({
//       hooks: {
//         useDispatch: createDispatchHook(CoreContext),
//         useSelector: createSelectorHook(CoreContext),
//         useStore: createStoreHook(CoreContext),
//       },
//     }),
//   );
//
// export { coreCreateApi };
