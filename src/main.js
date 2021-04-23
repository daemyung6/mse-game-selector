const config = require("../config/data.js")
console.log(config)


const connecter = require("./connecter.js");
connecter.init(config.remoteList, config.remotePort);