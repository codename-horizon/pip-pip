import { Ship } from "./logic"
import { PointPhysicsWorld } from "./physics"

export async function test(){
    const world = new PointPhysicsWorld()
    const ship = new Ship()
    world.addObject(ship.physics)
    world.addObject(ship.physics)
    console.log(world, ship)

    ship.physics.position.x += 10
    console.log(ship.physics.position)

    setTimeout(() => {
        console.log(world.objects)
        ship.physics.destroy()
        console.log(world.objects)
    }, 100)
}