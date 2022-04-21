export type UnknownJson = Record<string, unknown>;

export type DataStatus = "uninitialized" | "pending" | "fulfilled" | "rejected";

export interface CoreDataSelectorResponse<T> {
    readonly data?: T;
    readonly status: DataStatus;
    readonly error?: string;
}
