const WebSocket = require('ws');
const seatsElements = document.getElementById("seats");
const net = require('net');
const wol = require('wol')
const arp = require('node-arp');
const fs = require('fs');

const pcAllSelectBt = document.getElementById('pcAllSelectBt');
const pcAllUnSelectBt = document.getElementById('pcAllUnSelectBt');
const pcResetBt = document.getElementById('pcResetBt');
const pcTurnOnBt = document.getElementById('pcTurnOnBt');
const pcTurnOffBt = document.getElementById('pcTurnOffBt');
const selectedlist = document.getElementById('selectedlist');
const selectednum = document.getElementById('selectednum');

let remotes = [];
const config = require('../config/data.js');
const alertBox = require('./alertBox.js');
const remoteList = config.remoteList;
const remotePort = config.remotePort;
const programPath = config.programPath;


let configPath = "";
var dirList = __dirname.split('\\');
for (let i = 0; i < dirList.length - 1; i++) {
  configPath += dirList[i] + "/"
}
configPath += "config/"

let pcInfoList;

function getPcInfo(call) {
  fs.readFile(configPath + 'pcmaclist.json', function(err, file) {
    if(err) {
      console.log(err)
      fs.writeFile(configPath + 'pcmaclist.json', '[]', function(err) {
        if(err) { console.log(err) };
      })
      call([])
    }
    else {
      let json = JSON.parse(file);
      call(json)
    }
  })
}
let setPcInfoUpdate;
function setPcInfo(ip, mac) {
  function createEvent() {
    if(setPcInfoUpdate) {
      clearTimeout(setPcInfoUpdate)
    }
    setPcInfoUpdate = setTimeout(function() {
      updatePcInfo(pcInfoList)
      setPcInfoUpdate = undefined;
    }, 1000 * 10)
  }

  for (let i = 0; i < pcInfoList.length; i++) {
    if(pcInfoList[i].ip == ip) {
      if(pcInfoList[i].mac == mac) {
        return;
      }
      else {
        pcInfoList[i].mac = mac;
        createEvent()
        return;
      }
    }
  }
  pcInfoList.push({
    ip : ip,
    mac : mac,
  })
  createEvent()
  return;
}

function updatePcInfo(json) {
  fs.writeFile(configPath + 'pcmaclist.json', JSON.stringify(json), function(err) {
    if(err) { console.log(err); return; }
    console.log('pc mac list local save', pcInfoList);
  })
}


let launchingCount = 0;


function updateSelectedUI() {
  let str = ""
  let counter = 0;
  for(let i = 0; i < remotes.length; i++) {
    if(remotes[i].getIsClick()) {
      ++counter

      if(counter < 14) {
        if(i + 1 < 10) {
          str += `0${i + 1},`
        }
        else {
          str += `${i + 1},`
        }
      }
      if(counter == 14) {
        str += ' ...'
      }
    }
  }
  console.log(str.length)
  if(str.length == 0) {
    str = "&#65279;";
  }
  selectedlist.innerHTML = str;
  selectednum.innerText = `총 ${counter}대`;
}

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
    updateSelectedUI()
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
  function setNormal() {
    el.classList.remove('disconnect')
    el.classList.remove('connect')
  }
  let isConnect = false;
  function onDisconnect() {
    if(!isOnline) {return}
    el.children[1].innerText = "미연결";
    isConnect = false;
    setError()
    ws.close()
    ws = null;
    setTimeout(function() {
      if(!isOnline) { return }
      init()
    }, 2000)
  }

  let sendMsgfunc;
  this.sendMsg = function(msg) {
    if(typeof sendMsgfunc == "function") {
      return sendMsgfunc(msg)
    }
  }

  function init() {
    ws = new WebSocket(`ws://${ip}:${port}`);
    el.children[1].innerText = "연결중";

    let isOpened = false;
    

    ws.on('open', function() {
      el.children[1].innerText = "연결";
      updateMac()
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
  

  let isOnline = false;
  function updateMac() {
    arp.getMAC(ip, function(err, mac) {
      if (err && (config.localip != ip)) {
        el.children[1].innerText = "off";
        isOnline = false;
        return;
      }
      if(config.localip != ip) {
        setPcInfo(ip, mac);
      }
      isOnline = true;
      init()
    });
  }
  updateMac()

  function sendTcpMsg(msg, call) {
    var client = new net.Socket();
    client.setEncoding('utf8');
    let isConnect = false;
    setTimeout(function() {
      if(!isConnect) {
        client.destroy();
        call(null, false);
      }
    }, 3000)

    client.connect(config.pcRemotePort, ip, function() {
      isConnect = true;
      client.write(msg);
    });
    client.on('data', function(data) {
      call(client, data)
    })
    client.on('error', function(data) {

    })
  }
  this.turnOn = function() {
    if(isOnline) { return; };
    for (let i = 0; i < pcInfoList.length; i++) {
      if(pcInfoList[i].ip == ip) {
        wol.wake(pcInfoList[i].mac, function(err, res) {
          if(err) {
            alertBox.show(`${ip} pc의 mac address가 유효하지 않습니다.`)
            return;
          }
        });
        setNormal();
        el.children[1].innerText = "pc 시작중";
        setTimeout(function() {
          updateMac()
        }, 1000 * 10)
        return;
      }
    }
    alertBox.show(`${ip} pc의\nmac address값이 없습니다.`);
  }
  this.turnOff = function() {
    console.log(!isOnline)
    if(!isOnline) { return; } ;
    sendTcpMsg('turnoff', function(client, data) {
      console.log(client, data)
      if(data == false) {
        setError()
        el.children[1].innerText = "통신 err";
        isOnline = false;
        return;
      };
      if(data == 'turnoff') {
        client.destroy();
        isOnline = false;
        el.children[1].innerText = "off";
        if(ws.close) { ws.close() }
        ws = null;

        setNormal();
      }
    })
  }
  this.turnReset = function() {
    console.log(!isOnline)
    if(!isOnline) { return; } ;
    sendTcpMsg('restart', function(client, data) {
      if(data == false) {
        setError()
        el.children[1].innerText = "통신 err";
        isOnline = false;
        return;
      };
      if(data == 'restart') {
        client.destroy();
        isOnline = false;
        if(ws.close) { ws.close() }
        ws = null;
        el.children[1].innerText = "재시작";
        setNormal();
        setTimeout(function() {
          updateMac()
        }, 1000 * 10)
      }
    })
  }
}


function init() {
  remotes = [];
  console.log('pc mac list', pcInfoList)
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
      updateSelectedUI()
    }
    pcAllUnSelectBt.onclick = function() {
      for (let i = 0; i < remotes.length; i++) {
        remotes[i].setIsClick(false);
      }
      updateSelectedUI()
    }
  }


  pcResetBt.onclick = function() {
    console.log(remotes)
    for (let i = 0; i < remotes.length; i++) {
      console.log(remotes[i].getIsClick())
      if(remotes[i].getIsClick()) {
        remotes[i].turnReset();
      }
    }
  }
  pcTurnOnBt.onclick = function() {
    for (let i = 0; i < remotes.length; i++) {
      if(remotes[i].getIsClick()) {
        remotes[i].turnOn();
      }
    }
  }
  pcTurnOffBt.onclick = function() {
    for (let i = 0; i < remotes.length; i++) {
      if(remotes[i].getIsClick()) {
        remotes[i].turnOff();
      }
    }
  }
}
getPcInfo(function(list) {
  pcInfoList = list;
  init()
})


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