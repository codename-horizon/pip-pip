export type Flatten<T> = T extends Record<string, any> ? { [k in keyof T] : T[k] } : never
export type OptionalOnly<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
export type RequiredOnly<T, K extends keyof T> = Pick<T, K> & Omit<Partial<T>, K>

export type NonRecordToNever<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K] extends Record<string, unknown> ? T[K] : never
}

export type NonArrayToNever<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K] extends Array<unknown> ? T[K] : never
}

export type OmitNever<T> = {
    [K in keyof T]: string extends K ? never : number extends K ? never : T[K] extends never ? never : K
} extends { [_ in keyof T]: infer U } ? U : never

export type PickRecord<T extends Record<string, unknown>> = Pick<T, OmitNever<NonRecordToNever<T>>>
export type PickArray<T extends Record<string, unknown>> = Pick<T, OmitNever<NonArrayToNever<T>>>

export type TypeOrFactoryType<T> = T | ((value: Readonly<T>) => T)