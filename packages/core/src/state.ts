import { EventEmitter } from "./events"
import { PickRecord, TypeOrFactoryType } from "./lib/types"
import { isObject } from "./lib/utils"

export type StateSnapshot<T> = {
    time: number,
    state: T,
    previousState: T,
    changes: StatePartial<T>,
    deletions: StateBoolean<T>,
}

export type StateEventMap<T> = {
    change: StateSnapshot<T>,
}

export type StateBoolean<T> = {
    [K in keyof T]?: T[K] extends Record<string, any> ? StateBoolean<T[K]> : boolean
}

export type StatePartial<T> = {
    [K in keyof T]?: T[K] extends Record<string, any> ? StatePartial<T[K]> : T[K]
}

export type StateSchema = Record<string, any>

// TODO: Fix typing
export function getStateChanges<T extends StateSchema>(to: T, from: T){

    function loop<T extends Record<string, unknown>>(to: T, from: T){
        const changes: StatePartial<T> = {}
        const deletions: StateBoolean<T> = {}

        const keys = Array.from(new Set([
            ...Object.keys(to || {}),
            ...Object.keys(from || {}),
        ])) as unknown as Array<keyof T>

        for(const key of keys){
            const toValue = to?.[key]
            const fromValue = from?.[key]

            let changeValue: undefined | typeof toValue
            let deletionValue: undefined | typeof deletions

            const objType = isObject(toValue)
            if(objType){
                const objectChanges = loop(toValue as Record<string, unknown>, fromValue as Record<string, unknown>)
                if(Object.keys(objectChanges.changes).length !== 0){
                    changeValue = objectChanges.changes as typeof toValue
                } 
                if(Object.keys(objectChanges.deletions).length !== 0){
                    deletionValue = objectChanges.deletions as typeof deletionValue
                } 

            } else{
                if(fromValue !== toValue){
                    changeValue = toValue
                }
            }

            if(typeof toValue === "undefined"){
                deletions[key] = true as any
            }

            if(typeof deletionValue !== "undefined"){
                deletions[key] = deletionValue as any
            }

            if(typeof changeValue !== "undefined"){
                changes[key] = changeValue as typeof toValue
            }
        }

        return { changes, deletions }
    }
    
    return loop(to, from)
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

        const { changes, deletions } = getStateChanges(state, previousState)

        const snapshot: StateSnapshot<T> = {
            time: Date.now(),
            state,
            previousState,
            changes, deletions,
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
        TRecords extends PickRecord<T>, 
        KeyOfRecords extends keyof TRecords, 
        PropOfRecords extends TRecords[KeyOfRecords],
        KeyOfProp extends keyof PropOfRecords,
        PropValue extends PropOfRecords[KeyOfProp],
    >(key: KeyOfRecords, prop: KeyOfProp, valueOrFactory: TypeOrFactoryType<PropValue>){
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

    deleteRecord<
        TRecords extends PickRecord<T>, 
        KeyOfRecords extends keyof TRecords, 
        PropOfRecords extends TRecords[KeyOfRecords],
        KeyOfProp extends keyof PropOfRecords,
    >(key: KeyOfRecords, prop: KeyOfProp){
        type Key = keyof T

        const modified = this.state[key as Key][prop]
        delete modified[key as Key]

        this.set(key as Key, modified)
    }
}