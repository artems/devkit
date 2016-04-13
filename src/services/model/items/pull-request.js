import { Schema } from 'mongoose';

export function setupSchema() {
  return {
    _id: Number,
    body: String,
    title: String,
    number: Number,
    html_url: String,
    state: {
      type: String,
      'enum': ['open', 'closed']
    },
    user: {
      id: Number,
      login: String,
      html_url: String,
      avatar_url: String
    },
    repository: {
      id: Number,
      name: String,
      html_url: String,
      full_name: String,
      owner: {
        id: Number,
        login: String,
        html_url: String,
        avatar_url: String
      }
    },
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    merged_at: Date,
    merged: Boolean,
    merged_by: {
      id: Number,
      login: String,
      html_url: String,
      avatar_url: String
    },
    comments: Number,
    review_comments: Number,
    commits: Number,
    additions: Number,
    deletions: Number,
    changed_files: Number,
    files: {
      type: Array,
      'default': []
    },
    review: {
      status: {
        type: String,
        'enum': ['notstarted', 'inprogress', 'changesneeded', 'complete'],
        'default': 'notstarted'
      },
      reviewers: Array,
      started_at: Date,
      updated_at: Date,
      completed_at: Date
    },
    section: Schema.Types.Mixed
  };
}

export function setupModel(modelName, model) {

  /**
   * Set mongo id the same as pull request id.
   */
  model.virtual('id')
    .get(function () { return this._id; })
    .set(function (id) { this._id = id; });

  model.methods.toString = function () {
    return '[' + this.id + ' – ' + this.title + ']' + ' ' + this.html_url;
  };

  /**
   * Find pull requests by user
   *
   * @param {String} login
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findByUser = function (login) {
    return this
      .model(modelName)
      .find({ 'user.login': login })
      .sort('-updated_at');
  };

  /**
   * Find pull requests by reviewer
   *
   * @param {String} login
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findByReviewer = function (login) {
    return this
      .model(modelName)
      .find({ 'review.reviewers.login': login })
      .sort('-updated_at');
  };

  /**
   * Find pull request by repository and number
   *
   * @param {String} fullName - repository full name
   * @param {Number} number - pull request number
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findByRepositoryAndNumber = function (fullName, number) {
    return this
      .model(modelName)
      .findOne({ number, 'repository.full_name': fullName });
  };

  /**
   * Find open reviews
   *
   * @param {String} login
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findInReview = function () {
    const req = {
      state: 'open',
      'review.status': 'inprogress'
    };

    return this
      .model(modelName)
      .find(req, 'review');
  };

  /**
   * Find open reviews by reviewer
   *
   * @param {String} login
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findInReviewByReviewer = function (login) {
    const req = {
      state: 'open',
      'review.status': 'inprogress',
      'review.reviewers.login': login
    };

    return this
      .model(modelName)
      .find(req, 'review');
  };

}

export function getUserLogin(pullRequest) {
  if (pullRequest.repository &&
      pullRequest.repository.owner &&
      pullRequest.repository.owner.login) {
    return pullRequest.repository.owner.login;
  }

  if (pullRequest.organization && pullRequest.organization.login) {
    return pullRequest.organization.login;
  }

  return '';
}

/**
 * @typedef {Object} PullRequest
 *
 * @property {Number}  id
 * @property {String}  body
 * @property {String}  title
 * @property {Number}  number
 * @property {String}  html_url
 * @property {String}  state
 * @property {Object}  user
 * @property {Object}  repository
 * @property {Date}    created_at
 * @property {Date}    updated_at
 * @property {Date}    closed_at
 * @property {Date}    merged_at
 * @property {Boolean} merged
 * @property {Object}  merged_by
 * @property {Number}  comments
 * @property {Number}  review_comments
 * @property {Number}  commits
 * @property {Number}  additions
 * @property {Number}  deletions
 * @property {Number}  changed_files
 * @property {Array}   files
 * @property {Object}  review
 * @property {String}  review.status
 * @property {Array}   review.reviewers
 * @property {Date}    review.started_at
 * @property {Date}    review.updated_at
 * @property {Date}    review.completed_at
 */
