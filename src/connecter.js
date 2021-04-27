const WebSocket = require('ws');
const seatsElements = document.getElementById("seats");
const net = require('net');
const wol = require('wol')
const arp = require('node-arp');
const pcAllSelectBt = document.getElementById('pcAllSelectBt');
const pcAllUnSelectBt = document.getElementById('pcAllUnSelectBt');
let remotes = [];
const config = require('../config/data.js');
const remoteList = config.remoteList;
const remotePort = config.remotePort;
const programPath = config.programPath;

let launchingCount = 0;


function remote(ip, port, el) {
  let isClick = false;
  this.getIsClick = function() {
    return isClick;
  }
  this.setIsClick = function(value) {
    isClick = value;
    if(value) {
      el.classList.add('select');
    }
    else {
      el.classList.remove('select');
    }
  }
  el.onclick = function() {
    if(isClick) {
      el.classList.remove('select');
    }
    else {
      el.classList.add('select');
    }
    isClick = !isClick;
  }


  let ws;
  function setConnect() {
    el.classList.remove('disconnect');
    el.classList.add('connect')
  }
  function setError() {
    el.classList.add('disconnect')
    el.classList.remove('connect')
  }
  let isConnect = false;
  function onDisconnect() {
    el.children[1].innerText = "미연결";
    isConnect = false;
    setError()
    ws.close()
    ws = null;
    setTimeout(function() {
      init()
    }, 1000)
  }

  let sendMsgfunc;
  this.sendMsg = function(msg) {
    return sendMsgfunc(msg)
  }

  function init() {
    ws = new WebSocket(`ws://${ip}:${port}`);
    el.children[1].innerText = "연결중";

    let isOpened = false;
    

    ws.on('open', function() {
      el.children[1].innerText = "연결";
      isOpened = true;
      isConnect = true;
      setConnect()

    });
    ws.on('close', function() {
      if(isOpened) {
        onDisconnect()
      }   
    })
    ws.on('error', function() {
      onDisconnect()
    });
    ws.on('message', function(data) {
      data = JSON.parse(data);
      if(data.type == 'terminated') {
        el.children[1].innerText = "대기중";
        onExit()
      }
      if(data.type == 'launched') {
        el.children[1].innerText = "실행중";
      }
    });
    sendMsgfunc = function(msg) {
      if(isConnect) {
        ws.send(msg)
        return true;
      }
      return false;
    }
  }
  init()
}


function init() {
  remotes = [];
  for (let i = 0; i < remoteList.length; i++) {  
    let el = seatsElements
      .getElementsByClassName('seat')[remoteList[i].y - 1]
      .getElementsByClassName('zone')[remoteList[i].x - 1]

    el.classList.add('chair');
    el.classList.add('bt');
    
    

    var div = document.createElement('div');
    div.innerText = i + 1 < 10 ? `0${i + 1}` : i + 1;
    el.appendChild(div)

    var div = document.createElement('div');
    div.innerText = "대기중"
    el.appendChild(div)

    var div = document.createElement('div');
    div.innerText = remoteList[i].ip;
    el.appendChild(div)

    remotes.push(new remote(remoteList[i].ip, remotePort, el));

    pcAllSelectBt.onclick = function() {
      for (let i = 0; i < remotes.length; i++) {
        remotes[i].setIsClick(true);
      }
    }
    pcAllUnSelectBt.onclick = function() {
      for (let i = 0; i < remotes.length; i++) {
        remotes[i].setIsClick(false);
      }
    }
  }
}


let nowPlayId;
let onExitCallback;
let nowClickedDiv;

function highLightDiv(el) {
  if(nowClickedDiv) {
    nowClickedDiv.children[0].classList.remove('selectName');
    nowClickedDiv.children[1].classList.remove('selectBt');
    nowClickedDiv.children[2].classList.remove('selectBt');
  }
  el.children[0].classList.add('selectName');
  el.children[1].classList.add('selectBt');
  el.children[2].classList.add('selectBt');

  nowClickedDiv = el;
}
function dehighLightDiv() {
  if(nowClickedDiv) {
    nowClickedDiv.children[0].classList.remove('selectName');
    nowClickedDiv.children[1].classList.remove('selectBt');
    nowClickedDiv.children[2].classList.remove('selectBt');
  }
  nowClickedDiv = undefined;
}
function onExit() {
  --launchingCount
  
  if(launchingCount <= 0) {
    if(typeof onExitCallback == "function") {
      onExitCallback();
    }
  }
  dehighLightDiv()
}
function allLaunchGame(id, el, call) {
  nowPlayId = id;
  highLightDiv(el)
  launchingCount = 0;
  for (let i = 0; i < remotes.length; i++) {
    if(remotes[i].sendMsg(JSON.stringify({
      type : "launch",
      id : id,
      programPath : programPath
    }))) {
      ++launchingCount
    }
  }
  onExitCallback = call;
  
}
function allExitGame() {
  for (let i = 0; i < remotes.length; i++) {
    remotes[i].sendMsg(JSON.stringify({
      type : "terminate",
      id : nowPlayId,
      programPath : programPath
    }));
  }
  dehighLightDiv()
}

module.exports = {
  init : init,
  allLaunchGame : allLaunchGame,
  allExitGame : allExitGame,
}