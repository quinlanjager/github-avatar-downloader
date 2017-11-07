// load dependencies
require('dotenv').config();
const request = require('request');
const fs = require('fs');
const chalk = require('chalk'); // for styling
const token = process.env.GITHUB_TOKEN; // github token


// load commandline arguments
const repoOwner = process.argv[2];
const repoName = process.argv[3];

// hold starred repos, count how many users have beene checked
const starredRepos = {};
let count = 1;

// get URL options for convenience
function getOptions(url){
  return {
    url : url,
    headers : {
      'User-Agent' : 'GitHub Avatar Downloader',
      'Authorization' : `token ${token}`
    }
  }
}

function getRepoContributors(repoOwner, repoName, cb) {
  const options = getOptions(`https://api.github.com/repos/${repoOwner}/${repoName}/contributors`);
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

// sort objects numerically, descending
function sortObjectDesc(object){
  const sorted = [];
  const resultObj = {};
  for(const key in object){
    const group = [key, object[key]]
    sorted.push(group);
  }
  sorted.sort(function(a,b){
    return b[1] - a[1];
  });
  sorted.forEach((keyPair) => {
    resultObj[keyPair[0]] = keyPair[1];
  });
  return resultObj;
}

function printStarredRepos(collectionOfStarredRepos){
  const sortedStarredRepos = sortObjectDesc(starredRepos);
  const keyIndex = [];
  // buidling index for looping purposes
  for(const name in sortedStarredRepos){
    keyIndex.push(name);
  }
  for(let count = 0; count < 5; count++){
    console.log(`[ ${sortedStarredRepos[keyIndex[count]]} stars ] ${keyIndex[count]}`);
  }
}

function countStars(URL, parsedResult){
  const options = getOptions(URL);

  request(options, (err, response, body) => {
    if(err){
      throw err;
    }
    const parsedStarred = JSON.parse(body);
    for(const repo in parsedStarred){
      const repoName = parsedStarred[repo].full_name;
      if(!(repoName in starredRepos)){
        starredRepos[repoName] = 1;
      } else {
        starredRepos[repoName]++;
      }
    }

    // if we're finished collecting starred repos
    if(count === parsedResult.length){
      printStarredRepos(starredRepos);
    } else {
      count++;
    }
  })
}


console.log(chalk.green("Here are some recommended repos!"));

// some error handling
if(!token){
  console.log(chalk.red("No GitHub token provided. Please create a .env file in the working directory and add the following:"));
  console.log('GITHUB_TOKEN=<token>');
} else if(!repoOwner || !repoName){
  console.log(chalk.red('Required argument missing. Input repository owner and repository name in the following format:\n'), '<repo owner>', '<repo name>');
} else {
  getRepoContributors(repoOwner, repoName, function(err, result) {
    if(err){
      console.log(err);
    }
    const parsedResult = JSON.parse(result); // Parse JSON result
    for(const user in parsedResult){
      // writing out URL because the one GITHUB provides has extra parameters on it.
      countStars(`https://api.github.com/users/${parsedResult[user].login}/starred`, parsedResult);
    }
  });
}
