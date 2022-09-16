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

export type GameStateDataOptions<T, K> = {
    serialize: (value: T) => K,
    deserialize: (value: K) => T,
}

export class GameStateData<T, K = T>{
    private options: GameStateDataOptions<T, K>
    private subscriptions: GameStateDataSubscription<T>[]
    private value: T
    
    constructor(initialValue: T, options: Partial<GameStateDataOptions<T, K>> = {}){
        this.options = {
            serialize: (value: T) => value as unknown as K,
            deserialize: (value: K) => value as unknown as T,
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

    getSerialized(): K {
        return this.options.serialize(this.value)
    }

    setSerialized(value: K){
        this.set(this.options.deserialize(value))
    }
}