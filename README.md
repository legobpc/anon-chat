🕵️‍♂️ Анонімний чат-бот на Node.js + Telegram API
Цей бот дозволяє користувачам анонімно підключатись одне до одного, обмінюватися повідомленнями, медіа та додавати короткий опис про себе.

📦 Технології
Node.js

Telegram Bot API (через node-telegram-bot-api)

Docker

🚀 Запуск локально
Встанови залежності:
```npm install```

Створи .env файл:
```TELEGRAM_TOKEN=your_telegram_bot_token```

Запусти бота:
```node index.js```

🐳 Запуск у Docker
```
docker build -t anon-chat-bot .
docker run -d --env TELEGRAM_TOKEN=your_telegram_bot_token anon-chat-bot

on vps or local
docker run --rm -v ${PWD}:/app -w /app node:20 npm install
```

⚙️ Команди бота
Команда	Опис
```
/start	Показує меню та підключає до чату
/stop	Завершує поточну розмову
/next	Переходить до нового співрозмовника
/about <текст>	Додає короткий опис вашого профілю
```

📋 Поведінка
Бот показує правила лише один раз при першому запуску

Натискання «▶️ Почати» означає автоматичну згоду з правилами

Всі чати є повністю анонімними

📁 Структура
```
.
├── logic.js           # Основна логіка бота
├── handlers.js        # Обробники команд і повідомлень
├── index.js           # Точка входу
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

📜 Ліцензія
MIT
