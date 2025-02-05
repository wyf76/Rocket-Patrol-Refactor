// Rocket prefab
class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        this.isFiring = false;
        this.moveSpeed = 2;
        this.sfxShot = scene.sound.add('sfx-shot');
    }

    update() {
        // Always allow horizontal movement
        if (keyLEFT.isDown && this.x >= borderUISize + this.width) {
            this.x -= this.moveSpeed;
        } else if (keyRIGHT.isDown && this.x <= game.config.width - borderUISize - this.width) {
            this.x += this.moveSpeed;
        }

        // Fire button
        if (Phaser.Input.Keyboard.JustDown(keyFIRE) && !this.isFiring) {
            this.isFiring = true;
            this.sfxShot.play();
        }

        // If fired, move up
        if (this.isFiring && this.y >= borderUISize * 3 + borderPadding) {
            this.y -= this.moveSpeed;
        }

        // Reset on miss (if it goes above UI)
        if (this.y <= borderUISize * 3 + borderPadding) {
            this.isFiring = false;
            this.y = game.config.height - borderUISize - borderPadding;

            // Subtract 1 second on a miss
            if (this.scene.remainingTime > 1000) {
                this.scene.remainingTime -= 1000;
            } else {
                this.scene.remainingTime = 0;
            }
            // Update the timer text
            this.scene.timeText.setText(`Time: ${Math.ceil(this.scene.remainingTime / 1000)}`);
        }
    }

    reset() {
        this.isFiring = false;
        this.y = game.config.height - borderUISize - borderPadding;
    }
}