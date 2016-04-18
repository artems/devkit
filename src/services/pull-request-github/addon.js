export default function setup(options, imports) {

  return {

    mixin: function (model) {
      const github = imports.github;

      const pullRequestGitHub = new PullRequestGitHub(github, options);

      model.methods.loadPullRequestFromGitHub = function () {
        return pullRequestGitHub.loadPullRequestFromGitHub(this);
      };

      model.methods.updatePullRequestOnGitHib = function () {
        return pullRequestGitHub.updatePullRequsetOnGitHub(this);
      }

      model.methods.loadPullRequestFiles = function () {
        return pullRequestGitHub.loadPullRequestFiles(this);
      };

      model.methods.syncPullRequestWithGitHub = function () {
        return pullRequestGitHub.syncPullRequestWithGitHub(this);
      };

      model.methods.savePayloadFromGitHub = function (payload) {
        return pullRequestGitHub.savePayloadFromGitHub(this, payload);
      };

      model.methods.setBodySection = function (sectionId, content, position) {
        return pullRequestGitHub.setBodySection(this, sectionId, content, position);
      }

      model.methods.saveBodySection = function (sectionId, content, position) {
        return pullRequestGitHub
          .setBodySection(this, sectionId, content, position)
          .then(pullRequest => pullRequest.syncPullRequestWithGitHub());
      }

    },

    /**
     * Extend pull_request model to add extra body content field.
     *
     * @return {Object}
     */
    extender() {
      return {
        section: {}
      };
    }

  };

}
