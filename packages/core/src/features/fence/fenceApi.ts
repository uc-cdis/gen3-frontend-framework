import { UnknownJson } from "../../dataAccess";

export interface Gen3FenceRequest {
    readonly hostname: string;
    readonly endpoint: string;
    readonly method: "GET" | "POST";
    readonly body?: object;
}

export interface Gen3FenceResponce<H = UnknownJson> {
    readonly data: H;
}

export interface FetchError <T> {
    readonly url: string;
    readonly status: number;
    readonly statusText: string;
    readonly text: string;
    readonly request?: T;
}


export const buildFetchError = async <T>(
    res: Response,
    request?: T,
): Promise<FetchError<T>> => {
    return {
        url: res.url,
        status: res.status,
        statusText: res.statusText,
        text: await res.text(),
        request: request,
    };
};

export interface NameUrl {
    readonly name: string;
    readonly url: string;
}

export interface Gen3LoginProvider {
    readonly desc?: string;
    readonly id: string;
    readonly idp: string;
    readonly name: string;
    readonly secondary: boolean;
    readonly url: string;
    readonly urls: Array<NameUrl>
}

export interface Gen3FenceUserProviders {
    readonly default_provider: Gen3LoginProvider;
    readonly providers?: ReadonlyArray<Gen3LoginProvider>;
}

/**
 * The base call to Gen3 fence which support both GET and POST methods.
 * This can be used to build other fence related commands.
 * @param hostname
 * @param endpoint
 */
export const fetchLogin = async (
    hostname: string,
    endpoint = "login/"
) : Promise<Gen3FenceResponce<Gen3FenceUserProviders>> => {
    return fetchFence({ hostname: hostname, endpoint: endpoint, method:"GET"});
}

export const fetchFence = async<T> (
    request: Gen3FenceRequest,
): Promise<Gen3FenceResponce<T>> => {
    const res = await fetch(`${request.hostname}/user/${request.endpoint}`, {
        method: request.method,
        headers: {
            "Content-Type": "application/json",
        },
        body: request.method === "POST" ? JSON.stringify(request.body) : null,
    });
    if (res.ok)
        return res.json();

    throw await buildFetchError(res, request);
}
