
mongoose.connect('mongodb://aruggiero16:726915casa@ds025180.mlab.com:25180/prankusers')

var Entry = mongoose.model('photos', { name: String, file_id: String, vote: Number });

var token = "295281027:AAFYHVXFCAdJ5MNgIH-09-WVDKaNSujL-LU"

var bot = new Telegram(token, { polling: true })
log.debug("Server is up!");
console.log("Server is up!");

var myID = 67447150;

var doggo_ids = []

var votetable = {}

var uploadtable = []

var advicestable = []

var replyKeyboardMain = JSON.stringify({ "keyboard": [["/showdoggo"], ["/topdoggo"], ["/uploadDoggo"], ["/donate", "/advices"]] })

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


process.on("uncaughtException", function (err) {
  sendMessageToMe("Server Down!")
  sendMessageToMe(err)
})



bot.on("message", function (msg) {
  if (msg.text != "/cancel") {
    if (msg.text == "\u{01F44D}") {
      if (msg.chat.id in votetable) {//mi aspetto la votazione
        Entry.update({ file_id: votetable[msg.chat.id].doggo_id }, { $inc: { vote: 1 } }, function (err, affected) {
          //log.debug(err);
          //log.debug(affected);
          log.debug("vote increased");
          delete votetable[msg.chat.id]
          console.log(votetable)
          showdoggo(msg)
          sendMessageToMe("user " + msg.from.first_name + " increased vote to image " + votetable[msg.chat.id].doggo_id)
        })
      }
    } else if (msg.text == "\u{01F44E}") {
      if (msg.chat.id in votetable) {//mi aspetto la votazione
        Entry.update({ file_id: votetable[msg.chat.id].doggo_id }, { $inc: { vote: -1 } }, function (err, affected) {
          //log.debug(err);
          //log.debug(affected);
          log.debug("vote decreased");
          delete votetable[msg.chat.id]
          console.log(votetable)
          showdoggo(msg)
          sendMessageToMe("user " + msg.from.first_name + " decreased vote to image " + votetable[msg.chat.id].doggo_id)
        })
      }
    } else {
      if (advicestable.indexOf(msg.chat.id) != -1) {
        hits.info("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Wrote an hint:" + msg.text);
        console.log("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Wrote an hint:" + msg.text);
        delete advicestable[advicestable.indexOf(msg.chat.id)]
        sendMessageToMe("user " + msg.from.first_name + " sent a hint")
        bot.sendMessage(msg.chat.id, "Thank You!", {
          parse_mode: "Markdown",
          reply_markup: replyKeyboardMain
        })
      } else {
        log.debug("Message :" + JSON.stringify(msg));
        console.log("Message :" + JSON.stringify(msg));
      }
    }
  }
})

bot.onText(/\/start/, function (msg) {
  if(!isGroup(msg)){
  bot.sendMessage(msg.chat.id, "Welcome!", {
    parse_mode: "Markdown",
    reply_markup: replyKeyboardMain
  })
  sendMessageToMe("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Started Bot")
  log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Started Bot");
  }
})


bot.onText(/\/advices/, function (msg) {
  bot.sendMessage(msg.from.id, "Something wrong? or just an hint? Write here what you think about my job!", {
    parse_mode: "Markdown",
    reply_markup: JSON.stringify({ "keyboard": [["/cancel"]] })
  })
  advicestable.push(msg.from.id)
  console.log(advicestable);
  log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Want to write an hint");
})



bot.on("photo", function (msg) {
  log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Uploaded an image");
  console.log(uploadtable)
  if (uploadtable.indexOf(msg.from.id) != -1) {
    doggo_ids.push(new Photo(msg.from.first_name, msg.photo[msg.photo.length - 1].file_id))
    log.debug("file_id=" + msg.photo[msg.photo.length - 1].file_id);
    var doggo = new Entry({ name: msg.from.first_name, file_id: msg.photo[msg.photo.length - 1].file_id, vote: 0 });
    doggo.save().then(function (doc) {
      if (!doc) {
        log.debug("errore");
      } else {
        log.debug('meow');
        bot.sendPhoto(myID, msg.photo[msg.photo.length - 1].file_id, {
          caption: "From " + msg.from.id + " (" + msg.from.first_name + ")"
        })
      }
    });
    delete uploadtable[uploadtable.indexOf(msg.from.id)]
    console.log(uploadtable);
    bot.sendMessage(msg.from.id, "Saved!", {
      parse_mode: "Markdown",
      reply_markup: replyKeyboardMain
    })
  }
})

var isGroup = function (msg) {
  return msg.chat.type=="group"
}

var showdoggo = function (msg) {
  shuffle(doggo_ids)
  votetable[msg.from.id] = { doggo_id: doggo_ids[0].file_id }
  var replyKeyboard = JSON.stringify({ "keyboard": [["\u{1F44D}"], ["\u{1F44E}"], ["/another"], ["/mainMenu"]] })
  Entry.findOne({ file_id: votetable[msg.chat.id].doggo_id }).exec(function (err, doc) {
    //se sono in un gruppo, non invio mai la tastiera e neanche il voto
    if (isGroup(msg)) {
      bot.sendPhoto(msg.chat.id, doggo_ids[0].file_id).then(message => {
        console.log(message);
        sendMessageToMe("Group " + msg.chat.title + " Requested an image")
      })
    } else {
      bot.sendPhoto(msg.chat.id, doggo_ids[0].file_id, {
        caption: "Votes:" + doc.vote,
        parse_mode: "Markdown",
        reply_markup: replyKeyboard
      }).then(message => {
        console.log(message);
        sendMessageToMe("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Requested an image")
      })
    }
  })
}

bot.onText(/\/uploadDoggo/, function (msg, match) {
  if (!isGroup(msg)) {
    log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") want to upload an image");
    bot.sendMessage(msg.chat.id, "Send me an image of your doggo", {
      parse_mode: "Markdown",
      reply_markup: JSON.stringify({ "keyboard": [["/cancel"]] })
    })
    uploadtable.push(msg.chat.id)
    console.log(uploadtable);
  }
})


bot.onText(/\/cancel/, function (msg, match) {
  if (!isGroup(msg)) {
    if (uploadtable.indexOf(msg.chat.id) != -1) {
      delete uploadtable[uploadtable.indexOf(msg.chat.id)]
      console.log(uploadtable);
      bot.sendMessage(msg.chat.id, "Ok!", {
        parse_mode: "Markdown",
        reply_markup: replyKeyboardMain
      })
    } else if (advicestable.indexOf(msg.chat.id) != -1) {
      delete advicestable[advicestable.indexOf(msg.chat.id)]
      console.log(advicestable);
      bot.sendMessage(msg.chat.id, "Ok!", {
        parse_mode: "Markdown",
        reply_markup: replyKeyboardMain
      })
    }
  }
})

bot.onText(/\/showdoggo/, function (msg, match) {
  log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Requested an image");
  showdoggo(msg)
})

bot.onText(/\/another/, function (msg, match) {
  showdoggo(msg)
})

bot.onText(/\/mainMenu/, function (msg, match) {
  if (isGroup(msg)) {
    bot.sendMessage(msg.chat.id, "Back to Main Menu").then(message => {
      log.debug(message);
    })
  } else {
    bot.sendMessage(msg.chat.id, "Back to Main Menu", {
      parse_mode: "Markdown",
      reply_markup: replyKeyboardMain
    }).then(message => {
      log.debug(message);
    })
  }
})

bot.onText(/\/topdoggo/, function (msg, match) {
  sendMessageToMe("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Requested top image")
  log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Requested top image");
  Entry.findOne({}).sort("-vote").exec(function (err, value) {
    log.debug(value);
    bot.sendPhoto(msg.chat.id, value.file_id, { caption: "Top with " + value.vote + " votes" })
  })
})

bot.onText(/\/donate/, function (msg, match) {
  bot.sendMessage(msg.from.id, "Thank You! https://www.paypal.me/Ruggiero26/0.50")
})
