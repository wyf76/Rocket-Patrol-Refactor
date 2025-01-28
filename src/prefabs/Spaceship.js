class Spaceship extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, pointValue) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        this.points = pointValue;
        this.moveSpeed = game.settings.spaceshipSpeed;
        this.direction = Phaser.Math.RND.pick(['left', 'right']);
        // Adjust initial position based on direction
        if (this.direction === 'right') {
            this.flipX = true;
            this.x = 0 - this.width; // Start off the left edge
        } else {
            this.x = game.config.width; // Start off the right edge
        }
        this.y = y; // Maintain the provided y position
    }

    update() {
        // Move spaceship based on direction
        this.x += this.direction === 'left' ? -this.moveSpeed : this.moveSpeed;
        // Wrap around edges
        if (this.direction === 'left' && this.x <= 0 - this.width) {
            this.reset();
        } else if (this.direction === 'right' && this.x >= game.config.width) {
            this.reset();
        }
    }

    reset() {
        // Reset to the correct edge based on direction
        if (this.direction === 'left') {
            this.x = game.config.width;
        } else {
            this.x = 0 - this.width;
        }
    }
}
