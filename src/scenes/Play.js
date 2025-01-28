class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    create() {
        // Place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);
        this.distantStars = this.add.tileSprite(0, 0, 640, 480, 'distant_stars').setOrigin(0, 0);

        // Green UI background + White borders
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, 
                           borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, 
                           borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, 
                           game.config.height, 0xFFFFFF).setOrigin(0, 0);

        // Add Rocket
        this.p1Rocket = new Rocket(
            this,
            game.config.width / 2,
            game.config.height - borderUISize - borderPadding,
            'rocket'
        ).setOrigin(0.5, 0).setDepth(3);

        // Add Spaceships (x3)
        this.ship01 = new Spaceship(this, 0, borderUISize * 4, 'spaceship', 0, 30).setOrigin(0, 0).setDepth(3);
        this.ship02 = new Spaceship(this, 0, borderUISize * 5 + borderPadding * 2, 'spaceship', 0, 20).setOrigin(0, 0).setDepth(3);
        this.ship03 = new Spaceship(this, 0, borderUISize * 6 + borderPadding * 4, 'spaceship', 0, 10).setOrigin(0, 0).setDepth(3);

        // Define keys
        keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        // Initialize score
        this.p1Score = 0;

        // Display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: { top: 5, bottom: 5 },
            fixedWidth: 0
        };
        this.scoreLeft = this.add
            .text(borderUISize + borderPadding, borderUISize + borderPadding * 2, `Score: ${this.p1Score}`, scoreConfig)
            .setDepth(5);

        // Flag for game over
        this.gameOver = false;

        // Initialize the remaining time (in ms) from game settings
        this.remainingTime = game.settings.gameTimer; // e.g. 60000 ms for 60 seconds

        // Display timer text
        this.timeText = this.add.text(
            game.config.width - borderUISize - 150,
            borderUISize + borderPadding * 2,
            `Time: ${Math.ceil(this.remainingTime / 1000)}`,
            {
                fontFamily: 'Courier',
                fontSize: '24px',
                color: '#FFFFFF'
            }
        );

        // (Optional) If you have a high score system, set it up. Otherwise, comment out:
        this.highScore = 0; // or load from local storage
        this.highScoreText = this.add.text(game.config.width / 2,borderUISize + borderPadding * 2, 
            `High Score: ${this.highScore}`, scoreConfig).setOrigin(0.5).setDepth(5);

        // Add fire UI text
        this.add.text(this.p1Rocket.x, this.p1Rocket.y + 40, 'F to Fire', {
            fontSize: '12px',
            fill: '#FFF'
        }).setOrigin(0.5);

        // Background music
        if(!this.bgm){
            this.bgm = this.sound.add('bgm', { volume: 0.2, loop: true });
            this.bgm.play();
        }

        // For speed boost logic later
        this.speedIncreased = false;
    }

    update() {
        // Check for game over input
        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(keyRESET)) {
                this.scene.restart();
            }
            if (Phaser.Input.Keyboard.JustDown(keyLEFT)) {
                this.scene.start("menuScene");
            }
            return; // Skip the rest if the game is over
        }

        // Parallax scrolling
        this.starfield.tilePositionX -= 4;
        this.distantStars.tilePositionX -= 2;

        // Update rocket & ships
        this.p1Rocket.update();
        this.ship01.update();
        this.ship02.update();
        this.ship03.update();

        // Decrease remaining time
        // Use the time since last frame: this.game.loop.delta or this.time.elapsedMS
        let delta = this.game.loop.delta; 
        this.remainingTime -= delta;

        // If time runs out, game is over
        if (this.remainingTime <= 0) {
            this.remainingTime = 0;
            this.endGame();
        }

        // Update the timer text
        this.timeText.setText(`Time: ${Math.ceil(this.remainingTime / 1000)}`);

        // Check collisions
        if (this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }

        // Speed increase after 30 seconds of play (i.e., after 30,000 ms have elapsed)
        // If we started with 60,000 ms, once we drop below 30,000 ms, 30 seconds have passed.
        if (!this.speedIncreased && this.remainingTime <= 30000) {
            this.ship01.moveSpeed = 5;
            this.ship02.moveSpeed = 6;
            this.ship03.moveSpeed = 7;
            this.speedIncreased = true;
        }

        // Update high score display during gameplay (if applicable)
        this.highScoreText.setText(`High Score: ${this.highScore}`);
    }

    checkCollision(rocket, ship) {
        // Simple AABB
        if (
            rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y
        ) {
            return true;
        }
        return false;
    }

    shipExplode(ship) {
        if (!ship.active) return; // Prevent double-exploding

        // Add time bonus for successful hits
        let timeBonus = Math.floor(ship.points / 10) * 1000; // e.g. 1 second per 10 points
        this.remainingTime += timeBonus;
        this.timeText.setText(`Time: ${Math.ceil(this.remainingTime / 1000)}`);

        // Hide the ship
        ship.alpha = 0;

        // Create explosion animation
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {
            ship.reset();
            ship.alpha = 1;
            boom.destroy();
        });

        // Add score and update text
        this.p1Score += ship.points;
        this.scoreLeft.setText(`Score: ${this.p1Score}`);

        // Play explosion sound
        this.sound.play('sfx-explosion');

        // Particle effect
        const particles = this.add.particles(ship.x, ship.y, 'flares', {
            frame: ['red', 'blue', 'yellow'],
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 600,
            blendMode: 'ADD',
            quantity: 10
        });
        this.time.delayedCall(600, () => {
            particles.destroy();
        });
    }

    endGame() {
        this.gameOver = true;
        // Display "GAME OVER" text
        this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', {
            fontSize: '28px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        // Optionally instruct user
        this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press (R) to Restart or ← for Menu', {
            fontSize: '18px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
    }
}