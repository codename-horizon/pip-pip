import { Ship } from "./logic"
import { PointPhysicsObject, PointPhysicsWorld } from "@pip-pip/core/src/client"

export async function runGame(canvas: HTMLCanvasElement){
    const context = canvas.getContext("2d")

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const world = new PointPhysicsWorld()

    const total = 50
    for(let i = 0; i < total; i++){
        const object = new PointPhysicsObject()
        object.position.x = Math.random() * canvas.width
        object.position.y = Math.random() * canvas.height

        const angle = Math.random() * Math.PI * 2
        const mag = Math.random() * 100

        object.velocity.x = Math.cos(angle) * mag
        object.velocity.y = Math.sin(angle) * mag
        world.addObject(object)
    }

    world.updateTick()

    function draw(){
        requestAnimationFrame(draw)
        world.update()
        if(context === null) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)

        
        for(const id in world.objects){
            const object = world.objects[id]
            
            if(object.position.x < 0){
                object.position.qx = 0
                object.velocity.qx *= -1
            }
            
            if(object.position.x > canvas.width){
                object.position.qx = canvas.width
                object.velocity.qx *= -1
            }
            
            if(object.position.y < 0){
                object.position.qy = 0
                object.velocity.qy *= -1
            }
            
            if(object.position.y > canvas.height){
                object.position.qy = canvas.height
                object.velocity.qy *= -1
            }
        }

        for(const id in world.objects){
            const object = world.objects[id]

            object.position.flush()
            object.velocity.flush()
        }

        for(const id in world.objects){
            const object = world.objects[id]

            context.strokeStyle = "white"
            context.beginPath()
            context.arc(
                object.position.x,
                object.position.y,
                object.radius,
                0, Math.PI * 2,
            )
            context.stroke()
        }
    }

    draw()
}