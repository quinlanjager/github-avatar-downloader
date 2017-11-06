const request = require('request');
const TOKEN = require('secrets').GITHUB_TOKEN;
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


getRepoContributors("jquery", "jquery", function(err, result) {
  console.log("Errors:", err);
  console.log("Result:", result);
});