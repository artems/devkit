'use strict';

import mongoose from 'mongoose';

export default function (options, imports, provide) {

  const logger = imports.logger;
  const connection = mongoose.createConnection(options.host);

  connection
    .on('open', function () {
      provide(connection);
    })
    .on('error', function (error) {
      logger.error(error);
    });

}
