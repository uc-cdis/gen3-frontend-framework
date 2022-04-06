import {buildCreateApi, coreModule, reactHooksModule} from "@reduxjs/toolkit/dist/query/react";
import {useCoreSelector , useCoreStore, useCoreDispatch} from "./hooks";



export const coreCreateApi = buildCreateApi(
    coreModule(),
    reactHooksModule({
            // @ts-ignore
        useSelector:  useCoreSelector,
            // @ts-ignore
        useStore: useCoreStore,
        useDispatch:  useCoreDispatch })
)
