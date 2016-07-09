import GitHubTeam from './class';

export default function setup(options, imports) {

  const github = imports.github;
  const teamManager = imports['team-manager'];

  const githubTeam = new GitHubTeam(
    github,
    options.orgName,
    options.slugName,
    options.overrides
  );

  teamManager.addRoute(githubTeam, options.serviceName, options.pattern);

}
