import { EventEmitter } from "./events"
import { PickRecord, TypeOrFactoryType } from "./lib/types"
import { isObject } from "./lib/utils"

export type StateSnapshot<T> = {
    time: number,
    state: T,
    previousState: T,
    changes: StateChanges<T>,
}

export type StateEventMap<T> = {
    change: StateSnapshot<T>,
}

export type StateChangesBoolean<T> = {
    [K in keyof T]?: T[K] extends Record<string, any> ? StateChangesBoolean<T[K]> : boolean
}

export type StateChanges<T> = {
    [K in keyof T]?: T[K] extends Record<string, any> ? StateChanges<T[K]> : T[K]
}

export type StateSchema = Record<string, any>

export function getStateChanges<T extends StateSchema>(to: T, from: T){

    function loop<T extends Record<string, unknown>>(to: T, from: T){
        const changes: StateChanges<T> = {}
        for(const key in to){
            const toValue = to[key]
            const fromValue = from?.[key]

            let changeValue: undefined | typeof toValue

            const objType = isObject(toValue)
            if(objType){
                const objectChanges = loop(toValue as Record<string, unknown>, fromValue as Record<string, unknown>)
                if(Object.keys(objectChanges).length !== 0){
                    changeValue = objectChanges as typeof toValue
                }
            } else{
                if(fromValue !== toValue){
                    changeValue = toValue
                }
            }

            if(typeof changeValue !== "undefined"){
                changes[key] = changeValue as typeof toValue
            }
        }

        return changes
    }
    
    const changes: StateChanges<T> = loop(to, from)
    return changes
}


export class State<T extends StateSchema>{
    history: StateSnapshot<T>[] = []
    state: T
    events: EventEmitter<StateEventMap<T>> = new EventEmitter("State")
    transactionState?: T

    constructor(initialState: T){
        this.state = initialState
    }

    setState(state: T){
        const previousState = this.state
        this.state = state

        const snapshot: StateSnapshot<T> = {
            time: Date.now(),
            state,
            previousState,
            changes: getStateChanges(state, previousState),
        }

        this.history = [snapshot, ...this.history]
        this.events.emit("change", snapshot)
    }

    set<K extends keyof T>(key: K, valueOrFactory: TypeOrFactoryType<T[K]>){
        const newValue = valueOrFactory instanceof Function ? 
            valueOrFactory(this.state[key]) : valueOrFactory

        const newState = {
            ...this.state,
            [key]: newValue,
        }
        this.setState(newState)
    }

    setRecord<
        R extends PickRecord<T>, 
        K extends keyof R, 
        P extends R[K],
        PK extends keyof P,
        PV extends P[PK],
    >(key: K, prop: PK, valueOrFactory: TypeOrFactoryType<PV>){
        type Key = keyof T
        type Value = T[Key]

        const currentvalue = this.state[key as Key][prop]
        const newValue = valueOrFactory instanceof Function ? valueOrFactory(currentvalue) : valueOrFactory

        const factory = ((obj: Value) => {
            return {
                ...obj,
                [prop]: newValue,
            }
        }) as TypeOrFactoryType<Value>
        this.set(key as Key, factory)
    }
}