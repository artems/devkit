import StaticTeam from './class';

export default function setup(options, imports) {

  const teamManager = imports['team-manager'];

  const staticTeam = new StaticTeam(options.members, options.overrides);

  teamManager.addRoute(staticTeam, options.serviceName, options.pattern);

  return {};

}
