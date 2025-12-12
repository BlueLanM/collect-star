const config = {
	height: 600,
	physics: {
		arcade: {
			debug: false,
			gravity: { y: 300 }
		},
		default: "arcade"
	},
	scene: {
		create,
		preload,
		update
	},
	type: Phaser.AUTO,
	width: 800
};

let cursors;
let platforms;
let player;
let star;
let bombs;
let score = 0;
let scoreText;
let gameOver = false;
let gameOverText;

const game = new Phaser.Game(config);

// 初始化
function create() {
	this.add.image(400, 300, "sky");
	createGround.call(this);
	createPlayer.call(this);
	createStar.call(this);
	scoreText = this.add.text(16, 16, "score: 0", { fill: "#000", fontSize: "32px" });
	createBomb.call(this);
}

// 创建地面&板子
function createGround() {
	platforms = this.physics.add.staticGroup();
	platforms.create(400, 568, "ground").setScale(2).refreshBody();
	platforms.create(600, 400, "ground");
	platforms.create(50, 250, "ground");
	platforms.create(750, 220, "ground");
}

// 创建玩家
function createPlayer() {
	player = this.physics.add.sprite(100, 450, "dude");

	player.setBounce(0.2);
	player.setCollideWorldBounds(true);
	player.body.setGravityY(300);

	this.anims.create({
		frameRate: 10,
		frames: this.anims.generateFrameNumbers("dude", { end: 3, start: 0 }),
		key: "left",
		repeat: -1
	});

	this.anims.create({
		frameRate: 20,
		frames: [{ frame: 4, key: "dude" }],
		key: "turn"
	});

	this.anims.create({
		frameRate: 10,
		frames: this.anims.generateFrameNumbers("dude", { end: 8, start: 5 }),
		key: "right",
		repeat: -1
	});

	// 增加玩家和地面的碰撞器
	this.physics.add.collider(player, platforms);
}

// 玩家移动
function onMove() {
	cursors = this.input.keyboard.createCursorKeys();

	if (cursors.left.isDown) {
		player.setVelocityX(-160);

		player.anims.play("left", true);
	} else if (cursors.right.isDown) {
		player.setVelocityX(160);

		player.anims.play("right", true);
	} else {
		player.setVelocityX(0);

		player.anims.play("turn");
	}

	if (cursors.up.isDown && player.body.touching.down) {
		player.setVelocityY(-480);
	}
}

// 创建星星
function createStar() {
	star = this.physics.add.group({
		key: "star",
		repeat: 11,
		setXY: { stepX: 70, x: 12, y: 0 }
	});

	star.children.iterate(function(child) {
		child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
	});

	// 增加星星和地面的碰撞器
	this.physics.add.collider(star, platforms);

	// 增加星星和玩家的碰撞器
	this.physics.add.overlap(player, star, collectStar, null, this);
}

// 收集星星（玩家和星星之间碰撞）
function collectStar(player, stars) {
	stars.disableBody(true, true);

	score += 10;
	scoreText.setText("Score: " + score);

	// 如果星星全部收集完，重新生成星星并生成炸弹
	if (star.countActive(true) === 0) {
		star.children.iterate(function(child) {
			child.enableBody(true, child.x, 0, true, true);
		});

		const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

		const bomb = bombs.create(x, 16, "bomb");
		bomb.setBounce(1);
		bomb.setCollideWorldBounds(true);
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
	}
}

// 创建炸弹
function createBomb() {
	bombs = this.physics.add.group();

	bombs.create(100, 16, "bomb").setBounce(1);

	// 增加炸弹和地面的碰撞器
	this.physics.add.collider(bombs, platforms);

	// 增加炸弹和玩家的碰撞器
	this.physics.add.overlap(player, bombs, hitBomb, null, this);
}

function hitBomb(player, bomb) {
	bomb.disableBody(true, true);
	this.physics.pause();

	player.setTint(0xff0000);

	player.anims.play("turn");

	gameOver = true;
	gameOverText = this.add.text(150, 300, "Game Over 按下ctrl+R重新开始", { fill: "#fff", fontSize: "32px" });
}

// 载入资源
function preload() {
	this.load.image("sky", "assets/sky.png");
	this.load.image("ground", "assets/platform.png");
	this.load.image("star", "assets/star.png");
	this.load.image("bomb", "assets/bomb.png");
	this.load.spritesheet("dude",
		"assets/dude.png",
		{ frameHeight: 48, frameWidth: 32 }
	);
}

function update() {
	onMove.call(this);
}