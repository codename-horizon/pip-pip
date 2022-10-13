import { PipGameMap, JSONPipGameMap } from "../logic/map"


export type PipMapType = {
    id: string,
    name: string,
    texture: string,
    createMap: () => PipGameMap,
}

export const PIP_MAPS: PipMapType[] = []

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