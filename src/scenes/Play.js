class Play extends Phaser.Scene{
    constructor(){
        super("playScene")
    }

    create(){
        //place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0)

        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0)
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0)
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0)
        this.p1Rocket = new Rocket(this,game.config.width/2, game.config.height - borderUISize-borderPadding,
            'rocket').setOrigin(0.5,0)
        //Add parallax layer
        this.distantStars = this.add.tileSprite(0,0,640,480, 'distant_stars').setOrigin(0,0)

        //add spaceship(x3)
        
        this.ship01 = new Spaceship(this, 0, borderUISize * 4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, 0, borderUISize * 5 + borderPadding * 2, 
            'spaceship', 0, 20).setOrigin(0, 0);
        this.ship03 = new Spaceship(this, 0, borderUISize * 6 + borderPadding * 4, 
            'spaceship', 0, 10).setOrigin(0, 0);
        //bring up the rocket. got cover up by background
        this.p1Rocket.setDepth(3)
        this.ship01.setDepth(3)
        this.ship02.setDepth(3)
        this.ship03.setDepth(3)


        //define keys
        keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)

        //initialize score
        this.p1Score=0

        //display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
              top: 5,
              bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, 
            `Score: ${this.p1Score}`, this.scoreConfig).setDepth(5);
        // GAME OVER flag
        this.gameOver = false


        //60 second play clock
        scoreConfig.fixedWidth = 0
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5)
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or ← for Menu',
                scoreConfig).setOrigin(0.5)
            this.gameOver = true
        }, null, this)

        //Add fire ui text
        this.add.text(this.p1Rocket.x, this.p1Rocket.y +40 , 'F to Fire',{
            fontSize:'12px',
            fill: '#FFF'
        }).setOrigin(0.5)

        // Add high score display
        this.highScoreText = this.add.text(game.config.width/2, borderUISize + borderPadding*2, 
            `High Score: ${this.highScore}`, this.scoreConfig).setOrigin(0.5).setDepth(5);
            
        // Initialize the remaining time
        this.remainingTime = game.settings.gameTimer; // Get timer from game settings

        // Display timer text
        this.timeText = this.add.text(
            game.config.width - borderUISize - 150, // Adjust x-position if needed
            borderUISize + borderPadding * 2,
            `Time: ${Math.ceil(this.remainingTime / 1000)}`, // Display in seconds
            {
                fontFamily: 'Courier',
                fontSize: '24px',
                color: '#FFFFFF'
            }
        );

        //Background music
        if(!this.bgm){
            this.bgm = this.sound.add('bgm', { volume:0.2, loop:true})
            this.bgm.play()
        }
        
    }

    update(){
        //check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyRESET)) {
            this.scene.restart();
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }
    
        // Parallax scrolling
        this.starfield.tilePositionX -= 4;
        this.distantStars.tilePositionX -= 2;
    
        if (!this.gameOver) {
            this.p1Rocket.update();
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
    
            // Decrease remaining time
            this.remainingTime -= this.time.elapsedMS;
            if (this.remainingTime <= 0) {
                this.remainingTime = 0; // Prevent negative time
                this.gameOver = true;
                this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', {
                    fontSize: '28px',
                    color: '#FFFFFF'
                }).setOrigin(0.5);
            }
    
            // Update the timer text
            this.timeText.setText(`Time: ${Math.ceil(this.remainingTime / 1000)}`);
        }
    
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

        //Parallax scrolling
        this.starfield.tilePositionX -=4
        this.distantStars.tilePositionX -=2

        // Update Spaceships
        this.ship01.update();
        this.ship02.update();
        this.ship03.update();

        //speed increase after 30s
        if(this.clock.getElapsed() >30000){
            this.ship01.moveSpeed = 5
            this.ship02.moveSpeed = 6
            this.ship03.moveSpeed = 7
        }

        // Update timer text to show remaining time
        this.remainingTime -= this.time.elapsedMS; // Decrease remaining time
        if (this.remainingTime <= 0) {
            this.remainingTime = 0; // Prevent negative time
            this.gameOver = true;
            this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', {
                fontSize: '28px',
                color: '#FFFFFF'
            }).setOrigin(0.5);
        }
        
        this.timeText.setText(`Time: ${Math.ceil(this.remainingTime / 1000)}`);
        // Update high score display during gameplay
        this.highScoreText.setText(`High Score: ${this.highScore}`);
    }

    checkCollision(rocket, ship){
        // simple aabb checking
        if(rocket.x < ship.x +ship.width &&
            rocket.x + rocket.width >ship.x &&
            rocket.y <ship.y + ship.height &&
            rocket.height +rocket.y > ship.y){
                return true
        }else{
            return false
        }
    }

    shipExplode(ship) {
        if (!ship.active) return; // Prevent multiple explosions for the same ship

        // Add time bonus for successful hits
        let timeBonus = Math.floor(ship.points / 10) * 1000; // 1 second per 10 points
        this.remainingTime += timeBonus;

        // Update the timer text
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
        this.scoreLeft.text = this.p1Score;

        // Play explosion sound
        this.sound.play('sfx-explosion');
    
        // Particle Effect
        const particles = this.add.particles(ship.x, ship.y, 'flares', {
            frame: ['red', 'blue', 'yellow'], 
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 600,
            blendMode: 'ADD',
            quantity: 10
        });
    
        // Destroy particles after they finish
        this.time.delayedCall(600, () => {
            particles.destroy();
        });
    }
}
