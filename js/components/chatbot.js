/**
 * @fileoverview Health Assistant Chatbot Component
 * Interactive chatbot with FAQs, symptom checker, and doctor connect features.
 * 
 * @module components/chatbot
 * @author SwasthyaSetu Team
 * @version 1.0.0
 */

// =============================================================================
// CHATBOT CLASS
// =============================================================================

/**
 * Health Assistant Chatbot
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
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize the chatbot
     * @private
     */
    init() {
        this.createContainer();
        this.attachEventListeners();
        console.log('[HealthChatbot] Initialized');
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
            <!-- FAB Button -->
            <button class="chatbot-fab" id="chatbot-fab" aria-label="Open Health Assistant">
                <span class="material-icons-outlined" style="font-size: 24px;">smart_toy</span>
            </button>

            <!-- Chat Window -->
            <div class="chatbot-window" id="chatbot-window">
                <!-- Header -->
                <div class="chatbot-header">
                    <h3>
                        <span class="material-icons-outlined">health_and_safety</span>
                        Health Assistant
                    </h3>
                    <button class="chatbot-close-btn" id="chatbot-close" aria-label="Close">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>

                <!-- Messages Area -->
                <div class="chatbot-messages" id="chatbot-messages">
                    <!-- Messages will be added here -->
                </div>

                <!-- Footer -->
                <div class="chatbot-footer">
                    Powered by SwasthyaSetu AI
                </div>
            </div>
        `;

        document.body.appendChild(this.container);

        // Cache elements
        this.window = this.container.querySelector('#chatbot-window');
        this.messagesEl = this.container.querySelector('#chatbot-messages');

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

        // Delegate click events in messages area
        this.messagesEl.addEventListener('click', (e) => this.handleMessageClick(e));
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
                this.showSymptomChecker();
            } else if (action === 'doctor') {
                this.showDoctorConnect();
            } else if (action === 'back') {
                this.showMainMenu();
            } else if (action === 'faq-item' && faqId) {
                this.showFAQAnswer(parseInt(faqId));
            }
        }

        // Form submission
        if (target.id === 'symptom-submit-btn') {
            this.handleSymptomSubmit();
        }

        if (target.id === 'doctor-submit-btn') {
            this.handleDoctorSubmit();
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

        this.addBotMessage(`
            <p style="margin-bottom: 0.75rem;">👋 Hello! I'm your Health Assistant. How can I help you today?</p>
            <div class="chatbot-options">
                <button class="chatbot-option-btn" data-action="faq">
                    📋 Frequently Asked Questions
                </button>
                <button class="chatbot-option-btn" data-action="symptom">
                    🩺 Check My Symptoms
                </button>
                <button class="chatbot-option-btn" data-action="doctor">
                    👨‍⚕️ Connect with a Doctor
                </button>
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
    // VIEW: SYMPTOM CHECKER
    // =========================================================================

    /**
     * Show symptom checker form
     */
    showSymptomChecker() {
        this.currentView = 'symptom';
        this.clearMessages();

        this.addBotMessage(`
            <p style="margin-bottom: 0.75rem;">🩺 <strong>Symptom Checker</strong></p>
            <p style="margin-bottom: 1rem; font-size: 0.85rem; color: #666;">
                Describe your symptoms and I'll provide general guidance. 
                <em>This is not a substitute for professional medical advice.</em>
            </p>
            <div style="background: #f8fafc; border-radius: 0.5rem; padding: 1rem;">
                <textarea 
                    id="symptom-input" 
                    placeholder="Example: I have had a headache and mild fever for 2 days..."
                    style="width: 100%; min-height: 80px; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.75rem; font-size: 0.9rem; resize: none; font-family: inherit;"
                ></textarea>
                <button 
                    id="symptom-submit-btn"
                    style="width: 100%; margin-top: 0.75rem; padding: 0.75rem; background: #86efac; color: #1a202c; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;"
                >
                    Analyze Symptoms
                </button>
            </div>
            <div class="chatbot-options" style="margin-top: 0.75rem;">
                <button class="chatbot-option-btn" data-action="back" style="border-color: #ccc; color: #666;">
                    ← Back to Menu
                </button>
            </div>
        `);
    }

    /**
     * Handle symptom form submission
     * @private
     */
    async handleSymptomSubmit() {
        const input = this.messagesEl.querySelector('#symptom-input');
        const symptoms = input?.value?.trim();

        if (!symptoms) {
            this.addBotMessage(`<p style="color: #ef4444;">Please describe your symptoms.</p>`);
            return;
        }

        this.addUserMessage(symptoms);

        // Show loading
        this.addBotMessage(`
            <p style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="material-icons-outlined" style="animation: spin 1s linear infinite;">sync</span>
                Analyzing your symptoms...
            </p>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        `);

        // Get analysis
        try {
            const result = await analyzeSymptoms(symptoms);
            this.showSymptomResult(result);
        } catch (error) {
            console.error('[Chatbot] Symptom analysis error:', error);
            this.addBotMessage(`<p style="color: #ef4444;">Sorry, I couldn't analyze your symptoms. Please try again.</p>`);
        }
    }

    /**
     * Show symptom analysis result
     * @private
     * @param {Object} result - Analysis result
     */
    showSymptomResult(result) {
        // Remove loading message
        const messages = this.messagesEl.querySelectorAll('.message.bot');
        if (messages.length > 0) {
            messages[messages.length - 1].remove();
        }

        // Severity color
        const severityColors = {
            mild: '#22c55e',
            moderate: '#f59e0b',
            severe: '#ef4444',
            unknown: '#6b7280'
        };
        const severityColor = severityColors[result.severity] || severityColors.unknown;

        // Format remedies
        const remediesHtml = result.remedies.map(r => `<li>${r}</li>`).join('');

        // Format warning signs
        const warningsHtml = result.warningSigns?.length
            ? result.warningSigns.map(w => `<li>${w}</li>`).join('')
            : '<li>Symptoms worsening significantly</li>';

        this.addBotMessage(`
            <div style="space-y: 1rem;">
                <!-- Possible Condition -->
                <div style="background: #f0fdf4; border-left: 4px solid ${severityColor}; padding: 0.75rem; border-radius: 0.25rem; margin-bottom: 1rem;">
                    <p style="font-weight: 600; margin-bottom: 0.25rem;">Possible Condition:</p>
                    <p style="font-size: 1.1rem; color: #166534;">${result.possibleCondition}</p>
                    <span style="display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: ${severityColor}20; color: ${severityColor}; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
                        ${result.severity} severity
                    </span>
                </div>
                
                <!-- Home Remedies -->
                <div style="margin-bottom: 1rem;">
                    <p style="font-weight: 600; margin-bottom: 0.5rem;">🏠 Suggested Remedies:</p>
                    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.6;">
                        ${remediesHtml}
                    </ul>
                </div>
                
                <!-- Warning Signs -->
                <div style="background: #fef2f2; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <p style="font-weight: 600; color: #dc2626; margin-bottom: 0.5rem;">⚠️ Seek Medical Help If:</p>
                    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.85rem; color: #7f1d1d;">
                        ${warningsHtml}
                    </ul>
                </div>
                
                <!-- Recommendation -->
                <div style="background: #eff6ff; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.75rem;">
                    <p style="font-size: 0.9rem; color: #1e40af;">
                        💡 ${result.recommendation}
                    </p>
                </div>
                
                <!-- Disclaimer -->
                <p style="font-size: 0.75rem; color: #6b7280; font-style: italic;">
                    ${result.disclaimer}
                </p>
            </div>
            
            <div class="chatbot-options" style="margin-top: 1rem;">
                <button class="chatbot-option-btn" data-action="doctor">
                    👨‍⚕️ Connect with Doctor
                </button>
                <button class="chatbot-option-btn" data-action="symptom">
                    Check Other Symptoms
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
     * Show doctor connect form
     */
    showDoctorConnect() {
        this.currentView = 'doctor';
        this.clearMessages();

        this.addBotMessage(`
            <p style="margin-bottom: 0.75rem;">👨‍⚕️ <strong>Connect with a Doctor</strong></p>
            <p style="margin-bottom: 1rem; font-size: 0.85rem; color: #666;">
                Fill in your details and a healthcare professional will contact you.
            </p>
            <div style="background: #f8fafc; border-radius: 0.5rem; padding: 1rem;">
                <div style="margin-bottom: 0.75rem;">
                    <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.25rem;">Full Name *</label>
                    <input type="text" id="doctor-name" placeholder="Enter your name" 
                        style="width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.9rem;">
                </div>
                <div style="margin-bottom: 0.75rem;">
                    <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.25rem;">Age *</label>
                    <input type="number" id="doctor-age" placeholder="Enter your age" min="1" max="120"
                        style="width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.9rem;">
                </div>
                <div style="margin-bottom: 0.75rem;">
                    <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.25rem;">Contact (Phone/Email) *</label>
                    <input type="text" id="doctor-contact" placeholder="Phone number or email" 
                        style="width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.9rem;">
                </div>
                <div style="margin-bottom: 0.75rem;">
                    <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.25rem;">Describe Your Symptoms *</label>
                    <textarea id="doctor-symptoms" placeholder="What symptoms are you experiencing?" rows="3"
                        style="width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.9rem; resize: none; font-family: inherit;"></textarea>
                </div>
                <button id="doctor-submit-btn"
                    style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
                    Submit Request
                </button>
            </div>
            <div class="chatbot-options" style="margin-top: 0.75rem;">
                <button class="chatbot-option-btn" data-action="back" style="border-color: #ccc; color: #666;">
                    ← Back to Menu
                </button>
            </div>
        `);
    }

    /**
     * Handle doctor connect form submission
     * @private
     */
    async handleDoctorSubmit() {
        const name = this.messagesEl.querySelector('#doctor-name')?.value?.trim();
        const age = this.messagesEl.querySelector('#doctor-age')?.value?.trim();
        const contact = this.messagesEl.querySelector('#doctor-contact')?.value?.trim();
        const symptoms = this.messagesEl.querySelector('#doctor-symptoms')?.value?.trim();

        // Validation
        if (!name || !age || !contact || !symptoms) {
            this.addBotMessage(`<p style="color: #ef4444;">Please fill in all required fields.</p>`);
            return;
        }

        // Store patient data
        this.patientData = { name, age, contact, symptoms };

        this.addUserMessage(`Request submitted:\nName: ${name}\nAge: ${age}\nContact: ${contact}`);

        // Show loading
        this.addBotMessage(`
            <p style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="material-icons-outlined" style="animation: spin 1s linear infinite;">sync</span>
                Processing your request...
            </p>
        `);

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Remove loading and show result
        const messages = this.messagesEl.querySelectorAll('.message.bot');
        if (messages.length > 0) {
            messages[messages.length - 1].remove();
        }

        // Also analyze symptoms for quick guidance
        let quickAnalysis = null;
        try {
            quickAnalysis = await analyzeSymptoms(symptoms);
        } catch (e) {
            console.error('[Chatbot] Quick analysis failed:', e);
        }

        this.addBotMessage(`
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                <p style="font-weight: 600; color: #166534; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="material-icons-outlined">check_circle</span>
                    Request Submitted Successfully!
                </p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #166534;">
                    Your request has been received. A healthcare professional will contact you at <strong>${contact}</strong> within 24-48 hours.
                </p>
            </div>
            
            ${quickAnalysis ? `
                <div style="background: #eff6ff; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <p style="font-weight: 600; margin-bottom: 0.5rem;">💡 While You Wait:</p>
                    <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">Based on your symptoms, this might be: <strong>${quickAnalysis.possibleCondition}</strong></p>
                    <p style="font-size: 0.85rem; color: #1e40af;">${quickAnalysis.recommendation}</p>
                </div>
            ` : ''}
            
            <p style="font-size: 0.85rem; color: #6b7280;">
                For emergencies, please call <strong>108</strong> or visit the nearest hospital.
            </p>
            
            <div class="chatbot-options" style="margin-top: 1rem;">
                <button class="chatbot-option-btn" data-action="back">
                    ← Back to Menu
                </button>
            </div>
        `);
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
