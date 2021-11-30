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

#Get-ChildItem ./allure-report/*.* -Recurse | Remove-Item
#Get-ChildItem ./allure-results/*.* -Recurse | Remove-Item

Write-Host "Current Execution Environment ++++++++ $env  ++++++++"
Get-Date

node newman-run.js "./NydigProvider-MarketData.postman_collection.json" "./NCR.postman_globals.json" "./NydigProvider_$env.postman_environment.json"
node newman-run.js "./NydigProvider-Users.postman_collection.json" "./NCR.postman_globals.json" "./NydigProvider_$env.postman_environment.json" false
node newman-run.js "./NydigProvider-Accounts.postman_collection.json" "./NCR.postman_globals.json" "./NydigProvider_$env.postman_environment.json" false
node newman-run.js "./NydigProvider-Orders.postman_collection.json" "./NCR.postman_globals.json" "./NydigProvider_$env.postman_environment.json" false

#Copy-Item -Path './allure-report/history' -Destination './allure-results/history' -recurse -Force
#allure generate './allure-results/' -o './allure-report/' --clean
#allure open './allure-report/'

allure generate
allure open allure-report