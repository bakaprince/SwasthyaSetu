# Add Chatbot to All Patient Pages
# This script adds the chatbot CSS and JavaScript to all patient-facing pages

$patientPages = @(
    "appointments.html",
    "book-appointment.html",
    "hospitals.html",
    "profile.html",
    "records.html",
    "resources.html",
    "telemedicine.html"
)

$cssToAdd = '    <link rel="stylesheet" href="../css/components/chatbot.css">'

$scriptsToAdd = @'

    <!-- Chatbot Scripts -->
    <script src="../js/config/gemini-config.js" defer></script>
    <script src="../js/services/chatbot-context.js" defer></script>
    <script src="../js/components/chatbot.js" defer></script>
    <script>
        // Initialize chatbot after page load
        document.addEventListener('DOMContentLoaded', () => {
            window.chatbotInstance = new Chatbot();
        });
    </script>
'@

foreach ($page in $patientPages) {
    $filePath = "c:\Users\Abhishek Chaudhary\Downloads\project\SwasthyaSetu\pages\$page"
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Add CSS if not already present
        if ($content -notmatch "chatbot\.css") {
            $content = $content -replace '(<link rel="stylesheet" href="\.\./css/main\.css">)', "`$1`n$cssToAdd"
        }
        
        # Add scripts if not already present
        if ($content -notmatch "chatbot\.js") {
            $content = $content -replace '(</body>)', "$scriptsToAdd`n`$1"
        }
        
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "✅ Added chatbot to $page"
    } else {
        Write-Host "❌ File not found: $page"
    }
}

Write-Host "`n🎉 Chatbot added to all patient pages!"
