export default function setup() {

  return {

    /**
     * Extend pull_request model to add extra body content field.
     *
     * @return {Object}
     */
    extender() {
      return {
        section: {}
      };
    }

  };

}
