/**
 * @fileoverview Swasthya Saathi Chatbot Component
 * Interactive chatbot with FAQs, symptom checker, and doctor connect features.
 * 
 * @module components/chatbot
 * @author SwasthyaSetu Team
 * @version 2.0.0
 */

// =============================================================================
// CHATBOT CLASS
// =============================================================================

/**
 * Swasthya Saathi - Health Assistant Chatbot
 * Provides FAQ answers, symptom checking, and doctor connection.
 * 
 * @class
 */
class HealthChatbot {
    /**
     * Create a new chatbot instance
     */
    constructor() {
        /** @private Current view state */
        this.currentView = 'menu'; // menu, faq, symptom, doctor, chat

        /** @private Symptom chat history */
        this.symptomHistory = [];

        /** @private Patient data for doctor connect */
        this.patientData = {
            name: '',
            age: '',
            contact: '',
            symptoms: ''
        };

        /** @private Chat messages history */
        this.messages = [];

        /** @private DOM elements */
        this.container = null;
        this.window = null;
        this.messagesEl = null;

        // Initialize
        this.init();
    }

    // =========================================================================
    // FAQ DATA
    // =========================================================================

    /**
     * @private
     * @returns {Array} FAQ list
     */
    getFAQs() {
        return [
            {
                id: 1,
                question: "How do I book an appointment?",
                answer: "To book an appointment:\n1. Go to Dashboard\n2. Click 'Book New Appointment'\n3. Select hospital and department\n4. Choose a doctor and time slot\n5. Confirm your booking\n\nYou can also use the 'Hospitals' page to find nearby hospitals and book directly."
            },
            {
                id: 2,
                question: "What is ABHA ID?",
                answer: "ABHA (Ayushman Bharat Health Account) is a 14-digit unique health ID that:\n• Links all your medical records\n• Enables paperless access to health data\n• Works across all hospitals in India\n• Is part of the National Digital Health Mission\n\nYou can create your ABHA ID at abha.gov.in"
            },
            {
                id: 3,
                question: "How to find nearby hospitals?",
                answer: "To find hospitals near you:\n1. Go to 'Hospitals' page\n2. Click 'Use Current Location'\n3. Browse the list of nearby hospitals\n4. Use filters for city or hospital type\n5. Click any hospital for details\n\nYou can also search by name or specialty."
            },
            {
                id: 4,
                question: "How to cancel an appointment?",
                answer: "To cancel an appointment:\n1. Go to 'My Appointments'\n2. Find the appointment you want to cancel\n3. Click 'Cancel' button\n4. The hospital will be notified\n\nNote: Some hospitals may have cancellation policies."
            },
            {
                id: 5,
                question: "What is telemedicine?",
                answer: "Telemedicine allows you to consult doctors online via video call. Benefits:\n• Consult from home\n• No travel required\n• Prescriptions sent digitally\n• Ideal for follow-ups\n\nWhen booking, select 'Telemedicine' as appointment type."
            },
            {
                id: 6,
                question: "How to view my prescriptions?",
                answer: "To view prescriptions:\n1. Go to 'My Appointments'\n2. Click on a completed appointment\n3. Look for 'Documents' section\n4. Click on any prescription to view/download\n\nAll uploaded documents are securely stored."
            },
            {
                id: 7,
                question: "Is my data secure?",
                answer: "Yes! SwasthyaSetu ensures:\n• End-to-end encryption\n• HIPAA-compliant data handling\n• Secure authentication\n• No data sharing without consent\n\nYour health data is protected by government standards."
            },
            {
                id: 8,
                question: "How to contact support?",
                answer: "You can reach us through:\n• Email: swasthyasetu.helpdesk@gmail.com\n• Help page for FAQs\n• This chatbot for quick answers\n\nWe typically respond within 24 hours."
            }
        ];
    }

    // =========================================================================
    // AUTHENTICATION CHECK
    // =========================================================================

    /**
     * Check if user is logged in
     * @private
     * @returns {boolean} True if logged in
     */
    isLoggedIn() {
        // Check for the correct swasthya auth keys
        const user = localStorage.getItem('swasthya_user');
        const token = localStorage.getItem('swasthya_token');
        return !!(user || token);
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize the chatbot
     * @private
     */
    init() {
        this.createContainer();
        this.attachEventListeners();
        console.log('[SwasthyaSaathi] Initialized');
    }

    /**
     * Create the chatbot DOM structure
     * @private
     */
    createContainer() {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'chatbot-container';
        this.container.innerHTML = `
            <!-- Contact Us Button (Above Chatbot) -->
            <div class="contact-fab-container" id="contact-fab-container">
                <button class="contact-fab" id="contact-fab" aria-label="Contact Us">
                    <span class="material-icons-outlined" style="font-size: 24px;">mail</span>
                </button>
                <!-- Contact Dropdown Menu -->
                <div class="contact-dropdown" id="contact-dropdown">
                    <div class="contact-dropdown-header">
                        <span class="material-icons-outlined">support_agent</span>
                        Contact Us
                    </div>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=swasthyasetu.helpdesk@gmail.com&su=Support%20Request" target="_blank" class="contact-option">
                        <img src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_32dp.png" alt="Gmail" style="width:20px;height:20px;">
                        Gmail
                    </a>
                    <a href="https://compose.mail.yahoo.com/?to=swasthyasetu.helpdesk@gmail.com&subject=Support%20Request" target="_blank" class="contact-option">
                        <img src="https://s.yimg.com/nq/storm/assets/hailstorm/2024/07/mail-icon-touch-128.png" alt="Yahoo" style="width:20px;height:20px;">
                        Yahoo Mail
                    </a>
                    <a href="https://outlook.live.com/mail/0/deeplink/compose?to=swasthyasetu.helpdesk@gmail.com&subject=Support%20Request" target="_blank" class="contact-option">
                        <img src="https://img.icons8.com/color/48/microsoft-outlook-2019--v2.png" alt="Outlook" style="width:20px;height:20px;">
                        Outlook
                    </a>
                    <a href="mailto:swasthyasetu.helpdesk@gmail.com?subject=Support%20Request" class="contact-option">
                        <span class="material-icons-outlined" style="font-size:20px;color:#666;">email</span>
                        Other / Default
                    </a>
                </div>
            </div>

            <!-- FAB Button -->
            <button class="chatbot-fab" id="chatbot-fab" aria-label="Open Swasthya Saathi">
                <span class="material-icons-outlined" style="font-size: 24px;">smart_toy</span>
            </button>

            <!-- Chat Window -->
            <div class="chatbot-window" id="chatbot-window">
                <!-- Header -->
                <div class="chatbot-header">
                    <h3>
                        <span class="material-icons-outlined">health_and_safety</span>
                        Swasthya Saathi
                    </h3>
                    <button class="chatbot-close-btn" id="chatbot-close" aria-label="Close">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>

                <!-- Messages Area -->
                <div class="chatbot-messages" id="chatbot-messages">
                    <!-- Messages will be added here -->
                </div>

                <!-- Input Area (for chat mode) -->
                <div class="chatbot-input-area" id="chatbot-input-area" style="display: none;">
                    <input type="text" id="chatbot-input" placeholder="Type your symptoms..." 
                        style="flex: 1; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.9rem;">
                    <button id="chatbot-send-btn" 
                        style="padding: 0.75rem 1rem; background: #86efac; border: none; border-radius: 0.5rem; cursor: pointer;">
                        <span class="material-icons-outlined" style="font-size: 20px;">send</span>
                    </button>
                </div>

                <!-- Footer -->
                <div class="chatbot-footer">
                    Powered by SwasthyaSetu
                </div>
            </div>
        `;

        document.body.appendChild(this.container);

        // Cache elements
        this.window = this.container.querySelector('#chatbot-window');
        this.messagesEl = this.container.querySelector('#chatbot-messages');
        this.inputArea = this.container.querySelector('#chatbot-input-area');
        this.inputEl = this.container.querySelector('#chatbot-input');

        // Show initial menu
        this.showMainMenu();
    }

    /**
     * Attach event listeners
     * @private
     */
    attachEventListeners() {
        // FAB click - toggle window
        const fab = this.container.querySelector('#chatbot-fab');
        fab.addEventListener('click', () => this.toggleWindow());

        // Close button
        const closeBtn = this.container.querySelector('#chatbot-close');
        closeBtn.addEventListener('click', () => this.closeWindow());

        // Contact FAB - toggle dropdown
        const contactFab = this.container.querySelector('#contact-fab');
        const contactDropdown = this.container.querySelector('#contact-dropdown');
        if (contactFab && contactDropdown) {
            contactFab.addEventListener('click', () => {
                contactDropdown.classList.toggle('visible');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!contactFab.contains(e.target) && !contactDropdown.contains(e.target)) {
                    contactDropdown.classList.remove('visible');
                }
            });
        }

        // Delegate click events in messages area
        this.messagesEl.addEventListener('click', (e) => this.handleMessageClick(e));

        // Send button for symptom chat
        const sendBtn = this.container.querySelector('#chatbot-send-btn');
        sendBtn.addEventListener('click', () => this.sendSymptomMessage());

        // Enter key in input
        this.inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendSymptomMessage();
            }
        });
    }

    /**
     * Handle clicks within messages area
     * @private
     * @param {Event} e - Click event
     */
    handleMessageClick(e) {
        const target = e.target;

        // FAQ option click
        if (target.classList.contains('chatbot-option-btn')) {
            const action = target.dataset.action;
            const faqId = target.dataset.faqId;

            if (action === 'faq') {
                this.showFAQList();
            } else if (action === 'symptom') {
                this.showSymptomChat();
            } else if (action === 'doctor') {
                this.showDoctorConnect();
            } else if (action === 'back') {
                this.hideInputArea();
                this.showMainMenu();
            } else if (action === 'faq-item' && faqId) {
                this.showFAQAnswer(parseInt(faqId));
            } else if (action === 'login') {
                // Redirect to login
                window.location.href = window.location.pathname.includes('/pages/')
                    ? '../index.html#login'
                    : 'index.html#login';
            } else if (action === 'book') {
                // Redirect to booking page
                window.location.href = window.location.pathname.includes('/pages/')
                    ? 'book-appointment.html'
                    : 'pages/book-appointment.html';
            }
        }
    }

    // =========================================================================
    // WINDOW CONTROLS
    // =========================================================================

    /**
     * Toggle chatbot window visibility
     */
    toggleWindow() {
        if (this.window.classList.contains('visible')) {
            this.closeWindow();
        } else {
            this.openWindow();
        }
    }

    /**
     * Open chatbot window
     */
    openWindow() {
        this.window.classList.add('visible');
    }

    /**
     * Close chatbot window
     */
    closeWindow() {
        this.window.classList.remove('visible');
    }

    /**
     * Show input area for chat
     * @private
     */
    showInputArea() {
        this.inputArea.style.display = 'flex';
        this.inputArea.style.padding = '0.75rem';
        this.inputArea.style.borderTop = '1px solid #e2e8f0';
        this.inputArea.style.gap = '0.5rem';
    }

    /**
     * Hide input area
     * @private
     */
    hideInputArea() {
        this.inputArea.style.display = 'none';
    }

    // =========================================================================
    // MESSAGE RENDERING
    // =========================================================================

    /**
     * Clear all messages
     * @private
     */
    clearMessages() {
        this.messagesEl.innerHTML = '';
        this.messages = [];
    }

    /**
     * Add a bot message
     * @private
     * @param {string} content - Message HTML content
     */
    addBotMessage(content) {
        const msg = document.createElement('div');
        msg.className = 'message bot';
        msg.innerHTML = content;
        this.messagesEl.appendChild(msg);
        this.scrollToBottom();
    }

    /**
     * Add a user message
     * @private
     * @param {string} text - Message text
     */
    addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'message user';
        msg.textContent = text;
        this.messagesEl.appendChild(msg);
        this.scrollToBottom();
    }

    /**
     * Scroll messages to bottom
     * @private
     */
    scrollToBottom() {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    // =========================================================================
    // VIEW: MAIN MENU
    // =========================================================================

    /**
     * Show main menu with primary options
     */
    showMainMenu() {
        this.currentView = 'menu';
        this.clearMessages();
        this.hideInputArea();

        // Check login status for different options
        const isLoggedIn = this.isLoggedIn();

        this.addBotMessage(`
            <p style="margin-bottom: 0.75rem;">🙏 Namaste! I'm <strong>Swasthya Saathi</strong>, your health companion. How can I help you today?</p>
            <div class="chatbot-options">
                <button class="chatbot-option-btn" data-action="faq">
                    📋 Frequently Asked Questions
                </button>
                <button class="chatbot-option-btn" data-action="symptom">
                    💬 Chat About Symptoms
                </button>
                <button class="chatbot-option-btn" data-action="doctor">
                    👨‍⚕️ Connect with a Doctor
                </button>
                ${isLoggedIn ? `
                    <button class="chatbot-option-btn" data-action="book" style="background: #86efac; color: #1a202c;">
                        📅 Book Appointment
                    </button>
                ` : ''}
            </div>
        `);
    }

    // =========================================================================
    // VIEW: FAQ LIST
    // =========================================================================

    /**
     * Show FAQ list
     */
    showFAQList() {
        this.currentView = 'faq';
        this.clearMessages();

        const faqs = this.getFAQs();
        const faqButtons = faqs.map(faq => `
            <button class="chatbot-option-btn" data-action="faq-item" data-faq-id="${faq.id}">
                ${faq.question}
            </button>
        `).join('');

        this.addBotMessage(`
            <p style="margin-bottom: 0.75rem;">📋 <strong>Frequently Asked Questions</strong></p>
            <p style="margin-bottom: 0.75rem; font-size: 0.85rem; color: #666;">Click a question to see the answer:</p>
            <div class="chatbot-options">
                ${faqButtons}
                <button class="chatbot-option-btn" data-action="back" style="margin-top: 0.5rem; border-color: #ccc; color: #666;">
                    ← Back to Menu
                </button>
            </div>
        `);
    }

    /**
     * Show answer for specific FAQ
     * @param {number} faqId - FAQ ID
     */
    showFAQAnswer(faqId) {
        const faq = this.getFAQs().find(f => f.id === faqId);
        if (!faq) return;

        this.addUserMessage(faq.question);

        // Format answer with line breaks
        const formattedAnswer = faq.answer.replace(/\n/g, '<br>');

        this.addBotMessage(`
            <p style="white-space: pre-line;">${formattedAnswer}</p>
            <div class="chatbot-options" style="margin-top: 1rem;">
                <button class="chatbot-option-btn" data-action="faq">
                    Ask another question
                </button>
                <button class="chatbot-option-btn" data-action="back" style="border-color: #ccc; color: #666;">
                    ← Back to Menu
                </button>
            </div>
        `);
    }

    // =========================================================================
    // VIEW: SYMPTOM CHAT
    // =========================================================================

    /**
     * Show symptom chat interface
     */
    showSymptomChat() {
        this.currentView = 'symptom';
        this.clearMessages();
        this.symptomHistory = [];

        this.addBotMessage(`
            <p style="margin-bottom: 0.75rem;">💬 <strong>Symptom Chat</strong></p>
            <p style="margin-bottom: 0.5rem; font-size: 0.9rem;">Tell me what you're feeling. I'll try to help with some suggestions.</p>
            <p style="font-size: 0.8rem; color: #666; font-style: italic;">Example: "I have a headache" or "feeling tired"</p>
        `);

        // Show input area for chatting
        this.showInputArea();
        this.inputEl.focus();
    }

    /**
     * Send symptom message from input
     * @private
     */
    async sendSymptomMessage() {
        const message = this.inputEl.value.trim();
        if (!message) return;

        // Clear input
        this.inputEl.value = '';

        // Add user message
        this.addUserMessage(message);
        this.symptomHistory.push(message);

        // Show typing indicator
        this.addBotMessage(`
            <p style="display: flex; align-items: center; gap: 0.5rem; color: #666;">
                <span style="animation: pulse 1s infinite;">💭</span>
                Thinking...
            </p>
            <style>@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }</style>
        `);

        // Analyze symptoms
        try {
            const result = await analyzeSymptoms(message);
            this.showSymptomChatResult(result);
        } catch (error) {
            console.error('[Chatbot] Symptom analysis error:', error);
            // Remove loading message
            const messages = this.messagesEl.querySelectorAll('.message.bot');
            if (messages.length > 0) {
                messages[messages.length - 1].remove();
            }
            this.addBotMessage(`<p style="color: #ef4444;">Sorry, I couldn't understand. Can you describe your symptoms differently?</p>`);
        }
    }

    /**
     * Show symptom chat result
     * @private
     * @param {Object} result - Analysis result
     */
    showSymptomChatResult(result) {
        // Remove loading message
        const messages = this.messagesEl.querySelectorAll('.message.bot');
        if (messages.length > 0) {
            messages[messages.length - 1].remove();
        }

        // Format remedies as simple list
        const remediesText = result.remedies.slice(0, 4).map(r => `• ${r}`).join('<br>');

        this.addBotMessage(`
            <div style="margin-bottom: 0.75rem;">
                <p style="font-weight: 600; color: #166534; margin-bottom: 0.5rem;">
                    This sounds like it could be: <strong>${result.possibleCondition}</strong>
                </p>
                <p style="font-size: 0.85rem; margin-bottom: 0.75rem;">
                    <strong>You can try:</strong><br>
                    ${remediesText}
                </p>
                ${result.warningSigns && result.warningSigns.length > 0 ? `
                    <p style="font-size: 0.8rem; color: #dc2626; background: #fef2f2; padding: 0.5rem; border-radius: 0.25rem;">
                        ⚠️ See a doctor if: ${result.warningSigns[0]}
                    </p>
                ` : ''}
            </div>
            <p style="font-size: 0.75rem; color: #666; margin-bottom: 0.75rem;">
                ${result.disclaimer || 'This is general guidance, not medical advice.'}
            </p>
            <p style="font-size: 0.85rem; color: #666;">
                Tell me more symptoms, or:
            </p>
            <div class="chatbot-options" style="margin-top: 0.5rem;">
                <button class="chatbot-option-btn" data-action="doctor">
                    👨‍⚕️ Talk to a Doctor
                </button>
                <button class="chatbot-option-btn" data-action="back" style="border-color: #ccc; color: #666;">
                    ← Back to Menu
                </button>
            </div>
        `);
    }

    // =========================================================================
    // VIEW: DOCTOR CONNECT
    // =========================================================================

    /**
     * Show doctor connect - requires login
     */
    showDoctorConnect() {
        this.currentView = 'doctor';
        this.clearMessages();
        this.hideInputArea();

        // Check if logged in
        if (!this.isLoggedIn()) {
            this.addBotMessage(`
                <p style="margin-bottom: 0.75rem;">👨‍⚕️ <strong>Connect with a Doctor</strong></p>
                <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <p style="font-size: 0.9rem; color: #92400e; display: flex; align-items: center; gap: 0.5rem;">
                        <span class="material-icons-outlined" style="font-size: 20px;">info</span>
                        Please log in first to connect with a doctor or book an appointment.
                    </p>
                </div>
                <div class="chatbot-options">
                    <button class="chatbot-option-btn" data-action="login" style="background: #3b82f6; color: white; border-color: #3b82f6;">
                        🔐 Login / Register
                    </button>
                    <button class="chatbot-option-btn" data-action="back" style="border-color: #ccc; color: #666;">
                        ← Back to Menu
                    </button>
                </div>
            `);
            return;
        }

        // User is logged in - show booking options
        this.addBotMessage(`
            <p style="margin-bottom: 0.75rem;">👨‍⚕️ <strong>Connect with a Doctor</strong></p>
            <p style="margin-bottom: 1rem; font-size: 0.9rem; color: #666;">
                You can book an appointment with a doctor near you.
            </p>
            <div style="background: #f0fdf4; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                <p style="font-size: 0.9rem; color: #166534; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="material-icons-outlined" style="font-size: 20px;">check_circle</span>
                    You're logged in! Ready to book.
                </p>
            </div>
            <div class="chatbot-options">
                <button class="chatbot-option-btn" data-action="book" style="background: #86efac; color: #1a202c;">
                    📅 Book Appointment Now
                </button>
                <button class="chatbot-option-btn" data-action="back" style="border-color: #ccc; color: #666;">
                    ← Back to Menu
                </button>
            </div>
            <p style="font-size: 0.8rem; color: #666; margin-top: 1rem;">
                💡 For emergencies, call <strong>108</strong> immediately.
            </p>
        `);
    }
}

// =============================================================================
// GLOBAL TOGGLE FUNCTION
// =============================================================================

/**
 * Global function to toggle chatbot (for external buttons)
 */
function toggleChat() {
    if (window.healthChatbot) {
        window.healthChatbot.toggleWindow();
    }
}

// =============================================================================
// INITIALIZE ON PAGE LOAD
// =============================================================================

// Create global instance when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.healthChatbot = new HealthChatbot();
    });
} else {
    window.healthChatbot = new HealthChatbot();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthChatbot;
}
