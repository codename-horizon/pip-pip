import { generateId, HelloWorld } from "@pip-pip/core"

const sayHello: HelloWorld = () => {
    console.log("hello!", generateId())
}

sayHello()