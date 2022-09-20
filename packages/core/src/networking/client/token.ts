import { Client, ClientTypes } from "."
import { getLocalStorage } from "../../common"

export function initializeTokenHandler<T extends ClientTypes>(client: Client<T>){
    const getClientLocalStorage = () => {
        if(!client.isBrowser()) return
        return getLocalStorage()
    }

    client.setToken = (token?: string) => {
        const localStorage = getClientLocalStorage()

        if(typeof token === "string"){
            client.token = token
            if(typeof localStorage !== "undefined"){
                localStorage.setItem(client.options.tokenKey, token)
            }
            client.clientEvents.emit("tokenSet")
        } else{
            client.token = undefined
            if(typeof localStorage !== "undefined"){
                localStorage.removeItem(client.options.tokenKey)
            }
            client.clientEvents.emit("tokenUnset")
        }
    }

    client.syncToken = () => {
        const localStorage = getClientLocalStorage()
        if(typeof localStorage === "undefined") return
        const token = localStorage.getItem(client.options.tokenKey)
        if(typeof token === "string"){
            client.setToken(token)
        }
    }
}