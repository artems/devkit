import GitHubTeam from './github';

export default function setup(options, imports) {

  const github = imports.github;

  const service = new GitHubTeam(github, options.orgName, options.slugName);

  return service;

}
