export type Flatten<T> = T extends Record<string, any> ? { [k in keyof T] : T[k] } : never
export type OptionalOnly<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
export type RequiredOnly<T, K extends keyof T> = Pick<T, K> & Omit<Partial<T>, K>