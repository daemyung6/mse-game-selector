const connecter = require("./connecter.js");
connecter.init();

const gamelist = require('./gamelist.js');
gamelist.init({
  allLaunchGame : connecter.allLaunchGame,
  allExitGame : connecter.allExitGame,
});

const fileSave = require('./filesave.js');
fileSave.init(
  gamelist
);