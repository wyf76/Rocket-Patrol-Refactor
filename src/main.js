//Yufan Weng
// Rocket Patrol Enhanced
//Time: 8 hr
// Mode Mods: Track High Score (1), FIRE UI (1), 
// BGM (1), Speed Increase (1), Rocket Control (1), Random Direction (1),
// Explosion SFX (3), Timer (3), Parallax (3)
// new timing (5), 
let config={
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    scene: [ Menu, Play ]
}

let game = new Phaser.Game(config)

//set UI sizes
let borderUISize = game.config.height/15
let borderPadding = borderUISize /3
let keyFIRE, keyRESET, keyLEFT, keyRIGHT