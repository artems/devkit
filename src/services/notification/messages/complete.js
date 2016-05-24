export function message({ pullRequest }) {

  return `
Review completed.
#${pullRequest.number} – ${pullRequest.title}
${pullRequest.html_url}
`;

}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const notification = imports.notification;

  function completeNotification(payload) {
    const login = payload.pullRequest.get('user.login');

    return notification(login, message(payload))
      .catch(error => logger.error(error));
  }

  events.on('review:complete', completeNotification);

  return {};

}
