try{
    $allureVersion = allure --version
}
catch {
 Write-Host  "Install allure reports for windows"
 Write-Host Here is the link to konow more about allure https://docs.qameta.io/allure/
 exit
}

allure generate --clean
allure open allure-report