let gameList;
let gameListDiv;
let selectedListDiv;
let gameListAddBt;
let gameListDeleteBt;
let gameListResetBt;
let gameListSubmitBt;
let runListDiv;
let programPath;
let allLaunchGame;
let allExitGame;
let autoPlayBt;
let autoStopBt;

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
    selectedListDiv.appendChild(div);
  }
  console.log(selectList);
  console.log(selectedList)
}

function updateRunlist() {
  runList = [];

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
  }
}


function init(args) {
  gameList = args.gameList;
  gameListDiv = args.gameListDiv;
  selectedListDiv = args.selectedListDiv;
  gameListAddBt = args.gameListAddBt;
  gameListDeleteBt = args.gameListDeleteBt;
  gameListResetBt = args.gameListResetBt;
  gameListSubmitBt = args.gameListSubmitBt;
  runListDiv = args.runListDiv;
  allLaunchGame = args.allLaunchGame;
  programPath = args.programPath;
  allExitGame = args.allExitGame;
  autoPlayBt = args.autoPlayBt;
  autoStopBt = args.autoStopBt;


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
    selectList.sort(function(a, b) { return a - b});
    selectedList.sort(function(a, b) { return a - b});
    updateList()
  }
  gameListSubmitBt.onclick = function() {
    updateRunlist()
  }

  autoPlayBt.onclick = function() {
    if(runListDiv.children.length == 0) {
      return;
    }
    console.log(runListDiv.children[0].children[1])
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
}