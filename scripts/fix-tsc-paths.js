/**
 * Author: Mike del Castillo
 * Date: October 5, 2022
 * Description: Replace ./src references to ./dist in build folders
 */

const packages = [
    "@pip-pip/core",
    "@pip-pip/game",
]

const targets = [
    "./packages/core/dist",
    "./packages/game/dist",
    "./packages/server/dist",
]

const fs = require("fs")
const path = require("path")

for(const target of targets){
    searchDirectory(target)
}

function searchDirectory(dir){
    const files = fs.readdirSync(dir)
    for(const filename of files){
        const file = path.join(dir, filename)
        const lstat = fs.lstatSync(file)
        if(lstat.isDirectory()) searchDirectory(file)
        if([".js", ".d.ts"].some(ext => file.toLowerCase().endsWith(ext))) process(file)
    }
}

function process(file){
    let contents = fs.readFileSync(file).toString()
    for(const package of packages){
        const src = package + "/src"
        const dist = package + "/dist"
        const regex = new RegExp(src, "gmi")
        contents = contents.replace(regex, dist)
    }
    fs.writeFileSync(file, contents)
    console.log(`[PROCESSED] ${file}`)
}