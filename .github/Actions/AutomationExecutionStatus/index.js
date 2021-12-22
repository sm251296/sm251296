const core = require('@actions/core');
const github = require('@actions/github');

try {
    var jsonInput = core.getInput('test-results-json');
    console.log("jsonInput ---------  " + jsonInput);
    var testResults = JSON.parse(jsonInput);
    console.log("testResults ========== " + testResults);

    if(testResults.Run.Stats.Assertions.failed > 0){
        core.setFailed("Number of tests failed : " + testResults.Run.Stats.Assertions.failed)
    }

    console.log("All tests passed!!");

} catch (error){
    core.setFailed(error);
}