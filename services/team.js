import _ from 'lodash';

import Team from '../modules/team';

/*

Example of config:

{
  "team": {
    "options": {
      "routes": [
        { "team_github_1": ["serp/*", "search-interfaces/*"] },
        { "team_github_2": ["devexp/*"] },
        { "team_config_1": "serp-contribs/tyrion"
      ]
    },
    dependencies: [
      "team_github_1",
      "team_github_2",
      "team_config_1"
    ]
  }
}

*/

export default function (options, imports, provide) {

  let routes = [];

  (options.routes || []).forEach(route => {
    _.forEach(route, (sourceName, pattern) => {
      const source = imports[sourceName];

      if (!source) {
        throw new Error('Source `' + sourceName + '` for team service does not provided');
      }

      if (!Array.isArray(patten)) {
        routes.push({ source, pattern });
      } else {
        pattern.forEach(sourcePattern => {
          routes.push({ source, pattern: sourcePattern });
        });
      }
    });
  });

  const team = new Team(routes);

  provide(team);

}
