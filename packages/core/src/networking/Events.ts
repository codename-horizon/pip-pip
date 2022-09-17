/* REMINDER: BROWSER-SAFE */

import { HorizonEventKey, HorizonEventMap, HorizonEventReceiver, OptionalIfUndefined } from "../types/client"

export class HorizonEventEmitter<T extends HorizonEventMap  = Record<string, unknown>>{
    listeners: {
        [K in HorizonEventKey<T>]?: Array<(params: HorizonEventMap[K]) => void>;
    } = {}

    on<K extends HorizonEventKey<T>>(eventName: K, callback: HorizonEventReceiver<T[K]>): void{
        this.listeners[eventName] = (this.listeners[eventName] || []).concat(callback)
    }

    off<K extends HorizonEventKey<T>>(eventName: K, callback: HorizonEventReceiver<T[K]>): void{
        this.listeners[eventName] = (this.listeners[eventName] || []).filter(f => f !== callback)
    }

    emit<K extends HorizonEventKey<T>>(eventName: K, ...params: OptionalIfUndefined<T[K]>): void{
        (this.listeners[eventName] || []).forEach(function(callback) {
            callback(params[0])
        })
    }
}