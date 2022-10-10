export function degreeToRadians(degree: number){
    return degree / 180 * Math.PI
}

export function radiansToDegree(radians: number){
    return radians * 180 / Math.PI
}

export function radianDifference(radianA: number, radianB: number){
    const diff = (radianB - radianA + Math.PI) % (Math.PI * 2) - Math.PI
    return diff < -Math.PI ? diff + Math.PI * 2 : diff
}

export function degreeDifference(degreeA: number, degreeB: number){
    const diff = (degreeB - degreeA + 180) % 360 - 180
    return diff < -180 ? diff + 360 : diff
}

export function forgivingEqual(a: number, b: number, amount = 5){
    return Math.abs(b - a) < amount 
}