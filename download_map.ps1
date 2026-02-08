$url = "https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson"
$output = "js/data/temp_india.geojson"
Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
Write-Host "Download complete"
