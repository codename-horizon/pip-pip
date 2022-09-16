import { generateId } from "../lib/utils"

export type GameStateDataHistory<T> = {
    timestamp: number,
    valueFrom: T,
    valueTo: T,
}
export type GameStateDataSubscriptionCallback<T> = (change: GameStateDataHistory<T>) => void
export type GameStateDataSubscription<T> = {
    id: string,
    callback: GameStateDataSubscriptionCallback<T>,
}

export type GameStateDataOptions<T> = {
    serialize: (value: T) => string,
    deserialize: (value: string) => T,
}

export class GameStateData<T>{
    private options: GameStateDataOptions<T>
    private subscriptions: GameStateDataSubscription<T>[]
    private value: T
    
    constructor(initialValue: T, options: Partial<GameStateDataOptions<T>> = {}){
        this.options = {
            serialize: (value: T) => {
                const genericValue = value as T & { 
                    toString?: () => string,
                    getSerialized?: () => string,
                }

                if(typeof genericValue.toString === "function"){
                    return genericValue.toString()
                }

                if(typeof genericValue.getSerialized === "function"){
                    return genericValue.getSerialized()
                }
                
                if(typeof value === "object"){
                    return JSON.stringify(value)
                }

                return value as string
            },
            deserialize: (value: string) => value as unknown as T,
            ...options,
        }
        this.value = initialValue
        this.subscriptions = []
    }

    subscribe(callback: GameStateDataSubscriptionCallback<T>): GameStateDataSubscription<T>["id"]{
        const id = generateId()
        this.subscriptions.push({ id, callback })
        return id
    }

    unsubscribe(id: GameStateDataSubscription<T>["id"]){
        this.subscriptions = this.subscriptions.filter(sub => sub.id !== id)
    }

    set(newValue: T | ((value: T) => T)){
        const computedValue = newValue instanceof Function ? newValue(this.value) : newValue
        const change: GameStateDataHistory<T> = {
            timestamp: Date.now(),
            valueFrom: this.value,
            valueTo: computedValue,
        }
        this.value = computedValue
        for(const subscription of this.subscriptions){
            subscription.callback(change)
        }
    }

    get(): T {
        return this.value
    }

    getSerialized(){
        return this.options.serialize(this.value)
    }

    setSerialized(value: string){
        this.set(this.options.deserialize(value))
    }
}