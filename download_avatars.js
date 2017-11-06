// load dependencies
const request = require('request');
const fs = require('fs');
const chalk = require('chalk'); // for styling
const token = require('./secrets').GITHUB_TOKEN; // github token

// load commandline arguments
const repoOwner = process.argv[2];
const repoName = process.argv[3];


function getRepoContributors(repoOwner, repoName, cb) {
  const options = {
    url : `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
    headers : {
      'User-Agent' : 'GitHub Avatar Downloader',
      'Authorization' : `token ${token}`
    }
  };
  request(options, (err, response, body) => {
    cb(err, body);
  });
}

function downloadImageByURL(url, path){
  // begin downloading image from given url
  request.get(url)
  .on('error', (error) => {
    throw error;
  })
  .pipe(fs.createWriteStream(path));
}

console.log(chalk.green('Welcome to the GitHub Avatar Downloader'));

if(!repoOwner || !repoName){
  console.log(chalk.red('Please input a repository owner and a repository name using the following format:\n'), '<repo owner>', '<repo name>');
} else {
  console.log(chalk.green('Downloading GitHub avatars'));
  getRepoContributors(repoOwner, repoName, function(err, result) {
    const parsedResult = JSON.parse(result); // Parse JSON result
    for(const userID in parsedResult){ // find UserID
      const user = parsedResult[userID];
      downloadImageByURL(user.avatar_url, `avatars/${user.login}.jpg`);
    }
  });
}
