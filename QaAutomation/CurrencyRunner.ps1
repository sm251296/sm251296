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
	Creation Date:  10/08/2021
	Purpose/Change: Initial script development	
#>

param([string] $env)

if (!$env){
    $env= 'QA'
}

cls

Write-Host "Current Execution Environment ++++++++ $env  ++++++++"

Get-Date

Get-ChildItem "newman\*.*" | Remove-Item

node newman-run.js "./CryptoCurrency-Config.postman_collection.json" "./NCR.postman_globals.json" "./$env.postman_environment.json"
node newman-run.js "./CryptoCurrency-MarketData.postman_collection.json" "./NCR.postman_globals.json" "./$env.postman_environment.json" 
node newman-run.js "./CryptoCurrency-Users.postman_collection.json" "./NCR.postman_globals.json" "./$env.postman_environment.json" 
node newman-run.js "./CryptoCurrency-Accounts.postman_collection.json" "./NCR.postman_globals.json" "./$env.postman_environment.json" 
node newman-run.js "./CryptoCurrency-Orders.postman_collection.json" "./NCR.postman_globals.json" "./$env.postman_environment.json" 
node newman-run.js "./CryptoCurrency-Receipts.postman_collection.json" "./NCR.postman_globals.json" "./$env.postman_environment.json"

allure generate
allure open allure-report