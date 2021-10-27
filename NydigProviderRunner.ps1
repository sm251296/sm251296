<#

.SYNOPSIS
	The script run the postman collection and move files into the data folder.

.DESCRIPTION
	This Script is used to run collection and move files for local setup.
	Deletes the old file before replacing.
    If no parameter is supplied default value is 'QA'

.PARAMETER product
    product name for deployment
	
.NOTES
	./Local_Setup.ps1 	-env "QA"

	Version:        1.0
	Author:         Satish Muraharisetti
	Creation Date:  10/18/2021
	Purpose/Change: Initial script development	
#>

param([string] $env)

if (!$env){
    $env= 'QA'
}

cls

Write-Host "Current Execution Environment ++++++++ $env  ++++++++"
Get-Date

#cleanup previous results file
Get-ChildItem "newman\*.*" | Remove-Item

#node newman-run.js "./NydigProvider.postman_collection.json" "./NCR.postman_globals.json" "./NydigProvider_$env.postman_environment.json"

node newman-run.js "./NydigProvider-MarketData.postman_collection.json" "./NCR.postman_globals.json" "./NydigProvider_$env.postman_environment.json"
#node newman-run.js "./NydigProvider-.postman_collection.json" "./NCR.postman_globals.json" "./NydigProvider_$env.postman_environment.json"
node newman-run.js "./NydigProvider-Users.postman_collection.json" "./NCR.postman_globals.json" "./NydigProvider_$env.postman_environment.json"
#node newman-run.js "./NydigProvider-Users.postman_collection.json" "./NCR.postman_globals.json" "./NydigProvider_$env.postman_environment.json"

#Copy-Item -Path './allure-report/history' -Destination './allure-results/history' -recurse -Force
#allure generate './allure-results/' -o './allure-report/' --clean
#allure open './allure-report/'

allure generate
allure open allure-report