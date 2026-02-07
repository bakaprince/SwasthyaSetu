/**
 * @fileoverview Gemini API Configuration for Symptom Analysis
 * Provides AI-powered symptom analysis with local fallback.
 * 
 * @module config/gemini-config
 * @author SwasthyaSetu Team
 * @version 2.0.0
 */

// =============================================================================
// API CONFIGURATION
// =============================================================================

/**
 * Gemini API Configuration
 * Replace API_KEY with your actual key to enable AI features
 */
const GEMINI_CONFIG = {
    API_KEY: '', // Add your Gemini API key here
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    MAX_TOKENS: 500,
    TEMPERATURE: 0.7
};

// =============================================================================
// MILD CONDITIONS DATABASE
// Only common, mild conditions - no serious diseases
// =============================================================================

/**
 * Database of mild health conditions with remedies
 * Intentionally excludes serious conditions
 * @private
 */
const MILD_CONDITIONS = {
    headache: {
        keywords: ['headache', 'head pain', 'head hurts', 'head ache', 'head is paining'],
        condition: 'Tension Headache',
        severity: 'mild',
        remedies: [
            'Rest in a quiet, dark room',
            'Apply a cold or warm compress to your forehead',
            'Stay hydrated - drink plenty of water',
            'Gentle neck and shoulder stretches',
            'Take a break from screens'
        ],
        warningSigns: [
            'Headache persists for more than 2 days'
        ],
        recommendation: 'Most headaches go away with rest. If it continues, consult a doctor.'
    },

    cold: {
        keywords: ['cold', 'runny nose', 'sneezing', 'blocked nose', 'stuffy nose', 'nasal congestion', 'cough', 'common cold'],
        condition: 'Common Cold',
        severity: 'mild',
        remedies: [
            'Get plenty of rest and sleep',
            'Drink warm fluids like soup or tea with honey',
            'Use steam inhalation to clear congestion',
            'Gargle with warm salt water',
            'Keep yourself warm and comfortable'
        ],
        warningSigns: [
            'Symptoms last more than 10 days'
        ],
        recommendation: 'A cold usually clears up in 7-10 days. Stay warm and rest well.'
    },

    soreThroat: {
        keywords: ['sore throat', 'throat pain', 'throat hurts', 'difficulty swallowing', 'scratchy throat', 'throat irritation'],
        condition: 'Sore Throat',
        severity: 'mild',
        remedies: [
            'Gargle with warm salt water (3-4 times daily)',
            'Drink warm water with honey and lemon',
            'Suck on lozenges or hard candy',
            'Avoid cold drinks and ice cream',
            'Rest your voice as much as possible'
        ],
        warningSigns: [
            'Difficulty breathing or severe pain'
        ],
        recommendation: 'Sore throats usually heal within a week. Warm fluids help a lot.'
    },

    fever: {
        keywords: ['fever', 'temperature', 'hot body', 'feeling hot', 'chills', 'body temperature high'],
        condition: 'Mild Fever',
        severity: 'mild',
        remedies: [
            'Rest and avoid physical exertion',
            'Drink plenty of fluids to stay hydrated',
            'Take a lukewarm sponge bath',
            'Wear light, comfortable clothing',
            'Keep the room well ventilated'
        ],
        warningSigns: [
            'Fever above 103°F (39.4°C) or lasting more than 3 days'
        ],
        recommendation: 'Mild fever often resolves on its own. Stay hydrated and rest.'
    },

    stomachUpset: {
        keywords: ['stomach pain', 'stomach ache', 'upset stomach', 'indigestion', 'acidity', 'gas', 'bloating', 'nausea', 'vomiting'],
        condition: 'Stomach Upset',
        severity: 'mild',
        remedies: [
            'Eat light, bland foods (rice, toast, bananas)',
            'Drink ginger tea or jeera water',
            'Avoid spicy, oily, and heavy foods',
            'Take small sips of water frequently',
            'Rest and avoid lying down right after eating'
        ],
        warningSigns: [
            'Severe pain or blood in vomit/stool'
        ],
        recommendation: 'Stomach issues usually settle with light food and rest.'
    },

    tiredness: {
        keywords: ['tired', 'fatigue', 'exhausted', 'no energy', 'weakness', 'feeling weak', 'lethargy', 'drowsy'],
        condition: 'General Fatigue',
        severity: 'mild',
        remedies: [
            'Get 7-8 hours of quality sleep',
            'Stay hydrated throughout the day',
            'Eat nutritious, balanced meals',
            'Take short breaks during work',
            'Light exercise or a short walk can help'
        ],
        warningSigns: [
            'Fatigue persists for weeks despite rest'
        ],
        recommendation: 'Good sleep and nutrition usually help. Listen to your body.'
    },

    bodyPain: {
        keywords: ['body pain', 'muscle pain', 'body ache', 'muscles hurt', 'back pain', 'joint pain', 'pain all over'],
        condition: 'Muscle Aches',
        severity: 'mild',
        remedies: [
            'Rest the affected area',
            'Apply a warm compress or heating pad',
            'Gentle stretching exercises',
            'Take a warm bath with Epsom salt',
            'Gentle massage can provide relief'
        ],
        warningSigns: [
            'Severe pain or swelling that doesn\'t improve'
        ],
        recommendation: 'Rest and warmth usually help muscle pain. Avoid overexertion.'
    },

    stress: {
        keywords: ['stress', 'anxious', 'worried', 'tense', 'overwhelmed', 'cannot sleep', 'insomnia', 'nervous'],
        condition: 'Stress & Tension',
        severity: 'mild',
        remedies: [
            'Practice deep breathing exercises',
            'Take short walks in nature',
            'Limit caffeine and screen time before bed',
            'Talk to someone you trust',
            'Try relaxation or meditation apps'
        ],
        warningSigns: [
            'Feeling of hopelessness or persistent low mood'
        ],
        recommendation: 'Taking breaks and relaxation techniques help manage stress.'
    },

    skinIrritation: {
        keywords: ['itching', 'rash', 'skin', 'itchy', 'hives', 'skin irritation', 'red skin'],
        condition: 'Mild Skin Irritation',
        severity: 'mild',
        remedies: [
            'Keep the area clean and dry',
            'Apply a cold compress to reduce itching',
            'Wear loose, cotton clothing',
            'Avoid scratching the affected area',
            'Use mild, fragrance-free soap'
        ],
        warningSigns: [
            'Rash spreading rapidly or difficulty breathing'
        ],
        recommendation: 'Most mild rashes clear up on their own. Keep the skin clean.'
    },

    eyeStrain: {
        keywords: ['eye strain', 'eyes hurt', 'tired eyes', 'dry eyes', 'eye pain', 'blurry vision', 'screen fatigue'],
        condition: 'Digital Eye Strain',
        severity: 'mild',
        remedies: [
            'Follow the 20-20-20 rule (every 20 min, look 20 feet away for 20 sec)',
            'Blink frequently when using screens',
            'Adjust screen brightness and position',
            'Use artificial tears if eyes feel dry',
            'Take regular breaks from screens'
        ],
        warningSigns: [
            'Sudden vision changes or severe pain'
        ],
        recommendation: 'Regular screen breaks help. Consider an eye check-up if it persists.'
    }
};

// =============================================================================
// SYMPTOM ANALYSIS FUNCTION
// =============================================================================

/**
 * Analyze symptoms and provide guidance
 * Uses local analysis to avoid serious disease suggestions
 * 
 * @param {string} symptoms - User's symptom description
 * @returns {Promise<Object>} Analysis result with condition, remedies, etc.
 */
async function analyzeSymptoms(symptoms) {
    const symptomLower = symptoms.toLowerCase();

    // Try local analysis first (more controlled, avoids serious diseases)
    const localResult = analyzeLocally(symptomLower);

    if (localResult) {
        return localResult;
    }

    // If no match found locally, return a generic helpful response
    return {
        possibleCondition: 'General Discomfort',
        severity: 'mild',
        remedies: [
            'Get adequate rest and sleep',
            'Stay well hydrated',
            'Eat light, nutritious food',
            'Monitor your symptoms',
            'Take it easy for a day or two'
        ],
        warningSigns: [
            'Symptoms worsen or new symptoms appear'
        ],
        recommendation: 'If symptoms persist or worsen, please consult a healthcare professional.',
        disclaimer: 'This is general wellness guidance, not medical diagnosis. For accurate diagnosis, please visit a doctor.'
    };
}

/**
 * Analyze symptoms using local condition database
 * @private
 * @param {string} symptomLower - Lowercase symptom text
 * @returns {Object|null} Analysis result or null if no match
 */
function analyzeLocally(symptomLower) {
    // Find matching condition
    for (const [key, condition] of Object.entries(MILD_CONDITIONS)) {
        const hasMatch = condition.keywords.some(keyword =>
            symptomLower.includes(keyword)
        );

        if (hasMatch) {
            return {
                possibleCondition: condition.condition,
                severity: condition.severity,
                remedies: condition.remedies,
                warningSigns: condition.warningSigns,
                recommendation: condition.recommendation,
                disclaimer: 'This is general wellness guidance, not a medical diagnosis. For persistent issues, consult a doctor.'
            };
        }
    }

    return null;
}

// =============================================================================
// EXPORTS
// =============================================================================

// Make available globally
if (typeof window !== 'undefined') {
    window.analyzeSymptoms = analyzeSymptoms;
    window.GEMINI_CONFIG = GEMINI_CONFIG;
}

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { analyzeSymptoms, GEMINI_CONFIG };
}
