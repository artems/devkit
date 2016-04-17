import PullRequestReview from './class';

export default function setup(options, imports) {

  return {

    mixin(model) {
      const { team, events, logger } = imports;

      const review = new PullRequestReview(options, {
        team,
        events,
        logger: logger.getLogger('review')
      });

      model.methods.stopReview = function () {
        return review.stopReview(this);
      };

      model.methods.startReview = function () {
        return review.startReview(this);
      };

      model.methods.approveReview = function (login) {
        return review.approveReview(this, login);
      };

      model.methods.updateReviewers = function (reviewers) {
        return review.updateReviewers(this, reviewers);
      };

    },

    /**
     * Extend pull_request model to add extra `review` field.
     *
     * @return {Object}
     */
    extender() {
      return {
      };
    }

  };

}
