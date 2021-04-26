const config = require("../config/data.js")
console.log(config)

const connecter = require("./connecter.js");
connecter.init(
  config.remoteList, 
  config.remotePort, 
  config.programPath, 
);

const gamelist = require('./gamelist.js');
gamelist.init({
  gameList : config.gameList,
  gameListDiv : document.getElementById('gameList'),
  selectedListDiv : document.getElementById('selectedList'),
  gameListAddBt : document.getElementById('gameListAddBt'),
  gameListDeleteBt : document.getElementById('gameListDeleteBt'),
  gameListResetBt : document.getElementById('gameListResetBt'),
  gameListSubmitBt : document.getElementById('gameListSubmitBt'),
  runListDiv : document.getElementById('runList'),
  allLaunchGame : connecter.allLaunchGame,
  allExitGame : connecter.allExitGame,
  autoPlayBt : document.getElementById('autoPlayBt'),
  autoStopBt : document.getElementById('autoStopBt'),
});