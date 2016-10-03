//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//

'use strict'
var shuffle = require('shuffle-array')

var Telegram = require("node-telegram-bot-api")
var mongoose = require('mongoose');
var fs = require('fs');
var Log = require('log'), log = new Log('debug', fs.createWriteStream('my.log'));
mongoose.connect('mongodb://aruggiero16:726915casa@ds025180.mlab.com:25180/prankusers')

var Entry = mongoose.model('photos', { name: String, file_id: String, vote: Number });

var token = "295281027:AAFYHVXFCAdJ5MNgIH-09-WVDKaNSujL-LU"

var bot = new Telegram(token, { polling: true })
log.debug("Server is up!");


var doggo_ids = []

var votetable = {}

var uploadtable = []

var replyKeyboardMain = JSON.stringify({ "keyboard": [["/showdoggo"], ["/topdoggo"], ["/uploadDoggo"], ["/donate"]] })

class Photo {
  constructor(name, file_id) {
    this.name = name
    this.file_id = file_id
  }
}

Entry.find({}, function (err, photos) {
  photos.forEach(function (elem) {
    doggo_ids.push(new Photo(elem.name, elem.file_id))
  })
})

bot.on("message", function (msg) {
  log.debug(msg);
  if (msg.text == "\u{01F44D}") {
    if (msg.chat.id in votetable) {//mi aspetto la votazione
      Entry.update({ file_id: votetable[msg.chat.id].doggo_id }, { $inc: { vote: 1 } }, function (err, affected) {
        //log.debug(err);
        //log.debug(affected);
        log.debug("vote increased");
        delete votetable[msg.chat.id]
        log.debug(votetable)
        showdoggo(msg)
      })
    }
  } else if (msg.text == "\u{01F44E}") {
    if (msg.chat.id in votetable) {//mi aspetto la votazione
      Entry.update({ file_id: votetable[msg.chat.id].doggo_id }, { $inc: { vote: -1 } }, function (err, affected) {
        //log.debug(err);
        //log.debug(affected);
        log.debug("vote decreased");
        delete votetable[msg.chat.id]
        log.debug(votetable)
        showdoggo(msg)
      })
    }
  }
})

bot.onText(/\/start/, function (msg) {
  bot.sendMessage(msg.chat.id, "Welcome!", {
    parse_mode: "Markdown",
    reply_markup: replyKeyboardMain
  }).then(msg => {
    log.debug(msg);
  })
  log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.form.last_name + ") Started Bot");
})



bot.on("photo", function (msg) {
  log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.form.last_name + ") Uploaded an image");
  log.debug(uploadtable)
  if (uploadtable.indexOf(msg.chat.id) != -1) {
    doggo_ids.push(new Photo(msg.from.first_name, msg.photo[msg.photo.length - 1].file_id))
    log.debug("file_id="+msg.photo[msg.photo.length - 1].file_id);
    var doggo = new Entry({ name: msg.from.first_name, file_id: msg.photo[msg.photo.length - 1].file_id, vote: 0 });
    doggo.save().then(function (doc) {
      if (!doc) {
        log.debug("errore");
      } else {
        log.debug('meow');
      }
    });
    delete uploadtable[uploadtable.indexOf(msg.chat.id)]
    log.debug(uploadtable);
    bot.sendMessage(msg.chat.id, "Saved!", {
      parse_mode: "Markdown",
      reply_markup: replyKeyboardMain
    })
  }
})

var showdoggo = function (msg) {
  shuffle(doggo_ids)
  votetable[msg.chat.id] = { doggo_id: doggo_ids[0].file_id }
  var replyKeyboard = JSON.stringify({ "keyboard": [["\u{1F44D}"], ["\u{1F44E}"], ["/another"], ["/mainMenu"]] })
  bot.sendPhoto(msg.chat.id, doggo_ids[0].file_id, {
    parse_mode: "Markdown",
    reply_markup: replyKeyboard
  }).then(message => {
    log.debug(message);
  })
}

bot.onText(/\/uploadDoggo/, function (msg, match) {
  log.debug("User " + message.from.id + " (" + message.from.first_name + " " + message.form.last_name + ") want to upload an image");
  bot.sendMessage(msg.chat.id, "Send me an image of your doggo", {
    parse_mode: "Markdown",
    reply_markup: JSON.stringify({ "keyboard": [["/cancel"]] })
  })
  uploadtable.push(msg.chat.id)
  log.debug(uploadtable);
})


bot.onText(/\/cancel/, function (msg, match) {
  if (uploadtable.indexOf(msg.chat.id) != -1) {
    delete uploadtable[uploadtable.indexOf(msg.chat.id)]
    log.debug(uploadtable);
    bot.sendMessage(msg.chat.id, "Ok!", {
      parse_mode: "Markdown",
      reply_markup: replyKeyboardMain
    })
  }
})

bot.onText(/\/showdoggo/, function (msg, match) {
  log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.form.last_name + ") Requested an image");
  showdoggo(msg)
})

bot.onText(/\\u{01F44D}/, function (msg, match) {
  if (msg.chat.id in votetable) {//mi aspetto la votazione
    Entry.update({ file_id: votetable[msg.chat.id].doggo_id }, { $inc: { vote: 1 } }, function (err, affected) {
      //log.debug(err);
      //log.debug(affected);
      log.debug("vote increased");
      delete votetable[msg.chat.id]
      log.debug(votetable)
      showdoggo(msg)
    })
  }
})

bot.onText(/\/thumbDown/, function (msg, match) {
  if (msg.chat.id in votetable) {//mi aspetto la votazione
    Entry.update({ file_id: votetable[msg.chat.id].doggo_id }, { $inc: { vote: -1 } }, function (err, affected) {
      //log.debug(err);
      //log.debug(affected);
      log.debug("vote decreased");
      delete votetable[msg.chat.id]
      log.debug(votetable)
      showdoggo(msg)
    })
  }
})

bot.onText(/\/another/, function (msg, match) {
  showdoggo(msg)
})

bot.onText(/\/mainMenu/, function (msg, match) {
  bot.sendMessage(msg.chat.id, "Back to Main Menu", {
    parse_mode: "Markdown",
    reply_markup: replyKeyboardMain
  }).then(message => {
    log.debug(message);
  })
})

bot.onText(/\/topdoggo/, function (msg, match) {
  log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.form.last_name + ") Requested top image");
  Entry.findOne({}).sort("-vote").exec(function (err, value) {
    log.debug(value);
    bot.sendPhoto(msg.chat.id, value.file_id).then(message => {
      log.debug(message);
    })
  })
})

bot.onText(/\/donate/, function (msg, match) {
  bot.sendMessage(msg.chat.id, "Thank You! https://www.paypal.me/Ruggiero26/0.50")
})
