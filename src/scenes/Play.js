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
        console.log("Creating Rocket...");
        this.p1Rocket = new Rocket(this,game.config.width/2, game.config.height - borderUISize-borderPadding,
            'rocket').setOrigin(0.5,0)
        console.log("Rocket Created:", this.p1Rocket);

        //add spaceship(x3)

        console.log("Creating ship01...");
        this.ship01 = new Spaceship(this, 200, 100, 'spaceship', 0, 30).setOrigin(0, 0);
        console.log("ship01 Created:", this.ship01);
        
        console.log("Creating ship02...");
        this.ship02 = new Spaceship(this, 300, 150, 'spaceship', 0, 20).setOrigin(0, 0);
        console.log("ship02 Created:", this.ship02);
        
        console.log("Creating ship03...");
        this.ship03 = new FastShip(this, 400, 200, 'fastship', 0, 50).setOrigin(0, 0);
        console.log("ship03 Created:", this.ship03);
        
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
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig)
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


        //Add parallax layer
        this.distantStars = this.add.tileSprite(0,0,640,480, 'distant_stars').setOrigin(0,0)

        //Add fire ui text
        this.add.text(this.p1Rocket.x, this.p1Rocket.y +40 , 'F to Fire',{
            fontSize:'12px',
            fill: '#FFF'
        }).setOrigin(0.5)

        //initialize high score
        this.highScore = this.registry.get('highScore') || 0

        //Timer text
        this.timeText = this.add.text(game.config.width - borderUISize - 100,
            borderUISize + borderPadding*2,
            'Time: ' + Math.floor(game.settings.gameTimer/1000).toString(),{
                fontFamily: 'Courier',
                fontSize: '24px',
                color: '#FFFFFF'
            })
        
        //Background music
        if(!this.bgm){
            this.bgm = this.sound.add('bgm', { volume:0.2, loop:true})
            this.bgm.play()
        }
        
    }

    update(){
        //check key input for restart
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyRESET)){
            this.scene.restart()
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene")
          }
        this.starfield.tilePositionX -= 4
        if(!this.gameOver){
            this.p1Rocket.update()
            this.ship01.update()
            this.ship02.update()
            this.ship03.update() 
        }
        

        // check collision
        if(this.checkCollision(this.p1Rocket, this.ship03)){
            this.p1Rocket.reset()
            this.shipExplode(this.ship03)   
        }
        if(this.checkCollision(this.p1Rocket, this.ship02)){
            this.p1Rocket.reset()
            this.shipExplode(this.ship02)   
        }
        if(this.checkCollision(this.p1Rocket, this.ship01)){
            this.p1Rocket.reset()
            this.shipExplode(this.ship01)   
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

        //update timer
        const remaining = game.settings.gameTimer - this.clock.getElapsed()
        this.timeText.setText("Time: " + Math.ceil(remaining / 1000).toString())

        //update high score
        if(this.p1Score >this.highScore){
            this.highScore = this.p1Score
            this.registry.set('highScore', this.highScore)
        }
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
        // Hide the ship
        ship.alpha = 0;
    
        // Create an explosion animation at the ship's position
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
    
        // Play random explosion sound
        const explosions = ['sfx-explosion1', 'sfx-explosion2', 'sfx-explosion3', 'sfx-explosion4'];
        this.sound.play(Phaser.Math.RND.pick(explosions));
    
        const particles = this.add.particles(ship.x, ship.y, 'flares', {
            frame: ['red', 'blue', 'yellow'],
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 600,
            blendMode: 'ADD',
            quantity: 10
        });
    }
}
