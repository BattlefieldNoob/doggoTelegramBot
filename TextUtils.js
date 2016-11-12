
class TextUtils {

    constructor(bot) {
        this.bot = bot;
    }

    message(chatid, dontUseCustomKeyboard, message, customkeybord) {
        this.bot.sendMessage(chatid, message, !dontUseCustomKeyboard ? {
            parse_mode: "Markdown",
            reply_markup: customkeybord
        } : {}).then(message => {
            console.log(message);
        })
    }
}

module.exports.GetInstance = function (bot) {
    return new TextUtils(bot)
}