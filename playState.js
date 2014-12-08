var PlayState = {
  preload: function() {
  },
  create: function() {
    this.spawnQueue = [];
    this.spawnQueueQueue = [];
    this.spawnCooldown = 0;
    this.spawnCount = 0;

    this.player = this.spawn("player", 1024 / 2 - 10, 768 / 2 - 10);
    this.playerBullets = game.add.group();
    this.enemies = game.add.group();
    this.cursors = game.input.keyboard.createCursorKeys();
    this.altUp = game.input.keyboard.addKey(Phaser.Keyboard.W);
    this.altLeft = game.input.keyboard.addKey(Phaser.Keyboard.A);
    this.altDown = game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.altRight = game.input.keyboard.addKey(Phaser.Keyboard.D);

    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.spawnQueueQueue.push({text: "the screen", delay: 2000, line: 2});
    this.fillSpawnQueueQueue();
  },
  update: function() {
    var _this = this;
    // console.log(game.rnd.integerInRange(0, 1));
    // if (!game.rnd.integerInRange(0, 50)) {
    //   this.spawnQueue.push({type: "enemy", x: game.rnd.integerInRange(0, 500), y: game.rnd.integerInRange(0, 500)});
    // }
    this.spawnCooldown -= game.time.elapsed;
    if (this.spawnCooldown < 0 ) {
      this.spawnCooldown = 0;
    }
    if (this.spawnQueue.length && !this.spawnCooldown) {
      var spawn = this.spawnQueue.shift();
      this.spawn(spawn.type, spawn.x, spawn.y, spawn.activateTime);
      this.spawnCooldown += 30;
    }
    else if (!this.spawnQueue.length) {
      var spawnQueue = this.spawnQueueQueue.shift();
      if (!this.spawnQueueQueue.length) {
        this.fillSpawnQueueQueue();
      }
      this.createSpawns(spawnQueue.text, spawnQueue.delay, spawnQueue.line);
    }

    if (this.player) {
      this.player.state.cooldown -= game.time.elapsed;
      if (this.player.state.cooldown < 0) {
        this.player.state.cooldown = 0;
      }

      // handle controls
      if (this.cursors.left.isDown || this.altLeft.isDown) {
        this.player.body.acceleration.x = -6000;
      }
      else if (this.cursors.right.isDown || this.altRight.isDown) {
        this.player.body.acceleration.x = 6000;
      }
      else {
        this.player.body.acceleration.x = 0;
      }
      if (this.cursors.up.isDown || this.altUp.isDown) {
        this.player.body.acceleration.y = -6000;
      }
      else if (this.cursors.down.isDown || this.altDown.isDown) {
        this.player.body.acceleration.y = 6000;
      }
      else {
        this.player.body.acceleration.y = 0;
      }

      if (game.input.activePointer.isDown && !this.player.state.cooldown) {
        this.spawn("playerBullet", this.player.x + this.player.body.width / 2 - 2, this.player.y + this.player.body.height / 2 - 2);
        this.player.state.cooldown += 40;
      }

      // collision
      game.physics.arcade.overlap(this.player, this.enemies, function(player, enemy) {
        player.destroy();
        _this.player = null;
        game.state.start("play");
      });
      game.physics.arcade.overlap(this.playerBullets, this.enemies, function(playerBullet, enemy) {
        playerBullet.alive = false;
        enemy.destroy();
      });
    }
  },
  render: function() {
  },
  spawn: function(type, x, y, activateTime) {
    if (type === "pause") {
      this.spawnCooldown += x;
      return;
    }
    var spawn = game.add.sprite(x, y);
    // spawn.anchor.setTo(.5, .5)
    var graphics = game.add.graphics(0, 0);
    spawn.addChild(graphics);
    game.physics.enable(spawn, Phaser.Physics.ARCADE);

    switch (type) {
      case "player":
        graphics.lineStyle(2, 0x0000FF, 1); // width, color (0x0000FF), alpha (0 -> 1) // required settings
        // graphics.beginFill(0xFFFF0B, 1) // color (0xFFFF0B), alpha (0 -> 1) // required settings
        graphics.drawRect(0, 0, 14, 14); // (x, y, w, h)
        spawn.body.width = spawn.body.height = 15;
        spawn.body.drag.setTo(3000, 3000);
        spawn.body.maxVelocity.setTo(500, 500);
        spawn.body.collideWorldBounds = true;
        spawn.state = {cooldown: 0};
        break;
      case "playerBullet":
        graphics.lineStyle(2, 0x0000FF, 1);
        graphics.drawRect(0, 0, 6, 6);
        spawn.rotation = game.physics.arcade.angleToPointer(this.player);
        game.physics.arcade.moveToPointer(spawn, 450);
        spawn.body.width = spawn.body.height = 6;
        spawn.checkWorldBounds = true;
        spawn.outOfBoundsKill = true;
        spawn.update = function() {
          if (!this.alive) {
            this.destroy();
          }
        };
        this.playerBullets.add(spawn);
        break;
      case "enemy":
        graphics.lineStyle(2, 0xFF0000, 1); // width, color (0x0000FF), alpha (0 -> 1) // required settings
        graphics.drawRect(0, 0, 20, 20); // (x, y, w, h)
        spawn.body.width = spawn.body.height = 20;
        var randAngle = game.rnd.frac() * Math.PI * 2;
        spawn.body.collideWorldBounds = true;
        spawn.body.bounce.setTo(1, 1);
        spawn.state = {activated: false, activateTime: activateTime};
        spawn.update = function() {
          // console.log("game.time.now: " + game.time.now);
          // console.log("this.state.activateTime: " + this.state.activateTime);
          // console.log("this.state.activated: " + this.state.activated);
          if (game.time.now >= this.state.activateTime && !this.state.activated) {
            this.state.activated = true;
            this.body.velocity.x = Math.cos(randAngle) * 120;
            this.body.velocity.y = Math.sin(randAngle) * 120;
          }
          if (this.state.activated) {
            this.rotation += .05;
          }
        };
        this.enemies.add(spawn);
        break;
    }

    return spawn;
  },
  createSpawns: function(text, pause, line) {
    var enemySize = 25;
    var letterSize = enemySize * 3 + 10;

    var baseSpawnX = 1024 / 2 - text.length * letterSize / 2;
    if (line !== undefined) {
      this.spawnCount = line;
    }
    else {
      this.spawnCount ++;
      line = this.spawnCount % 8;
    }
    var baseSpawnY = line * (letterSize + 5) + 35;

    for (var i = 0; i < text.length; i ++) {
      var letter = text[i];
      var fontLetter = font[letter];
      for (var j = 0; j < 9; j ++) {
        if (fontLetter[j]) {
          this.spawnQueue.push({
            type: "enemy",
            x: (j % 3) * enemySize + baseSpawnX + i * letterSize,
            y: Math.floor(j / 3) * enemySize + baseSpawnY,
            activateTime: game.time.now + 3000
          });
        }
      }
    }
    this.spawnQueue.push({type: "pause", x: pause});
  },
  fillSpawnQueueQueue: function() {
    this.spawnQueueQueue.push({text: "the screen", delay: 500, line: 0});
    this.spawnQueueQueue.push({text: "is all", delay: 0});
    this.spawnQueueQueue.push({text: "that is", delay: 500});
    this.spawnQueueQueue.push({text: "or was", delay: 500});
    this.spawnQueueQueue.push({text: "or ever", delay: 0});
    this.spawnQueueQueue.push({text: "will be", delay: 500});
  }
};