// Queue of users waiting to be matched
const queue = [];

// Active chat pairs: userId => partnerId
const pairs = {};

// Stores user descriptions
const profiles = {};

/**
 * Tracks which users accepted the terms
 * @type {Object<number, boolean>}
 */
const acceptedTerms = {};

/**
 * Marks that the user has accepted the terms
 * @param {number} userId
 */
function acceptTerms(userId) {
    acceptedTerms[userId] = true;
}

/**
 * Checks if user already accepted the terms
 * @param {number} userId
 * @returns {boolean}
 */
function hasAcceptedTerms(userId) {
    return !!acceptedTerms[userId];
}

/**
 * Saves a user profile description
 * @param {number} userId - Telegram user ID
 * @param {string} text - User's profile description
 */
function setProfile(userId, text) {
    profiles[userId] = text;
}

/**
 * Gets a user profile description
 * @param {number} userId - Telegram user ID
 * @returns {string|null} - User's profile or null if not set
 */
function getProfile(userId) {
    return profiles[userId] || null;
}

/**
 * Checks if the user is currently in an active chat.
 * @param {number} userId - Telegram user ID
 * @returns {boolean} - True if user is in a chat
 */
function isInChat(userId) {
    return !!pairs[userId];
}

/**
 * Returns the partner ID of the given user.
 * @param {number} userId - Telegram user ID
 * @returns {number | undefined} - Partner's user ID if exists
 */
function getPartner(userId) {
    return pairs[userId];
}

/**
 * Attempts to find a chat partner for the given user.
 * 
 * If there is already a user waiting in the queue, pairs them with the current user,
 * sends both users each other's profile (if available), notifies them of the match,
 * and shows chat control buttons.
 * 
 * If the queue is empty, the user is added to it and asked to wait.
 * 
 * @param {TelegramBot} bot - The Telegram bot instance
 * @param {number} userId - Telegram user ID of the current user
 */
function findPartner(bot, userId) {
    if (queue.length > 0) {
        // Take the first user from the queue and pair them with the current user
        const partnerId = queue.shift();
        pairs[userId] = partnerId;
        pairs[partnerId] = userId;

        // Exchange profiles (if available)
        const userProfile = getProfile(userId);
        const partnerProfile = getProfile(partnerId);

        if (userProfile) {
            bot.sendMessage(partnerId, `👤 Профіль співрозмовника:\n${userProfile}`);
        }
        if (partnerProfile) {
            bot.sendMessage(userId, `👤 Профіль співрозмовника:\n${partnerProfile}`);
        }

        // Notify both users about the connection
        sendBoth(bot, userId, partnerId, '🔗 Ви підключені! Починайте спілкування:');

        // Show inline control buttons
        showChatActions(bot, userId);
        showChatActions(bot, partnerId);
    } else {
        // No available partner: add user to the waiting queue
        queue.push(userId);
        bot.sendMessage(userId, '⏳ Шукаємо вам співрозмовника, будь ласка, зачекайте...');
    }
}

/**
 * Disconnects a user from the current chat or removes them from the queue.
 * Optionally notifies the partner if exists.
 * @param {TelegramBot} bot - The Telegram bot instance
 * @param {number} userId - Telegram user ID
 * @param {boolean} notify - Whether to notify the partner (default: true)
 */
function disconnect(bot, userId, notify = true) {
    const partnerId = pairs[userId];

    if (partnerId) {
        // Remove both users from pairs
        delete pairs[userId];
        delete pairs[partnerId];

        if (notify) {
            bot.sendMessage(partnerId, '🚫 Ваш співрозмовник покинув чат.');
            showChatActions(bot, partnerId);
        }
    }

    // If user was in the queue, remove them
    const index = queue.indexOf(userId);
    if (index !== -1) queue.splice(index, 1);
}

/**
 * Sends a message to both users in a pair.
 * @param {TelegramBot} bot - The Telegram bot instance
 * @param {number} userA - First user's Telegram ID
 * @param {number} userB - Second user's Telegram ID
 * @param {string} text - The message text
 */
function sendBoth(bot, userA, userB, text) {
    bot.sendMessage(userA, text);
    bot.sendMessage(userB, text);
}

/**
 * Shows inline chat control buttons to the user.
 * @param {TelegramBot} bot - The Telegram bot instance
 * @param {number} userId - Telegram user ID
 */
function showChatActions(bot, userId) {
    // bot.sendMessage(userId, 'Що бажаєте зробити?', {
    //     reply_markup: {
    //         inline_keyboard: [
    //             [{ text: '🔁 Наступний', callback_data: 'next' }],
    //             [{ text: '🚫 Вийти', callback_data: 'stop' }]
    //         ]
    //     }
    // });
}

/**
 * Shows the main keyboard menu
 * @param {TelegramBot} bot - The Telegram bot instance
 * @param {number} userId - Telegram user ID
 */
function showMainMenu(bot, userId) {
    bot.sendMessage(userId, 'Меню ⬇️', {
        reply_markup: {
            keyboard: [
                ['▶️ Почати', '⏹ Зупинити'],
                ['👤 Мій профіль']
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    });
}

// Exporting the core chat logic
module.exports = {
    isInChat,
    getPartner,
    findPartner,
    disconnect,
    setProfile,
    getProfile,
    showMainMenu,
    acceptTerms,
    hasAcceptedTerms
};