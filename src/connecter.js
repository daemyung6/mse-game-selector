const WebSocket = require('ws');
const seatsElements = document.getElementById("seats");
let remotes = [];

function remote(ip, port, el) {
    let ws;
    this.ws = ws;
    function init() {
        ws = new WebSocket(`ws://${ip}:${port}`);

        ws.on('open', function() {

        });
        ws.on('error', function() {
            ws.close()
        });
        ws.on('message', function() {
            
        });
    }
    init()


    
    
}


function init(remoteList, remotePort) {
    remotes = [];
    for (let i = 0; i < remoteList.length; i++) {  
        let el = seatsElements
            .getElementsByClassName('seat')[remoteList[i].y - 1]
            .getElementsByClassName('zone')[remoteList[i].x - 1]

        el.setAttribute('class', 'zone chair');

        var div = document.createElement('div');
        div.innerText = i + 1 < 10 ? `0${i + 1}` : i + 1;
        el.appendChild(div)

        var div = document.createElement('div');
        div.innerText = remoteList[i].ip;
        el.appendChild(div)

        remotes.push(new remote(remoteList[i].ip, remotePort, el));
    }

}


module.exports = {
    init : init
}