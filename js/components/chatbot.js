/**
 * Enhanced Chatbot Component with Gemini AI Integration
 * Handles the floating chatbot widget with AI-powered responses
 */

class Chatbot {
    constructor() {
        this.container = null;
        this.isOpen = false;
        this.isMenuOpen = false;
        this.conversationHistory = [];
        this.isTyping = false;
        this.contextInitialized = false;
        this.init();
    }

    async init() {
        console.log('Initializing AI-Powered Chatbot...');

        // Initialize context service
        if (window.ChatbotContext) {
            await window.ChatbotContext.initialize();
            this.contextInitialized = true;
            console.log('Chatbot context initialized');
        }

        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container = document.createElement('div');
        this.container.id = 'chatbot-component';
        this.container.className = 'chatbot-container';

        const supportEmail = 'swasthyasetu.helpdesk@gmail.com';

        this.container.innerHTML = `
            <!-- Chat Window -->
            <div class="chatbot-window" id="chatbot-window">
                <div class="chatbot-header">
                    <h3>
                        <span class="material-icons-outlined">smart_toy</span>
                        Swasthya Assistant
                        <span class="ai-badge">AI</span>
                    </h3>
                    <button class="chatbot-close-btn" id="chatbot-close-btn">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages"></div>
                
                <!-- Input Area -->
                <div class="chatbot-input-area">
                    <input 
                        type="text" 
                        id="chatbot-input" 
                        placeholder="Type your question..." 
                        autocomplete="off"
                    />
                    <button id="chatbot-send-btn" class="chatbot-send-btn">
                        <span class="material-icons-outlined">send</span>
                    </button>
                </div>
                
                <div class="chatbot-footer">Powered by Gemini AI</div>
            </div>

            <!-- Contact Popup Menu -->
            <div class="contact-menu-container" id="contact-menu-container">
                <div class="menu-view active" id="menu-main">
                    <button class="contact-menu-item" id="contact-whatsapp">
                        <span class="material-icons-outlined" style="color: #25D366;">chat</span>
                        Chat with us
                    </button>
                    <button class="contact-menu-item" id="contact-email-trigger">
                        <span class="material-icons-outlined" style="color: #EA4335;">email</span>
                        Email
                    </button>
                </div>

                <div class="menu-view" id="menu-email">
                    <button class="contact-menu-item back-btn" id="email-back-btn">
                        <span class="material-icons-outlined" style="font-size: 16px;">arrow_back</span>
                        Back
                    </button>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}" target="_blank" class="contact-menu-item">
                        <span class="material-icons-outlined" style="color: #EA4335;">mail</span>
                        Gmail
                    </a>
                    <a href="https://compose.mail.yahoo.com/?to=${supportEmail}" target="_blank" class="contact-menu-item">
                        <span class="material-icons-outlined" style="color: #720e9e;">mail</span>
                        Yahoo Mail
                    </a>
                    <a href="https://outlook.live.com/owa/?path=/mail/action/compose&to=${supportEmail}" target="_blank" class="contact-menu-item">
                        <span class="material-icons-outlined" style="color: #0078d4;">mail</span>
                        Outlook
                    </a>
                    <a href="mailto:${supportEmail}" class="contact-menu-item">
                        <span class="material-icons-outlined" style="color: #64748b;">forward_to_inbox</span>
                        Others
                    </a>
                </div>
            </div>
            
            <!-- Secondary FAB (Contact) -->
            <button class="chatbot-fab-secondary" id="chatbot-contact-btn" aria-label="Contact Support" title="Contact Options">
                <span class="material-icons-outlined" style="font-size: 24px;">headphones</span>
            </button>

            <!-- Primary FAB (Chat) -->
            <button class="chatbot-fab" id="chatbot-toggle-btn" aria-label="Toggle Chatbot">
                <span class="material-icons-outlined" style="font-size: 24px;">chat</span>
            </button>
        `;

        document.body.appendChild(this.container);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('chatbot-toggle-btn');
        const contactBtn = document.getElementById('chatbot-contact-btn');
        const closeBtn = document.getElementById('chatbot-close-btn');
        const whatsappBtn = document.getElementById('contact-whatsapp');
        const sendBtn = document.getElementById('chatbot-send-btn');
        const inputField = document.getElementById('chatbot-input');

        // Email Menu Logic
        const emailTriggerBtn = document.getElementById('contact-email-trigger');
        const emailBackBtn = document.getElementById('email-back-btn');
        const menuMain = document.getElementById('menu-main');
        const menuEmail = document.getElementById('menu-email');

        // Chat Toggle
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.closeContactMenu();
                this.toggleChat();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleChat(false));
        }

        // Contact Menu Toggle
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                this.toggleChat(false);
                this.toggleContactMenu();
            });
        }

        // WhatsApp
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => {
                window.open('https://wa.me/911234567890', '_blank');
                this.closeContactMenu();
            });
        }

        // Email menu navigation
        if (emailTriggerBtn) {
            emailTriggerBtn.addEventListener('click', () => {
                menuMain.classList.remove('active');
                menuEmail.classList.add('active');
            });
        }

        if (emailBackBtn) {
            emailBackBtn.addEventListener('click', () => {
                menuEmail.classList.remove('active');
                menuMain.classList.add('active');
            });
        }

        const emailLinks = menuEmail.querySelectorAll('a');
        emailLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.closeContactMenu(), 500);
            });
        });

        // Send message handlers
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleSendMessage());
        }

        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.toggleChat(false);
                this.closeContactMenu();
            }
        });
    }

    toggleChat(forceState) {
        const windowEl = document.getElementById('chatbot-window');
        const toggleIcon = document.querySelector('#chatbot-toggle-btn .material-icons-outlined');

        this.isOpen = forceState !== undefined ? forceState : !this.isOpen;

        if (this.isOpen) {
            windowEl.classList.add('visible');
            toggleIcon.innerText = 'close';

            // If empty, add initial greeting
            const messagesContainer = document.getElementById('chatbot-messages');
            if (messagesContainer.children.length === 0) {
                this.addBotMessage('Hi! I\'m your Swasthya Assistant. How can I help you today?');
                this.showInitialOptions();
            }

            // Focus input
            setTimeout(() => {
                document.getElementById('chatbot-input')?.focus();
            }, 100);
        } else {
            windowEl.classList.remove('visible');
            toggleIcon.innerText = 'chat';
        }
    }

    toggleContactMenu() {
        const menuContainer = document.getElementById('contact-menu-container');
        const menuMain = document.getElementById('menu-main');
        const menuEmail = document.getElementById('menu-email');

        this.isMenuOpen = !this.isMenuOpen;

        if (this.isMenuOpen) {
            menuContainer.classList.add('visible');
            menuMain.classList.add('active');
            menuEmail.classList.remove('active');
        } else {
            menuContainer.classList.remove('visible');
        }
    }

    closeContactMenu() {
        this.isMenuOpen = false;
        const menuContainer = document.getElementById('contact-menu-container');
        if (menuContainer) menuContainer.classList.remove('visible');
    }

    showInitialOptions() {
        this.addOptions([
            { text: 'How do I book an appointment?', action: 'quick-ask' },
            { text: 'What is ABHA ID?', action: 'quick-ask' },
            { text: 'Find nearby hospitals', action: 'quick-ask' },
            { text: 'Emergency help', action: 'emergency' }
        ]);
    }

    async handleSendMessage() {
        const inputField = document.getElementById('chatbot-input');
        const message = inputField.value.trim();

        if (!message || this.isTyping) return;

        // Add user message
        this.addUserMessage(message);
        inputField.value = '';

        // Get AI response
        await this.getAIResponse(message);
    }

    async getAIResponse(userMessage) {
        // Check if API key is configured
        if (!window.GeminiConfig || window.GeminiConfig.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            this.addBotMessage('⚠️ AI features are not configured yet. Please add your Gemini API key in gemini-config.js');
            return;
        }

        this.showTypingIndicator();

        try {
            // Build conversation context with patient and hospital data
            let contextString = window.GeminiConfig.systemPrompt;

            // Add patient and hospital context if available
            if (this.contextInitialized && window.ChatbotContext) {
                contextString += window.ChatbotContext.getContextString();
            }

            // Add conversation history
            contextString += '\n\n## CONVERSATION HISTORY:\n' +
                this.conversationHistory.map(msg => `${msg.role}: ${msg.text}`).join('\n') +
                `\nUser: ${userMessage}\nAssistant:`;

            const response = await fetch(
                `${window.GeminiConfig.apiEndpoint}?key=${window.GeminiConfig.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: contextString
                            }]
                        }],
                        generationConfig: window.GeminiConfig.generationConfig,
                        safetySettings: window.GeminiConfig.safetySettings
                    })
                }
            );

            // Check if response is OK
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Log API response for debugging
            console.log('Gemini API Response:', data);

            this.hideTypingIndicator();

            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                const aiResponse = data.candidates[0].content.parts[0].text;

                // Add to conversation history
                this.conversationHistory.push({ role: 'User', text: userMessage });
                this.conversationHistory.push({ role: 'Assistant', text: aiResponse });

                // Keep only last 10 messages to avoid token limits
                if (this.conversationHistory.length > 10) {
                    this.conversationHistory = this.conversationHistory.slice(-10);
                }

                this.addBotMessage(aiResponse);
            } else if (data.error) {
                // API returned an error
                console.error('API Error Response:', data.error);
                throw new Error(data.error.message || 'API returned an error');
            } else {
                // Unexpected response format
                console.error('Unexpected API response format:', data);
                throw new Error('Invalid response from AI');
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            this.hideTypingIndicator();

            // Provide more specific error messages
            let errorMessage = 'Sorry, I encountered an error. ';

            if (error.message && error.message.includes('fetch')) {
                errorMessage += 'Network connection issue. Please check your internet connection.';
            } else if (error.message && error.message.includes('API key')) {
                errorMessage += 'API key issue. Please verify your Gemini API key is correct.';
            } else if (error.message && error.message.includes('quota')) {
                errorMessage += 'API quota exceeded. Please try again later.';
            } else {
                errorMessage += 'Please try again or contact support.';
            }

            // Log detailed error for debugging
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                apiKey: window.GeminiConfig?.apiKey ? 'Set (starts with: ' + window.GeminiConfig.apiKey.substring(0, 10) + '...)' : 'Not set'
            });

            this.addBotMessage(errorMessage);
        }

    }

    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    addBotMessage(text) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.innerText = text;
        messagesContainer.appendChild(msgDiv);
        this.scrollToBottom();
    }

    addUserMessage(text) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user';
        msgDiv.innerText = text;
        messagesContainer.appendChild(msgDiv);
        this.scrollToBottom();
    }

    addOptions(options) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'chatbot-options';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chatbot-option-btn';
            btn.innerText = opt.text;
            btn.addEventListener('click', () => this.handleOptionClick(opt));
            optionsDiv.appendChild(btn);
        });

        messagesContainer.appendChild(optionsDiv);
        this.scrollToBottom();
    }

    async handleOptionClick(option) {
        // Add user selection bubble
        this.addUserMessage(option.text);

        if (option.action === 'emergency') {
            this.addBotMessage('🚨 For medical emergencies, please call 108 immediately or use the Emergency Access button on the homepage.');
            return;
        }

        if (option.action === 'quick-ask') {
            // Use AI to answer
            await this.getAIResponse(option.text);
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Show hospital search results
     */
    showHospitalResults(query) {
        if (!window.ChatbotContext) return;

        const results = window.ChatbotContext.searchHospitals(query);

        if (results.length === 0) {
            this.addBotMessage(`I couldn't find any hospitals matching "${query}". Try searching by city, department, or hospital name.`);
            return;
        }

        let message = `Found ${results.length} hospital(s):\n\n`;
        results.slice(0, 3).forEach((hospital, index) => {
            message += `${index + 1}. **${hospital.name}** (${hospital.city})\n`;
            message += `   📞 ${hospital.contact.phone}\n`;
            message += `   🛏️ Beds: ${hospital.beds.available}/${hospital.beds.total}\n`;
            message += `   🏥 Departments: ${hospital.departments.slice(0, 3).join(', ')}\n\n`;
        });

        if (results.length > 3) {
            message += `\n...and ${results.length - 3} more. Visit the Hospitals page for full list.`;
        }

        this.addBotMessage(message);
    }

    /**
     * Refresh context (useful after login/logout)
     */
    async refreshContext() {
        if (window.ChatbotContext) {
            await window.ChatbotContext.initialize();
            this.contextInitialized = true;
            console.log('Chatbot context refreshed');
        }
    }
}


// Make accessible globally
window.Chatbot = Chatbot;
