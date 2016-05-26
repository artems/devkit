export default class YandexStarTrek {

  /**
   * @constructor
   * @param {Object} request
   * @param {Object} options
   */
  constructor(request, options) {
    this.request = request;

    this._options = options;
  }

  sendRequest(url, method, payload) {
    if (this._options.silent) return;

    const params = {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `OAuth ${this._options.token}`,
        'Content-Type': 'application/json'
      }
    };

    return this.request[method](url, params);
  }

  issueRequest(issue, method, payload) {
    const url = `${this._options.url}/issues/${issue}`;

    return this.sendRequest(url, method, payload);
  }

  issueStatusChange(issue, method, status) {
    const url = `${this._options.url}/issues/${issue}/transitions/${status}/_execute`;

    return this.sendRequest(url, method);
  }

  /**
   * Parse issues from pull request title.
   *
   * @param {String} title
   * @param {Array} queues
   *
   * @return {Array}
   */
  parseIssue(title, queues = []) {
    const issues = [];
    // (SERP|GATEWAY)-[0-9]+
    const regexp = new RegExp('(?:^|\\W)((?:' + queues.join('|') + ')' + '-[0-9]+)(?:\\W|$)', 'g');

    let match;
    while (match = regexp.exec(title)) { // eslint-disable-line no-cond-assign
      issues.push(match[1]);
    }

    return issues;
  }
}
