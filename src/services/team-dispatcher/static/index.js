import StaticTeam from './static';

export default function setup(options, imports) {

  return new StaticTeam(options.members, options.overrides);

}
