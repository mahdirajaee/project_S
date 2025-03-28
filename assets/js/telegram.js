/**
 * Telegram Bot Integration Module
 * 
 * Handles integration with Telegram bot for notifications and user management
 */

class TelegramBot {
    constructor() {
        // Bot configuration (in a real app, this would be stored securely)
        this.botToken = 'YOUR_TELEGRAM_BOT_TOKEN'; // Replace with your actual bot token
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
        this.webhookUrl = `${window.location.origin}/webhook.php`; // Webhook endpoint
        
        // Initialize bot
        this.init();
    }
    
    /**
     * Initialize the bot
     */
    init() {
        // For demonstration purposes only
        console.log('Telegram Bot initialized');
        
        // Check if webhook is set (in a real app, this would be done server-side)
        this.checkWebhook();
        
        // Setup event listeners
        document.addEventListener('user_created', (event) => {
            this.notifyAdminUserCreated(event.detail);
        });
        
        document.addEventListener('message_sent', (event) => {
            this.notifyUserNewMessage(event.detail);
        });
    }
    
    /**
     * Check if webhook is already set
     * In a real application, this would be done server-side
     */
    async checkWebhook() {
        // Simulate API call
        console.log(`Checking webhook: ${this.webhookUrl}`);
        
        // Simulate result for demonstration purposes
        return {
            ok: true,
            result: {
                url: this.webhookUrl,
                has_custom_certificate: false,
                pending_update_count: 0,
                max_connections: 40
            }
        };
    }
    
    /**
     * Set webhook for the bot
     * In a real application, this would be done server-side
     */
    async setWebhook() {
        // This is just for demonstration
        console.log(`Setting webhook to: ${this.webhookUrl}`);
        
        // Simulate success response
        return {
            ok: true,
            result: true,
            description: "Webhook was set"
        };
    }
    
    /**
     * Send a message to a Telegram chat
     * @param {string} chatId - Telegram chat ID
     * @param {string} text - Message text
     * @param {Object} options - Additional options
     */
    async sendMessage(chatId, text, options = {}) {
        // This is a simulation for demonstration purposes
        console.log(`Sending Telegram message to chat ${chatId}:`, text);
        
        // In a real application, you would make an API call:
        /*
        const url = `${this.apiUrl}/sendMessage`;
        const data = {
            chat_id: chatId,
            text: text,
            parse_mode: options.parseMode || 'HTML',
            disable_web_page_preview: options.disablePreview || false,
            disable_notification: options.silent || false,
            reply_to_message_id: options.replyTo || null
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log('Message sent successfully:', result);
            return result;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
        */
        
        // Simulate successful sending
        return {
            ok: true,
            result: {
                message_id: Date.now(),
                from: {
                    id: 123456789,
                    is_bot: true,
                    first_name: "DashboardBot",
                    username: "YourDashboardBot"
                },
                chat: {
                    id: chatId,
                    type: "private"
                },
                date: Math.floor(Date.now() / 1000),
                text: text
            }
        };
    }
    
    /**
     * Broadcast a message to multiple users
     * @param {Array|string} recipients - Array of chat IDs or 'all' for all connected users
     * @param {string} text - Message text
     * @param {Object} options - Additional options
     */
    async broadcastMessage(recipients, text, options = {}) {
        // Get all connected Telegram users
        let chatIds = [];
        
        if (recipients === 'all') {
            // Find all connected users
            const usersStr = localStorage.getItem('users') || '[]';
            const users = JSON.parse(usersStr);
            
            // For each user, get the Telegram chat ID if exists
            users.forEach(user => {
                const chatId = localStorage.getItem(`telegram_chat_id_${user.username}`);
                if (chatId) chatIds.push(chatId);
            });
        } else if (Array.isArray(recipients)) {
            chatIds = recipients;
        } else {
            // Single recipient
            chatIds = [recipients];
        }
        
        // Send to each chat ID
        const results = [];
        
        for (const chatId of chatIds) {
            try {
                const result = await this.sendMessage(chatId, text, options);
                results.push(result);
            } catch (error) {
                console.error(`Error sending to chat ID ${chatId}:`, error);
                results.push({ ok: false, error });
            }
        }
        
        return {
            total: chatIds.length,
            successful: results.filter(r => r.ok).length,
            failed: results.filter(r => !r.ok).length,
            results
        };
    }
    
    /**
     * Notify admin when a new user is created
     * @param {Object} user - User data
     */
    notifyAdminUserCreated(user) {
        // Get admin chat ID (in a real app, this would be stored in a database)
        const adminChatId = localStorage.getItem('admin_telegram_chat_id') || '123456789';
        
        // Format message
        const message = `
🆕 <b>New User Created</b>

Username: <code>${user.username}</code>
Email: <code>${user.email}</code>
Created: <code>${new Date().toLocaleString()}</code>
        `;
        
        // Send notification
        this.sendMessage(adminChatId, message, {
            parseMode: 'HTML'
        });
    }
    
    /**
     * Notify user when they receive a new message
     * @param {Object} messageData - Message data
     */
    notifyUserNewMessage(messageData) {
        // In a real app, you would get the user's Telegram chat ID from a database
        // Here we'll simulate using localStorage
        
        // If message is for all users
        if (messageData.recipient === 'all') {
            // Get all users
            const usersStr = localStorage.getItem('users') || '[]';
            const users = JSON.parse(usersStr);
            
            // Send to each user who has a Telegram connection
            users.forEach(user => {
                if (user.role !== 'admin') { // Don't send to admin users
                    const chatId = localStorage.getItem(`telegram_chat_id_${user.username}`);
                    if (chatId) {
                        this.sendUserMessage(chatId, messageData);
                    }
                }
            });
        } else {
            // Find specific user
            const usersStr = localStorage.getItem('users') || '[]';
            const users = JSON.parse(usersStr);
            const user = users.find(u => u.id.toString() === messageData.recipient);
            
            if (user) {
                const chatId = localStorage.getItem(`telegram_chat_id_${user.username}`);
                if (chatId) {
                    this.sendUserMessage(chatId, messageData);
                }
            }
        }
    }
    
    /**
     * Send a message notification to a specific user
     */
    sendUserMessage(chatId, messageData) {
        // Format message
        const message = `
📬 <b>New Message</b>

From: <b>${messageData.senderName}</b>
Subject: <b>${messageData.subject}</b>

${messageData.content}

<i>Login to your dashboard to reply.</i>
        `;
        
        // Send notification
        this.sendMessage(chatId, message, {
            parseMode: 'HTML'
        });
    }
    
    /**
     * Register a user with the bot
     * Associates a user account with their Telegram chat ID
     * @param {string} username - User's username
     * @param {string} chatId - Telegram chat ID
     */
    registerUser(username, chatId) {
        // In a real app, you would store this in a database
        localStorage.setItem(`telegram_chat_id_${username}`, chatId);
        
        console.log(`Registered user ${username} with Telegram chat ID ${chatId}`);
        
        // Store the connection timestamp
        localStorage.setItem(`telegram_connected_since_${username}`, new Date().toISOString());
        
        // Send confirmation message
        this.sendMessage(chatId, `✅ You are now registered for notifications from the Dashboard.`);
        
        return true;
    }
    
    /**
     * Unregister a user from the bot
     * @param {string} username - User's username
     */
    unregisterUser(username) {
        // Get chat ID before removing
        const chatId = localStorage.getItem(`telegram_chat_id_${username}`);
        
        // In a real app, you would remove this from a database
        localStorage.removeItem(`telegram_chat_id_${username}`);
        localStorage.removeItem(`telegram_connected_since_${username}`);
        
        console.log(`Unregistered user ${username} from Telegram notifications`);
        
        // Send confirmation message if chat ID exists
        if (chatId) {
            this.sendMessage(chatId, `👋 You have been unregistered from Dashboard notifications.`);
        }
        
        return true;
    }
    
    /**
     * Process incoming webhook events from Telegram
     * In a real application, this would be handled server-side
     * @param {Object} update - Telegram update object
     */
    processWebhookUpdate(update) {
        console.log('Received webhook update:', update);
        
        // Process message
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            
            // Process command
            if (message.text && message.text.startsWith('/')) {
                const command = message.text.split(' ')[0];
                const args = message.text.substring(command.length).trim();
                
                switch (command) {
                    case '/start':
                        this.handleStartCommand(chatId);
                        break;
                    case '/register':
                        this.handleRegisterCommand(chatId, args);
                        break;
                    case '/unregister':
                        this.handleUnregisterCommand(chatId);
                        break;
                    case '/help':
                        this.handleHelpCommand(chatId);
                        break;
                    default:
                        this.sendMessage(chatId, 'Unknown command. Type /help for available commands.');
                }
            } else {
                // Handle non-command messages
                this.sendMessage(chatId, 'To interact with the bot, please use commands. Type /help for available commands.');
            }
        }
    }
    
    /**
     * Handle /start command
     * @param {string} chatId - Telegram chat ID
     */
    handleStartCommand(chatId) {
        const message = `
👋 <b>Welcome to the Dashboard Bot!</b>

This bot allows you to receive notifications from your Dashboard account.

To register, use the /register command followed by your username and password:
<code>/register yourusername yourpassword</code>

You must use the same credentials as your Dashboard account.

Type /help for more commands.
        `;
        
        this.sendMessage(chatId, message, {
            parseMode: 'HTML'
        });
    }
    
    /**
     * Handle /register command
     * @param {string} chatId - Telegram chat ID
     * @param {string} args - Command arguments (username password)
     */
    handleRegisterCommand(chatId, args) {
        if (!args || args.split(' ').length < 2) {
            this.sendMessage(chatId, 'Please provide your username and password: /register yourusername yourpassword');
            return;
        }
        
        const [username, password] = args.trim().split(' ');
        
        // In a real app, you would verify the username exists in your database
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);
        const user = users.find(user => user.username === username);
        
        if (!user) {
            this.sendMessage(chatId, `❌ User "${username}" not found. Please check your username and try again.`);
            return;
        }
        
        // In a real app, you would use proper password verification
        // For demo purposes, we'll check against the stored password
        if (user.password !== password) {
            this.sendMessage(chatId, '❌ Invalid password. Please try again.');
            return;
        }
        
        // Register the user
        this.registerUser(username, chatId);
    }
    
    /**
     * Handle /unregister command
     * @param {string} chatId - Telegram chat ID
     */
    handleUnregisterCommand(chatId) {
        // In a real app, you would look up the username by chat ID in your database
        // Here we'll simulate that for demonstration
        let foundUsername = null;
        
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);
        
        for (const user of users) {
            const userChatId = localStorage.getItem(`telegram_chat_id_${user.username}`);
            if (userChatId === chatId.toString()) {
                foundUsername = user.username;
                break;
            }
        }
        
        if (!foundUsername) {
            this.sendMessage(chatId, '❌ You are not registered with this bot.');
            return;
        }
        
        // Unregister the user
        this.unregisterUser(foundUsername);
        
        // Confirm unregistration
        this.sendMessage(chatId, '✅ You have been successfully unregistered from receiving notifications.');
    }
    
    /**
     * Handle /help command
     * @param {string} chatId - Telegram chat ID
     */
    handleHelpCommand(chatId) {
        const message = `
🤖 <b>Dashboard Bot Commands</b>

/start - Start the bot
/register <username> <password> - Register for notifications
/unregister - Unregister from notifications
/help - Show this help message
/status - Check your notification status
        `;
        
        this.sendMessage(chatId, message, {
            parseMode: 'HTML'
        });
    }
    
    /**
     * Get all registered Telegram users
     * @returns {Array} Array of registered users with their Telegram info
     */
    getRegisteredUsers() {
        // In a real app, this would come from a database
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);
        
        const registeredUsers = [];
        
        users.forEach(user => {
            const chatId = localStorage.getItem(`telegram_chat_id_${user.username}`);
            const connectedSince = localStorage.getItem(`telegram_connected_since_${user.username}`);
            
            if (chatId) {
                registeredUsers.push({
                    username: user.username,
                    telegramUsername: `@${user.username}Demo`, // In a real app this would come from Telegram
                    chatId,
                    connectedSince: connectedSince || new Date().toISOString()
                });
            }
        });
        
        return registeredUsers;
    }
}

// Initialize bot
const telegramBot = new TelegramBot();

// Make it available globally
window.telegramBot = telegramBot;