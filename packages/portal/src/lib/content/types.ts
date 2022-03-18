
export interface ContentSource {
    get<T extends Record<string, undefined>>(filepath: string): Promise<T>
}
