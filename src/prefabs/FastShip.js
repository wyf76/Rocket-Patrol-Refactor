class FastShip extends Spaceship{
    constructor(scene, x, y, texture, frame, pointValue){
        super(scene, x, y, texture, frame, pointValue)
        this.moveSpeed *= 1.5
        this.setScale(0.7)
    }
}