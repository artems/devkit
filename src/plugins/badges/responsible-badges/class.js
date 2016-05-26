import { isEmpty } from 'lodash';
import BadgeBase from '../base-badge';

export class ResponsibleBadgeBuilder extends BadgeBase {

  /**
   * @constructor
   *
   * @param {String} url
   */
  constructor(url) {
    super(url);
  }

  /**
   * Create badge for responsible.
   *
   * @param {Object} component
   *
   * @return {String}
   */
  buildResponsibleBadge(component) {
    return this.create(
      component.codeName || component.path,
      component.responsibles.join(', '),
      'blue',
      component.url
    );
  }

  /**
   * Concat responsible badges.
   *
   * @param {Object} components
   *
   * @return {String}
   */
  build(components) {
    const badges = components.map(x => this.buildResponsibleBadge(x));

    if (!isEmpty(badges)) {
      return 'Ответственные:\n' + badges.join(' ');
    }

    return '';
  }

}
