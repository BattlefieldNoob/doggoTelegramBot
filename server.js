'use strict'
var shuffle = require('shuffle-array')

var Telegram = require("node-telegram-bot-api")

var token = "295281027:AAFYHVXFCAdJ5MNgIH-09-WVDKaNSujL-LU" //token ok
//var token = "267638518:AAF2JK50cplpczO189GIiir63NaC20MBrMs" //token test
var bot = new Telegram(token, { polling: true })

var myID = 67447150;

var sendMessageToMe = function (message) {
  bot.sendMessage(myID, "LOG MESSAGE:" + message)
}

var botClass=require("./DoggoBot.js").GetInstance(bot)

process.on("uncaughtException", function (err) {
  sendMessageToMe("Server Down!")
  sendMessageToMe(err)
})

bot.on("message", function (msg) {
  botClass.handleRequest(msg);
})

