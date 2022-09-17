/* REMINDER: BROWSER-SAFE */

import { EventKey, EventMap, EventCallback, OptionalIfUndefined } from "../types/client"

export class EventEmitter<T extends EventMap  = Record<string, unknown>>{
    listeners: {
        [K in EventKey<T>]?: Array<(params: EventMap[K]) => void>;
    } = {}

    on<K extends EventKey<T>>(eventName: K, callback: EventCallback<T[K]>): void{
        this.listeners[eventName] = (this.listeners[eventName] || []).concat(callback)
    }

    off<K extends EventKey<T>>(eventName: K, callback: EventCallback<T[K]>): void{
        this.listeners[eventName] = (this.listeners[eventName] || []).filter(f => f !== callback)
    }

    emit<K extends EventKey<T>>(eventName: K, ...params: OptionalIfUndefined<T[K]>): void{
        (this.listeners[eventName] || []).forEach(function(callback) {
            callback(params[0])
        })
    }
}