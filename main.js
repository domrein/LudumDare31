var game = new Phaser.Game(1024, 768, Phaser.AUTO, "game");
game.state.add("play", PlayState);
game.state.start("play");
