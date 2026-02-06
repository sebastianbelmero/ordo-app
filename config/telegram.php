<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Telegram Bot Token
    |--------------------------------------------------------------------------
    |
    | Your Telegram bot token from @BotFather.
    | Get it by creating a bot via https://t.me/BotFather
    |
    */

    'bot_token' => env('TELEGRAM_BOT_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | Telegram Bot Username
    |--------------------------------------------------------------------------
    |
    | Your bot username (without @).
    | Example: if your bot is @mybot, just use 'mybot'
    |
    */

    'bot_username' => env('TELEGRAM_BOT_USERNAME', 'ordoo_bot'),

    /*
    |--------------------------------------------------------------------------
    | Webhook URL
    |--------------------------------------------------------------------------
    |
    | The full URL where Telegram will send updates.
    | This should be publicly accessible HTTPS URL.
    |
    */

    'webhook_url' => env('TELEGRAM_WEBHOOK_URL'),

    /*
    |--------------------------------------------------------------------------
    | Webhook Secret Token
    |--------------------------------------------------------------------------
    |
    | Optional secret token to validate webhook requests from Telegram.
    | Highly recommended for security.
    |
    */

    'webhook_secret' => env('TELEGRAM_WEBHOOK_SECRET'),

];
