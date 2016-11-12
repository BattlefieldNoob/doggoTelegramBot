'use strict'
var shuffle = require('shuffle-array')

var Telegram = require("node-telegram-bot-api")
var mongoose = require('mongoose');

mongoose.connect('mongodb://aruggiero16:726915casa@ds025180.mlab.com:25180/prankusers')

var Entry = mongoose.model('photos', { name: String, file_id: String, vote: Number });

var token = "295281027:AAFYHVXFCAdJ5MNgIH-09-WVDKaNSujL-LU"
//var token = "267638518:AAF2JK50cplpczO189GIiir63NaC20MBrMs"
var bot = new Telegram(token, { polling: true })

var myID = 67447150;

var doggo_ids = []

class Photo {
  constructor(name, file_id) {
    this.name = name
    this.file_id = file_id
  }
}

var sendMessageToMe = function (message) {
  bot.sendMessage(myID, "LOG MESSAGE:" + message)
}

Entry.find({}, function (err, photos) {
  photos.forEach(function (elem) {
    doggo_ids.push(new Photo(elem.name, elem.file_id))
  })
})

var botClass=require("./DoggoBot.js").GetInstance(bot,Entry,doggo_ids)

process.on("uncaughtException", function (err) {
  sendMessageToMe("Server Down!")
  sendMessageToMe(err)
})

bot.on("message", function (msg) {
  botClass.handleRequest(msg);
})

