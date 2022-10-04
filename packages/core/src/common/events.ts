export type EventMap = Record<string, any>
export type EventKey<T extends EventMap> = string & keyof T
export type EventCallback<T> = (params: T) => void
export type EventUndefinedParam<T> = undefined extends T ? [param?: T] : [param: T]

export type EventNameParmeter<T extends EventMap> = {
    [K in keyof T]?: T[K]
}

export type EventEmitterSubscriptionCallback<T extends EventMap> = (event: EventNameParmeter<T>) => void

export class EventEmitter<T extends EventMap  = Record<string, never>>{
    name: string
    listeners: {
        [K in keyof T]?: Array<(params: T[K]) => void>;
    } = {}
    subscribers: EventEmitterSubscriptionCallback<T>[] = []


    constructor(name = "EVENT_EMITTER"){
        this.name = name
    }

    on<K extends keyof T>(eventName: K, callback: EventCallback<T[K]>): void{
        this.listeners[eventName] = (this.listeners[eventName] || []).concat(callback)
    }

    off<K extends keyof T>(eventName: K, callback: EventCallback<T[K]>): void{
        this.listeners[eventName] = (this.listeners[eventName] || []).filter(f => f !== callback)
    }

    once<K extends keyof T>(eventName: K, callback: EventCallback<T[K]>): void{
        const temporaryCallback: typeof callback = (params) => {
            callback(params)
            this.off(eventName, temporaryCallback)
        }
        this.on(eventName, temporaryCallback)
    }

    emit<K extends keyof T>(eventName: K, ...params: EventUndefinedParam<T[K]>): void {
        console.log(new Date().toISOString(), `[${this.name}] eventName: ${eventName.toString()}` + 
            (params[0] ? `, params: ${params}` : ""))

        for(const callback of this.listeners[eventName] || []){
            callback(params[0] as T[K])
        }
        
        const event = {
            [eventName]: params[0],
        } as EventNameParmeter<T>

        for(const subscriberCallback of this.subscribers){
            subscriberCallback(event)
        }
    }

    subscribe(callback: EventEmitterSubscriptionCallback<T>){
        this.subscribers.push(callback)
    }

    unsubscribe(callback: EventEmitterSubscriptionCallback<T>){
        this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }

    reset(){
        this.listeners = {}
    }
}

export class EventCollector<T extends EventMap>{
    emitter: EventEmitter<T>
    pool: EventNameParmeter<T>[] = []

    constructor(emitter: EventEmitter<T>){
        this.emitter = emitter
        buildEventCollector(this)
    }

    flush(){
        this.pool = []
    }
}

export interface EventCollector<T extends EventMap>{
    catchEvent: (event: EventNameParmeter<T>) => void
    destroy: () => void
}

function buildEventCollector<T extends EventMap>(collector: EventCollector<T>){
    collector.catchEvent = (event: EventNameParmeter<T>) => {
        collector.pool.push(event)
    }

    collector.emitter.subscribe(collector.catchEvent)

    collector.destroy = () => {
        collector.emitter.unsubscribe(collector.catchEvent)
    }
}