/**
 * @fileoverview Gemini API Configuration
 * Configuration and helper functions for Google Gemini AI integration.
 * Used for symptom analysis and health recommendations.
 * 
 * @module config/gemini-config
 * @author SwasthyaSetu Team
 * @version 1.0.0
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * @constant {Object} GEMINI_CONFIG
 * @description Configuration for Gemini API
 */
const GEMINI_CONFIG = {
    // Note: In production, use environment variables or secure key management
    // This is a placeholder - user should replace with their own API key
    API_KEY: 'YOUR_GEMINI_API_KEY',

    // API endpoint for Gemini Pro
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',

    // Fallback to local analysis if API unavailable
    USE_FALLBACK: true,

    // Maximum tokens for response
    MAX_TOKENS: 1024,

    // Temperature for response creativity (0-1)
    TEMPERATURE: 0.7
};

// =============================================================================
// SYMPTOM ANALYSIS
// =============================================================================

/**
 * Analyze symptoms using Gemini API or local fallback.
 * 
 * @async
 * @param {string} symptoms - Patient's described symptoms
 * @returns {Promise<Object>} Analysis result with diagnosis and remedies
 * 
 * @example
 * const result = await analyzeSymptoms('headache and fever for 2 days');
 * console.log(result.diagnosis);
 * console.log(result.remedies);
 */
async function analyzeSymptoms(symptoms) {
    // First try Gemini API
    if (GEMINI_CONFIG.API_KEY && GEMINI_CONFIG.API_KEY !== 'YOUR_GEMINI_API_KEY') {
        try {
            return await callGeminiAPI(symptoms);
        } catch (error) {
            console.error('[Gemini] API error, using fallback:', error);
        }
    }

    // Fallback to local symptom analysis
    return localSymptomAnalysis(symptoms);
}

/**
 * Call Gemini API for symptom analysis.
 * 
 * @async
 * @private
 * @param {string} symptoms - Patient's symptoms
 * @returns {Promise<Object>} Gemini response
 */
async function callGeminiAPI(symptoms) {
    const prompt = `You are a helpful medical assistant. A patient describes these symptoms: "${symptoms}"

Please provide:
1. A possible condition this might be (focus on common, mild conditions like cold, headache, allergies)
2. 3-4 home remedies they can try
3. Warning signs that would require immediate medical attention
4. A gentle recommendation to consult a doctor

IMPORTANT: Always include a disclaimer that this is not medical advice and they should consult a healthcare professional.

Format your response as JSON:
{
    "possibleCondition": "...",
    "severity": "mild|moderate|severe",
    "remedies": ["remedy1", "remedy2", "remedy3"],
    "warningSigns": ["sign1", "sign2"],
    "recommendation": "...",
    "disclaimer": "..."
}`;

    const response = await fetch(`${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: GEMINI_CONFIG.TEMPERATURE,
                maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Try to parse JSON from response
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('[Gemini] Failed to parse JSON response');
    }

    // Return text response if JSON parsing fails
    return {
        possibleCondition: 'Unable to determine',
        severity: 'unknown',
        remedies: ['Please consult a doctor for proper diagnosis'],
        warningSigns: [],
        recommendation: text,
        disclaimer: 'This is not medical advice. Please consult a healthcare professional.'
    };
}

/**
 * Local symptom analysis fallback.
 * Pattern-matches common symptoms to provide basic guidance.
 * 
 * @private
 * @param {string} symptoms - Patient's symptoms (lowercase)
 * @returns {Object} Analysis result
 */
function localSymptomAnalysis(symptoms) {
    const symptomLower = symptoms.toLowerCase();

    // Common symptom patterns
    const patterns = [
        {
            keywords: ['headache', 'head pain', 'migraine'],
            condition: 'Tension Headache / Migraine',
            severity: 'mild',
            remedies: [
                'Rest in a quiet, dark room',
                'Apply cold or warm compress to forehead',
                'Stay hydrated - drink plenty of water',
                'Take over-the-counter pain relief (paracetamol)',
                'Practice deep breathing or meditation'
            ],
            warningSigns: [
                'Sudden, severe headache (worst of your life)',
                'Headache with fever and stiff neck',
                'Vision changes or confusion',
                'Headache after head injury'
            ]
        },
        {
            keywords: ['cold', 'runny nose', 'sneezing', 'congestion', 'stuffy'],
            condition: 'Common Cold',
            severity: 'mild',
            remedies: [
                'Get plenty of rest',
                'Drink warm fluids (soup, tea, water)',
                'Use saline nasal drops',
                'Gargle with warm salt water',
                'Steam inhalation for congestion'
            ],
            warningSigns: [
                'High fever (above 103°F/39.4°C)',
                'Symptoms lasting more than 10 days',
                'Difficulty breathing',
                'Severe sinus pain'
            ]
        },
        {
            keywords: ['cough', 'throat', 'sore throat'],
            condition: 'Upper Respiratory Infection / Sore Throat',
            severity: 'mild',
            remedies: [
                'Drink warm honey-lemon water',
                'Gargle with salt water 3-4 times daily',
                'Use throat lozenges',
                'Stay hydrated',
                'Rest your voice'
            ],
            warningSigns: [
                'Difficulty swallowing or breathing',
                'Blood in saliva or phlegm',
                'Fever lasting more than 3 days',
                'Severe throat swelling'
            ]
        },
        {
            keywords: ['fever', 'temperature', 'chills'],
            condition: 'Viral Fever',
            severity: 'mild',
            remedies: [
                'Take paracetamol for fever',
                'Rest completely',
                'Stay well hydrated',
                'Use a cool damp cloth on forehead',
                'Wear light, comfortable clothing'
            ],
            warningSigns: [
                'Fever above 104°F (40°C)',
                'Fever lasting more than 3 days',
                'Rash appearing with fever',
                'Severe headache or neck stiffness',
                'Confusion or unusual behavior'
            ]
        },
        {
            keywords: ['stomach', 'nausea', 'vomiting', 'diarrhea', 'upset stomach'],
            condition: 'Stomach Upset / Gastroenteritis',
            severity: 'mild',
            remedies: [
                'Stay hydrated with ORS or clear fluids',
                'Eat bland foods (rice, toast, bananas)',
                'Avoid dairy, spicy, and fatty foods',
                'Rest your stomach - eat small portions',
                'Ginger tea can help with nausea'
            ],
            warningSigns: [
                'Blood in vomit or stool',
                'Signs of dehydration (dark urine, dizziness)',
                'Severe abdominal pain',
                'Vomiting lasting more than 24 hours'
            ]
        },
        {
            keywords: ['allergy', 'allergic', 'itching', 'rash', 'hives'],
            condition: 'Allergic Reaction',
            severity: 'mild',
            remedies: [
                'Take antihistamine medication',
                'Apply cool compress to itchy areas',
                'Avoid scratching',
                'Identify and avoid the allergen',
                'Use calamine lotion for skin relief'
            ],
            warningSigns: [
                'Difficulty breathing',
                'Swelling of face, lips, or tongue',
                'Dizziness or fainting',
                'Rapid heartbeat'
            ]
        },
        {
            keywords: ['tired', 'fatigue', 'exhausted', 'weakness', 'no energy'],
            condition: 'General Fatigue',
            severity: 'mild',
            remedies: [
                'Ensure 7-8 hours of quality sleep',
                'Stay hydrated throughout the day',
                'Eat balanced, nutritious meals',
                'Take short breaks during work',
                'Light exercise like walking'
            ],
            warningSigns: [
                'Unexplained weight loss',
                'Persistent fatigue for weeks',
                'Shortness of breath',
                'Chest pain'
            ]
        },
        {
            keywords: ['stress', 'anxiety', 'worried', 'tense', 'nervous'],
            condition: 'Stress / Anxiety',
            severity: 'mild',
            remedies: [
                'Practice deep breathing exercises',
                'Try meditation or yoga',
                'Get regular physical exercise',
                'Maintain a regular sleep schedule',
                'Talk to friends or family'
            ],
            warningSigns: [
                'Thoughts of self-harm',
                'Panic attacks',
                'Unable to perform daily activities',
                'Symptoms affecting work/relationships'
            ]
        }
    ];

    // Find matching pattern
    for (const pattern of patterns) {
        if (pattern.keywords.some(keyword => symptomLower.includes(keyword))) {
            return {
                possibleCondition: pattern.condition,
                severity: pattern.severity,
                remedies: pattern.remedies,
                warningSigns: pattern.warningSigns,
                recommendation: 'If symptoms persist for more than 2-3 days or worsen, please consult a doctor.',
                disclaimer: '⚠️ This is not medical advice. This is a general guidance system. Please consult a qualified healthcare professional for proper diagnosis and treatment.'
            };
        }
    }

    // Default response if no pattern matches
    return {
        possibleCondition: 'Unable to determine specific condition',
        severity: 'unknown',
        remedies: [
            'Monitor your symptoms',
            'Get adequate rest',
            'Stay hydrated',
            'Maintain a healthy diet'
        ],
        warningSigns: [
            'Symptoms getting worse',
            'High fever',
            'Difficulty breathing',
            'Severe pain'
        ],
        recommendation: 'Since I cannot identify your specific condition, I recommend consulting a doctor for proper evaluation.',
        disclaimer: '⚠️ This is not medical advice. Please consult a qualified healthcare professional for proper diagnosis and treatment.'
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GEMINI_CONFIG, analyzeSymptoms, localSymptomAnalysis };
}
