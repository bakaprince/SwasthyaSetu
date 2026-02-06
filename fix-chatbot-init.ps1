# Fix Chatbot Initialization on All Pages
# Removes defer and adds proper initialization

$pages = @(
    "hospitals.html",
    "appointments.html",
    "profile.html",
    "records.html",
    "book-appointment.html",
    "telemedicine.html",
    "resources.html"
)

$basePath = "c:\Users\Abhishek Chaudhary\Downloads\project\SwasthyaSetu\pages"

foreach ($page in $pages) {
    $file = Join-Path $basePath $page
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Replace defer attributes
        $content = $content -replace 'src="\.\./js/config/gemini-config\.js" defer', 'src="../js/config/gemini-config.js"'
        $content = $content -replace 'src="\.\./js/services/chatbot-context\.js" defer', 'src="../js/services/chatbot-context.js"'
        $content = $content -replace 'src="\.\./js/components/chatbot\.js" defer', 'src="../js/components/chatbot.js"'
        
        # Replace initialization code
        $oldInit = @'
        // Initialize chatbot after page load
        document.addEventListener('DOMContentLoaded', () => {
            window.chatbotInstance = new Chatbot();
        });
'@

        $newInit = @'
        // Initialize chatbot after all scripts load
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (typeof Chatbot !== 'undefined') {
                    window.chatbotInstance = new Chatbot();
                    console.log('Chatbot initialized successfully');
                } else {
                    console.error('Chatbot class not found');
                }
            }, 500);
        });
'@
        
        $content = $content -replace [regex]::Escape($oldInit), $newInit
        
        $content | Set-Content $file -NoNewline -Encoding UTF8
        Write-Host "✅ Fixed $page"
    }
}

Write-Host "`n🎉 All pages updated!"
