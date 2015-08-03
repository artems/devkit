'use strict';

import GitHub from 'github';

export default function (options, imports) {

  const github = new GitHub(options);
  github.authenticate(options.authenticate);

  return Promise.resolve({ service: github });

}
