class TextUtils {   

    private constructor(private bot) {
    }

    message(chatid:number, dontUseCustomKeyboard:Boolean, message:String, customkeybord:String) {
        this.bot.sendMessage(chatid, message, !dontUseCustomKeyboard ? {
            parse_mode: "Markdown",
            reply_markup: customkeybord
        } : {}).then(message => {
            console.log(message);
        })
    }

    static GetInstance(bot){
        return new TextUtils(bot)
    }
}