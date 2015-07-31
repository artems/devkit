'use strict';

import Badge from '../modules/badge';

export default function (options, imports) {

  const badge = new Badge(options);

  return Promise.resolve({ service: badge });

}
