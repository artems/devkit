function message(link) {
  return `Документацию можно найти по адресу: ${link}`;
}

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger;
  const notification = imports.notification;

  function helpNotification(payload) {
    const login = payload.pullRequest.get('user.login');

    return notification(login, message(options.link))
      .catch(error => logger.error(error));
  }

  events.on('review:command:help', helpNotification);

  return {};

}
