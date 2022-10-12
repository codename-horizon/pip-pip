import { PipPipGamePhase } from "@pip-pip/game/src/logic"
import { GameContext, getClientPlayer } from "."
import { client } from "./client"

export function getUIContext(context: GameContext) {
    return {
        isPhaseSetup: context.game.phase === PipPipGamePhase.SETUP,
        isPhaseCountdown: context.game.phase === PipPipGamePhase.COUNTDOWN,
        isPhaseMatch: context.game.phase === PipPipGamePhase.MATCH,
        isPhaseResults: context.game.phase === PipPipGamePhase.RESULTS,

        gameCountdownMs: (context.game.countdown / context.game.tps) * 1000,

        isHost: context.game.host?.id === client.connectionId,

        clientPlayer: getClientPlayer(context.game),
    }
}

export type UIContext = ReturnType<typeof getUIContext>

export function processInputs(context: GameContext){
    const { mouse, keyboard, game } = context
    const clientPlayer = getClientPlayer(game)
    if(typeof clientPlayer === "undefined") return

    let xInput = 0, yInput = 0
    
    if(keyboard.state.KeyW) yInput -= 1
    if(keyboard.state.KeyS) yInput += 1
    if(keyboard.state.KeyA) xInput -= 1
    if(keyboard.state.KeyD) xInput += 1
    
    const hasKeyboardInput = xInput !== 0 || yInput !== 0
                
    if(hasKeyboardInput){
        clientPlayer.inputs.movementAngle = Math.atan2(yInput, xInput)
        clientPlayer.inputs.movementAmount = 1
    }
    
    if(!hasKeyboardInput){
        clientPlayer.inputs.movementAmount = 0
    }
    
    // aiming
    const mouseAngle = Math.atan2(
        mouse.state.position.y - window.innerHeight / 2,
        mouse.state.position.x - window.innerWidth / 2,
    )
                
    clientPlayer.inputs.aimRotation = mouseAngle
    
    // shooting
    clientPlayer.inputs.useWeapon = (mouse.state.left.down || keyboard.state.Space) === true
    clientPlayer.inputs.doReload = keyboard.state.KeyR === true
}