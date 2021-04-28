const gameListSaveBt = document.getElementById('gameListSaveBt');
const gameListLoadBt = document.getElementById('gameListLoadBt');
const savePage = document.getElementById('savePage');
const listDiv = savePage.getElementsByClassName('list')[0];
const saveNameInput = document.getElementById('saveNameInput');
const savePageCloseBt = document.getElementById('savePageCloseBt');
const saveDateDiv = document.getElementById('saveDate');
const saveBt = document.getElementById('saveBt');

const saveListPage = document.getElementById('saveListPage');
const loadBt = document.getElementById('loadBt');
const saveListPageCloseBt = document.getElementById('saveListPageCloseBt');
const savePageLoadBt = document.getElementById('savePageLoadBt');
const saveListDiv = saveListPage.getElementsByClassName("list")[0];



const fs = require('fs');
let savePath = "";
let dirList = __dirname.split('\\');
for (let i = 0; i < dirList.length - 1; i++) {
  savePath += dirList[i] + "/"
}
savePath += "save/"
const alertBox = require('./alertBox.js');

let getRunList;
const gameList = require('../config/data.js').gameList;
let updateRunlist;
let nowList;
let nowFileName;

saveNameInput.onchange = function() {
  nowFileName = this.value;
}

function openSavePage(list) {
  if(list.length == 0) { alertBox.show('리스트가 없습니다.'); return; }
  console.log(list)
  nowList = list;
  let nowDate = new Date();
  var tempStr = `게임 리스트 ${nowDate.getFullYear()}`
  tempStr += nowDate.getMonth() + 1 < 10 ? `0${nowDate.getMonth() + 1}` : nowDate.getMonth() + 1;
  tempStr += nowDate.getDate() < 10 ? `0${nowDate.getDate()}` : nowDate.getDate();
  saveNameInput.value = nowFileName = tempStr;
  saveNameInput.focus();

  var tempStr = `${nowDate.getFullYear()}년 `
  tempStr += nowDate.getMonth() + 1 < 10 ? `0${nowDate.getMonth() + 1}` : nowDate.getMonth() + 1;
  tempStr += `월 `
  tempStr += nowDate.getDate() < 10 ? `0${nowDate.getDate()}` : nowDate.getDate();
  tempStr += `일, `
  tempStr += nowDate.getHours() < 10 ? `0${nowDate.getHours()}` : nowDate.getHours();
  tempStr += `시 `
  tempStr += nowDate.getMinutes() < 10 ? `0${nowDate.getMinutes()}` : nowDate.getMinutes();
  tempStr += `분`

  saveDateDiv.innerText = tempStr

  listDiv.innerHTML = null;
  for (let i = 0; i < list.length; i++) {
    let div = document.createElement('div');
    div.innerText = gameList[list[i]].title;
    listDiv.appendChild(div);
  }
  saveListPage.classList.remove('popUp');
  savePage.classList.add('popUp');
}
function closePage() {
  savePage.classList.remove('popUp');
  saveListPage.classList.remove('popUp');
}
savePageCloseBt.onclick = closePage;
saveListPageCloseBt.onclick = closePage;
gameListSaveBt.onclick = function() {
  openSavePage(getRunList())
}


function saveFile() {
  fs.readdir(
    `${savePath}`,
    function(err, list) {
      if(err) {
        alertBox.show(`저장경로에 문제가 발생했습니다.`);
        closePage()
        return;
      }
      if(list.indexOf(nowFileName + '.json') != -1) {
        if(!confirm('동일한 이름의 파일이 이미 존재합니다.\n덮어씌우시겠습니까?', "123123")) {
          alertBox.show('파일 저장에 실패 했습니다.');
          closePage()
          return;
        }
      }
      fs.writeFile(
        `${savePath}${nowFileName}.json`,
        JSON.stringify(nowList),
        function(err) {
          if(err) {
            alertBox.show('파일 저장에 실패 했습니다.');
            closePage()
          }
          alertBox.show('파일 저장에 성공 했습니다.');
          closePage()
        }
      )
    }
  )
}
saveBt.onclick = saveFile;


function openSaveListPage() {
  let fileInfoList = [];

  fs.readdir(savePath, function(err, list) {
    if(err) {
      alertBox.show('저장경로에 문제가 발생했습니다.');
      return;
    }
    console.log(list);
    for (let i = 0; i < list.length; i++) {
      const id = i;
      fs.stat(savePath + list[i], function(err, info) {
        fileInfoList.push({
          name : list[i],
          info : info
        })
        setTimeout(function() {
          if(id == list.length - 1) {
            console.log(fileInfoList)
            view()
            saveListPage.classList.add("popUp");
            savePage.classList.remove("popUp");
          }
        }, 0)
      })
    }
    if(list.length == 0) {
      view()
      saveListPage.classList.add("popUp");
      savePage.classList.remove("popUp");
    }
  })
  function view() {
    saveListDiv.innerHTML = null;

    let lastClick;
    let lastClickID = undefined;
    
    
    for (let i = 0; i < fileInfoList.length; i++) {
      let div = document.createElement('div');
      const id = i;
      let name = fileInfoList[i].name;
      let time = fileInfoList[i].info.mtime;

      var tempStr = "";
      tempStr += `${time.getFullYear()}년 `
      tempStr += time.getMonth() + 1 < 10 ? `0${time.getMonth() + 1}` : time.getMonth();
      tempStr += "월 ";
      tempStr += time.getDate() < 10 ? `0${time.getDate()}` : time.getDate();
      tempStr += "일, ";
      tempStr += time.getHours() < 10 ? `0${time.getHours()}` : time.getHours();
      tempStr += "일 ";
      tempStr += time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
      tempStr += "분";

      div.innerHTML = /*html*/ `
        <div>
            <input type="checkbox"> ${name.substr(0, name.length - 5)}
        </div>
        <div>
            ${tempStr}
        </div>
        <div>
            <div class="bt">삭제</div>
        </div>
      `
      function check() {
        if(lastClick) {
          lastClick.children[0].children[0].checked = false;
        }
        div.children[0].children[0].checked = true;
        lastClick = div;
        lastClickID = id;
      }
      div.children[0].onclick = check;
      div.children[1].onclick = check;
      div.children[2].onclick = function() {
        if(confirm(`선택한 파일을 삭제 하시겠습니까?\n"${name}"`)) {
          fs.unlink(savePath + name, function(err) {
            if(err) {
              alertBox.show('파일 삭제에 실패했습니다.');
              return
            }
            alertBox.show('파일 삭제에 성공했습니다.');
            fileInfoList.splice(id, 1);
            view()

          })
          
        }
      }
      saveListDiv.appendChild(div)

    }
    loadBt.onclick = function() {
      if(lastClickID == undefined) {
        return;
      }
      const name = fileInfoList[lastClickID].name;
      fs.readFile(savePath + name, function(err, file) {
        if(err) {
          alertBox.show("파일 로드에 실패 했습니다.");
          view()
          return
        }
        const json = JSON.parse(file);
        updateRunlist(json);
        closePage()
      })
    }
    
  }
  
}
gameListLoadBt.onclick = openSaveListPage;
savePageLoadBt.onclick = openSaveListPage;


function init(gamelist) {
  getRunList = gamelist.getRunList;
  updateRunlist = gamelist.updateRunlist
}
module.exports = {
  init : init,
  
}