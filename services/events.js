'use strict';

import { EventEmitter } from 'events';

export default function (options, imports) {

  const emitter = new EventEmitter();

  return Promise.resolve({ service: emitter });

}
