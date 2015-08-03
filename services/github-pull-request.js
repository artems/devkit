import GitHubPullRequest from '../modules/github-pull-request';

export default function (options, imports) {

  const model = imports.model;
  const github = imports.github;
  const githubPullRequest = new GitHubPullRequest(
    model.get('pull_request'),
    github,
    options
  );

  return Promise.resolve({ service: githubPullRequest });

}
