import * as PIXI_Assets from "@pixi/assets"


export const assetLoader = PIXI_Assets.Assets

import logo from "../assets/logo.png"
assetLoader.addBundle("ui", {
    logo,
})

import ship1 from "../assets/ship-1.png"
import ship2 from "../assets/ship-2.png"
import ship3 from "../assets/ship-3.png"
assetLoader.addBundle("ships", {
    "ship": ship1,
    "ship-blu": ship2,
    "ship-red": ship3,
})