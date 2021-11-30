const request = require('request-promise');
const fs = require('fs');

(async function(){

    let projectName = process.argv[2];
    if (process.argv[2] === undefined) {        
        projectName = 'Unknown';
    }

    projectName = '*' + projectName + '*';

    const startMessage = process.argv[3];

    var resultsObj = undefined;
    var msgColor = 'danger';

    try{
        if(fs.existsSync('./newman/Result.json') && startMessage == undefined) {
            resultsObj = JSON.parse(fs.readFileSync('./newman/Result.json', 'utf8'));
            try{
                if(resultsObj.Run.Stats.Assertions.failed == 0){
                    msgColor = 'good';
                }
            }
            catch{
                    msgColor = 'warning';
            }
        }
    }
    catch(err){
        console.log('### Results file has not been created ./newman/Result.json ###');
    }

    try{
        var bodyTestResults;

        if(startMessage != undefined){
            bodyTestResults = {
                text : projectName + ' API Run Started'
            };
        }
        else{
            bodyTestResults = {
                mkdwn: true,
                text : projectName + ' API Run completed',
                attachments : [{
                    color: msgColor,
                    text : '\n ```Requests : ' +  JSON.stringify(resultsObj.Run.Stats.Requests) + '\nAssertions : ' + JSON.stringify(resultsObj.Run.Stats.Assertions) + '```'
                }]
            };            
        }

        const result = await request({
            //url: 'https://hooks.slack.com/services/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',
			//url: 'https://hooks.slack.com/services/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',
            method: 'POST',
            body: bodyTestResults,
            json: true,
        });
    }
    catch (ex){
        console.log('out error', ex);
    }
    //debugger;
})();