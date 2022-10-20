import { PipPipGamePhase } from "@pip-pip/game/src/logic"
import { PipPlayer } from "@pip-pip/game/src/logic/player"
import { GameContext, GAME_CONTEXT } from "."

export type ChatCommand = {
    command: string,
    name: string,
    inputs: string[],
    description: string,
    callback: (message: string, inputs: string[]) => void | ChatMessage,
}


export type ChatMessagePartPlayer = {
    type: "player",
    player: PipPlayer,
}

export type ChatMessagePartError = {
    type: "error",
    code: string,
    text: string,
}

export type ChatMessageText = {
    style?: string,
    text: string,
}

export type ChatMessage = {
    text: ChatMessageText[],
}

export const CHAT_SPACE: ChatMessageText = { style: "space", text: "" }
export const CHAT_LINE_BREAK: ChatMessageText = { style: "break", text: "" }
  
export const GAME_COMMANDS: ChatCommand[] = []

export function createErrorChatMessage(code: string, text: string): ChatMessage{
    return {
        text: [{
            style: "bad",
            text: code
        }, {
            text: `: ${text}`,
        }],
    }
}

export const MESSAGE_ERROR_NOT_HOST = createErrorChatMessage("FORBIDDEN", "Only host can run this command.")
export const MESSAGE_ERROR_COMMAND_404 = createErrorChatMessage("UNKNOWN", "Command not found.")

GAME_COMMANDS.push({
    command: "start",
    name: "Start Game",
    inputs: [],
    description: "Starts the game",
    callback(message, inputs){
        if(GAME_CONTEXT.store.isHost){
            GAME_CONTEXT.sendGamePhase(PipPipGamePhase.COUNTDOWN)
        } else{
            return MESSAGE_ERROR_NOT_HOST
        }
    }
})

GAME_COMMANDS.push({
    command: "skip",
    name: "Skip game countdown",
    inputs: [],
    description: "Skip game countdown",
    callback(message, inputs){
        if(GAME_CONTEXT.store.isHost){
            GAME_CONTEXT.sendGamePhase(PipPipGamePhase.MATCH)
        } else{
            return MESSAGE_ERROR_NOT_HOST
        }
    }
})

GAME_COMMANDS.push({
    command: "stop",
    name: "Stop Game",
    inputs: [],
    description: "Stops the game",
    callback(message, inputs){
        if(GAME_CONTEXT.store.isHost){
            GAME_CONTEXT.sendGamePhase(PipPipGamePhase.SETUP)
        } else{
            return MESSAGE_ERROR_NOT_HOST
        }
    }
})

GAME_COMMANDS.push({
    command: "clear",
    name: "Clear Chat",
    inputs: [],
    description: "Clears the whole chat only for you.",
    callback(message, inputs){
        GAME_CONTEXT.store.chatMessages = []
    }
})

GAME_COMMANDS.push({
    command: "help",
    name: "Help",
    inputs: [],
    description: "Show all commands",
    callback(message, inputs){
        for(const command of GAME_COMMANDS){
            GAME_CONTEXT.store.chatMessages.push({
                text: [{
                    style: "info",
                    text: `/${command.command}`
                }, CHAT_SPACE, {
                    text: `${command.name}`
                }],
            })
        }

    }
})

export function processChat(gameContext: GameContext){
    let clearChat = false
    // player join
    for(const event of gameContext.gameEvents.filter("addPlayer")){
        const { player } = event.addPlayer
        gameContext.store.chatMessages.push({
            text: [{
                style: "player",
                text: player.name,
            }, CHAT_SPACE, {
                style: "good",
                text: "joined",
            }],
        })

        if(player.id === gameContext.client.connectionId){
            clearChat = true
        }
    }

    // player leave
    for(const event of gameContext.gameEvents.filter("removePlayer")){
        const { player } = event.removePlayer
        gameContext.store.chatMessages.push({
            text: [{
                style: "player",
                text: player.name,
            }, CHAT_SPACE, {
                style: "bad",
                text: "left",
            }],
        })
    }

    // player disconnected or disconnected
    for(const event of gameContext.gameEvents.filter("playerIdleChange")){
        const { player } = event.playerIdleChange
        if(player.idle){
            gameContext.store.chatMessages.push({
                text: [{
                    style: "player",
                    text: player.name,
                }, CHAT_SPACE, {
                    style: "bad",
                    text: "disconnected",
                }],
            })
        } else{
            gameContext.store.chatMessages.push({
                text: [{
                    style: "player",
                    text: player.name,
                }, CHAT_SPACE, {
                    style: "good",
                    text: "reconnected",
                }],
            })
        }
    }

    // send phase change
    if(gameContext.gameEvents.filter("phaseChange").length > 0){
        if(gameContext.game.phase === PipPipGamePhase.SETUP){
            gameContext.store.chatMessages.push({
                text: [{
                    style: "good",
                    text: "Game is now in lobby mode.",
                }],
            })
        }
        if(gameContext.game.phase === PipPipGamePhase.COUNTDOWN){
            gameContext.store.chatMessages.push({
                text: [{
                    style: "good",
                    text: "Get ready...",
                }],
            })
        }
        if(gameContext.game.phase === PipPipGamePhase.MATCH){
            gameContext.store.chatMessages.push({
                text: [{
                    style: "good",
                    text: "The match has started.",
                }],
            })
        }
    }

    if(clearChat){
        gameContext.store.chatMessages = []
    }
}