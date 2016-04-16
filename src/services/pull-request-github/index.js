import PullRequestGitHub from './pull-request-github';

export default function setup(options, imports) {

  const github = imports.github;

  const PullRequestModel = imports['pull-request-model'];

  return new PullRequestGitHub(github, PullRequestModel, options);

}
