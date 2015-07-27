export default function middleware() {

  return function (req, res, next) {

    /**
     * Send success response.
     *
     * @param {*} [data] — response data.
     */
    res.ok = function (data) {
      this.json(data);
    };

    /**
     * Send error message.
     *
     * @param {String} [message] — error message (default: error).
     * @param {Number} [status] — http response status (default: 500).
     */
    res.error = function (message, status) {
      message = message || 'Internal error';

      this
        .status(status || 500)
        .json({ error: message });
    }

    next();

  };

};
