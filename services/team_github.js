import GitHubTeam from '../modules/team/github';

export default function (options, imports) {

  const github = imports.github;

  const githubTeam = new GitHubTeam(github, options.slug);

  return Promise.resolve({ service: githubTeam });

}
