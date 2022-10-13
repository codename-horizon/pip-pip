import { PipGameMap, JSONPipGameMap } from "../logic/map"


export type PipMapType = {
    id: string,
    name: string,
    texture: string,
    createMap: () => PipGameMap,
}

export const PIP_MAPS: PipMapType[] = []

import MAZE_MAP from "./maze.map.json"
PIP_MAPS.push({
    id: "maze",
    name: "Maze",
    texture: "default",
    createMap: () => new JSONPipGameMap("maze", MAZE_MAP),
})

import PORTAL_MAP from "./portal.map.json"
PIP_MAPS.push({
    id: "portal",
    name: "Portal",
    texture: "default",
    createMap: () => new JSONPipGameMap("portal", PORTAL_MAP),
})

import TEST_MAP from "./test.map.json"
PIP_MAPS.push({
    id: "test",
    name: "Test",
    texture: "default",
    createMap: () => new JSONPipGameMap("test", TEST_MAP),
})

import GALAXY_MAP from "./galaxy.map.json"
PIP_MAPS.push({
    id: "galaxy",
    name: "Galaxy",
    texture: "default",
    createMap: () => new JSONPipGameMap("galaxy", GALAXY_MAP),
})