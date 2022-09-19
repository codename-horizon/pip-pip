export type EventMap = Record<string, any>
export type EventKey<T extends EventMap> = string & keyof T
export type EventCallback<T> = (params: T) => void
export type EventUndefinedParam<T> = undefined extends T ? [param?: T] : [param: T]

export class EventEmitter<T extends EventMap  = Record<string, never>>{
    name: string
    listeners: {
        [K in EventKey<T>]?: Array<(params: EventMap[K]) => void>;
    } = {}

    constructor(name = "EVENT_EMITTER"){
        this.name = name
    }

    on<K extends EventKey<T>>(eventName: K, callback: EventCallback<T[K]>): void{
        this.listeners[eventName] = (this.listeners[eventName] || []).concat(callback)
    }

    off<K extends EventKey<T>>(eventName: K, callback: EventCallback<T[K]>): void{
        this.listeners[eventName] = (this.listeners[eventName] || []).filter(f => f !== callback)
    }

    once<K extends EventKey<T>>(eventName: K, callback: EventCallback<T[K]>): void{
        const temporaryCallback: typeof callback = (params) => {
            callback(params)
            this.off(eventName, temporaryCallback)
        }
        this.on(eventName, temporaryCallback)
    }

    emit<K extends EventKey<T>>(eventName: K, ...params: EventUndefinedParam<T[K]>): void {
        console.log(`[${this.name}] eventName: ${eventName}` + 
            (params[0] ? `, params: ${params}` : ""));
        (this.listeners[eventName] || []).forEach(function(callback) {
            callback(params[0])
        })
    }

    reset(){
        this.listeners = {}
    }
}