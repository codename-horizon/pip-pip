export type Flatten<T> = T extends Record<string, any> ? { [k in keyof T] : T[k] } : never
