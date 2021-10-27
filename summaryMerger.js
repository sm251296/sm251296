var fs = require('fs'),
  _ = require('lodash');

module.exports = {
  merge: function index() {
    const baseDirectory = './newman/';

    var matchedFiles = fs.readdirSync('.\\newman')
      .filter(fn => fn.endsWith('.json'));

    if (matchedFiles.length === 0) {
      return;
    }

    var totalRequests = {};
    var totalAssertions = {};
    var failures = [];

    _.forEach(matchedFiles, function(item) {
      var fileContent = fs.readFileSync((baseDirectory + item), 'utf8');
      var contentJson = JSON.parse(fileContent);
      totalRequests = addStats(totalRequests, contentJson.Run.Stats.Requests);
      totalAssertions = addStats(totalAssertions, contentJson.Run.Stats.Assertions);
      failures = _.concat(failures, contentJson.Run.Failures);
    });

    var consolidatedResult = {
      Run: {
        Stats: {
          Assertions: totalAssertions,
          Requests: totalRequests
        },
        Failures: failures
      }
    };

    fs.writeFileSync((baseDirectory + 'Result.json'),
      JSON.stringify(consolidatedResult),
      function(err) {
        if (err) throw err;
      });

    function addStats(totalStats, statsToAdd) {
      if (_.isEmpty(totalStats)) {
        totalStats.total = 0;
        totalStats.pending = 0;
        totalStats.failed = 0;
      }
      if (_.isEmpty(statsToAdd)) {
        return totalStats;
      }
      totalStats.total += statsToAdd.total;
      totalStats.failed += statsToAdd.failed;
      totalStats.pending += statsToAdd.pending;
      return totalStats;
    }
  }
}