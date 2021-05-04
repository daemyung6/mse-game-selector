const gameList = require('../config/data.js').gameList;
const programPath = require('../config/data.js').programPath;
const gameListDiv = document.getElementById('gameList');
const selectedListDiv = document.getElementById('selectedList');
const gameListAddBt = document.getElementById('gameListAddBt');
const gameListDeleteBt = document.getElementById('gameListDeleteBt');
const gameListResetBt = document.getElementById('gameListResetBt');
const gameListSubmitBt = document.getElementById('gameListSubmitBt');
const runListDiv = document.getElementById('runList');
const autoPlayBt = document.getElementById('autoPlayBt');
const autoStopBt = document.getElementById('autoStopBt');


let allLaunchGame;
let allExitGame;

let isAutoPlay = false;
let autoPlayNum = 0;

let selectList = [];
let selectedList = [];
let runList = [];

function updateList() {
  gameListDiv.innerHTML = null
  for (let i = 0; i < selectList.length; i++) {
    let div = document.createElement('div');
    div.innerHTML = /*html*/`
      <input type="checkbox"> ${gameList[selectList[i]].title}
    `
    gameListDiv.appendChild(div);
    div.onclick = function() {
      div.children[0].checked = !div.children[0].checked;
      console.log("do event")
    }
    div.children[0].onclick = function() {
      div.children[0].checked = !div.children[0].checked;
    }
  }

  selectedListDiv.innerHTML = null;
  for (let i = 0; i < selectedList.length; i++) {
    let div = document.createElement('div');
    div.innerHTML = /*html*/ `
      <input type="checkbox"> ${gameList[selectedList[i]].title}
    `
    div.onclick = function() {
      div.children[0].checked = !div.children[0].checked;
    }
    div.children[0].onclick = function() {
      div.children[0].checked = !div.children[0].checked;
    }
    selectedListDiv.appendChild(div);
  }
}

function updateRunlist(list) {
  runList = [];
  if(list) {
    selectedList = list
  }

  runListDiv.innerHTML = null;
  for (let i = 0; i < selectedList.length; i++) {
    runList[i] = selectedList[i];
    const id = gameList[selectedList[i]].id;
    let div = document.createElement('div');
    div.setAttribute('class', 'item');
    div.innerHTML = /*html*/`
      <div class="name">
        <div>${gameList[selectedList[i]].title}</div>
      </div>
      <div class="bt">실행</div>
      <div class="bt">종료</div>
    `
    runListDiv.appendChild(div);
    div.children[1].onclick = function() {
      allLaunchGame(id, div, function() {
        if(isAutoPlay) {
          ++autoPlayNum
          if(runListDiv.children.length < autoPlayNum + 1) {
            return
          }
          setTimeout(function() {
            runListDiv.children[autoPlayNum].children[1].onclick()
          }, 500)
          
        }
      });
    }
    div.children[2].onclick = function() {
      allExitGame()
    }
  }
}

function initlist() {
  selectedList = [];
  for (let i = 0; i < gameList.length; i++) {
    selectList[i] = i;
    let div = document.createElement('div');
    div.innerHTML = /*html*/`
      <input type="checkbox"> ${gameList[i].title}
    `
    gameListDiv.appendChild(div);
    div.onclick = function() {
      div.children[0].checked = !div.children[0].checked;
    }
    div.children[0].onclick = function() {
      div.children[0].checked = !div.children[0].checked;
    }
  }
}


function init(args) {
  allLaunchGame = args.allLaunchGame;
  allExitGame = args.allExitGame;

  initlist()
  
  gameListAddBt.onclick = function() {
    for (let i = 0; i < gameListDiv.getElementsByTagName('input').length; i++) {
      if(gameListDiv.getElementsByTagName('input')[i].checked) {
        selectedList.push(selectList.splice(i, 1)[0]);
        gameListDiv.getElementsByTagName('input')[i].remove();
        --i;
      }
    }
    selectList.sort(function(a, b) { return a - b});
    selectedList.sort(function(a, b) { return a - b});
    updateList()
  }
  gameListResetBt.onclick = function() {
    initlist();
    updateList()
  }
  gameListDeleteBt.onclick = function() {
    for (let i = 0; i < selectedListDiv.getElementsByTagName('input').length; i++) {
      if(selectedListDiv.getElementsByTagName('input')[i].checked) {
        selectList.push(selectedList.splice(i, 1)[0]);
        selectedListDiv.getElementsByTagName('input')[i].remove();
        --i;
      }
    }
    selectList.sort(function(a, b) { return a - b });
    selectedList.sort(function(a, b) { return a - b });
    updateList()
  }
  gameListSubmitBt.onclick = function() {
    updateRunlist()
  }

  autoPlayBt.onclick = function() {
    if(runListDiv.children.length == 0) {
      return;
    }
    isAutoPlay = true;
    autoPlayNum = 0;
    runListDiv.children[0].children[1].onclick();
  }
  autoStopBt.onclick = function() {
    isAutoPlay = false;
    allExitGame()
  }
}
function getRunList() {
  return runList;
}
module.exports = {
  init : init,
  getRunList : getRunList,
  updateRunlist : updateRunlist,
}