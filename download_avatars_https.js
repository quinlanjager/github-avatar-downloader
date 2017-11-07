// load dependencies
require('dotenv').config();
const fs = require('fs');
const mime = require('mime');
const https = require('https');
const chalk = require('chalk'); // for styling
const token = process.env.GITHUB_TOKEN; // github token

// load commandline arguments
const repoOwner = process.argv[2];
const repoName = process.argv[3];

function getRepoContributors(repoOwner, repoName, cb) {
  const options = {
    hostname : 'api.github.com',
    path : `/repos/${repoOwner}/${repoName}/contributors`,
    headers : {
      'User-Agent' : 'GitHub Avatar Downloader',
      'Authorization' : `token ${token}`
    }
  };
  https.get(options, (res) => {
    res.setEncoding = 'utf8';
    if(res.statusCode === 401){
      console.log(chalk.red('Bad credentials given. Verify token in .env file.'));
    } else if(res.statusCode === 404){
      console.log(chalk.red('Given repository owner and/or repository owner could not be found.'));
    } else {
      let body = "";

      // Collect body
      res.on('data', (chunk)=>{
        body += chunk;
      });
      res.on('end', (err) => {
        cb(body);
      });
    }
  });
}

// write this with the HTTP module so that we can get the header before piping.
function downloadImageByURL(url, path){
  // begin downloading image from given url
  https.get(url, (res) => {
    const fileExt = mime.getExtension(res.headers['content-type']);
    res.on('error', (err) => {
      throw error;
    });
    res.pipe(fs.createWriteStream(`${path}.${fileExt}`))
  });
}

console.log(chalk.green('Welcome to the GitHub Avatar Downloader'));

// some error handling
if(!token){
  console.log(chalk.red("No GitHub token provided. Please create a .env file in the working directory and add the following:"));
  console.log('GITHUB_TOKEN=<token>');
} else if(!repoOwner || !repoName){
  console.log(chalk.red('Required argument missing. Input repository owner and repository name in the following format:\n'), '<repo owner>', '<repo name>');
} else {
  console.log(chalk.green('Downloading GitHub avatars'));

  // Check if 'avatars exists'
  try{
    fs.accessSync('avatars');
  } catch (err) {
    if(err){
      fs.mkdir('avatars');
    }
  }
  getRepoContributors(repoOwner, repoName, function(result) {
    const parsedResult = JSON.parse(result); // Parse JSON result
    for(const userID in parsedResult){ // find UserID
      const user = parsedResult[userID];
      downloadImageByURL(user.avatar_url, `avatars/${user.login}`);
    }
  });
}
