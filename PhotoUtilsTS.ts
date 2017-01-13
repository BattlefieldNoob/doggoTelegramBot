
import shuffle = require('shuffle-array')

class PhotoUtils {

    private constructor(private bot, private mongooseEntry, private doggo_ids, private doggoBot) {
    }

    showDoggo(msg, votetable, chatid, firstname, isGroup) {
        console.log("showDoggo")
        shuffle(this.doggo_ids)
        if (!isGroup) {
            votetable[chatid] = { doggo_id: this.doggo_ids[0].file_id }
            var replyKeyboard = JSON.stringify({ "keyboard": [["\u{1F44D}"], ["\u{1F44E}"], ["/another"], ["/mainMenu"]] })
            this.mongooseEntry.findOne({ file_id: votetable[chatid].doggo_id }).exec(function (err, doc) {
                //se sono in un gruppo, non invio mai la tastiera e neanche il voto
                this.doggoBot._sendMessageToMe("User " + chatid + " (" + firstname + ") Requested an image")
                this.bot.sendPhoto(chatid, this.doggo_ids[0].file_id, {
                    caption: "Votes:" + doc.vote,
                    parse_mode: "Markdown",
                    reply_markup: replyKeyboard
                }).then(message => {
                    console.log(message);
                })
            }.bind(this))
        } else {
            this.mongooseEntry.findOne({ file_id: this.doggo_ids[0].file_id }).exec(function (err, doc) {
                this.doggoBot._sendMessageToMe("Group " + msg.chat.title + " Requested an image")
                //se sono in un gruppo, non invio mai la tastiera e neanche il voto
                this.bot.sendPhoto(chatid, this.doggo_ids[0].file_id).then(message => {
                    console.log(message);
                })
            }.bind(this))
        }
    }

    topDoggo(msg, votetable, chatid, firstname, isGroup) {
        if (!isGroup)
            this.doggoBot._sendMessageToMe("User " + chatid + " (" + firstname + ") Requested top image")
        else
            this.doggoBot._sendMessageToMe("Group " + msg.chat.title + " Requested top image")
        //log.debug("User " + msg.from.id + " (" + msg.from.first_name + " " + msg.from.last_name + ") Requested top image");
        this.mongooseEntry.findOne({}).sort("-vote").exec(function (err, value) {
         //   this.bot.log.debug(value);
            this.bot.sendPhoto(chatid, value.file_id, { caption: "Top with " + value.vote + " votes" })
        }.bind(this))
    }

    static GetInstance(bot, mongooseEntry, doggo_ids, doggoBot) {
        return new PhotoUtils(bot, mongooseEntry, doggo_ids, doggoBot)
    }
}