export const tickDown = (n: number, amount = 1) => Math.max(0, n - amount)

export const sanitize = (s: string) => s.replace(/[^0-9a-z_]/gmi, "").trim().substring(0, 16).trim()

export const CACHE_NAME_KEY = "pip_name_a"