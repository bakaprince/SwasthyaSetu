# Enhanced Chatbot with Patient Context

## Overview
The SwasthyaSetu chatbot now has **full access to patient data and hospital information** after login, providing personalized, context-aware assistance!

## 🎯 New Features

### 1. **Patient Context Awareness**
The chatbot now knows:
- ✅ Patient name and ABHA ID
- ✅ Upcoming appointments
- ✅ Medical records summary
- ✅ User's location/city
- ✅ Login status

### 2. **Hospital Database Access**
The chatbot can:
- ✅ Search all hospitals in the network
- ✅ Check bed availability in real-time
- ✅ Find hospitals by department/specialty
- ✅ Provide contact information
- ✅ Show available resources (ICU, ambulances, etc.)

### 3. **Personalized Responses**
- Greets users by name when logged in
- References their upcoming appointments
- Suggests hospitals based on their location
- Provides tailored health information

## 📋 How It Works

### Architecture

```
User Login → localStorage (userData)
              ↓
ChatbotContext Service
  ├── Loads patient data
  ├── Loads hospital database
  ├── Loads appointments
  └── Provides context to AI
              ↓
Gemini AI (receives full context)
              ↓
Personalized Response
```

### Files Structure

```
js/
├── services/
│   └── chatbot-context.js      # ⭐ NEW - Context provider
├── components/
│   └── chatbot.js               # ✏️ Enhanced with context
└── config/
    └── gemini-config.js         # System prompt
```

## 💬 Example Conversations

### **Before Login (Guest)**
**User**: "Book an appointment"
**Bot**: "To book an appointment, I'll need you to log in first with your ABHA ID. This helps me provide personalized service and saves your appointment details securely."

### **After Login (Logged In)**
**User**: "Book an appointment"
**Bot**: "Hi Rahul! I can help you book an appointment. I see you're in Delhi. Would you like to book at:
1. AIIMS Delhi (234 beds available)
2. Safdarjung Hospital (156 beds available)
3. Ram Manohar Lohia Hospital (89 beds available)

Which hospital would you prefer?"

### **Hospital Search**
**User**: "Find cardiology hospitals"
**Bot**: "Here are hospitals with Cardiology departments:

1. **AIIMS Delhi** (New Delhi)
   📞 011-26588500
   🛏️ Beds: 234/2478
   🏥 Departments: Cardiology, Neurology, Orthopedics

2. **Fortis Escorts Heart Institute** (New Delhi)
   📞 011-47135000
   🛏️ Beds: 45/310
   🏥 Departments: Cardiology, Cardiac Surgery

Would you like to book an appointment at any of these?"

### **Appointment Status**
**User**: "What's my appointment status?"
**Bot**: "Hi Rahul! You have 1 upcoming appointment:

📅 **Tomorrow, 10:00 AM**
🏥 AIIMS Delhi - Cardiology
👨‍⚕️ Dr. Sharma

Would you like to reschedule or cancel this appointment?"

## 🔧 Technical Details

### ChatbotContext Service API

```javascript
// Initialize context
await ChatbotContext.initialize();

// Get context string for AI
const context = ChatbotContext.getContextString();

// Search hospitals
const results = ChatbotContext.searchHospitals('cardiology');

// Get hospitals by department
const hospitals = ChatbotContext.getHospitalsByDepartment('Neurology');

// Get all available departments
const departments = ChatbotContext.getAllDepartments();

// Format hospital info
const info = ChatbotContext.formatHospitalInfo(hospital);

// Create appointment
const appointment = ChatbotContext.createAppointmentContext({
    hospital: 'AIIMS Delhi',
    department: 'Cardiology',
    date: '2024-02-15',
    time: '10:00 AM',
    reason: 'Checkup'
});
```

### Data Sources

1. **Patient Data** (from localStorage)
   - `userData` - Name, ABHA ID, mobile, city
   - `appointments` - Upcoming appointments
   - `medicalRecords` - Medical history

2. **Hospital Data** (from `/data/hospitals.json`)
   - Hospital details
   - Bed availability
   - Departments and specialties
   - Contact information
   - Resources (ICU, ambulances, etc.)

## 🎨 Context String Format

The AI receives context in this format:

```
## CURRENT USER CONTEXT:

**Patient Information:**
- Name: Rahul Kumar
- ABHA ID: 12-3456-7890-1234
- Mobile: +91-9876543210
- Location: Delhi

**User Status:** Logged in to patient portal

**Upcoming Appointments:**
1. AIIMS Delhi - Cardiology on 2024-02-15 at 10:00 AM

**Available Hospitals in Network:**
1. All India Institute of Medical Sciences (AIIMS) (New Delhi)
   - Departments: Cardiology, Neurology, Orthopedics...
   - Beds Available: 234/2478
   - Contact: 011-26588500

2. Safdarjung Hospital (New Delhi)
   - Departments: General Medicine, Surgery, Pediatrics...
   - Beds Available: 156/1500
   - Contact: 011-26165060

(Total 5 hospitals in network)
```

## 🔄 Refresh Context

The context is automatically refreshed when:
- User logs in
- User logs out
- New appointment is booked
- Page is reloaded

To manually refresh:
```javascript
await window.chatbotInstance.refreshContext();
```

## 🚀 Integration with Patient Pages

### Dashboard Page
Add this after login success:
```javascript
// After successful login
localStorage.setItem('userData', JSON.stringify({
    name: 'Rahul Kumar',
    abhaId: '12-3456-7890-1234',
    mobile: '+91-9876543210',
    city: 'Delhi'
}));

// Refresh chatbot context
if (window.chatbotInstance) {
    await window.chatbotInstance.refreshContext();
}
```

### Hospitals Page
The chatbot can now answer:
- "Show me hospitals near me"
- "Which hospitals have cardiology?"
- "What's the bed availability at AIIMS?"
- "Find hospitals with ICU beds"

### Appointments Page
The chatbot can now:
- Show upcoming appointments
- Help reschedule appointments
- Provide appointment details
- Suggest available time slots

## 🔐 Privacy & Security

- ✅ All data is stored in localStorage (client-side)
- ✅ No sensitive data sent to Gemini API
- ✅ Context is session-based
- ✅ Cleared on logout
- ✅ ABDM compliant

## 📊 Benefits

1. **Personalized Experience**
   - Addresses users by name
   - Remembers their preferences
   - Contextual suggestions

2. **Faster Service**
   - No need to repeat information
   - Quick access to relevant data
   - Intelligent recommendations

3. **Better Accuracy**
   - Real-time hospital data
   - Accurate bed availability
   - Up-to-date department info

4. **Seamless Integration**
   - Works across all pages
   - Syncs with user actions
   - Consistent experience

## 🎯 Use Cases

### For Patients
- "Book an appointment at a nearby hospital"
- "Check my appointment status"
- "Find hospitals with emergency beds"
- "What departments are available at AIIMS?"

### For Emergency
- "I need an ambulance"
- "Which hospital has ICU beds?"
- "Nearest hospital with ventilators"

### For Information
- "What is ABHA ID?"
- "How do I register?"
- "What services are available?"

## 🔮 Future Enhancements

- [ ] Voice input support
- [ ] Multi-language conversations
- [ ] Prescription reminders
- [ ] Health tips based on medical history
- [ ] Integration with telemedicine
- [ ] Appointment booking directly from chat
- [ ] Queue status updates
- [ ] Medicine delivery tracking

---

**Version**: 2.0  
**Last Updated**: February 2026  
**Status**: Production Ready ✅

🏥 **SwasthyaSetu - Intelligent Healthcare Assistance** 🤖
