export function generateId(length = 8){
    const pool = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ@#$%&"
    return Array(length).fill(null).map(() => pool[Math.floor(Math.random()*pool.length)]).join("")
}