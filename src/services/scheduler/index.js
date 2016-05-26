import moment from 'moment';
import schedule from 'node-schedule';

const EVENT_NAME = 'review:schedule:ping';

/**
 * Service for sending notification by time
 *
 * @param {Object} options
 * @param {Number} options.days How often to send a reminder.
 * @param {Object} imports
 *
 * @return {Promise}
 */
export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const PullRequestModel = imports['pull-request-model'];

  function cancelJob(payload) {
    const pullId = payload.pullRequest.id;
    const jobName = 'pull-' + pullId;

    return Promise.resolve(schedule.cancelJob(jobName));
  }

  function createJob(payload, timeShift = options.days) {

    const pullId = payload.pullRequest.id;
    const reviewStartTime = moment(payload.pullRequest.review.started_at);
    const reviewFullDays = moment.duration(moment().diff(reviewStartTime)).asDays();
    const expirationTime = reviewStartTime.add(reviewFullDays + timeShift, 'days');

    // exclude weekend
    while (expirationTime.isoWeekday() > 5) {
      expirationTime.add(1, 'days');
    }

    function triggerEvent() {
      PullRequestModel
        .findById(pullId)
        .then(pullRequest => {
          if (!pullRequest.review_comments && pullRequest.state !== 'closed') {
            events.emit(EVENT_NAME, payload);
            createJob(payload);
          }
        })
        .catch(logger.error.bind(logger));
    }

    return cancelJob(payload)
      .then(() => {
        const jobName = 'pull-' + pullId;
        return schedule.scheduleJob(
          jobName, expirationTime.toDate(), triggerEvent
        );
      });
  }

  function onReviewDone(payload) {
    return cancelJob(payload).catch(logger.error.bind(logger));
  }

  function onReviewStart(payload) {
    return createJob(payload).catch(logger.error.bind(logger));
  }

  function shutdown() {
    schedule.scheduledJobs.map(x => x).forEach(x => x.cancel());
  }

  events.on('review:approved', onReviewDone);
  events.on('review:complete', onReviewDone);

  events.on('review:command:stop', onReviewDone);
  events.on('review:command:start', onReviewStart);

  events.on('github:pull_request:close', onReviewDone);

  PullRequestModel
    .findInReview()
    .then(result => {
      result.forEach(pullRequest => {
        const payload = { pullRequest };
        createJob(payload);
      });
    });

  return { shutdown };
}
