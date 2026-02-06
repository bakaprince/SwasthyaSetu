# Quick Add Chatbot Script
# Adds chatbot to remaining patient pages

$pages = @("profile.html", "records.html", "book-appointment.html", "telemedicine.html", "resources.html")
$basePath = "c:\Users\Abhishek Chaudhary\Downloads\project\SwasthyaSetu\pages"

$cssLine = '    <link rel="stylesheet" href="../css/components/chatbot.css">'
$jsBlock = @'

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

foreach ($page in $pages) {
    $file = Join-Path $basePath $page
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Add CSS if not present
        if ($content -notmatch "chatbot\.css") {
            $content = $content -replace '(</head>)', "$cssLine`r`n`$1"
            Write-Host "Added CSS to $page"
        }
        
        # Add JS if not present
        if ($content -notmatch "chatbot\.js") {
            $content = $content -replace '(</body>)', "$jsBlock`r`n`$1"
            Write-Host "Added JS to $page"
        }
        
        $content | Set-Content $file -NoNewline -Encoding UTF8
        Write-Host "✅ Updated $page"
    }
}

Write-Host "`n🎉 Done!"
