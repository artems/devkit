const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS todo (
  id INTEGER PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  complete INT NOT NULL
)`;

const SELECT_BY_ID_SQL = 'SELECT * FROM pull_request WHERE id = ?';

const REPLACE_SQL = 'INSERT OR REPLACE';

export default class PullRequestModel {

  constructor(db) {
    this.db = db;
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(SELECT_BY_ID_SQL, [id], function(error, result) {
        return error ? reject(error) : resolve(result);
      });
    });
  }

  save(pullRequest) {
  }

  extend(local, remote) {
  }

}

