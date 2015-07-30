import { Schema } from 'mongoose';

/**
 * Extend PullRequest model which adds extra body content field.
 * Extra body entry format: { uniqId: 'content' }.
 *
 * @return {Object}
 */
export function extender() {

  return {
    section: Schema.Types.Mixed
  };

}
