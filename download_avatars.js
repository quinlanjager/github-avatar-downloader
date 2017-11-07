// load dependencies
require('dotenv').config();
const request = require('request');
const fs = require('fs');
const chalk = require('chalk'); // for styling
const token = process.env.GITHUB_TOKEN; // github token


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
    if(response.statusCode === 401){
      console.log(chalk.red('Bad credentials given. Verify token in .env file.'));
    } else if(response.statusCode === 404){
      console.log(chalk.red('Given repository owner and/or repository owner could not be found.'));
    } else {
      cb(err, body);
    }
  });
}


// write this with the HTTP module so that we can get the header before piping.
function downloadImageByURL(url, path){
  // begin downloading image from given url
  request.get(url)
  .on('error', (error) => {
    console.log(error);
    throw error;
  })
  .pipe(fs.createWriteStream(path));
}

console.log(chalk.green('Welcome to the GitHub Avatar Downloader'));

// some error handling
if(!token){
  console.log(chalk.red("No GitHub token provided. Please create a .env file in the working directory and add the following:"));
  console.log('GITHUB_TOKEN=<token>');
} else if(!repoOwner || !repoName){
  console.log(chalk.red('Required argument missing. Input repository owner and repository name in the following format:\n'), '<repo owner>', '<repo name>');
} else {
   // Check if 'avatars exists'
  try{
    fs.accessSync('avatars'); // synchronous because we need to check before anything else can run...
  } catch (err) {
    if(err){
      fs.mkdir('avatars');
    }
  }
  console.log(chalk.green('Downloading GitHub avatars'));
  getRepoContributors(repoOwner, repoName, function(err, result) {
    if(err){
      console.log(err);
    }
    const parsedResult = JSON.parse(result); // Parse JSON result
    for(const userID in parsedResult){ // find UserID
      const user = parsedResult[userID];
      downloadImageByURL(user.avatar_url, `avatars/${user.login}.jpg`);
    }
  });
}
