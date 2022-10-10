import { JSONGameMap } from "../logic/map"

import SOURCE_MAP_TEST from "./test.map.json"

export const BASE_MAPS = {
    "test": () => new JSONGameMap(SOURCE_MAP_TEST),
}