'use strict';

import Badge from '../modules/badge';

export default function (options, imports, provide) {

  const badge = new Badge(options);

  provide(badge);

}
