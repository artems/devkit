import { Schema } from 'mongoose';

const notificationTransport = new Schema({
  id: String,
  username: String
});

export function setupSchema() {
  return {
    _id: String,
    html_url: String,
    avatar_url: String,
    notification_transports: {
      type: [notificationTransport],
      'default': []
    }
  };
}

export function setupModel(modelName, model) {

  /**
   * Set mongo id the same as user login
   */
  model.virtual('login')
    .get(function () { return this._id; })
    .set(function (login) { this._id = login; });

  /**
   * Find user by login
   *
   * @param {String} login
   *
   * @return {Promise.<User>}
   */
  model.statics.findByLogin = function (login) {
    return this
      .model(modelName)
      .findById(login);
  };

}
