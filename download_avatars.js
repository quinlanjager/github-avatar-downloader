const request = require('request');
const fs = require('fs');
const TOKEN = require('./secrets').GITHUB_TOKEN; // github token
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
  // begin downloading image from given url
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


getRepoContributors("jquery", "jquery", function(err, result) {
  let parsedResult = JSON.parse(result); // Parse JSON result
  for(let userID in parsedResult){ // find UserID
    let user = parsedResult[userID];
    downloadImageByURL(user.avatar_url, `avatars/${user.login}.jpg`);
  }
});

