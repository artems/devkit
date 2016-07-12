import { Schema } from 'mongoose';
import { isEmpty } from 'lodash';

export default function setup(options, imports) {

  return {

    mixin(model, modelName) {

      /**
       * Returns true if pull request has reviewers
       *
       * @return {Boolean}
       */
      model.methods.hasReviewers = function () {
        return !isEmpty(this.get('review.reviewers'));
      };

      /**
       * Find pull requests by reviewer
       *
       * @param {String} login
       * @param {Number} skip
       * @param {Number} limit
       *
       * @return {Promise.<PullRequest>}
       */
      model.statics.findByReviewer = function (login, skip = 0, limit = 50) {
        return this
          .model(modelName)
          .find({ 'review.reviewers.login': login })
          .sort('-updated_at')
          .skip(skip)
          .limit(limit)
          .exec();
      };

      /**
       * Find open reviews
       *
       * @param {Number} skip
       * @param {Number} limit
       *
       * @return {Promise.<PullRequest>}
       */
      model.statics.findInReview = function (skip = 0, limit = 50) {
        const req = {
          state: 'open',
          'review.status': 'inprogress'
        };

        return this
          .model(modelName)
          .find(req)
          .skip(skip)
          .limit(limit)
          .exec();
      };

      /**
       * Find open reviews by reviewer
       *
       * @param {String} login
       * @param {Number} skip
       * @param {Number} limit
       *
       * @return {Promise.<PullRequest>}
       */
      model.statics.findInReviewByReviewer = function (login, skip = 0, limit = 50) {
        const req = {
          state: 'open',
          'review.status': 'inprogress',
          'review.reviewers.login': login
        };

        return this
          .model(modelName)
          .find(req)
          .skip(skip)
          .limit(limit)
          .exec();
      };

    },

    /**
     * Extend pull_request model to add extra `review` field.
     *
     * @return {Object}
     */
    extender() {

      const Reviewer = new Schema({ login: String });
      const RankValue = new Schema({ login: String, value: Number });
      const ReviewStep = new Schema({ name: String, ranks: [RankValue] });
      const ReviewHistory = new Schema({
        ranks: [ReviewStep],
        update_at: Date
      });

      return {
        review: {
          status: {
            type: String,
            'enum': [
              'notstarted',
              'inprogress',
              'changesneeded',
              'complete'
            ],
            'default': 'notstarted'
          },
          history: [ReviewHistory],
          reviewers: [Reviewer],
          started_at: Date,
          updated_at: Date,
          completed_at: Date
        }
      };

    }

  };

}
