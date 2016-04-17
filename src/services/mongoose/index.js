import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('mongoose');

  const connection = mongoose.createConnection(options.host);

  connection.shutdown = (complete) => connection.close(complete);

  return new Promise((resolve, reject) => {
    connection
      .on('open', () => {
        logger.info('Mongoose connected to %s:%s', connection.host, connection.port);
        resolve(connection);
      })
      .on('error', (error) => {
        reject(error);
      });
  });

}
