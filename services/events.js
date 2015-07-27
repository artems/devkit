'use strict';

import { EventEmitter } from 'events';

export default function (options, imports, provide) {

  const emitter = new EventEmitter();

  provide(emitter);

}
