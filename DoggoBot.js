'use strict'
let fs = require('fs');
let currentDateTime = new Date().toISOString();
let Log = require('log'), log = new Log('debug', fs.createWriteStream('log-' + currentDateTime + '.log')), hits = new Log('debug', fs.createWriteStream('hints-' + currentDateTime + '.log'));

var mongoose = require('mongoose');

mongoose.connect('mongodb://aruggiero16:726915casa@ds025180.mlab.com:25180/prankusers') //ok
//mongoose.connect('mongodb://aruggiero16:726915casa@ds036709.mlab.com:36709/unity_webgl_access') //test

var Entry = mongoose.model('photos', { name: String, file_id: String, vote: Number });

class Photo {
    constructor(name, file_id) {
        this.name = name
        this.file_id = file_id
    }
}

var doggo_ids=[]

class DoggoBot {
    constructor(botinstance) {
        this.myID = 67447150;
        this.votetable = {}
        this.uploadtable = []
        this.advicestable = []
        this.bot = botinstance
        this.photos = require("./PhotoUtils.js").Instance(botinstance, Entry, doggo_ids, this)
        this.text = require("./TextUtils.js").GetInstance(botinstance, this)
        this.replyKeyboardMain = JSON.stringify({ "keyboard": [["/showdoggo"], ["/topdoggo"], ["/uploadDoggo"], ["/donate", "/advices"]] })
        this.cancelKeyboard = JSON.stringify({ "keyboard": [["/cancel"]] })
        this.fnmap = {
            "text": {
                "/start": this._handleStartMessage,
                "/showdoggo": this._handleShowDoggo,
                "/another": this._handleShowDoggo,
                "/topdoggo": this._handleTopDoggo,
                "/mainMenu": this._handleMainMenu,
                "/advices": this._handleAdvices,
                "/donate": this._handleDonate,
                "/cancel": this._handleCancel,
                "/uploadDoggo": this._handleUploadDoggo,
                "\u{01F44D}": this._handleVoteUp,
                "\u{01F44E}": this._handleVoteDown,
                "": this._handleHintMessage
            },
            "photo": this._handleDoggoPhotoReceived
        }
        Entry.find({}, function (err, photos) {
            photos.forEach(function (elem) {
                doggo_ids.push(new Photo(elem.name, elem.file_id))
            })
        })

        log.debug("Server is up!");
        console.log("Server is up!");
    }

    handleRequest(msg) {
        console.log("//--------------------------HANDLE REQUEST--------------------------//")
        console.log(msg)
        var key = Object.keys(this.fnmap).find(key => key in msg)
        var data = this.fnmap[key]
        //console.log("key:"+key+" data:"+data)
        while (typeof data != 'function') {
            key = Object.keys(data).find(akey => akey == msg[key] || akey == "")
            data = data[key]
            //console.log("key:"+key+" data:"+data)
        }
        data.call(this, msg, msg.chat.id, msg.from.id, this._isGroup(msg))
    }

    _handleStartMessage(msg, chatid, fromid, isGroup) {
        console.log("Handle text:" + msg.text + " full message:" + msg)
        if (!isGroup) {
            this.text.message(chatid, isGroup, "Welcome!", this.replyKeyboardMain)
            this._sendMessageToMe("User " + chatid + " (" + msg.from.first_name + " " + msg.from.last_name + ") Started Bot")
            log.debug("User " + chatid + " (" + msg.from.first_name + " " + msg.from.last_name + ") Started Bot");
        }
    }

    _handleShowDoggo(msg, chatid, fromid, isGroup) {
        console.log("handleShowDoggo")
        this.photos.showDoggo(msg, this.votetable, chatid, msg.from.first_name, isGroup);
    }

    _handleTopDoggo(msg, chatid, fromid, isGroup) {
        console.log("handleTopDoggo")
        this.photos.topDoggo(msg, this.votetable, chatid, msg.from.first_name, isGroup);
    }

    _handleDonate(msg, chatid, fromid, isGroup) {
        this.text.message(chatid, true, "Thank You! https://www.paypal.me/Ruggiero26/0.50", null)
    }

    _handleMainMenu(msg, chatid, fromid, isGroup) {
        this.text.message(chatid, isGroup, "Back to Main Menu", this.replyKeyboardMain)
    }

    _handleAdvices(msg, chatid, fromid, isGroup) {
        if (!isGroup) {
            this.advicestable.push(fromid)
            this.text.message(fromid, isGroup, "Something wrong? or just an hint? Write here what you think about my job!", this.cancelKeyboard)
            console.log(this.advicestable)
            log.debug("User " + fromid + " (" + msg.from.first_name + ") Want to write an hint")
        }
    }

    _handleCancel(msg, chatid, fromid, isGroup) {
        if (!isGroup) {
            if (this.uploadtable.indexOf(chatid) != -1) {
                delete this.uploadtable[this.uploadtable.indexOf(chatid)]
                console.log(this.uploadtable);
            } else if (this.advicestable.indexOf(chatid) != -1) {
                delete this.advicestable[this.advicestable.indexOf(chatid)]
                console.log(this.advicestable);
            }
            this.text.message(chatid, isGroup, "OK!", this.replyKeyboardMain)
        }
    }

    _handleUploadDoggo(msg, chatid, fromid, isGroup) {
        if (!isGroup) {
            log.debug("User " + fromid + " (" + msg.from.first_name + ") want to upload an image");
            this.text.message(chatid, isGroup, "Send me an image of your doggo", this.cancelKeyboard)
            this.uploadtable.push(chatid)
            console.log(this.uploadtable);
        }
    }

    _handleDoggoPhotoReceived(msg, chatid, fromid, isGroup) {
        log.debug("User " + fromid + " (" + msg.from.first_name + ") Uploaded an image");
        console.log(this.uploadtable)
        if (this.uploadtable.indexOf(fromid) != -1) {
            doggo_ids.push(new Photo(msg.from.first_name, msg.photo[msg.photo.length - 1].file_id))
            log.debug("file_id=" + msg.photo[msg.photo.length - 1].file_id);
            var doggo = new Entry({ name: msg.from.first_name, file_id: msg.photo[msg.photo.length - 1].file_id, vote: 0 });
            doggo.save().then(function (doc) {
                if (!doc) {
                    log.debug("errore");
                } else {
                    log.debug('meow');
                    this.bot.sendPhoto(myID, msg.photo[msg.photo.length - 1].file_id, {
                        caption: "From " + fromid + " (" + msg.from.first_name + ")"
                    })
                }
            }.bind(this));
            delete this.uploadtable[this.uploadtable.indexOf(fromid)]
            console.log(this.uploadtable);
            this.text.message(fromid, isGroup, "Saved!", this.replyKeyboardMain)
        }
    }

    _handleVoteUp(msg, chatid, fromid, isGroup) {
        if (chatid in this.votetable) {//mi aspetto la votazione
            Entry.update({ file_id: this.votetable[chatid].doggo_id }, { $inc: { vote: 1 } }, function (err, affected) {
                log.debug("vote increased");
                delete this.votetable[chatid]
                console.log(this.votetable)
                this._handleShowDoggo(msg, chatid, fromid, isGroup)
                this._sendMessageToMe("user " + msg.from.first_name + " increased vote to image " + this.votetable[chatid].doggo_id)
            }.bind(this))
        }
    }

    _handleVoteDown(msg, chatid, fromid, isGroup) {
        if (chatid in this.votetable) {//mi aspetto la votazione
            Entry.update({ file_id: this.votetable[chatid].doggo_id }, { $inc: { vote: -1 } }, function (err, affected) {
                log.debug("vote decreased");
                delete this.votetable[chatid]
                console.log(this.votetable)
                this._handleShowDoggo(msg, chatid, fromid, isGroup)
                this._sendMessageToMe("user " + msg.from.first_name + " decreased vote to image " + this.votetable[chatid].doggo_id)
            }.bind(this))
        }
    }

    _handleHintMessage(msg, chatid, fromid, isGroup) {
        if (!isGroup) {
            if (this.advicestable.indexOf(fromid) != -1) {
                hits.info("User " + fromid + " (" + msg.from.first_name + ") Wrote an hint:" + msg.text);
                console.log("User " + fromid + " (" + msg.from.first_name + ") Wrote an hint:" + msg.text);
                delete this.advicestable[this.advicestable.indexOf(chatid)]
                this._sendMessageToMe("user " + msg.from.first_name + " sent a hint")
                this.text.message(fromid, isGroup, "Thank You!", this.replyKeyboardMain)
            } else {
                log.debug("Message :" + JSON.stringify(msg));
                console.log("Message :" + JSON.stringify(msg));
            }
        }
    }

    _isGroup(msg) {
        return msg.chat.type == "group"
    }

    _sendMessageToMe(message) {
        this.text.message(this.myID, true, "LOG MESSAGE:" + message, null)
    }
}

module.exports.GetInstance = function (bot) {
    return new DoggoBot(bot)
}