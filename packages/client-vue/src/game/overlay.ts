import { PipPipGamePhase } from "@pip-pip/game/src/logic"
import { GameContext } from "."
import { client } from "./client"

export function getUIContext(context: GameContext) {
    return {
        isPhaseSetup: context.game.phase === PipPipGamePhase.SETUP,
        isPhaseCountdown: context.game.phase === PipPipGamePhase.COUNTDOWN,
        isPhaseMatch: context.game.phase === PipPipGamePhase.MATCH,
        isPhaseResults: context.game.phase === PipPipGamePhase.RESULTS,

        gameCountdownMs: (context.game.countdown / context.game.tps) * 1000,

        isHost: context.game.host?.id === client.connectionId,
    }
}

export type UIContext = ReturnType<typeof getUIContext>