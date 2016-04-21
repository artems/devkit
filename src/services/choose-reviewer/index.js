import ChooseReviewer from './class';

export default function setup(options, imports) {
  imports.logger = imports.logger.getLogger('review');

  return new ChooseReviewer(options, imports);
}
