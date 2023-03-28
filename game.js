let player;
let cursors;
let bombs;
let isMaxBomb = false;
let score = 0;
let scoreText;
let intervalCreateBombs;
let intervalScore;
let gameOver = false;
let bgm;
const MAX_BOMBS_SIZE = 100;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'assets/player.png', { width: 50, height: 50 });
    this.load.image('bomb', 'assets/bomb.png', { width: 16, height: 16 });
    this.load.image('background', 'assets/background.jpg');
    this.load.audio('bgm', ['assets/bgm.mp3']);
}

function init(that) {
    intervalScore && clearInterval(intervalScore)
    intervalCreateBombs && clearInterval(intervalCreateBombs);

    for (let index = 0; index < 30; index++) {
        createBombs(that);
    }

    intervalScore = setInterval(function() {
        if (gameOver) {
            clearInterval(intervalScore)
        }
        score += 1
    }, 100);

    intervalCreateBombs = setInterval(function() {
        if (isMaxBomb || gameOver) {
            clearInterval(intervalCreateBombs);
        }
        createBombs(that)
    }, 1000);
}

function create() {
    let image = this.add.image(0, 0, 'background').setOrigin(0);
    image.displayWidth = config.width;
    image.displayHeight = config.height;
    bgm = this.sound.add('bgm');

    // 배경음악 재생 (루프 재생)
    bgm.play({loop: true});
    player = this.physics.add.image(400, 300, 'player');
    player.setCollideWorldBounds(true); // 플레이어 객체가 세계 경계에 충돌할 수 있도록 설정

    player.displayWidth = 50; // 이미지 가로 크기 조정
    player.displayHeight = 50; // 이미지 세로 크기 조정
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    bombs = this.physics.add.group({ maxSize: MAX_BOMBS_SIZE });
   
   init(this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
}

function createBombs(that) {
    if (bombs.getLength() >= MAX_BOMBS_SIZE) {
        isMaxBomb = true;
        return;
    }
    // isMaxBomb
    const x = Phaser.Math.Between(0, config.width);
    const y = Phaser.Math.Between(0, config.height);
    const bomb = that.physics.add.image(x, y, 'bomb');

    bomb.displayWidth = 16;
    bomb.displayHeight = 16;
    bombs.add(bomb);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
    bomb.allowGravity = false;
}

function update() {
    scoreText.setText('Score: ' + score);
    if (cursors.left.isDown) player.setVelocityX(-250);
    if (cursors.right.isDown) player.setVelocityX(250);
    if (cursors.up.isDown) player.setVelocityY(-250);
    if (cursors.down.isDown) player.setVelocityY(250);
    if (cursors.space.isDown) restartGame(this);
}

function restartGame(that) {
    // 점수 초기화
    gameOver = false;
    score = 0;

    bgm.play();
    isMaxBomb = false;

    bombs.clear(true, true);

    player.clearTint();
    that.physics.resume();
    scoreText.setText('Score: ' + score);
    
    init(that);
}

function hitBomb(player, bomb) {
    this.physics.pause();
    bgm.stop();
    player.setTint(0xff0000);

    gameOver = true;
}