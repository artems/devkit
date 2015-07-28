import GitHub from 'github';

import GitHubTeam from './modules/team/github';

const options = {
  "debug": false,
  "version": "3.0.0",
  "protocol": "https",
  "host": "api.github.com",
  "timeout": 5000,
  "headers": {
    "user-agent": "DevKit-App"
  }
};

const github = new GitHub(options);

const team = new GitHubTeam(github);

team.getTeam({ org: 'devexp-org' })
.then(team => {
  console.log(team);
})
.catch(e => { console.error(e); });
