const request = require('request');
const fs = require('fs');
const TOKEN = require('./secrets').GITHUB_TOKEN;
const chalk = require('chalk');
console.log(chalk.green("*******************************************"))
console.log(chalk.green("* Welcome to the GitHub Avatar Downloader *"))
console.log(chalk.green("*******************************************"))


function getRepoContributors(repoOwner, repoName, cb) {
  const options = {
    url : `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
    headers : {
      'User-Agent' : 'request',
      'Authorization' : `token ${TOKEN}`
    }
  }
  request(options, (err, response, body) => {
    cb(err, body);
  });
}

function downloadImageByURL(url, path){
  request.get(url)
  .on('error', (error) => {
    throw err;
  })
  .on('response', () => {
    console.log(chalk.green("Response received."));
  }).pipe(fs.createWriteStream(path))
  .on('finish', () => {
    console.log(chalk.green("Finished downloading image!"));
  });
}


downloadImageByURL("https://avatars2.githubusercontent.com/u/2741?v=3&s=466", "avatars/kvirani.jpg")
getRepoContributors("jquery", "jquery", function(err, result) {
  console.log("Errors:", err);
  let parsedResult = JSON.parse(result);
  for(let userID in parsedResult){
    let user = parsedResult[userID];
    console.log(user.avatar_url);
  }
});

