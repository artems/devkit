import GitHubTeam from './class';

export default function setup(options, imports) {

  const github = imports.github;
  const teamDispatcher = imports['team-dispatcher'];

  const githubTeam = new GitHubTeam(
    github,
    options.orgName,
    options.slugName,
    options.overrides
  );

  teamDispatcher.addRoute(githubTeam, imports.serviceName, options.pattern);

  return {};

}
