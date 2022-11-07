import { PipShip, createShipStats, createRange } from "../logic/ship"

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
        stats = createShipStats({
            weapon: {
                rate: 1,
                capacity: 120,
            },
            bullet: {
                velocity: 50,
                damage: createRange(2),
            },
            defense: createRange(0.5),
        })
    },
})

PIP_SHIPS.push({
    id: "hugo",
    name: "Hugo",
    texture: "ship_2",
    Ship: class extends PipShip{
        stats = createShipStats({
            movement: {
                agility: 1,
                acceleration: createRange(3, 1/3),
            },
        })
    },
})

PIP_SHIPS.push({
    id: "gotchi",
    name: "Gotchi",
    texture: "ship_3",
    Ship: class extends PipShip{
        stats = createShipStats({
            movement: {
                agility: 0.2,
                acceleration: {
                    low: 7.5,
                    normal: 10,
                    high: 15,
                },
            },
            aim: {
                speed: 0.25,
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
