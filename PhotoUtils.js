
var shuffle = require('shuffle-array')

class PhotoUtils {
    constructor(bot, mongooseEntry,doggo_ids,doggoBot) {
        this.bot = bot
        this.Entry = mongooseEntry
        this.doggo_ids=doggo_ids
        this.doggoBot=doggoBot;
    }

    showDoggo(msg,votetable,chatid,firstname,isGroup) {
        console.log("showDoggo")
        shuffle(this.doggo_ids)
        if (!isGroup) {
            votetable[chatid] = { doggo_id: this.doggo_ids[0].file_id }
            var replyKeyboard = JSON.stringify({ "keyboard": [["\u{1F44D}"], ["\u{1F44E}"], ["/another"], ["/mainMenu"]] })
            this.Entry.findOne({ file_id: votetable[chatid].doggo_id }).exec(function (err, doc) {
                //se sono in un gruppo, non invio mai la tastiera e neanche il voto
                this.doggoBot._sendMessageToMe("User " + chatid+ " (" + firstname + ") Requested an image")
                /*this.bot.sendPhoto(chatid, this.doggo_ids[0].file_id, {
                    caption: "Votes:" + doc.vote,
                    parse_mode: "Markdown",
                    reply_markup: replyKeyboard
                }).then(message => {
                    console.log(message);
                    sendMessageToMe("User " + chatid+ " (" + firstname + ") Requested an image")
                })*/
            }.bind(this))
        } else {
            this.Entry.findOne({ file_id: this.doggo_ids[0].file_id }).exec(function (err, doc) {
                this.doggoBot._sendMessageToMe("Group " + msg.chat.title + " Requested an image")
                //se sono in un gruppo, non invio mai la tastiera e neanche il voto
             /*   this.bot.sendPhoto(chatid, this.doggo_ids[0].file_id).then(message => {
                    console.log(message);
                    sendMessageToMe("Group " + msg.chat.title + " Requested an image")
                })*/
            }.bind(this))
        }
    }

    topDoggo(msg,votetable,chatid,firstname,isGroup){
         sendMessageToMe("User " + msg.from.id + " (" + firstname + ") Requested top image")
         //log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Requested top image");
         this.Entry.findOne({}).sort("-vote").exec(function (err, value) {
         log.debug(value);
             this.bot.sendPhoto(chatid, value.file_id, { caption: "Top with " + value.vote + " votes" })
         }.bind(this))
    }
}

module.exports.Instance = function(bot,mongooseEntry,doggo_ids,doggoBot){
    return new PhotoUtils(bot,mongooseEntry,doggo_ids,doggoBot)
}