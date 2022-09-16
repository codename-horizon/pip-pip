/* REMINDER: BROWSER-SAFE */
import { generateId } from "../lib/utils"

type HorizonEventCallback = (payload: unknown) => void

type HorizonEventListener = {
    id: string,
    eventName: string,
    callback: HorizonEventCallback,
}

export class HorizonEventEmitter{
    listeners: HorizonEventListener[] = []

    on(eventName: string, callback: HorizonEventCallback){
        const id = generateId()
        this.listeners.push({
            id, eventName, callback,
        })
        return id
    }

    off(id: string){
        this.listeners = this.listeners.filter(listener => listener.id !== id)
    }

    emit(eventName: string, payload: unknown){
        for(const listener of this.listeners){
            if(listener.eventName === eventName){
                listener.callback(payload)
            }
        }
    }
}