'use strict';

import mongoose from 'mongoose';

export default function (options, imports, provide) {

  const logger = imports.logger;
  const connection = mongoose.createConnection(options.host);

  connection
    .on('open', function () {
      logger.info('Mongodb connected to %s:%s', connection.host, connection.port);

      provide(connection);
    })
    .on('error', function (error) {
      logger.error(error);
    });

}
