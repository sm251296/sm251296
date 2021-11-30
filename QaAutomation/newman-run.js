const fs = require('fs'),
  sm = require('./summaryMerger.js'),
  newman = require('newman'),
  path = require('path'),
  _ = require('lodash');

var iterationData = [], // initialize empty array to run once
  fileNames = new Set(), // to keep list of files that are modified
  itrCount = "", // keep count of iteration
  i = 0,
  cleanFolder = true,
  collectionName;

if (process.argv[5] !== undefined) {
  cleanFolder = process.argv[5];
}

if (process.argv[6] !== undefined) {
  iterationData = require(process.argv[5]);
}

// To get the response content type
function getContentType(responseHeaders) {
  var matchContentTypeHeader = _.map(responseHeaders.header, function (item) {
    if (item.key.toLowerCase() === 'content-type') {
      return item;
    }
  });
  var contentTypeHeader = _.without(matchContentTypeHeader, undefined);
  var contentType = undefined;
  if (contentTypeHeader.length > 0) {
    contentType = contentTypeHeader[0].value;
  }
  return contentType;
}

//To get datetimestamp for foldername
function datetimestamp()
{
	var today = new Date();
	var sToday = (today.getMonth()+1).toString();
	sToday += today.getDate().toString();
	sToday += today.getYear().toString();
	sToday += today.getHours().toString();
	sToday += today.getMinutes().toString();
	sToday += today.getSeconds().toString();
	return sToday;
}

collectionName = process.argv[2].match(/(?<=.\/)(.*)(?=.postman_collection.json)/s)[0];

var resultsFolder = collectionName + "_Postman_RunResults_" + datetimestamp();
fs.mkdirSync(resultsFolder);

fs.access("./newman", function(error) {
  if (error) {
    console.log("### Created 'newman' results folder ###");
    fs.mkdirSync("newman");
  } else {
    if (cleanFolder === true) {
      console.log("### Cleaning 'newman' results folder ###");
      fs.readdir("newman", (err, files) => {
        if (err) throw err;

        for (const file of files) {
          fs.unlink(path.join("newman", file), err => {
            if (err) throw err;
          });
        }
      });
    }
  }
});

newman.run({
  collection: require(process.argv[2]),
  reporters: ['html', 'htmlextra', 'json-summary', 'allure'],
  reporter: {
        html: {
            export: './' + resultsFolder + '/' + collectionName + '_htmlResults.html'
		},
        htmlextra: {
            export: './' + resultsFolder + '/' + collectionName + '_htmlExtraResults.html'
		},
        'json-summary': {
            export: './newman/' + collectionName + '.json'
		}		
  },
  globals: require(process.argv[3]),
  environment: require(process.argv[4]),
  iterationData: iterationData,
}, function (err, summary) {
  // handle collection run err, process the run summary here
}).on('console', function (err, args) {
  var consoleMsg = "";
  args.messages.forEach(msg => consoleMsg = consoleMsg + msg + "\n");
  consoleMsg = consoleMsg + "-------------------------------\n"
  fs.appendFileSync('./newman/consoleLogger.log', consoleMsg, function (error) {
    if (error) {
      console.error(error);
    }
  });
}).on('start', function (err, args) { // on start of run, log to console
  console.log('\n\n### Running ' + collectionName + ' collection ###');
  fs.appendFileSync('./newman/consoleLogger.log',
    `*** ${process.argv[2]} console log *** \n\n`,
    function (error) {
      if (error) {
        console.error(error);
      }
    });
}).on('request', function (err, summary) {
  if (err) {
    return console.error(err);
  }
  // console.log(" =summary.item.name >>>>>>>>>>>> " + summary.item.name);
  if (summary.response.code !== 204) {
    var responseHeaders = JSON.parse(JSON.stringify(summary.response));
    var contentType = getContentType(responseHeaders);

    var responseBuffer = summary.response.stream;
    if (responseBuffer !== "") {
      if (contentType === 'application/json') {
        responseBuffer = JSON.stringify(JSON.parse(responseBuffer), null, 4)
      }
	  //console.log(summary);
	  // console.log(" -summary.item >>>>>>>>>>>> " + summary.item);
      // var responseFileName = './' + resultsFolder +'/' + `${summary.item.name.replace('/', "-")}_response.json`;
	  
	  var responseFileName;
	  if(summary.item.name === 'undefined' || summary.item.name == null){
		  responseFileName = datetimestamp() + '_response.json';
	  }
	  else {
		  responseFileName = `${summary.item.name.replace('/', "-")}_response.json`;
	  }
      responseFileName = './' + resultsFolder +'/' + responseFileName;
      fileNames.add(responseFileName);
      if (fs.existsSync(responseFileName)) {
        fs.appendFileSync(responseFileName, ',\n');
        fs.appendFileSync(responseFileName, responseBuffer);
      } else {
        fs.writeFile(responseFileName,
          responseBuffer,
          function (error) {
            if (error) {
              console.error(error);
            }
          });
      }
    }
  }
  
  var summaryFileName;
  if(summary.item.name === 'undefined' || summary.item.name == null){
    summaryFileName = datetimestamp() + '_summary.json';
  }
  else {
    summaryFileName = `${summary.item.name.replace('/', "-")}_summary.json`;
  }
	  
  summaryFileName = './' + resultsFolder +'/' + summaryFileName;
  fileNames.add(summaryFileName);
  if (fs.existsSync(summaryFileName)) {
    fs.appendFileSync(summaryFileName, ',\n');
    fs.appendFileSync(summaryFileName, JSON.stringify(summary, null, 4));
  } else {
    fs.writeFile(summaryFileName, JSON.stringify(summary, null, 4),
      function (error) {
        if (error) {
          console.error(error);
        }
      });
  }
}).on('iteration', function (err) {
  if (err) {
    console.error(err);
  }
  // initialize as int
  if (itrCount === '') {
    itrCount = 0;
  }
  itrCount = itrCount + 1;
  console.log(`------ Completed iteration => ${itrCount} ------`);
}).on('done', function (err, summary) {
  if (err || summary.error) {
    console.error('collection run encountered an error.');
  } else {
    console.log('### Collection run completed. ###');
  }
  if (itrCount > 1) {
    _.forEach(Array.from(fileNames), function (fileName) {
      var fileContent = fs.readFileSync(fileName, 'utf8');
      // make it an array of json objects
      fs.writeFile(fileName, `[\n${fileContent}\n]`, function (error) {
        if (error) {
          console.error(error);
        }
      });
    })
  }
  var collectionName = process.argv[2]
    .replace(".json", "")
    .replace("./", "") +
    "_";

  fs.readdir("./newman", (err, files) => {
    files.forEach(file => {
      if (file.indexOf('Result.json') === -1) {
        var newfileName = collectionName + file.replace("newman-", "")
          .replace("summary-", "");
        fs.renameSync(`./newman/${file}`, `./newman/${newfileName}`);
      }
    });
  });
  sm.merge();
});