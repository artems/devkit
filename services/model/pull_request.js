'use strict';

const REPO_REGEX = /repos\/(.*\/.*)\/pulls/;

export default function pullRequest(setup, mongoose) {

  const Schema = mongoose.Schema;

  const schema = {
    id: Number,
    _id: Number,
    title: String,
    body: String,
    url: String,
    org: String,
    repo: String,
    full_name: String,
    html_url: String,
    number: Number,
    state: {
      type: String,
      'enum': ['open', 'closed']
    },
    user: {
      login: String,
      avatar_url: String,
      url: String,
      html_url: String
    },
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    merged_at: Date,
    merged: Boolean,
    merged_by: {
      login: String,
      avatar_url: String,
      url: String,
      html_url: String
    },
    comments: Number,
    review_comments: Number,
    review: {
      status: {
        type: String,
        'enum': ['notstarted', 'inprogress', 'complete'],
        'default': 'notstarted'
      },
      reviewers: Array,
      started_at: Date,
      updated_at: Date,
      completed_at: Date
    },
    commits: Number,
    additions: Number,
    deletions: Number,
    changed_files: Number,
    head: Schema.Types.Mixed,
    files: {
      type: Array,
      'default': []
    }
  };

  const model = new Schema(schema);

  /**
   * Replace mongo id with pull request id.
   *
   * @param {Number} id - pull requiest id.
   * @return {Number}
   */
  model.path('id').set(function (id) {
    this._id = id;
    return id;
  });

  /**
   * Parse url and get owner/repo.
   *
   * @param {String} url - pull request url.
   * @return {String}
   */
  model.path('url').set(function (url) {
    let repo = url.match(REPO_REGEX) || [];

    if (repo[1]) {
      repo = repo[1];

      this.org = repo.split('/')[0];
      this.repo = repo.split('/')[1];
      this.full_name = repo;
    }

    return url;
  });

  /**
   * Find pull request by number and repo
   *
   * @param {Number} number
   * @param {String} fullName - repository full name
   * @return {Promise}
   */
  model.statics.findByNumberAndRepo = function (number, fullName) {
    return this.model('PullRequest').findOne({ number, full_name: fullName });
  };

  /**
   * Find pull requests by user
   *
   * @param {String} login
   * @return {Promise}
   */
  model.statics.findByUser = function (login) {
    return this
      .model('PullRequest')
      .find({ 'user.login': login })
      .sort('-updated_at');
  };

  /**
   * Find pull requests by reviewer
   *
   * @param {String} login
   * @return {Promise}
   */
  model.statics.findByReviewer = function (login) {
    return this
      .model('PullRequest')
      .find({ 'review.reviewers.login': login })
      .sort('-updated_at');
  };

  /**
   * Find open reviews by reviewer
   *
   * @param {String} login
   * @return {Promise}
   */
  model.statics.findOpenReviewsByUser = function (login) {
    return this
      .model('PullRequest')
      .find({
        state: 'open',
        'review.reviewers.login': login,
        'review.status': 'inprogress'
      }, 'review');
  };

  setup(schema, model);

}
