class Menu extends Phaser.Scene{
    constructor(){
        super("menuScene")
    }

    preload() {
        // load images/tile sprites
        this.load.image('rocket', './assets/rocket.png')
        this.load.image('spaceship', './assets/spaceship.png')
        //fastship
        this.load.image('starfield', './assets/starfield.png')
        this.load.image('distant_stars', './assets/distant_stars.png')
        this.load.spritesheet('explosion', './assets/explosion.png',{
            frameWidth: 64,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 9
        })
        // load audio
        this.load.audio('sfx-select', './assets/sfx-select.wav')
        this.load.audio('sfx-explosion', './assets/sfx-explosion.wav')
        this.load.audio('sfx-shot', './assets/sfx-shot.wav')
        //add new explosion sound
        this.load.audio('sfx-explosion1', './assets/explosion_01.wav');
        this.load.audio('sfx-explosion2', './assets/laserrocket2.wav');
        this.load.audio('sfx-explosion3', './assets/mega-thunder.wav');
        this.load.audio('sfx-explosion4', './assets/usat-bomb.wav');
        this.load.audio('bgm', './assets/Space journey.mp3');
        this.load.atlas('flares', 'https://labs.phaser.io/assets/particles/flares.png', 'https://labs.phaser.io/assets/particles/flares.json');
    
        console.log("Loaded Textures:", this.textures.list);
      }
      

    create(){
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {start: 0, end: 9, first: 0}),
            frameRate: 30
        })
        let menuConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
              top: 5,
              bottom: 5,
            },
            fixedWidth: 0
        }
    // display menu text
    this.add.text(game.config.width/2, game.config.height/2 - borderUISize - borderPadding, 'ROCKET PATROL',
        menuConfig).setOrigin(0.5)
    this.add.text(game.config.width/2, game.config.height/2, 'Use arrows to move & (F) to fire',
        menuConfig).setOrigin(0.5)
    menuConfig.backgroundColor = '#00FF00'
    menuConfig.color = '#000'
    this.add.text(game.config.width/2, game.config.height/2 + borderUISize + borderPadding, 'Press <- for novice or -> for Expert', 
        menuConfig).setOrigin(0.5)

    // define keys
    keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
    keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)

    //Add high Score text
    this.add.text(game.config.width/2, borderUISize*3, 'High Score: '+  
      (this.registry.get('highScore') || 0).toString(),{
          fontFamily: 'Courier',
          fontSize: '24px',
          color: '#FFFFFF',
      }).setOrigin(0.5)
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keyLEFT)) {
          // easy mode
          game.settings = {
            spaceshipSpeed: 3,
            gameTimer: 60000    
          }
          this.sound.play('sfx-select')
          this.scene.start('playScene')    
        }
        if (Phaser.Input.Keyboard.JustDown(keyRIGHT)) {
          // hard mode
          game.settings = {
            spaceshipSpeed: 4,
            gameTimer: 45000    
          }
          this.sound.play('sfx-select')
          this.scene.start('playScene')    
        }
      }
}

