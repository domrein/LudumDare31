var game = new Phaser.Game(1024, 768, Phaser.AUTO, "game", {
  preload: function() {

  },
  create: function() {
    this.spawnQueue = [];
    this.spawnCooldown = 0;
    this.player = this.spawn("player");
    this.cursors = game.input.keyboard.createCursorKeys();

    game.physics.startSystem(Phaser.Physics.ARCADE);
  },
  update: function() {
    if (this.spawnQueue.length) {

    }

    if (this.player) {
      // handle controls
      if (this.cursors.left.isDown) {
        this.player.body.acceleration.x = -6000;
      }
      else if (this.cursors.right.isDown) {
        this.player.body.acceleration.x = 6000;
      }
      else {
        this.player.body.acceleration.x = 0;
      }
      if (this.cursors.up.isDown) {
        this.player.body.acceleration.y = -6000;
      }
      else if (this.cursors.down.isDown) {
        this.player.body.acceleration.y = 6000;
      }
      else {
        this.player.body.acceleration.y = 0;
      }

      // sprite.rotation = game.physics.arcade.angleToPointer(sprite);

      if (game.input.activePointer.isDown)
      {
        this.spawn("playerBullet", this.player.x, this.player.y);
      }
    }
  },
  render: function() {

  },
  spawn: function(type, x, y) {
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
        // spawn.body.maxVelocity.x = spawn.body.maxVelocity.y = 500;
        spawn.body.width = spawn.body.height = 15;
        spawn.body.drag.setTo(3000, 3000);
        spawn.body.maxVelocity.setTo(500, 500);
        spawn.body.collideWorldBounds = true;
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
        break;
    }

    return spawn;
  }
});
