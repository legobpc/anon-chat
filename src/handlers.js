/**
 * Registers Telegram bot commands (/start, /stop, /next, /about)
 * @param {TelegramBot} bot - The Telegram bot instance
 * @param {object} logic - Chat logic module
 */
function setupCommands(bot, logic) {
    bot.onText(/\/start/, (msg) => {
        const userId = msg.chat.id;

        // If already in chat, notify and exit
        if (logic.isInChat(userId)) {
            bot.sendMessage(userId, '⚠️ Ви вже в чаті. Натисніть "Вийти", щоб завершити поточну розмову.');
            return;
        }

        // If user hasn't accepted terms — send them first
        if (!logic.hasAcceptedTerms(userId)) {
            bot.sendMessage(userId, `⚠️ Використовуючи цього бота, ви погоджуєтесь з правилами:\n
    • Заборонено ображати інших учасників
    • Заборонено надсилати незаконний або неприйнятний контент
    • Адміністрація не несе відповідальність за повідомлення користувачів
    • Ви використовуєте бот добровільно та анонімно
    
    ▶️ Натиснувши «Почати», ви автоматично погоджуєтесь з цими правилами.`);
        }

        // Show main menu and connect to partner
        logic.showMainMenu(bot, userId);
        logic.disconnect(bot, userId, false);
    });

    bot.onText(/\/stop/, (msg) => {
        const userId = msg.chat.id;
        logic.disconnect(bot, userId);
        bot.sendMessage(userId, '✅ Ви покинули чат. Напишіть /start, щоб знайти нового співрозмовника.');
        logic.showMainMenu(bot, userId);
    });

    bot.onText(/\/next/, (msg) => {
        const userId = msg.chat.id;
        logic.disconnect(bot, userId);
        logic.findPartner(bot, userId);
    });

    bot.onText(/\/about (.+)/, (msg, match) => {
        const userId = msg.chat.id;
        const aboutText = match[1].trim();

        if (aboutText.length > 250) {
            bot.sendMessage(userId, '❗ Будь ласка, вкажіть коротку інформацію (до 250 символів).');
            return;
        }

        logic.setProfile(userId, aboutText);
        bot.sendMessage(userId, '✅ Ваш опис збережено! Його буде надіслано співрозмовнику при зʼєднанні.');
    });
}

/**
 * Handles inline button interactions (callback queries)
 * @param {TelegramBot} bot - The Telegram bot instance
 * @param {object} logic - Chat logic module
 */
function setupCallbacks(bot, logic) {
    bot.on('callback_query', (query) => {
        const userId = query.from.id;

        if (query.data === 'stop') {
            logic.disconnect(bot, userId);
            bot.sendMessage(userId, '✅ Ви покинули чат.');
            logic.showMainMenu(bot, userId);
        }

        if (query.data === 'next') {
            logic.disconnect(bot, userId);
            logic.findPartner(bot, userId);
        }

        bot.answerCallbackQuery(query.id);
    });
}

/**
 * Handles all user messages, including forwarded messages and button text
 * @param {TelegramBot} bot - The Telegram bot instance
 * @param {object} logic - Chat logic module
 */
function setupMessages(bot, logic) {
    bot.on('message', (msg) => {
        const userId = msg.chat.id;

        // Custom keyboard actions
        if (msg.text === '▶️ Почати') {
            if (!logic.hasAcceptedTerms(userId)) {
                logic.acceptTerms(userId);
            }

            logic.disconnect(bot, userId, false);
            logic.findPartner(bot, userId);
            return;
        }

        if (msg.text === '⏹ Зупинити') {
            logic.disconnect(bot, userId);
            bot.sendMessage(userId, '✅ Ви покинули чат.');
            logic.showMainMenu(bot, userId);
            return;
        }

        if (msg.text === '👤 Мій профіль') {
            const profile = logic.getProfile(userId);
            if (profile) {
                bot.sendMessage(userId, `👤 Ваш профіль:\n${profile}`);
            } else {
                bot.sendMessage(userId, 'ℹ️ У вас поки що немає профілю. Напишіть його за допомогою команди:\n/about Я люблю кіно');
            }
            return;
        }

        // Forward message to partner if in chat
        const partnerId = logic.getPartner(userId);
        if (!partnerId || msg.text?.startsWith('/')) return;

        if (msg.text) {
            bot.sendMessage(partnerId, msg.text);
        } else if (msg.photo) {
            const photo = msg.photo[msg.photo.length - 1].file_id;
            bot.sendPhoto(partnerId, photo, { caption: msg.caption || '' });
        } else if (msg.sticker) {
            bot.sendSticker(partnerId, msg.sticker.file_id);
        } else if (msg.voice) {
            bot.sendVoice(partnerId, msg.voice.file_id);
        }
    });
}

module.exports = {
    setupCommands,
    setupCallbacks,
    setupMessages
};