import { PipShip, createShipStats } from "../logic/ship"

export type ShipType = {
    id: string,
    name: string,
    texture: string,
    Ship: typeof PipShip,
}

export const PIP_SHIPS: ShipType[] = []

PIP_SHIPS.push({
    id: "mono",
    name: "Mono",
    texture: "ship_1",
    Ship: class extends PipShip{
        stats = createShipStats()
    },
})

PIP_SHIPS.push({
    id: "hugo",
    name: "Hugo",
    texture: "ship_2",
    Ship: class extends PipShip{
        stats = createShipStats()
    },
})

PIP_SHIPS.push({
    id: "gotchi",
    name: "Gotchi",
    texture: "ship_3",
    Ship: class extends PipShip{
        stats = createShipStats({
            movement: {
                acceleration: {
                    low: 4,
                    normal: 6,
                    high: 8,
                },
            },
        })
    },
})

PIP_SHIPS.push({
    id: "blu",
    name: "Blu",
    texture: "ship_4",
    Ship: class extends PipShip{
        stats = createShipStats()
    },
})

PIP_SHIPS.push({
    id: "flora",
    name: "Flora",
    texture: "ship_5",
    Ship: class extends PipShip{
        stats = createShipStats()
    },
})

PIP_SHIPS.push({
    id: "djibouti",
    name: "Djibouti",
    texture: "ship_6",
    Ship: class extends PipShip{
        stats = createShipStats()
    },
})
