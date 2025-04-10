// Load environment variables from .env file
require('dotenv').config();

// Import the Telegram Bot API library
const TelegramBot = require('node-telegram-bot-api');

// Import the modularized handlers and chat logic
const handlers = require('./src/handlers');
const logic = require('./src/logic');

// Get the bot token from environment variables
const token = process.env.TELEGRAM_TOKEN;

// Initialize the Telegram bot in polling mode
const bot = new TelegramBot(token, { polling: true });

// Register command handlers (/start, /stop, /next)
handlers.setupCommands(bot, logic);

// Register inline button handlers (callback queries)
handlers.setupCallbacks(bot, logic);

// Register message forwarding logic
handlers.setupMessages(bot, logic);
