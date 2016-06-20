import StaticTeam from './class';

export default function setup(options, imports) {

  const teamDispatcher = imports['team-dispatcher'];

  const staticTeam = new StaticTeam(options.members, options.overrides);

  teamDispatcher.addRoute(staticTeam, imports.serviceName, options.pattern);

  return {};

}
