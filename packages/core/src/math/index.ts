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

export function normalizeToPositiveRadians(radians: number){
    return radians % (Math.PI * 2) + Math.PI * 2
}

export function nearestPointFromSegment(
    lineStartX: number, lineStartY: number, 
    lineEndX: number, lineEndY: number, 
    pointX: number, pointY: number){

    const dx = lineEndX - lineStartX
    const dy = lineEndY - lineStartY
    const m = dy/dx
  
    if(dy == 0){
        if(lineStartX > lineEndX){
            const tx = lineStartX
            lineStartX = lineEndX
            lineEndX = tx
            const ty = lineStartY
            lineStartY = lineEndY
            lineEndY = ty
        }
        if(lineStartX < pointX && pointX < lineEndX){
            return {x: pointX, y: lineStartY}
        } else{
            if(pointX <= lineStartX) return {x: lineStartX, y: lineStartY}
            else return {x: lineEndX, y: lineEndY}
        }
    } else if(dx == 0){
        if(lineStartY > lineEndY){
            const tx = lineStartX
            lineStartX = lineEndX
            lineEndX = tx
            const ty = lineStartY
            lineStartY = lineEndY
            lineEndY = ty
        }
        if(lineStartY < pointY && pointY < lineEndY){
            return {x: lineStartX, y: pointY}
        } else{
            if(pointY <= lineStartY) return {x: lineStartX, y: lineStartY}
            else return {x: lineEndX, y: lineEndY}
        }
    } else{
        if(lineStartX > lineEndX){
            const tx = lineStartX
            lineStartX = lineEndX
            lineEndX = tx
            const ty = lineStartY
            lineStartY = lineEndY
            lineEndY = ty
        }
        const cx = (m * lineStartX - (-1/m) * pointX + pointY - lineStartY)/(m + 1/m)
        const cy = m * (cx - lineStartX) + lineStartY
  
        if(lineStartX < cx && cx < lineEndX){
            return {x: cx, y: cy}
        } else{
            if(cx <= lineStartX) return {x: lineStartX, y: lineStartY}
            else return {x: lineEndX, y: lineEndY}
        }
    }
}
  